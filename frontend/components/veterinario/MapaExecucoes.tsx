import React, { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Clock, 
  AlertCircle, 
  Activity, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2, 
  X,
  User
} from "lucide-react";
import { format, isSameDay, addDays, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MapaExecucoes({ animais, onSelectInternacao }: { animais: any[], onSelectInternacao: (internacao: any, animal: any) => void }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todos");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [executadoPor, setExecutadoPor] = useState("");
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: tarefas = [] } = useQuery({
    queryKey: ['tarefas'],
    queryFn: () => api.entities.TarefaVeterinaria.list('-data_hora_planejada'),
  });

  const { data: internacoes = [] } = useQuery({
    queryKey: ['internacoes'],
    queryFn: () => api.entities.Internacao.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => api.entities.Profissional.list(),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => api.entities.TarefaVeterinaria.update(selectedTask.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      setSelectedTask(null);
      setExecutadoPor("");
    }
  });

  const handleExecuteTask = () => {
    if (!executadoPor) return;
    updateTaskMutation.mutate({
        status: "Realizado",
        realizado_em: new Date().toISOString(),
        executado_por: executadoPor
    });
  };

  const handleCancelTask = () => {
    updateTaskMutation.mutate({
        status: "Cancelado"
    });
  };

  const activeInternacoes = useMemo(() => {
    return internacoes.filter((i: any) => i.status === "Em Andamento");
  }, [internacoes]);

  const timelineData = useMemo(() => {
    const activeInternacoesList = activeInternacoes;
    return activeInternacoesList.map((internacao: any) => {
      const animal = animais.find((a: any) => a.id === internacao.animal_id);
      let animalTasks = tarefas.filter((t: any) => 
        t.internacao_id === internacao.id && 
        isSameDay(new Date(t.data_hora_planejada), selectedDate)
      );

      if (statusFilter !== "Todos") {
        animalTasks = animalTasks.filter((t: any) => t.status === statusFilter);
      }
      
      if (priorityFilter !== "Todos") {
        animalTasks = animalTasks.filter((t: any) => t.prioridade === priorityFilter);
      }

      return {
        internacao,
        animal,
        tasks: animalTasks
      };
    });
  }, [activeInternacoes, tarefas, animais, selectedDate, statusFilter, priorityFilter]);

  const getTaskStatus = (task: any) => {
    const planned = new Date(task.data_hora_planejada);
    
    if (task.status === "Realizado") {
      const executed = new Date(task.realizado_em);
      const diff = Math.abs(differenceInMinutes(planned, executed));
      
      if (diff <= 60) return { color: "bg-blue-500", icon: CheckCircle2, label: "Realizado no Prazo" };
      return { color: "bg-orange-500", icon: CheckCircle2, label: "Realizado com Atraso" };
    }

    if (task.status === "Cancelado") {
      return { color: "bg-slate-300", icon: X, label: "Cancelado" };
    }

    const diffNow = differenceInMinutes(currentTime, planned);
    if (diffNow > 60) {
      return { color: "bg-red-500", icon: AlertCircle, label: "Atrasado (Não Feito)" };
    }
    
    return { color: "bg-slate-200 border-2 border-slate-400", icon: Clock, label: "Pendente" };
  };

  const renderTimeline = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentHour = currentTime.getHours();

    return (
      <div className="relative overflow-x-auto border-2 border-blue-100 rounded-2xl bg-white shadow-lg">
        <div className="flex min-w-max border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 sticky top-0 z-20">
          <div className="w-48 p-3 font-bold text-blue-900 sticky left-0 bg-gradient-to-r from-blue-50 to-cyan-50 border-r-2 border-blue-100 z-30 shadow-sm">
            Paciente / Box
          </div>
          {hours.map((h: number) => (
            <div key={h} className={`w-16 p-2 text-center text-sm font-medium border-r ${h === currentHour ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
              {h}:00
            </div>
          ))}
        </div>

        <div className="min-w-max">
          {timelineData.length === 0 ? (
             <div className="p-8 text-center text-slate-500">Nenhuma internação ativa no momento.</div>
          ) : (
            timelineData.map(({ internacao, animal, tasks }: any) => (
              <div key={internacao.id} className="flex border-b last:border-0 hover:bg-slate-50 transition-colors group">
                <div className="w-48 p-3 border-r sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex flex-col justify-center shadow-sm cursor-pointer"
                     onClick={() => onSelectInternacao(internacao, animal)}
                >
                  <div className="font-bold text-slate-900 truncate">{animal?.nome}</div>
                  <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <span className="bg-slate-100 px-1 rounded">{internacao.box_baia}</span>
                    <span>{animal?.especie}</span>
                  </div>
                </div>

                {hours.map((h: number) => {
                  const hourTasks = tasks.filter((t: any) => new Date(t.data_hora_planejada).getHours() === h);
                  
                  return (
                    <div key={h} className={`w-16 border-r relative h-16 flex items-center justify-center ${h === currentHour ? 'bg-blue-50/30' : ''}`}>
                      <div className="absolute inset-y-0 left-1/2 w-px bg-slate-100"></div>
                      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100"></div>

                      <div className="relative z-10 flex gap-1 flex-wrap justify-center">
                        {hourTasks.map((task: any) => {
                          const statusStyle = getTaskStatus(task);
                          const Icon = statusStyle.icon;
                          
                          return (
                            <div
                              key={task.id}
                              className={`w-6 h-6 rounded-full ${statusStyle.color} flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform`}
                              title={`${task.nome} - ${statusStyle.label}`}
                              onClick={() => setSelectedTask(task)}
                            >
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white via-blue-50/30 to-white p-4 rounded-xl shadow-md border border-blue-100">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800 min-w-[200px] justify-center">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </div>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Filtros:</span>
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "Todos")}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos Status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Realizado">Realizado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || "Todos")}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas Prioridades</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderTimeline()}

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detalhes da Tarefa</DialogTitle>
            </DialogHeader>
            {selectedTask && (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <h3 className="font-bold text-lg text-slate-800">{selectedTask.nome}</h3>
                        <p className="text-slate-600 text-sm mt-1">{selectedTask.descricao}</p>
                        <div className="flex gap-2 mt-3">
                            <Badge variant="outline">{selectedTask.tipo}</Badge>
                            <Badge variant={selectedTask.prioridade === 'Alta' ? 'destructive' : 'secondary'}>{selectedTask.prioridade}</Badge>
                            <Badge variant="outline">{format(new Date(selectedTask.data_hora_planejada), "HH:mm")}</Badge>
                        </div>
                    </div>

                    {selectedTask.status === "Pendente" && (
                        <div className="space-y-3">
                            <Label>Quem está executando?</Label>
                            <Select value={executadoPor} onValueChange={(val) => setExecutadoPor(val || "")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o profissional" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((u: any) => (
                                        <SelectItem key={u.id} value={u.nome}>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {u.nome}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedTask.status === "Realizado" && (
                        <div className="bg-green-50 text-green-800 p-3 rounded-md border border-green-200">
                            <p className="font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Executado por: {selectedTask.executado_por}
                            </p>
                            <p className="text-sm mt-1">
                                Em: {format(new Date(selectedTask.realizado_em), "dd/MM/yyyy HH:mm")}
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedTask.status === "Pendente" && (
                            <>
                                <Button variant="destructive" onClick={handleCancelTask}>Cancelar Tarefa</Button>
                                <Button onClick={handleExecuteTask} disabled={!executadoPor} className="bg-green-600 hover:bg-green-700 text-white">
                                    Marcar como Realizado
                                </Button>
                            </>
                        )}
                        {selectedTask.status !== "Pendente" && (
                            <Button onClick={() => setSelectedTask(null)}>Fechar</Button>
                        )}
                    </DialogFooter>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
