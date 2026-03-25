import React, { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  AlertCircle, 
  Activity, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, isSameDay, addDays, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MapaExecucoes({ animais, onSelectInternacao }: { animais: any[], onSelectInternacao: (internacao: any, animal: any) => void }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  
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

  const activeInternacoes = useMemo(() => {
    return internacoes.filter((i: any) => i.status === "Em Andamento");
  }, [internacoes]);

  const timelineData = useMemo(() => {
    const activeInternacoesList = activeInternacoes;
    return activeInternacoesList.map((internacao: any) => {
      const animal = animais.find((a: any) => a.id === internacao.animal_id);
      const animalTasks = tarefas.filter((t: any) => 
        t.internacao_id === internacao.id && 
        isSameDay(new Date(t.data_hora_planejada), selectedDate)
      );

      return {
        internacao,
        animal,
        tasks: animalTasks
      };
    });
  }, [activeInternacoes, tarefas, animais, selectedDate]);

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
                              className={`w-6 h-6 rounded-full ${statusStyle.color} flex items-center justify-center shadow-sm`}
                              title={`${task.nome} - ${statusStyle.label}`}
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
      </div>

      {renderTimeline()}
    </div>
  );
}
import { CheckCircle2, X } from "lucide-react";
