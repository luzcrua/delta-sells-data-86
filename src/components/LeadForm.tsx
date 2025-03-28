
import React, { useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader, Check, AlertCircle, ExternalLink } from "lucide-react";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import FormCombobox from "@/components/FormCombobox";
import FormTextarea from "@/components/FormTextarea";
import FormDatePicker from "@/components/FormDatePicker";
import { formatPhone, formatDate } from "@/lib/formatters";
import { leadFormSchema, LeadFormValues } from "@/lib/leadValidators";
import { submitToGoogleSheets, isWebhookConfigured, sendToWhatsAppFallback, getGoogleSheetViewUrl } from "@/services/GoogleSheetsService";
import { LogService } from "@/services/LogService";
import { format } from "date-fns";

const LeadForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSheetLink, setShowSheetLink] = useState(false);
  
  useEffect(() => {
    // Verificar se a URL do webhook está configurada
    const configured = isWebhookConfigured();
    setIsConfigured(configured);
    LogService.info(`Formulário de Lead - Webhook configurado: ${configured}`);
  }, []);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      instagram: "",
      interesse: "",
      statusLead: "Novo",
      dataLembrete: undefined,
      motivoLembrete: "",
      observacoes: "",
    },
  });

  const handleInputChange = (field: keyof LeadFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValue(field, e.target.value);
  };

  const handleSelectChange = (field: keyof LeadFormValues) => (value: string) => {
    setValue(field, value);
  };

  const handleTextareaChange = (field: keyof LeadFormValues) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(field, e.target.value);
  };

  const handleDateChange = (field: keyof LeadFormValues) => (date: Date | undefined) => {
    setValue(field, date);
  };

  const handleSendToWhatsApp = (data: LeadFormValues) => {
    LogService.info("Redirecionando para envio via WhatsApp", { formType: "lead" });
    sendToWhatsAppFallback({
      ...data,
      dataLembrete: data.dataLembrete ? format(data.dataLembrete, "dd/MM/yy") : "",
      formType: 'lead',
    });
  };

  const openGoogleSheet = () => {
    LogService.info("Abrindo Google Sheet para visualização");
    window.open(getGoogleSheetViewUrl('lead'), '_blank');
  };

  const onSubmit = async (data: LeadFormValues) => {
    LogService.info("Lead form - Submissão iniciada", { nome: data.nome, telefone: data.telefone });
    setIsSubmitting(true);
    setSubmitError(null);
    setShowSheetLink(false);
    
    try {
      const formattedData = {
        ...data,
        dataLembrete: data.dataLembrete ? format(data.dataLembrete, "dd/MM/yy") : "",
        formType: 'lead', // Identificador para saber que é um formulário de lead
      };
      
      LogService.debug("Lead form - Dados formatados para envio", formattedData);
      
      // Tentativas múltiplas para garantir que os dados sejam enviados
      let attempt = 1;
      let result;
      
      while (attempt <= 3) {
        LogService.info(`Lead form - Tentativa ${attempt}/3 de envio`);
        
        try {
          result = await submitToGoogleSheets(formattedData);
          LogService.info(`Lead form - Resposta da tentativa ${attempt}`, result);
          
          if (result.success) {
            break; // Sucesso, sai do loop
          } else {
            // Se não teve sucesso, mas não é um erro de rede, sai do loop
            if (!result.message.includes("network") && !result.message.includes("CORS")) {
              break;
            }
          }
        } catch (innerError) {
          LogService.error(`Lead form - Erro na tentativa ${attempt}`, innerError);
        }
        
        // Incrementa tentativa e aguarda antes de tentar novamente
        attempt++;
        if (attempt <= 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (result?.success) {
        LogService.info("Lead form - Envio bem-sucedido");
        toast({
          title: "Sucesso!",
          description: "Dados do lead enviados com sucesso para a planilha.",
        });
        setSubmitted(true);
        setShowSheetLink(true);
        
        // Só limpar o formulário após envio bem-sucedido
        setTimeout(() => {
          reset();
          setSubmitted(false);
        }, 3000);
      } else {
        // Armazenar a mensagem de erro, mas não resetar o formulário
        const errorMsg = result?.message || "Erro desconhecido ao enviar dados.";
        LogService.warn("Lead form - Falha no envio", { errorMsg });
        setSubmitError(errorMsg);
        toast({
          title: "Aviso",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      LogService.error("Lead form - Erro crítico na submissão", error);
      const errorMsg = error instanceof Error ? error.message : "Ocorreu um erro ao enviar os dados. Tente novamente.";
      
      setSubmitError(errorMsg);
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        {!isConfigured && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md">
            <p className="text-sm">
              ⚠️ A URL do App Script não está configurada no arquivo env.ts. Configure o arquivo para habilitar o envio direto para o Google Sheets.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="form-section space-y-4">
            <h2 className="text-2xl font-semibold text-delta-800 mb-4">
              Informações do Lead
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="nome-lead"
                label="Nome Completo"
                value={watch("nome")}
                onChange={handleInputChange("nome")}
                placeholder="Digite o nome completo"
                error={errors.nome?.message}
                required
              />
              <FormInput
                id="telefone-lead"
                label="Telefone"
                value={watch("telefone")}
                onChange={handleInputChange("telefone")}
                placeholder="(00) 00000-0000"
                error={errors.telefone?.message}
                formatter={formatPhone}
                required
                maxLength={15}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="instagram-lead"
                label="Instagram"
                value={watch("instagram") || ""}
                onChange={handleInputChange("instagram")}
                placeholder="@perfil"
                error={errors.instagram?.message}
              />
              <FormCombobox
                id="interesse-lead"
                label="Interesse"
                value={watch("interesse")}
                onChange={handleSelectChange("interesse")}
                onCustomInputChange={handleInputChange("interesse")}
                options={[
                  { value: "Lançamento de produtos", label: "Lançamento de produtos" },
                  { value: "Promoções", label: "Promoções" },
                  { value: "Personalização de pedidos", label: "Personalização de pedidos" },
                ]}
                error={errors.interesse?.message}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="form-section space-y-4">
            <h2 className="text-2xl font-semibold text-delta-800 mb-4">
              Status e Acompanhamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                id="status-lead"
                label="Status do Lead"
                value={watch("statusLead")}
                onChange={handleSelectChange("statusLead")}
                options={[
                  { value: "Novo", label: "Novo" },
                  { value: "Em negociação", label: "Em negociação" },
                  { value: "Qualificado", label: "Qualificado" },
                  { value: "Não qualificado", label: "Não qualificado" },
                ]}
                error={errors.statusLead?.message}
                required
              />
              <FormDatePicker
                id="data-lembrete-lead"
                label="Data de Lembrete"
                value={watch("dataLembrete")}
                onChange={handleDateChange("dataLembrete")}
                error={errors.dataLembrete?.message}
                required
                placeholder="Selecione uma data para o lembrete"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormTextarea
                id="motivo-lembrete-lead"
                label="Motivo do Lembrete"
                value={watch("motivoLembrete")}
                onChange={handleTextareaChange("motivoLembrete")}
                placeholder="Digite o motivo do lembrete"
                error={errors.motivoLembrete?.message}
                required
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div className="form-section">
            <FormTextarea
              id="observacoes-lead"
              label="Observações Adicionais"
              value={watch("observacoes") || ""}
              onChange={handleTextareaChange("observacoes")}
              placeholder="Digite informações adicionais, se necessário"
              error={errors.observacoes?.message}
              rows={4}
            />
          </div>

          {showSheetLink && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
              <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Dados enviados com sucesso!</p>
                <p className="text-sm">Os dados foram registrados na planilha.</p>
                <button 
                  type="button"
                  onClick={openGoogleSheet}
                  className="text-sm mt-2 flex items-center text-green-700 hover:text-green-900 font-medium"
                >
                  Ver na planilha <ExternalLink className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Erro no envio</p>
                <p className="text-sm">{submitError}</p>
                <p className="text-sm mt-1">Seus dados não foram perdidos.</p>
                <button 
                  type="button"
                  onClick={() => handleSendToWhatsApp(watch())}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium flex items-center"
                >
                  Enviar via WhatsApp <ExternalLink className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          <div className="form-section flex justify-center pt-4">
            <Button
              type="submit"
              className="w-full md:w-1/2 h-12 bg-delta-600 hover:bg-delta-700 text-white font-semibold text-lg transition-colors"
              disabled={isSubmitting || submitted}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  Enviando...
                </span>
              ) : submitted ? (
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Enviado com Sucesso!
                </span>
              ) : (
                "Enviar Dados do Lead"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadForm;
