
import { z } from "zod";

// Lead form validation schema
export const leadFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
  instagram: z.string().optional(),
  interesse: z.string().min(1, "Interesse é obrigatório"),
  statusLead: z.enum(["Novo", "Em negociação", "Qualificado", "Não qualificado"]),
  dataLembrete: z.date({
    required_error: "Data de lembrete é obrigatória",
  }),
  motivoLembrete: z.string().min(1, "Motivo do lembrete é obrigatório"),
  observacoes: z.string().optional()
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
