
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
import { formatCPF, formatPhone, formatCurrency, formatDate } from "@/lib/formatters";
import { formSchema, type FormValues } from "@/lib/validators";
import { submitToGoogleSheets, isWebhookConfigured, sendToWhatsAppFallback, getGoogleSheetViewUrl } from "@/services/GoogleSheetsService";
import { format } from "date-fns";
import LeadForm from "@/components/LeadForm";

const Index = () => {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [valorNumerico, setValorNumerico] = useState(0);
  const [freteNumerico, setFreteNumerico] = useState(15);
  const [activeTab, setActiveTab] = useState("cliente");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSheetLink, setShowSheetLink] = useState(false);
  
  useEffect(() => {
    // Verificar se a URL do webhook está configurada
    setIsConfigured(isWebhookConfigured());
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      genero: "Masculino",
      linha: "",
      tipo: "",
      cor: "",
      tamanho: "",
      valor: "",
      formaPagamento: "PIX",
      localizacao: "",
      frete: "15,00",
      dataPagamento: undefined,
      dataEntrega: undefined,
      valorTotal: "R$ 15,00",
      observacao: "",
    },
  });

  const valor = watch("valor");
  const frete = watch("frete");
  
  useEffect(() => {
    const parsedValor = parseFloat(valor.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    const parsedFrete = parseFloat(frete.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    
    setValorNumerico(parsedValor);
    setFreteNumerico(parsedFrete);
    
    const total = parsedValor + parsedFrete;
    setValue("valorTotal", formatCurrency(String(total * 100)));
  }, [valor, frete, setValue]);

  const handleInputChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValue(field, e.target.value);
  };

  const handleSelectChange = (field: keyof FormValues) => (value: string) => {
    setValue(field, value);
  };

  const handleTextareaChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(field, e.target.value);
  };

  const handleDateChange = (field: keyof FormValues) => (date: Date | undefined) => {
    setValue(field, date);
  };

  const handleSendToWhatsApp = (data: FormValues) => {
    sendToWhatsAppFallback({
      ...data,
      dataPagamento: data.dataPagamento ? format(data.dataPagamento, "dd/MM/yy") : "",
      dataEntrega: data.dataEntrega ? format(data.dataEntrega, "dd/MM/yy") : "",
      formType: 'cliente',
    });
  };

  const openGoogleSheet = () => {
    window.open(getGoogleSheetViewUrl(), '_blank');
  };

  const onSubmit = async (data: FormValues) => {
    console.log("Form submission triggered with data:", data);
    setIsSubmitting(true);
    setSubmitError(null);
    setShowSheetLink(false);
    
    try {
      const formattedData = {
        ...data,
        dataPagamento: data.dataPagamento ? format(data.dataPagamento, "dd/MM/yy") : "",
        dataEntrega: data.dataEntrega ? format(data.dataEntrega, "dd/MM/yy") : "",
        formType: 'cliente', // Identificador para saber que é um formulário de cliente
      };
      
      console.log("Sending formatted data to Google Sheets:", formattedData);
      const result = await submitToGoogleSheets(formattedData);
      console.log("Response from Google Sheets:", result);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Dados enviados com sucesso para a planilha.",
        });
        setSubmitted(true);
        setShowSheetLink(true);
        
        // Só limpar o formulário após envio bem-sucedido
        setTimeout(() => {
          reset();
          setSubmitted(false);
          // Não esconder o link da planilha, apenas resetar o formulário
        }, 3000);
      } else {
        // Armazenar a mensagem de erro, mas não resetar o formulário
        setSubmitError(result.message);
        toast({
          title: "Aviso",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      
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
    <div className="min-h-screen bg-gradient-to-br from-delta-50 to-delta-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 relative">
          
          <h1 className="text-3xl md:text-4xl font-bold text-delta-950 mb-2">
            DELTA SELLS CLIENTS
          </h1>
          <p className="text-delta-700 text-lg">
            Cadastro de clientes e registro de vendas
          </p>
          
          {!isConfigured && (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md">
              <p className="text-sm">
                ⚠️ A URL do App Script não está configurada no arquivo env.ts. Configure o arquivo para habilitar o envio direto para o Google Sheets.
              </p>
            </div>
          )}
        </header>

        <div className="flex justify-center mb-6 border-b border-delta-200">
          <button
            className={`tab-button ${activeTab === "cliente" ? "active" : ""}`}
            onClick={() => setActiveTab("cliente")}
          >
            CLIENTE
          </button>
          <button
            className={`tab-button ${activeTab === "lead" ? "active" : ""}`}
            onClick={() => setActiveTab("lead")}
          >
            LEAD
          </button>
        </div>

        <div className={`tab-panel ${activeTab === "cliente" ? "active" : ""}`}>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                
                <div className="form-section space-y-4">
                  <h2 className="text-2xl font-semibold text-delta-800 mb-4">
                    Informações Pessoais
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      id="nome"
                      label="Nome"
                      value={watch("nome")}
                      onChange={handleInputChange("nome")}
                      placeholder="Digite o nome completo"
                      error={errors.nome?.message}
                      required
                    />
                    <FormInput
                      id="cpf"
                      label="CPF"
                      value={watch("cpf") || ""}
                      onChange={handleInputChange("cpf")}
                      placeholder="000.000.000-00"
                      error={errors.cpf?.message}
                      formatter={formatCPF}
                      maxLength={14}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      id="telefone"
                      label="Telefone"
                      value={watch("telefone")}
                      onChange={handleInputChange("telefone")}
                      placeholder="(00) 00000-0000"
                      error={errors.telefone?.message}
                      formatter={formatPhone}
                      required
                      maxLength={15}
                    />
                    <FormSelect
                      id="genero"
                      label="Gênero"
                      value={watch("genero")}
                      onChange={handleSelectChange("genero")}
                      options={[
                        { value: "Masculino", label: "Masculino" },
                        { value: "Feminino", label: "Feminino" },
                        { value: "Outro", label: "Outro" },
                      ]}
                      error={errors.genero?.message}
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="form-section space-y-4">
                  <h2 className="text-2xl font-semibold text-delta-800 mb-2">
                    Informações do Produto
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormCombobox
                      id="linha"
                      label="Linha"
                      value={watch("linha")}
                      onChange={handleSelectChange("linha")}
                      onCustomInputChange={handleInputChange("linha")}
                      options={[
                        { value: "Oversized", label: "Oversized" },
                        { value: "Run Muscle", label: "Run Muscle" },
                      ]}
                      error={errors.linha?.message}
                      required
                    />
                    <FormCombobox
                      id="tipo"
                      label="Tipo"
                      value={watch("tipo")}
                      onChange={handleSelectChange("tipo")}
                      onCustomInputChange={handleInputChange("tipo")}
                      options={[
                        { value: "Camisa", label: "Camisa" },
                      ]}
                      error={errors.tipo?.message}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormCombobox
                      id="cor"
                      label="Cor"
                      value={watch("cor")}
                      onChange={handleSelectChange("cor")}
                      onCustomInputChange={handleInputChange("cor")}
                      options={[
                        { value: "OFF WHITE", label: "OFF WHITE" },
                        { value: "Preto", label: "Preto" },
                        { value: "Branco", label: "Branco" },
                        { value: "Cinza", label: "Cinza" },
                      ]}
                      error={errors.cor?.message}
                      required
                    />
                    <FormCombobox
                      id="tamanho"
                      label="Tamanho"
                      value={watch("tamanho")}
                      onChange={handleSelectChange("tamanho")}
                      onCustomInputChange={handleInputChange("tamanho")}
                      options={[
                        { value: "XPP", label: "XPP" },
                        { value: "PP", label: "PP" },
                        { value: "P", label: "P" },
                        { value: "M", label: "M" },
                        { value: "G", label: "G" },
                        { value: "GG", label: "GG" },
                      ]}
                      error={errors.tamanho?.message}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <FormInput
                      id="valor"
                      label="Valor"
                      value={watch("valor")}
                      onChange={handleInputChange("valor")}
                      placeholder="R$ 0,00"
                      error={errors.valor?.message}
                      formatter={formatCurrency}
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="form-section space-y-4">
                  <h2 className="text-2xl font-semibold text-delta-800 mb-4">
                    Pagamento e Entrega
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      id="formaPagamento"
                      label="Forma de Pagamento"
                      value={watch("formaPagamento")}
                      onChange={handleSelectChange("formaPagamento")}
                      options={[
                        { value: "PIX", label: "PIX" },
                        { value: "Débito", label: "Débito" },
                        { value: "Crédito", label: "Crédito" },
                        { value: "Dinheiro", label: "Dinheiro" },
                      ]}
                      error={errors.formaPagamento?.message}
                      required
                    />
                    <FormInput
                      id="localizacao"
                      label="Localização"
                      value={watch("localizacao") || ""}
                      onChange={handleInputChange("localizacao")}
                      placeholder="Digite a localização de entrega"
                      error={errors.localizacao?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormCombobox
                      id="frete"
                      label="Frete"
                      value={watch("frete")}
                      onChange={handleSelectChange("frete")}
                      onCustomInputChange={handleInputChange("frete")}
                      options={[
                        { value: "15,00", label: "R$ 15,00" },
                        { value: "0,00", label: "Grátis" },
                      ]}
                      error={errors.frete?.message}
                      required
                    />
                    <FormInput
                      id="valorTotal"
                      label="Valor Total"
                      value={watch("valorTotal")}
                      onChange={handleInputChange("valorTotal")}
                      placeholder="R$ 0,00"
                      error={errors.valorTotal?.message}
                      className="font-semibold"
                      required
                      readOnly={true}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormDatePicker
                      id="dataPagamento"
                      label="Data de Pagamento"
                      value={watch("dataPagamento")}
                      onChange={handleDateChange("dataPagamento")}
                      error={errors.dataPagamento?.message}
                      required
                      placeholder="Selecione a data de pagamento"
                    />
                    <FormDatePicker
                      id="dataEntrega"
                      label="Data de Entrega"
                      value={watch("dataEntrega")}
                      onChange={handleDateChange("dataEntrega")}
                      error={errors.dataEntrega?.message}
                      required
                      placeholder="Selecione a data de entrega"
                    />
                  </div>
                </div>

                <Separator />

                <div className="form-section">
                  <FormTextarea
                    id="observacao"
                    label="Observação"
                    value={watch("observacao") || ""}
                    onChange={handleTextareaChange("observacao")}
                    placeholder="Digite informações adicionais, se necessário"
                    error={errors.observacao?.message}
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
                      "Enviar Dados"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className={`tab-panel ${activeTab === "lead" ? "active" : ""}`}>
          <LeadForm />
        </div>

        <footer className="mt-8 text-center text-delta-700 text-sm">
          <p>© 2023 DELTA SELLS. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
