
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
import { formatCPF, formatPhone, formatCurrency } from "@/lib/formatters";
import { formSchema, type FormValues } from "@/lib/validators";
import { 
  submitToGoogleSheets, 
  isWebhookConfigured, 
  sendToWhatsAppFallback, 
  getGoogleSheetViewUrl 
} from "@/services/GoogleSheetsService";
import { LogService } from "@/services/LogService";
import { format } from "date-fns";

const CustomerForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [valorNumerico, setValorNumerico] = useState(0);
  const [freteNumerico, setFreteNumerico] = useState(15);
  const [customCupom, setCustomCupom] = useState("");
  const [jurosPersonalizado, setJurosPersonalizado] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSheetLink, setShowSheetLink] = useState(false);
  
  useEffect(() => {
    const configured = isWebhookConfigured();
    setIsConfigured(configured);
    LogService.info(`CustomerForm - Webhook configurado: ${configured}`);
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
      parcelamento: "",
      jurosAplicado: "",
      cupom: "",
      localizacao: "",
      frete: "15,00",
      dataPagamento: undefined,
      dataEntrega: undefined,
      valorTotal: "R$ 15,00",
      observacao: "",
    },
  });

  const formaPagamento = watch("formaPagamento");
  const cupom = watch("cupom");
  const valor = watch("valor");
  const frete = watch("frete");
  const parcelamento = watch("parcelamento");
  const jurosAplicado = watch("jurosAplicado");
  
  useEffect(() => {
    try {
      const cleanValor = valor.replace(/[^\d,]/g, "").replace(",", ".");
      const cleanFrete = frete.replace(/[^\d,]/g, "").replace(",", ".");
      
      const parsedValor = cleanValor ? parseFloat(cleanValor) : 0;
      const parsedFrete = cleanFrete ? parseFloat(cleanFrete) : 0;
      
      setValorNumerico(parsedValor);
      setFreteNumerico(parsedFrete);
      
      let descontoPercentual = 0;
      
      if (cupom === "5% OFF") {
        descontoPercentual = 5;
      } else if (cupom === "10% OFF") {
        descontoPercentual = 10;
      } else if (cupom === "15% OFF") {
        descontoPercentual = 15;
      } else if (cupom === "Personalizado" && customCupom) {
        const percentMatch = customCupom.match(/(\d+)/);
        if (percentMatch) {
          descontoPercentual = parseInt(percentMatch[0]);
        }
      }
      
      const desconto = (parsedValor * descontoPercentual) / 100;
      const valorComDesconto = parsedValor - desconto;
      
      let valorFinal = valorComDesconto;
      
      // Aplicar juros se houver parcelamento com juros
      if (parcelamento) {
        const numParcelas = parseInt(parcelamento.split("x")[0]);
        
        // Verificar se tem juros personalizado
        if (jurosAplicado === "Personalizado" && jurosPersonalizado) {
          const taxaMatch = jurosPersonalizado.match(/(\d+)/);
          if (taxaMatch) {
            const taxaJuros = parseInt(taxaMatch[0]) / 100;
            valorFinal = valorComDesconto * (1 + taxaJuros);
          }
        }
        // Aplicar juros padrão para parcelamento com juros
        else if (parcelamento.includes("com juros")) {
          // Juros de 3% por parcela acima de 3x
          if (numParcelas > 3) {
            const taxaJuros = 0.03 * (numParcelas - 3);
            valorFinal = valorComDesconto * (1 + taxaJuros);
          }
        }
      }
      
      const total = valorFinal + parsedFrete;
      
      // Arredondar para duas casas decimais
      const totalArredondado = Math.round(total * 100) / 100;
      const totalEmCentavos = Math.round(totalArredondado * 100);
      
      setValue("valorTotal", formatCurrency(String(totalEmCentavos)));
      
      LogService.debug("Valores atualizados", { 
        parsedValor, 
        parsedFrete, 
        descontoPercentual, 
        desconto,
        valorComDesconto,
        formaPagamento,
        parcelamento,
        jurosAplicado,
        jurosPersonalizado,
        valorFinal,
        total,
        totalArredondado,
        totalEmCentavos
      });
    } catch (error) {
      LogService.error("Erro ao calcular valor total", error);
      setValue("valorTotal", formatCurrency(String(parseFloat(frete.replace(/[^\d,]/g, "").replace(",", ".")) * 100 || 1500)));
    }
  }, [valor, frete, cupom, customCupom, formaPagamento, parcelamento, jurosAplicado, jurosPersonalizado, setValue]);

  const handleInputChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValue(field, e.target.value);
  };

  const handleSelectChange = (field: keyof FormValues) => (value: string) => {
    setValue(field, value);
    
    if (field === "cupom" && value !== "Personalizado") {
      setCustomCupom("");
    }
    
    if (field === "jurosAplicado" && value !== "Personalizado") {
      setJurosPersonalizado("");
    }
  };

  const handleCustomCupomChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomCupom(e.target.value);
    
    if (e.target.value) {
      setValue("cupom", "Personalizado");
    } else {
      setValue("cupom", "");
    }
  };
  
  const handleJurosPersonalizadoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJurosPersonalizado(e.target.value);
    
    if (e.target.value) {
      setValue("jurosAplicado", "Personalizado");
    } else {
      setValue("jurosAplicado", "");
    }
  };

  const handleTextareaChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(field, e.target.value);
  };

  const handleDateChange = (field: keyof FormValues) => (date: Date | undefined) => {
    setValue(field, date);
  };

  const handleSendToWhatsApp = (data: FormValues) => {
    LogService.info("Redirecionando para envio via WhatsApp", { formType: "cliente" });
    sendToWhatsAppFallback({
      ...data,
      dataPagamento: data.dataPagamento ? format(data.dataPagamento, "dd/MM/yy") : "",
      dataEntrega: data.dataEntrega ? format(data.dataEntrega, "dd/MM/yy") : "",
      formType: 'cliente',
    });
  };

  const openGoogleSheet = () => {
    LogService.info("Abrindo Google Sheet para visualização");
    window.open(getGoogleSheetViewUrl('cliente'), '_blank');
  };

  const onSubmit = async (data: FormValues) => {
    LogService.info("Formulário de Cliente - Submissão iniciada", { nome: data.nome, telefone: data.telefone });
    setIsSubmitting(true);
    setSubmitError(null);
    setShowSheetLink(false);
    
    try {
      const formattedData = {
        ...data,
        cupom: data.cupom === "Personalizado" ? customCupom : data.cupom,
        jurosAplicado: data.jurosAplicado === "Personalizado" ? jurosPersonalizado : data.jurosAplicado,
        dataPagamento: data.dataPagamento ? format(data.dataPagamento, "dd/MM/yy") : "",
        dataEntrega: data.dataEntrega ? format(data.dataEntrega, "dd/MM/yy") : "",
        formType: 'cliente',
      };
      
      LogService.debug("Formulário de Cliente - Dados formatados para envio", formattedData);
      
      let attempt = 1;
      let result;
      
      while (attempt <= 3) {
        LogService.info(`Formulário de Cliente - Tentativa ${attempt}/3 de envio`);
        
        try {
          result = await submitToGoogleSheets(formattedData);
          LogService.info(`Formulário de Cliente - Resposta da tentativa ${attempt}`, result);
          
          if (result.success) {
            break;
          } else {
            if (!result.message.includes("network") && !result.message.includes("CORS")) {
              break;
            }
          }
        } catch (innerError) {
          LogService.error(`Formulário de Cliente - Erro na tentativa ${attempt}`, innerError);
        }
        
        attempt++;
        if (attempt <= 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (result?.success) {
        LogService.info("Formulário de Cliente - Envio bem-sucedido");
        toast({
          title: "Sucesso!",
          description: "Dados enviados com sucesso para a planilha.",
        });
        setSubmitted(true);
        setShowSheetLink(true);
        
        setTimeout(() => {
          reset();
          setSubmitted(false);
        }, 3000);
      } else {
        const errorMsg = result?.message || "Erro desconhecido ao enviar dados.";
        LogService.warn("Formulário de Cliente - Falha no envio", { errorMsg });
        setSubmitError(errorMsg);
        toast({
          title: "Aviso",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      LogService.error("Formulário de Cliente - Erro crítico na submissão", error);
      
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
              
              <FormSelect
                id="parcelamento"
                label="Parcelamento"
                value={watch("parcelamento") || ""}
                onChange={handleSelectChange("parcelamento")}
                options={[
                  { value: "", label: "À vista" },
                  { value: "2x sem juros", label: "2x sem juros" },
                  { value: "3x sem juros", label: "3x sem juros" },
                  { value: "4x com juros", label: "4x com juros" },
                  { value: "5x com juros", label: "5x com juros" },
                  { value: "6x com juros", label: "6x com juros" },
                  { value: "7x com juros", label: "7x com juros" },
                  { value: "8x com juros", label: "8x com juros" },
                  { value: "9x com juros", label: "9x com juros" },
                  { value: "10x com juros", label: "10x com juros" },
                  { value: "11x com juros", label: "11x com juros" },
                  { value: "12x com juros", label: "12x com juros" },
                ]}
                error={errors.parcelamento?.message}
              />
            </div>
            
            {parcelamento && parcelamento.includes("com juros") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  id="jurosAplicado"
                  label="Juros Aplicado"
                  value={watch("jurosAplicado") || ""}
                  onChange={handleSelectChange("jurosAplicado")}
                  options={[
                    { value: "", label: "Padrão (3% por parcela acima de 3x)" },
                    { value: "5%", label: "5% de juros" },
                    { value: "10%", label: "10% de juros" },
                    { value: "15%", label: "15% de juros" },
                    { value: "Personalizado", label: "Juros personalizado" },
                  ]}
                  error={errors.jurosAplicado?.message}
                />
                
                {jurosAplicado === "Personalizado" && (
                  <div className="mt-2">
                    <FormInput
                      id="juros-personalizado"
                      label=""
                      value={jurosPersonalizado}
                      onChange={handleJurosPersonalizadoChange}
                      placeholder="Ex: 7%"
                      error=""
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
              <div>
                <FormSelect
                  id="cupom"
                  label="Cupom de Desconto"
                  value={watch("cupom") || ""}
                  onChange={handleSelectChange("cupom")}
                  options={[
                    { value: "", label: "Nenhum" },
                    { value: "5% OFF", label: "5% de desconto" },
                    { value: "10% OFF", label: "10% de desconto" },
                    { value: "15% OFF", label: "15% de desconto" },
                    { value: "Personalizado", label: "Desconto personalizado" },
                  ]}
                  error={errors.cupom?.message}
                />
                
                {cupom === "Personalizado" && (
                  <div className="mt-2">
                    <FormInput
                      id="custom-cupom"
                      label=""
                      value={customCupom}
                      onChange={handleCustomCupomChange}
                      placeholder="Ex: 20% OFF"
                      error=""
                    />
                  </div>
                )}
              </div>
              
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
            
            <div className="grid grid-cols-1 gap-4">
              <FormInput
                id="valorTotal"
                label="Valor Total"
                value={watch("valorTotal")}
                onChange={handleInputChange("valorTotal")}
                placeholder="R$ 0,00"
                error={errors.valorTotal?.message}
                className="font-semibold text-lg"
                required
                readOnly={true}
              />
              {parcelamento && (
                <div className="text-sm text-delta-600">
                  {parcelamento.includes("com juros") 
                    ? jurosAplicado === "Personalizado"
                      ? `Valor será parcelado em ${parcelamento} (${jurosPersonalizado} de juros)`
                      : jurosAplicado
                        ? `Valor será parcelado em ${parcelamento} (${jurosAplicado} de juros)`
                        : `Valor será parcelado em ${parcelamento} (3% de juros por parcela acima de 3x)`
                    : `Valor será parcelado em ${parcelamento}`}
                </div>
              )}
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
  );
};

export default CustomerForm;
