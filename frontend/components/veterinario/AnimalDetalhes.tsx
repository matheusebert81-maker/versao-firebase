import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  PawPrint, 
  Calendar, 
  Weight,
  User,
  AlertTriangle,
  Syringe,
  Stethoscope,
  History,
  Pill,
  Filter,
  Search,
  Plus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VacinasManager from "./VacinasManager";
import AnamneseForm from "./AnamneseForm";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { format, differenceInYears } from "date-fns";

export default function AnimalDetalhes({ animal, cliente, onClose, onEdit }: { animal: any, cliente: any, onClose: () => void, onEdit: (animal: any) => void }) {
  const idade = animal.data_nascimento 
    ? differenceInYears(new Date(), new Date(animal.data_nascimento))
    : null;

  const porteColors: Record<string, string> = {
    'Pequeno': 'bg-blue-500',
    'Médio': 'bg-yellow-500',
    'Grande': 'bg-red-500'
  };

  // Clinical History Query
  const { data: anamneses = [] } = useQuery({
    queryKey: ['anamneses', animal.id],
    queryFn: () => api.entities.Anamnese.list(),
    select: (data: any[]) => data.filter(a => a.animal_id === animal.id).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  });

  const { data: receitas = [] } = useQuery({
    queryKey: ['receitas', animal.id],
    queryFn: () => api.entities.Receita.filter({ animal_id: animal.id }, '-data_emissao'),
  });

  // Combined Medical History
  const [historyFilter, setHistoryFilter] = React.useState("all");
  const [historySearch, setHistorySearch] = React.useState("");

  const medicalHistory = React.useMemo(() => {
    const events = [
      ...anamneses.map((a: any) => ({ type: 'anamnese', date: a.data, data: a })),
      ...receitas.map((r: any) => ({ type: 'receita', date: r.data_emissao, data: r }))
    ];

    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(e => {
        if (historyFilter !== "all" && e.type !== historyFilter) return false;
        
        const searchLower = historySearch.toLowerCase();
        if (e.type === 'anamnese') {
             return e.data.queixa_principal?.toLowerCase().includes(searchLower) || e.data.diagnostico_presuntivo?.toLowerCase().includes(searchLower);
        }
        if (e.type === 'receita') {
             return e.data.itens?.some((i: any) => i.medicamento_nome?.toLowerCase().includes(searchLower)) || e.data.observacoes?.toLowerCase().includes(searchLower);
        }
        return true;
      });
  }, [anamneses, receitas, historyFilter, historySearch]);

  const [showAnamneseForm, setShowAnamneseForm] = React.useState(false);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{animal.nome}</h1>
              <p className="text-slate-600 mt-1">Detalhes do animal</p>
            </div>
          </div>
          <Button
            onClick={() => onEdit(animal)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-white shadow-sm p-1 rounded-xl">
                <TabsTrigger value="info" className="rounded-lg text-base">
                    <PawPrint className="w-4 h-4 mr-2" /> Info Geral
                </TabsTrigger>
                <TabsTrigger value="historico" className="rounded-lg text-base">
                    <History className="w-4 h-4 mr-2" /> Histórico Clínico
                </TabsTrigger>
                <TabsTrigger value="vacinas" className="rounded-lg text-base">
                    <Syringe className="w-4 h-4 mr-2" /> Vacinas
                </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Foto do Animal */}
               {animal.foto_url && (
                 <div className="lg:col-span-3">
                   <Card className="border-0 shadow-lg overflow-hidden">
                     <img 
                       src={animal.foto_url} 
                       alt={animal.nome}
                       className="w-full h-64 object-cover"
                     />
                   </Card>
                 </div>
               )}

               <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-green-600" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Nome</p>
                    <p className="font-semibold text-slate-900 text-lg mt-1">{animal.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Espécie</p>
                    <p className="font-semibold text-slate-900 mt-1">{animal.especie}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Raça</p>
                    <p className="font-semibold text-slate-900 mt-1">{animal.raca || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Sexo</p>
                    <p className="font-semibold text-slate-900 mt-1">{animal.sexo}</p>
                  </div>
                  {animal.data_nascimento && (
                    <>
                      <div>
                        <p className="text-sm text-slate-500">Data de Nascimento</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <p className="font-semibold text-slate-900">
                            {format(new Date(animal.data_nascimento), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Idade</p>
                        <p className="font-semibold text-slate-900 mt-1">
                          {idade} {idade === 1 ? 'ano' : 'anos'}
                        </p>
                      </div>
                    </>
                  )}
                  {animal.peso && (
                    <div>
                      <p className="text-sm text-slate-500">Peso</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Weight className="w-4 h-4 text-slate-400" />
                        <p className="font-semibold text-slate-900">{animal.peso} kg</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Cor</p>
                    <p className="font-semibold text-slate-900 mt-1">{animal.cor || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle>Características Físicas</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Porte</p>
                    <Badge className={`${porteColors[animal.porte] || 'bg-slate-500'} text-white mt-2`}>
                      {animal.porte}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tipo de Pelagem</p>
                    <p className="font-semibold text-slate-900 mt-1">{animal.tipo_pelagem || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Temperamento</p>
                    <Badge variant="outline" className="mt-2">
                      {animal.temperamento || 'Não informado'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Castrado</p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {animal.castrado ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(animal.observacoes_especiais || animal.alergias) && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Observações e Alergias
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {animal.observacoes_especiais && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500 mb-2">Observações Especiais</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{animal.observacoes_especiais}</p>
                    </div>
                  )}
                  {animal.alergias && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Alergias</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{animal.alergias}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informações do Tutor */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Tutor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cliente ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Nome</p>
                      <p className="font-semibold text-slate-900 mt-1">{cliente.nome}</p>
                    </div>
                    {cliente.telefone && (
                      <div>
                        <p className="text-sm text-slate-500">Telefone</p>
                        <p className="font-semibold text-slate-900 mt-1">{cliente.telefone}</p>
                      </div>
                    )}
                    {cliente.email && (
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-semibold text-slate-900 mt-1 break-words">{cliente.email}</p>
                      </div>
                    )}
                    {cliente.endereco && (
                      <div>
                        <p className="text-sm text-slate-500">Endereço</p>
                        <p className="text-slate-700 mt-1">
                          {cliente.endereco}{cliente.numero && `, ${cliente.numero}`}
                          {cliente.bairro && <><br />{cliente.bairro}</>}
                          {cliente.cidade && <><br />{cliente.cidade} - {cliente.estado}</>}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Tutor não encontrado</p>
                )}
              </CardContent>
            </Card>
          </div>
          </TabsContent>

           <TabsContent value="historico">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <History className="w-6 h-6 text-blue-600" /> Prontuário Unificado
                        </h2>
                        <div className="flex gap-2 w-full md:w-auto">
                           <div className="relative flex-1 md:w-64">
                               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                               <Input 
                                   placeholder="Buscar no prontuário..." 
                                   className="pl-9 h-9"
                                   value={historySearch}
                                   onChange={e => setHistorySearch(e.target.value)}
                               />
                           </div>
                           <Select value={historyFilter} onValueChange={(val) => setHistoryFilter(val || 'all')}>
                               <SelectTrigger className="w-[140px] h-9">
                                   <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                   <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="all">Todos</SelectItem>
                                   <SelectItem value="anamnese">Anamneses</SelectItem>
                                   <SelectItem value="receita">Receitas</SelectItem>
                               </SelectContent>
                           </Select>
                            <Button onClick={() => setShowAnamneseForm(!showAnamneseForm)} size="sm">
                                {showAnamneseForm ? "Cancelar" : <><Plus className="w-4 h-4 mr-2" /> Nova Entrada</>}
                            </Button>
                        </div>
                    </div>

                    {showAnamneseForm && (
                        <div className="mb-6 p-4 border rounded-xl bg-slate-50 animate-in slide-in-from-top-4">
                           <h3 className="font-bold text-slate-700 mb-4">Nova Evolução Clínica</h3>
                           <AnamneseForm animal={animal} veterinarioId="1" onClose={() => setShowAnamneseForm(false)} />
                        </div>
                    )}

                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-6 pb-4">
                        {medicalHistory.length === 0 ? (
                            <div className="text-slate-500 italic py-4">Nenhum registro encontrado.</div>
                        ) : (
                            medicalHistory.map((event, idx) => {
                                const isAnamnese = event.type === 'anamnese';
                                return (
                                    <div key={idx} className="relative">
                                        {/* Dot */}
                                        <div className={`absolute -left-[33px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                            isAnamnese ? 'bg-blue-500' : 'bg-rose-500'
                                        }`}></div>

                                        <Card className="hover:shadow-md transition-shadow">
                                            <CardHeader className={`py-3 px-4 border-b ${
                                                isAnamnese ? 'bg-blue-50/50' : 'bg-rose-50/50'
                                            }`}>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        {isAnamnese ? <Stethoscope className="w-4 h-4 text-blue-600" /> : <Pill className="w-4 h-4 text-rose-600" />}
                                                        <span className={`font-bold text-sm ${isAnamnese ? 'text-blue-800' : 'text-rose-800'}`}>
                                                            {isAnamnese ? event.data.tipo : 'Prescrição Veterinária'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm")}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                {isAnamnese ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queixa Principal</span>
                                                                <p className="text-slate-800 font-medium">{event.data.queixa_principal}</p>
                                                            </div>
                                                            {event.data.diagnostico_presuntivo && (
                                                                <div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnóstico</span>
                                                                    <p className="text-blue-700 font-bold">{event.data.diagnostico_presuntivo}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {event.data.exame_fisico && (
                                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exame Físico</span>
                                                                <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap">{event.data.exame_fisico}</p>
                                                            </div>
                                                        )}

                                                        {event.data.tratamento && (
                                                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Conduta / Tratamento</span>
                                                                <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap">{event.data.tratamento}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap gap-2">
                                                            {event.data.itens?.map((item: any, i: number) => (
                                                                <Badge key={i} variant="secondary" className="bg-white border text-slate-700">
                                                                    {item.medicamento_nome || item.nome} {item.concentracao}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        {event.data.observacoes && (
                                                           <div className="pt-2 text-sm text-slate-600 bg-rose-50/30 p-2 rounded">
                                                               <div dangerouslySetInnerHTML={{ __html: event.data.observacoes }} />
                                                           </div>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
           </TabsContent>

           <TabsContent value="vacinas">
                <Card>
                    <CardHeader>
                        <CardTitle>Controle de Vacinação e Vermifugação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VacinasManager animal={animal} />
                    </CardContent>
                </Card>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
