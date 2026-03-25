import React, { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Trash2, Printer, FileText, Edit3, Save, Pill, Bookmark, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";

export default function PrescriptionBuilder({ animalId, clienteId, onClose }: { animalId?: string, clienteId?: string, onClose?: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1: Build, 2: Preview/Print
  
  // Prescription Metadata
  const [selectedAnimalId, setSelectedAnimalId] = useState(animalId || "");
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || "");
  const [receitaTipo, setReceitaTipo] = useState("Simples");
  const [observacoes, setObservacoes] = useState(""); // Rich Text
  
  // Items
  const [items, setItems] = useState<any[]>([]);
  
  // Template Management State
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showLoadTemplate, setShowLoadTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const [currentItem, setCurrentItem] = useState({
    medicamento_id: "",
    nome: "",
    conc_valor: "",
    conc_unidade: "mg",
    forma: "Comprimido",
    dose_valor: "",
    dose_unidade: "comprimido(s)",
    frequencia_valor: "",
    frequencia_unidade: "horas", 
    duracao_valor: "",
    duracao_unidade: "dias", 
    via: "Oral",
    instrucoes_custom: ""
  });

  // Constants for Dropdowns
  const FORMAS = ["Comprimido", "Cápsula", "Suspensão", "Solução", "Xarope", "Gotas", "Spray", "Pomada", "Creme", "Gel", "Pasta", "Injetável", "Supositório", "Pó", "Transdérmica"];
  const VIAS = ["Oral", "Tópica", "Oftálmica", "Otológica", "Subcutânea", "Intramuscular", "Intravenosa", "Retal", "Inalatória", "Transdérmica", "Intra-articular"];
  const UNIDADES_CONC = ["mg", "mcg", "g", "ml", "mg/ml", "mcg/ml", "UI", "%", "mg/g"];
  const UNIDADES_DOSE = ["comprimido(s)", "cápsula(s)", "ml", "gota(s)", "jato(s)", "aplicação(ões)", "bisnaga(s)", "ampola(s)", "unidade(s)", "mg/kg"];

  // Autocomplete state
  const [medSearch, setMedSearch] = useState("");

  // Queries
  const { data: animais = [] } = useQuery({
    queryKey: ['animais'],
    queryFn: () => api.entities.Animal.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.entities.Cliente.list(),
  });

  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => api.entities.Medicamento.list(),
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ['modelos_receita'],
    queryFn: () => api.entities.ModeloReceita.list(),
  });

  // Filtered Meds
  const filteredMeds = medicamentos.filter((m: any) => 
    m.nome_comercial.toLowerCase().includes(medSearch.toLowerCase()) || 
    m.principio_ativo.toLowerCase().includes(medSearch.toLowerCase())
  ).slice(0, 10); // Limit results

  // Auto-fill Current Item when Med is selected
  const selectMed = (med: any) => {
    // Try to parse concentration (e.g. "50mg" -> "50" + "mg")
    const concMatch = med.concentracao ? med.concentracao.match(/^([\d\.,]+)\s*(.*)$/) : null;
    
    // Guess dose unit based on form
    let defaultDoseUnit = "unidade(s)";
    if (med.forma_farmaceutica?.toLowerCase().includes("comprimido")) defaultDoseUnit = "comprimido(s)";
    else if (med.forma_farmaceutica?.toLowerCase().includes("cápsula")) defaultDoseUnit = "cápsula(s)";
    else if (med.forma_farmaceutica?.toLowerCase().includes("gotas")) defaultDoseUnit = "gota(s)";
    else if (med.forma_farmaceutica?.toLowerCase().includes("solução") || med.forma_farmaceutica?.toLowerCase().includes("xarope")) defaultDoseUnit = "ml";
    else if (med.forma_farmaceutica?.toLowerCase().includes("spray")) defaultDoseUnit = "jato(s)";
    else if (med.forma_farmaceutica?.toLowerCase().includes("pomada") || med.forma_farmaceutica?.toLowerCase().includes("creme")) defaultDoseUnit = "aplicação(ões)";

    setCurrentItem({
      ...currentItem,
      medicamento_id: med.id,
      nome: med.nome_comercial,
      conc_valor: concMatch ? concMatch[1] : med.concentracao,
      conc_unidade: concMatch && UNIDADES_CONC.includes(concMatch[2]) ? concMatch[2] : "mg",
      forma: med.forma_farmaceutica,
      via: med.via_administracao,
      dose_unidade: defaultDoseUnit
    });
    setMedSearch(med.nome_comercial);
  };

  // Veterinary Calculation Helper
  const calculateDoseDetails = () => {
    const animal = animais.find((a: any) => a.id === selectedAnimalId);
    const peso = animal?.peso || 0;
    const { dose_valor, dose_unidade, conc_valor, conc_unidade } = currentItem;

    if (!peso || !dose_valor || !conc_valor) return null;

    // Scenario 1: Prescribed in mg/kg, Concentration in mg/ml or mg/cp
    if (dose_unidade === "mg/kg") {
        const totalMg = parseFloat(dose_valor) * peso;
        
        if (conc_unidade === "mg/ml" || conc_unidade === "mg") { // mg/ml (liquid) or mg (tablet strength)
             const amount = totalMg / parseFloat(conc_valor);
             // Round to 2 decimals if liquid, 0.25 if tablet
             const isLiquid = conc_unidade === "mg/ml";
             const roundedAmount = isLiquid ? parseFloat(amount.toFixed(2)) : (Math.round(amount * 4) / 4);
             
             const unit = isLiquid ? "ml" : "comprimido(s)";
             return {
                 totalMg,
                 amount: roundedAmount,
                 unit,
                 desc: `${roundedAmount} ${unit} (Ref: ${peso}kg x ${dose_valor}mg/kg = ${totalMg.toFixed(1)}mg total)`
             };
        }
    }
    return null;
  };

  // Generate Instruction Text Automatically
  const generateInstruction = () => {
    const { nome, conc_valor, conc_unidade, forma, dose_valor, dose_unidade, frequencia_valor, frequencia_unidade, duracao_valor, duracao_unidade, via } = currentItem;
    
    if (!nome) return "";

    const concentracaoFull = `${conc_valor}${conc_unidade}`;
    
    // Check for calculated dose
    const calc = calculateDoseDetails();
    let doseText = "";
    
    if (calc) {
        doseText = `${calc.amount} ${calc.unit}`;
    } else {
        doseText = `${dose_valor} ${dose_unidade}`;
    }

    let text = `${nome} ${concentracaoFull} (${forma}) - Via ${via}.\n`;
    text += `Administrar ${doseText}`;
    
    if (frequencia_valor) {
        if (frequencia_unidade === "horas") {
            text += ` a cada ${frequencia_valor} horas`;
        } else {
            text += ` ${frequencia_valor} vezes ao dia`;
        }
    }

    if (duracao_valor) {
        text += ` por ${duracao_valor} ${duracao_unidade}`;
    } else if (duracao_unidade === "Uso Contínuo") {
        text += `, uso contínuo`;
    } else {
        text += `.`;
    }

    return text;
  };

  const addItem = () => {
    const instruction = currentItem.instrucoes_custom || generateInstruction();
    // Store composite strings for compatibility
    const itemToSave = {
        ...currentItem,
        concentracao: `${currentItem.conc_valor}${currentItem.conc_unidade}`,
        dose: `${currentItem.dose_valor} ${currentItem.dose_unidade}`,
        instrucoes_texto: instruction
    };
    setItems([...items, itemToSave]);
    
    // Reset current item
    setCurrentItem({
      medicamento_id: "",
      nome: "",
      conc_valor: "",
      conc_unidade: "mg",
      forma: "Comprimido",
      dose_valor: "",
      dose_unidade: "comprimido(s)",
      frequencia_valor: "",
      frequencia_unidade: "horas",
      duracao_valor: "",
      duracao_unidade: "dias",
      via: "Oral",
      instrucoes_custom: ""
    });
    setMedSearch("");
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Handle Save
  const createMutation = useMutation({
    mutationFn: (data: any) => api.entities.Receita.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      // Maybe show toast?
      if (onClose) onClose();
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => api.entities.ModeloReceita.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos_receita'] });
      setShowSaveTemplate(false);
      setTemplateName("");
      alert("Modelo salvo com sucesso!");
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => api.entities.ModeloReceita.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos_receita'] });
    }
  });

  const handleSaveTemplate = () => {
    if (!templateName) return;
    createTemplateMutation.mutate({
      nome: templateName,
      tipo_modelo: receitaTipo,
      itens: items,
      observacoes: observacoes
    });
  };

  const loadTemplate = (modelo: any) => {
    setReceitaTipo(modelo.tipo_modelo || "Simples");
    setItems(modelo.itens || []);
    setObservacoes(modelo.observacoes || "");
    setShowLoadTemplate(false);
  };

  // Use Effect to update custom instruction when fields change (if it hasn't been manually edited drastically)
  // Simple logic: if custom instruction is empty or matches previous auto-generation, update it.
  useEffect(() => {
      if (currentItem.nome) {
          setCurrentItem(curr => ({...curr, instrucoes_custom: generateInstruction()}));
      }
  }, [
      currentItem.nome, currentItem.conc_valor, currentItem.conc_unidade, currentItem.forma, 
      currentItem.dose_valor, currentItem.dose_unidade, currentItem.frequencia_valor, 
      currentItem.frequencia_unidade, currentItem.duracao_valor, currentItem.duracao_unidade, currentItem.via
  ]);

  const handleSave = () => {
    // In a real app, we would get the logged in vet ID
    const vetId = "current-user-id"; 

    createMutation.mutate({
      veterinario_id: vetId, // Mocked for now
      animal_id: selectedAnimalId,
      cliente_id: selectedClienteId,
      data_emissao: new Date().toISOString(),
      tipo_modelo: receitaTipo,
      itens: items,
      observacoes: observacoes
    });
  };

  // Update Client when Animal Selected
  useEffect(() => {
    if (selectedAnimalId) {
      const animal = animais.find((a: any) => a.id === selectedAnimalId);
      if (animal) setSelectedClienteId(animal.cliente_id);
    }
  }, [selectedAnimalId, animais]);

  if (step === 2) {
    return (
      <PrescriptionPrintPreview 
        items={items} 
        animal={animais.find((a: any) => a.id === selectedAnimalId)}
        cliente={clientes.find((c: any) => c.id === selectedClienteId)}
        receitaTipo={receitaTipo}
        observacoes={observacoes}
        onBack={() => setStep(1)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Emitir Receita
        </h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLoadTemplate(true)}>
                <FolderOpen className="w-4 h-4 mr-2" /> Carregar Modelo
            </Button>
            <Button variant="outline" onClick={() => setShowSaveTemplate(true)} disabled={items.length === 0}>
                <Bookmark className="w-4 h-4 mr-2" /> Salvar como Modelo
            </Button>
            <Button variant="ghost" onClick={onClose}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Save Template Modal */}
      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
            <DialogHeader><DialogTitle>Salvar Modelo de Receita</DialogTitle></DialogHeader>
            <div className="py-4">
                <Label>Nome do Modelo</Label>
                <Input 
                    value={templateName} 
                    onChange={e => setTemplateName(e.target.value)} 
                    placeholder="Ex: Protocolo Pós-Castração Cães"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>Cancelar</Button>
                <Button onClick={handleSaveTemplate} className="bg-green-600 hover:bg-green-700">Salvar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Modal */}
      <Dialog open={showLoadTemplate} onOpenChange={setShowLoadTemplate}>
        <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Carregar Modelo</DialogTitle></DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto py-4">
                {modelos.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhum modelo salvo ainda.</p>
                ) : (
                    modelos.map((modelo: any) => (
                        <div key={modelo.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
                            <div className="cursor-pointer flex-1" onClick={() => loadTemplate(modelo)}>
                                <p className="font-bold text-slate-800">{modelo.nome}</p>
                                <p className="text-xs text-slate-500">{modelo.itens?.length || 0} medicamentos • {modelo.tipo_modelo}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-400 hover:text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(confirm("Excluir este modelo?")) deleteTemplateMutation.mutate(modelo.id);
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Paciente e Tutor</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <Label>Animal</Label>
                 <Select value={selectedAnimalId} onValueChange={(val) => setSelectedAnimalId(val || "")}>
                   <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                   <SelectContent>
                     {animais.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label>Tutor</Label>
                 <Select value={selectedClienteId} onValueChange={(val) => setSelectedClienteId(val || "")} disabled>
                   <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                   <SelectContent>
                     {clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label>Tipo de Receita</Label>
                 <Select value={receitaTipo} onValueChange={(val) => setReceitaTipo(val || "Simples")}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Simples">Simples</SelectItem>
                     <SelectItem value="Controle Especial">Controle Especial (C1/C5)</SelectItem>
                     <SelectItem value="Manipulação">Manipulação</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Observações / Orientações</CardTitle></CardHeader>
            <CardContent>
              <ReactQuill 
                theme="snow" 
                value={observacoes} 
                onChange={setObservacoes} 
                className="h-40 mb-12"
              />
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right: Item Builder */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-50 border-blue-200">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Pill className="w-4 h-4" /> Adicionar Medicamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label>Buscar Medicamento (Nome ou Princípio Ativo)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={medSearch} 
                    onChange={e => setMedSearch(e.target.value)} 
                    className="pl-9"
                    placeholder="Ex: Fenobarbital, Apoquel..."
                  />
                </div>
                {medSearch && filteredMeds.length > 0 && !currentItem.medicamento_id && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {filteredMeds.map((med: any) => (
                      <div 
                        key={med.id} 
                        className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                        onClick={() => selectMed(med)}
                      >
                        <span className="font-bold">{med.nome_comercial}</span> <span className="text-slate-500 text-xs">{med.concentracao} - {med.forma_farmaceutica}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                    <Label>Nome do Medicamento</Label>
                    <Input value={currentItem.nome} onChange={e => setCurrentItem({...currentItem, nome: e.target.value})} className="font-bold" />
                </div>
                
                <div className="md:col-span-3">
                    <Label>Concentração</Label>
                    <div className="flex gap-1">
                        <Input 
                            value={currentItem.conc_valor} 
                            onChange={e => setCurrentItem({...currentItem, conc_valor: e.target.value})} 
                            placeholder="Ex: 50" 
                        />
                        <Select value={currentItem.conc_unidade} onValueChange={v => setCurrentItem({...currentItem, conc_unidade: v || "mg"})}>
                            <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {UNIDADES_CONC.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <Label>Forma Farmacêutica</Label>
                    <Select value={currentItem.forma} onValueChange={v => setCurrentItem({...currentItem, forma: v || "Comprimido"})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                         {FORMAS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-2">
                    <Label>Via</Label>
                    <Select value={currentItem.via} onValueChange={v => setCurrentItem({...currentItem, via: v || "Oral"})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                         {VIAS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider">Posologia & Duração</h4>
                  {(() => {
                      const calc = calculateDoseDetails();
                      if (calc) return (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-bold">
                              ⚡ Calc: {calc.amount} {calc.unit}
                          </span>
                      );
                  })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <Label className="text-blue-900">Dose</Label>
                      <div className="flex gap-1">
                          <Input 
                              value={currentItem.dose_valor} 
                              onChange={e => setCurrentItem({...currentItem, dose_valor: e.target.value})} 
                              placeholder="Qtd" 
                          />
                          <Select value={currentItem.dose_unidade} onValueChange={v => setCurrentItem({...currentItem, dose_unidade: v || "comprimido(s)"})}>
                              <SelectTrigger className="min-w-[110px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  {UNIDADES_DOSE.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      {currentItem.dose_unidade === "mg/kg" && (
                           <p className="text-[10px] text-slate-500 mt-1">
                              *Baseado no peso do animal ({animais.find((a: any) => a.id === selectedAnimalId)?.peso || 0} kg)
                           </p>
                      )}
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Label>Frequência</Label>
                        <Input type="number" value={currentItem.frequencia_valor} onChange={e => setCurrentItem({...currentItem, frequencia_valor: e.target.value})} placeholder="Ex: 8" />
                    </div>
                    <div className="w-24">
                      <Select value={currentItem.frequencia_unidade} onValueChange={v => setCurrentItem({...currentItem, frequencia_unidade: v || "horas"})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="horas">em horas</SelectItem>
                          <SelectItem value="vezes">vezes/dia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                 </div>
                 <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Label>Duração</Label>
                        <Input type="number" value={currentItem.duracao_valor} onChange={e => setCurrentItem({...currentItem, duracao_valor: e.target.value})} placeholder="Ex: 7" />
                    </div>
                    <div className="w-24">
                      <Select value={currentItem.duracao_unidade} onValueChange={v => setCurrentItem({...currentItem, duracao_unidade: v || "dias"})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dias">dias</SelectItem>
                          <SelectItem value="semanas">semanas</SelectItem>
                          <SelectItem value="Uso Contínuo">Uso Contínuo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    </div>
                    </div>
                    </div>

                    <div>
                <Label>Texto Gerado (Editável)</Label>
                <Textarea 
                  value={currentItem.instrucoes_custom || generateInstruction()} 
                  onChange={e => setCurrentItem({...currentItem, instrucoes_custom: e.target.value})}
                  className="bg-white min-h-[80px]"
                />
                
                {/* Quick Suggestions */}
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                    {["Agitar antes de usar", "Oferecer com comida", "Jejum de 1h antes/depois", "Manter em geladeira", "Uso contínuo", "Se houver dor/vômito"].map(sug => (
                        <Button 
                            key={sug} 
                            variant="outline" 
                            size="sm" 
                            className="text-xs whitespace-nowrap h-7"
                            onClick={() => {
                                const currentText = currentItem.instrucoes_custom || generateInstruction();
                                // Avoid duplication
                                if (!currentText.includes(sug)) {
                                    setCurrentItem({...currentItem, instrucoes_custom: currentText.trim() + (currentText ? ". " : "") + sug});
                                }
                            }}
                        >
                            + {sug}
                        </Button>
                    ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={addItem} disabled={!currentItem.nome} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar à Receita
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700">Itens da Receita</h3>
            {items.length === 0 && <p className="text-slate-400 text-sm italic">Nenhum medicamento adicionado.</p>}
            {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-4 bg-white border rounded-lg shadow-sm">
                    <div>
                        <p className="font-bold text-slate-900">{item.nome} {item.concentracao}</p>
                        <p className="text-slate-600 whitespace-pre-wrap mt-1">{item.instrucoes_texto}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => setStep(2)} disabled={items.length === 0} className="bg-green-600 hover:bg-green-700">
                <Printer className="w-4 h-4 mr-2" /> Gerar e Imprimir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Print Preview
function PrescriptionPrintPreview({ items, animal, cliente, receitaTipo, observacoes, onBack, onSave }: { items: any[], animal: any, cliente: any, receitaTipo: string, observacoes: string, onBack: () => void, onSave: () => void }) {
    // Clinic Mock Data (Should come from settings)
    const clinic = {
        name: "Clínica Veterinária PetShop CRM",
        address: "Av. Paulista, 1000 - São Paulo, SP",
        cnpj: "00.000.000/0001-00",
        phone: "(11) 99999-9999",
        crmv: "CRMV-SP 12345"
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-slate-100 min-h-screen">
            <div className="flex justify-between items-center mb-6 print:hidden">
                <Button variant="outline" onClick={onBack}>
                    <Edit3 className="w-4 h-4 mr-2" /> Voltar e Editar
                </Button>
                <div className="flex gap-2">
                    <Button onClick={onSave} className="bg-blue-600">
                        <Save className="w-4 h-4 mr-2" /> Salvar
                    </Button>
                    <Button onClick={() => window.print()} className="bg-green-600">
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </Button>
                </div>
            </div>

            {/* The Paper Sheet */}
            <div className="bg-white shadow-xl p-12 min-h-[29.7cm] w-[21cm] mx-auto print:shadow-none print:w-full print:p-0 print:m-0 text-slate-900">
                {/* Header */}
                <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                    <h1 className="text-2xl font-bold uppercase">{clinic.name}</h1>
                    <p className="text-sm text-slate-600">{clinic.address}</p>
                    <p className="text-sm text-slate-600">CNPJ: {clinic.cnpj} • Tel: {clinic.phone}</p>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold border-2 border-slate-800 inline-block px-8 py-2 rounded uppercase tracking-wider">
                        Receituário {receitaTipo !== "Simples" && `de ${receitaTipo}`}
                    </h2>
                </div>

                {/* Patient/Tutor Info Block */}
                <div className="flex justify-between items-start border border-slate-300 bg-slate-50 p-4 rounded-lg mb-8 text-sm">
                    <div className="space-y-1">
                        <p><span className="font-bold">Tutor:</span> {cliente?.nome}</p>
                        <p><span className="font-bold">CPF:</span> {cliente?.cpf || "Não informado"}</p>
                        <p><span className="font-bold">Endereço:</span> {cliente?.endereco}, {cliente?.numero} - {cliente?.bairro}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p><span className="font-bold">Paciente:</span> {animal?.nome}</p>
                        <p><span className="font-bold">Espécie:</span> {animal?.especie} • <span className="font-bold">Raça:</span> {animal?.raca}</p>
                        <p><span className="font-bold">Peso:</span> {animal?.peso} kg • <span className="font-bold">Idade:</span> {animal?.idade} anos</p>
                    </div>
                </div>

                {/* Prescription Body */}
                <div className="space-y-8 mb-12">
                    <h3 className="font-bold text-lg border-b pb-2">Uso Veterinário</h3>
                    
                    <div className="space-y-6 pl-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="font-bold text-lg mb-1">
                                    {idx + 1}. {item.nome} {item.concentracao}
                                    <span className="text-sm font-normal ml-2 text-slate-600">({item.forma})</span>
                                </div>
                                <div className="pl-6 text-slate-800 whitespace-pre-wrap">
                                    {item.instrucoes_texto}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Observations */}
                {observacoes && (
                    <div className="mb-12">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-2">Orientações / Observações</h3>
                        <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded border border-slate-200" 
                             dangerouslySetInnerHTML={{ __html: observacoes }} 
                        />
                    </div>
                )}

                {/* Footer / Date / Signature */}
                <div className="mt-auto pt-12">
                    <div className="text-center mb-12">
                        <p className="text-lg">
                            São Paulo, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                        </p>
                    </div>

                    <div className="flex justify-center gap-16">
                        <div className="text-center">
                            <div className="w-64 h-px bg-slate-800 mb-2"></div>
                            <p className="font-bold">Carimbo e Assinatura</p>
                            <p className="text-xs text-slate-500">Médico Veterinário</p>
                        </div>
                    </div>
                </div>
                
                {/* Validation Footer (Optional) */}
                <div className="mt-12 text-center text-[10px] text-slate-400 border-t pt-2">
                    Documento gerado eletronicamente por PetShop CRM. A veracidade deste documento pode ser conferida na clínica.
                </div>
            </div>
        </div>
    );
}
