import React, { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Stethoscope, 
  Activity, 
  FileText, 
  Pill, 
  Syringe, 
  Clock, 
  CheckCircle2, 
  Printer,
  MoreHorizontal,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import PrescriptionBuilder from "./PrescriptionBuilder";
import VacinasManager from "./VacinasManager";
import AnamneseForm from "./AnamneseForm";
import TermosManager from "./TermosManager";
import AgendarProcedimento from "./AgendarProcedimento";

export default function ProntuarioView({ internacao, animal, onBack }: { internacao: any, animal: any, onBack: () => void }) {
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<string | null>(null); // 'consulta', 'sinais', 'vacina', 'receita', etc.
  
  // Dados do prontuário
  const { data: registros = [] } = useQuery({
    queryKey: ['prontuario', internacao.id],
    queryFn: () => api.entities.RegistroProntuario.list('-data_hora'),
    select: (data) => data.filter((r: any) => r.internacao_id === internacao.id)
  });

  // Mutation para atualizar status da internação
  const updateInternacaoMutation = useMutation({
    mutationFn: (data: any) => api.entities.Internacao.update(internacao.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes'] });
      onBack();
    }
  });

  // Action Grid Configuration
  const actions = [
    { id: 'consulta', label: 'Evolução Clínica', icon: Stethoscope, color: 'bg-blue-600', desc: 'Registrar evolução diária' },
    { id: 'sinais', label: 'Sinais Vitais', icon: Activity, color: 'bg-emerald-600', desc: 'Peso, temperatura, FC, FR' },
    { id: 'agendar', label: 'Agendar Procedimento', icon: Clock, color: 'bg-purple-600', desc: 'Medicações, exames, curativos' },
    { id: 'receita', label: 'Prescrição', icon: Pill, color: 'bg-rose-600', desc: 'Receitas e medicamentos' },
    { id: 'vacina', label: 'Imunização', icon: Syringe, color: 'bg-amber-600', desc: 'Vacinas e vermífugos' },
    { id: 'documentos', label: 'Documentos', icon: FileText, color: 'bg-slate-600', desc: 'Termos e atestados' },
  ];

  // Component to render the active action form
  const ActionPanel = () => {
    switch(activeAction) {
      case 'consulta': return <AnamneseForm animal={animal} veterinarioId={internacao.veterinario_id} onClose={() => setActiveAction(null)} />;
      case 'receita': return <PrescriptionBuilder animalId={animal.id} clienteId={animal.cliente_id} onClose={() => setActiveAction(null)} />;
      case 'vacina': return <VacinasManager animal={animal} />;
      case 'agendar': return <AgendarProcedimento internacao={internacao} animal={animal} onClose={() => setActiveAction(null)} />;
      case 'documentos': return <TermosManager />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <header className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {animal?.nome}
                <Badge variant={internacao.status === "Em Andamento" ? "default" : "secondary"} className="ml-2">
                  {internacao.status}
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 font-medium">{animal?.especie} • {animal?.raca} • {animal?.peso}kg • Box: {internacao.box_baia}</p>
            </div>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
            onClick={() => {
               if(confirm("Confirmar alta médica?")) {
                  updateInternacaoMutation.mutate({ status: "Alta Médica", data_alta: new Date().toISOString() });
               }
            }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Alta Médica
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Clock className="w-5 h-5 text-slate-500" /> Linha do Tempo
           </h2>
           <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <div className="space-y-6 relative ml-4">
                 <div className="absolute left-0 top-2 bottom-0 w-0.5 bg-slate-200"></div>
                 {registros.map((reg: any) => (
                   <Card key={reg.id} className="ml-8">
                     <CardHeader className="py-2 px-4 bg-slate-50 border-b text-xs font-bold text-slate-500">
                        {format(new Date(reg.data_hora), "dd/MM • HH:mm", { locale: ptBR })} - {reg.tipo}
                     </CardHeader>
                     <CardContent className="p-4 text-sm text-slate-700 whitespace-pre-line">
                        {reg.descricao}
                     </CardContent>
                   </Card>
                 ))}
              </div>
           </ScrollArea>
        </div>

        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" /> Central de Ações
              </h2>
              <AnimatePresence mode="wait">
                 {activeAction ? (
                    <motion.div key="panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                       <ActionPanel />
                    </motion.div>
                 ) : (
                    <motion.div key="grid" className="grid grid-cols-2 gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                       {actions.map((action) => (
                          <button key={action.id} onClick={() => setActiveAction(action.id)} className="flex flex-col items-center justify-center p-4 rounded-xl border bg-slate-50 hover:bg-white hover:border-blue-200 transition-all h-32">
                             <div className={`w-10 h-10 rounded-xl ${action.color} text-white flex items-center justify-center mb-2`}>
                                <action.icon className="w-5 h-5" />
                             </div>
                             <span className="font-bold text-slate-700 text-xs">{action.label}</span>
                          </button>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </main>
    </div>
  );
}
