import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Stethoscope, Pill, Syringe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgendamentoDetalhes({ agendamento, animal, onBack }: { agendamento: any, animal: any, onBack: () => void }) {
  // Fetch history
  const { data: anamneses = [] } = useQuery({
    queryKey: ['anamneses', animal?.id],
    queryFn: () => api.entities.Anamnese.list(),
    select: (data: any[]) => data.filter(a => a.animal_id === animal?.id),
    enabled: !!animal
  });

  const { data: receitas = [] } = useQuery({
    queryKey: ['receitas', animal?.id],
    queryFn: () => api.entities.Receita.filter({ animal_id: animal?.id }),
    enabled: !!animal
  });

  const { data: vacinas = [] } = useQuery({
    queryKey: ['vacinas', animal?.id],
    queryFn: () => api.entities.VacinaHistorico.filter({ animal_id: animal?.id }),
    enabled: !!animal
  });

  const medicalHistory = React.useMemo(() => {
    const events = [
      ...anamneses.map((a: any) => ({ type: 'anamnese', date: a.data, data: a })),
      ...receitas.map((r: any) => ({ type: 'receita', date: r.data_emissao, data: r })),
      ...vacinas.map((v: any) => ({ type: 'vacina', date: v.data_aplicacao, data: v }))
    ];

    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [anamneses, receitas, vacinas]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">Detalhes do Agendamento</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente ({animal?.nome})</CardTitle>
        </CardHeader>
        <CardContent>
          {medicalHistory.length === 0 ? (
            <p className="text-slate-500 italic">Nenhum histórico encontrado.</p>
          ) : (
            <div className="space-y-4">
              {medicalHistory.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                  {event.type === 'anamnese' && <Stethoscope className="w-5 h-5 text-blue-500 mt-1" />}
                  {event.type === 'receita' && <Pill className="w-5 h-5 text-rose-500 mt-1" />}
                  {event.type === 'vacina' && <Syringe className="w-5 h-5 text-amber-500 mt-1" />}
                  <div>
                    <p className="font-semibold text-sm">
                      {event.type === 'anamnese' ? 'Consulta' : event.type === 'receita' ? 'Receita' : 'Vacina'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(event.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-sm mt-1">
                      {event.type === 'anamnese' ? event.data.queixa_principal : 
                       event.type === 'receita' ? event.data.observacoes : 
                       event.data.nome_vacina}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
