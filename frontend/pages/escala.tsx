import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Trash2, Sun, Moon, ChevronLeft, ChevronRight, User } from "lucide-react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  parseISO 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import db from "@/lib/db";

export default function Escala() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { data: escalas = [] } = useQuery({
    queryKey: ['escala'],
    queryFn: () => db.entities.Escala.list(),
  });

  const { data: veterinarios = [] } = useQuery({
    queryKey: ['veterinarios'],
    queryFn: () => db.entities.Profissional.filter({ tipo: "Veterinário", ativo: true }),
  });

  // Calendar Generation
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  }, [calendarStart, calendarEnd]);

  // Group Shifts by Day
  const shiftsByDay = useMemo(() => {
    const map: any = {};
    escalas.forEach((shift: any) => {
      // Normalize date string to handle potential timezone issues or just use simple YYYY-MM-DD
      const dateKey = shift.data.split('T')[0]; // Assuming ISO format YYYY-MM-DDTHH:mm:ss
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(shift);
    });
    return map;
  }, [escalas]);

  // Mutations
  const createShiftMutation = useMutation({
    mutationFn: (data: any) => db.entities.Escala.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escala'] });
      setShowForm(false);
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (id: string) => db.entities.Escala.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escala'] });
    }
  });

  // Form Component
  const ShiftForm = () => {
    const [formData, setFormData] = useState({
      veterinario_id: "",
      data: format(new Date(), 'yyyy-MM-dd'),
      turno: "Manhã",
      observacoes: ""
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        createShiftMutation.mutate(formData);
    };

    return (
        <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Plantão</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Veterinário</Label>
                        <Select value={formData.veterinario_id} onValueChange={v => setFormData({...formData, veterinario_id: v || ""})}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {veterinarios.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Data</Label>
                        <Input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                    </div>
                    <div>
                        <Label>Turno / Plantão</Label>
                        <Select value={formData.turno} onValueChange={v => setFormData({...formData, turno: v || ""})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Manhã">Manhã</SelectItem>
                                <SelectItem value="Tarde">Tarde</SelectItem>
                                <SelectItem value="Noite">Noite</SelectItem>
                                <SelectItem value="Plantão 12h">Plantão 12h (Diurno)</SelectItem>
                                <SelectItem value="Plantão 24h">Plantão 24h</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Observações</Label>
                        <Input value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 text-white">Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  };

  // Helper to categorize shifts
  const getShiftCategory = (turno: string) => {
    if (["Manhã", "Tarde", "Plantão 12h"].includes(turno)) return "sun";
    if (["Noite", "Plantão 24h"].includes(turno)) return "moon";
    return "sun"; // Default fallback
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto bg-slate-50 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              Escala de Plantão
            </h1>
            <p className="text-slate-600">Gestão mensal de escalas e plantonistas</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subMonths(selectedDate, 1))}>
                <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <span className="text-lg font-bold text-slate-800 w-40 text-center capitalize">
                {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addMonths(selectedDate, 1))}>
                <ChevronRight className="w-5 h-5 text-slate-600" />
            </Button>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Plantão
        </Button>
      </div>

      {showForm && <ShiftForm />}

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        {/* Week Headers */}
        <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {day}
                </div>
            ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-slate-200 gap-px">
            {calendarDays.map((day, idx) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const shifts = shiftsByDay[dayStr] || [];
                
                const sunShifts = shifts.filter((s: any) => getShiftCategory(s.turno) === "sun");
                const moonShifts = shifts.filter((s: any) => getShiftCategory(s.turno) === "moon");

                return (
                    <div 
                        key={dayStr} 
                        className={`min-h-[140px] bg-white p-2 flex flex-col gap-2 ${
                            !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''
                        } ${isToday ? 'ring-2 ring-inset ring-blue-400' : ''}`}
                    >
                        {/* Date Header */}
                        <div className="flex justify-between items-start">
                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                                isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                            }`}>
                                {format(day, 'd')}
                            </span>
                            {shifts.length > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1 h-5">
                                    {shifts.length}
                                </Badge>
                            )}
                        </div>

                        {/* Shifts Content */}
                        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                            {/* Day Shifts (Sun) */}
                            {sunShifts.length > 0 && (
                                <div className="bg-amber-50 rounded-md p-1.5 border border-amber-100">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Sun className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-700 uppercase">Diurno</span>
                                    </div>
                                    <div className="space-y-1">
                                        {sunShifts.map((shift: any) => {
                                            const vet = veterinarios.find((v: any) => v.id === shift.veterinario_id);
                                            return (
                                                <div key={shift.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-1 min-w-0">
                                                        <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                                                        <span className="text-[10px] text-slate-700 truncate font-medium" title={vet?.nome}>
                                                            {vet?.nome?.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => { if(confirm("Remover?")) deleteShiftMutation.mutate(shift.id) }}
                                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Night Shifts (Moon) */}
                            {moonShifts.length > 0 && (
                                <div className="bg-indigo-50 rounded-md p-1.5 border border-indigo-100">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Moon className="w-3 h-3 text-indigo-500" />
                                        <span className="text-[10px] font-bold text-indigo-700 uppercase">Noturno</span>
                                    </div>
                                    <div className="space-y-1">
                                        {moonShifts.map((shift: any) => {
                                            const vet = veterinarios.find((v: any) => v.id === shift.veterinario_id);
                                            return (
                                                <div key={shift.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-1 min-w-0">
                                                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                                        <span className="text-[10px] text-slate-700 truncate font-medium" title={vet?.nome}>
                                                            {vet?.nome?.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => { if(confirm("Remover?")) deleteShiftMutation.mutate(shift.id) }}
                                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
