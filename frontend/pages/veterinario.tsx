import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Activity, FileText, Syringe, ClipboardList, BarChart3 } from "lucide-react";
import db from "@/lib/db";

import InternacoesList from "@/components/InternacoesList";
import InternacaoForm from "@/components/InternacaoForm";
import AgendarProcedimento from "@/components/veterinario/AgendarProcedimento";
import Dummy from "@/components/Dummy";
const ProntuarioView = Dummy;
const OrcamentosList = Dummy;
const ProcedimentosList = Dummy;
const MapaExecucoes = Dummy;
const VeterinaryReports = Dummy;
const PrescriptionBuilder = Dummy;
const TermosManager = Dummy;
const ControleVacinas = Dummy;

export default function Veterinario() {
  const [activeTab, setActiveTab] = useState("internacoes");
  const [showInternacaoForm, setShowInternacaoForm] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showAgendarForm, setShowAgendarForm] = useState(false);
  const [selectedInternacao, setSelectedInternacao] = useState(null);
  const [selectedInternacaoForAgendar, setSelectedInternacaoForAgendar] = useState<{internacao: any, animal: any} | null>(null);

  const queryClient = useQueryClient();

  const { data: internacoes = [], isLoading: isLoadingInternacoes } = useQuery({
    queryKey: ['internacoes'],
    queryFn: () => db.entities.Internacao.list('-data_entrada'),
  });

  const { data: animais = [] } = useQuery({
    queryKey: ['animais'],
    queryFn: () => db.entities.Animal.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => db.entities.Cliente.list(),
  });

  if (selectedInternacao) {
    return (
      <ProntuarioView />
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Centro Veterinário
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Gestão inteligente de pacientes e internações</p>
          </div>
          {activeTab === "internacoes" && (
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowPrescription(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
              >
                <FileText className="w-5 h-5 mr-2 text-rose-500" />
                Nova Receita
              </Button>
              <Button 
                onClick={() => setShowInternacaoForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Internação
              </Button>
            </div>
          )}
        </div>

        {showInternacaoForm && (
          <InternacaoForm onClose={() => setShowInternacaoForm(false)} />
        )}

        {showAgendarForm && selectedInternacaoForAgendar && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <AgendarProcedimento 
                internacao={selectedInternacaoForAgendar.internacao} 
                animal={selectedInternacaoForAgendar.animal} 
                onClose={() => setShowAgendarForm(false)} 
              />
            </div>
          </div>
        )}

        {showPrescription && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
             <PrescriptionBuilder />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/95 backdrop-blur-sm p-1.5 rounded-2xl border-2 border-blue-100 shadow-lg inline-flex h-auto gap-1">
            <TabsTrigger value="internacoes" className="px-4 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all">
              <Activity className="w-4 h-4 mr-2" />
              Internações
            </TabsTrigger>
            <TabsTrigger value="mapa" className="px-4 py-2 rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 transition-all">
              <ClipboardList className="w-4 h-4 mr-2" />
              Mapa de Execução
            </TabsTrigger>
            <TabsTrigger value="orcamentos" className="px-4 py-2 rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 transition-all">
              <FileText className="w-4 h-4 mr-2" />
              Orçamentos
            </TabsTrigger>
            <TabsTrigger value="procedimentos" className="px-4 py-2 rounded-lg data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 transition-all">
              <Syringe className="w-4 h-4 mr-2" />
              Procedimentos
            </TabsTrigger>
            <TabsTrigger value="vacinas" className="px-4 py-2 rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 transition-all">
              <Syringe className="w-4 h-4 mr-2" />
              Controle Vacinas
            </TabsTrigger>
            <TabsTrigger value="termos" className="px-4 py-2 rounded-lg data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 transition-all">
              <FileText className="w-4 h-4 mr-2" />
              Docs & Termos
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="px-4 py-2 rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 transition-all">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internacoes" className="animate-in fade-in-50 duration-300">
            <InternacoesList onAgendar={(internacao, animal) => {
              setSelectedInternacaoForAgendar({internacao, animal});
              setShowAgendarForm(true);
            }} />
          </TabsContent>

          <TabsContent value="orcamentos">
            <OrcamentosList />
          </TabsContent>

          <TabsContent value="procedimentos">
            <ProcedimentosList />
          </TabsContent>

          <TabsContent value="mapa">
            <MapaExecucoes />
          </TabsContent>

          <TabsContent value="relatorios">
            <VeterinaryReports />
          </TabsContent>
          
          <TabsContent value="vacinas">
            <ControleVacinas />
          </TabsContent>
          
          <TabsContent value="termos">
            <TermosManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
