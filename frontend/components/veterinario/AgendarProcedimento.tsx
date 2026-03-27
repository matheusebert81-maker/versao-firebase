import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pill, Syringe, Activity } from "lucide-react";
import { api } from "@/lib/api";

export default function AgendarProcedimento({ internacao, animal, onClose }: { internacao: any, animal: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [tipo, setTipo] = useState("Medicação"); // Medicação, Procedimento, Exame
  const [nome, setNome] = useState("");
  const [dose, setDose] = useState("");
  const [via, setVia] = useState("");
  const [dataPlanejada, setDataPlanejada] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [procedimentoId, setProcedimentoId] = useState("");
  const [prioridade, setPrioridade] = useState("Média");
  const [medSearch, setMedSearch] = useState("");

  const { data: profissionais = [] } = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => api.entities.Profissional.list(),
  });

  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => api.entities.Medicamento.list(),
  });

  const { data: procedimentos = [] } = useQuery({
    queryKey: ['procedimentos'],
    queryFn: () => api.entities.Procedimento.list(),
  });

  const filteredMeds = medicamentos.filter((m: any) => 
    m.nome_comercial.toLowerCase().includes(medSearch.toLowerCase()) || 
    m.principio_ativo.toLowerCase().includes(medSearch.toLowerCase())
  ).slice(0, 5);

  const selectMed = (med: any) => {
    setNome(`${med.nome_comercial} ${med.concentracao}`);
    setVia(med.via_administracao || "Oral");
    setMedSearch("");
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.entities.TarefaVeterinaria.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      onClose();
    }
  });

  const handleSave = () => {
    if (!nome || !dataPlanejada) return;
    
    let descricao = nome;
    if (tipo === "Medicação") {
        descricao = `${nome} - Dose: ${dose} - Via: ${via}`;
    }

    createMutation.mutate({
      animal_id: animal.id,
      internacao_id: internacao.id,
      nome: tipo === "Medicação" ? "Administrar Medicação" : nome,
      descricao: descricao,
      tipo: tipo,
      data_hora_planejada: dataPlanejada,
      status: "Pendente",
      prioridade: prioridade,
      medicamento: tipo === "Medicação" ? nome : null,
      dose: tipo === "Medicação" ? dose : null,
      via: tipo === "Medicação" ? via : null,
      profissional_id: profissionalId,
      procedimento_id: tipo === "Procedimento" ? procedimentoId : null,
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
            {tipo === "Medicação" ? <Pill className="w-5 h-5 text-purple-600" /> : <Activity className="w-5 h-5 text-blue-600" />}
            Agendar Tarefa / Medicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Tipo de Tarefa</Label>
                <Select value={tipo} onValueChange={(val) => setTipo(val || "Medicação")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Medicação">Medicação</SelectItem>
                        <SelectItem value="Procedimento">Procedimento (Curativo, etc)</SelectItem>
                        <SelectItem value="Exame">Coleta de Exame</SelectItem>
                        <SelectItem value="Sinais Vitais">Aferir Sinais Vitais</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Profissional Responsável</Label>
                <Select value={profissionalId} onValueChange={(val) => setProfissionalId(val || "")}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                        {profissionais.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        <div>
            <Label>Prioridade</Label>
            <Select value={prioridade} onValueChange={(val) => setPrioridade(val || "Média")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Alta">Alta (Vermelho)</SelectItem>
                    <SelectItem value="Média">Média (Amarelo)</SelectItem>
                    <SelectItem value="Baixa">Baixa (Verde)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {tipo === "Medicação" ? (
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="relative">
                    <Label className="text-blue-800">Buscar no VetSmart (Medicamentos)</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            value={medSearch} 
                            onChange={e => setMedSearch(e.target.value)} 
                            className="pl-9 bg-white"
                            placeholder="Digite o nome ou princípio ativo..."
                        />
                    </div>
                    {medSearch && filteredMeds.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {filteredMeds.map((med: any) => (
                                <div 
                                    key={med.id} 
                                    className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                                    onClick={() => selectMed(med)}
                                >
                                    <span className="font-bold text-slate-800">{med.nome_comercial}</span> 
                                    <span className="text-slate-500 text-xs ml-1">{med.concentracao} - {med.forma_farmaceutica}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <Label>Medicamento Selecionado</Label>
                    <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do medicamento" className="font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Dose</Label>
                        <Input value={dose} onChange={e => setDose(e.target.value)} placeholder="Ex: 1 comp, 2ml" />
                    </div>
                    <div>
                        <Label>Via de Administração</Label>
                        <Select value={via} onValueChange={(val) => setVia(val || "Oral")}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Oral">Oral (VO)</SelectItem>
                                <SelectItem value="Intravenosa">Intravenosa (IV)</SelectItem>
                                <SelectItem value="Intramuscular">Intramuscular (IM)</SelectItem>
                                <SelectItem value="Subcutânea">Subcutânea (SC)</SelectItem>
                                <SelectItem value="Tópica">Tópica</SelectItem>
                                <SelectItem value="Oftálmica">Oftálmica</SelectItem>
                                <SelectItem value="Otológica">Otológica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        ) : tipo === "Procedimento" ? (
            <div>
                <Label>Procedimento</Label>
                <Select value={procedimentoId} onValueChange={(val) => setProcedimentoId(val || "")}>
                    <SelectTrigger><SelectValue placeholder="Selecione o procedimento..." /></SelectTrigger>
                    <SelectContent>
                        {procedimentos.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Label className="mt-2">Descrição Adicional</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Detalhes do curativo" />
            </div>
        ) : (
            <div>
                <Label>Descrição da Tarefa</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Coleta de sangue" />
            </div>
        )}

        <div>
            <Label>Data e Hora Planejada</Label>
            <Input type="datetime-local" value={dataPlanejada} onChange={e => setDataPlanejada(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
                Agendar Tarefa
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
