import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, PawPrint, Edit, Trash2, Users } from 'lucide-react';

interface AgendaPorProfissionalProps {
  agendamentos: any[];
  profissionais: any[];
  clientes: any[];
  animais: any[];
  onEdit: (agendamento: any) => void;
  onDelete: (id: string) => void;
  onSelect: (agendamento: any) => void;
}

export default function AgendaPorProfissional({
  agendamentos,
  profissionais,
  clientes,
  animais,
  onEdit,
  onDelete,
  onSelect
}: AgendaPorProfissionalProps) {
  // Group agendamentos by profissional_id
  const agendamentosPorProfissional = agendamentos.reduce((acc: any, agendamento: any) => {
    const profId = agendamento.profissional_id || 'sem_profissional';
    if (!acc[profId]) {
      acc[profId] = [];
    }
    acc[profId].push(agendamento);
    return acc;
  }, {});

  // Sort each group by time
  Object.keys(agendamentosPorProfissional).forEach(key => {
    agendamentosPorProfissional[key].sort((a: any, b: any) => a.horario.localeCompare(b.horario));
  });

  const getProfissionalName = (id: string) => {
    if (id === 'sem_profissional') return 'Sem Profissional Atribuído';
    const prof = profissionais.find(p => p.id === id);
    return prof ? prof.nome : 'Profissional Desconhecido';
  };

  if (agendamentos.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum agendamento</h3>
          <p className="text-slate-500 max-w-md">
            Não há serviços agendados para exibir por profissional.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {Object.keys(agendamentosPorProfissional).map(profId => {
        const agendamentosProf = agendamentosPorProfissional[profId];
        
        return (
          <div key={profId} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
              <User className="w-5 h-5 text-blue-600" />
              {getProfissionalName(profId)}
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {agendamentosProf.length} agendamento{agendamentosProf.length !== 1 ? 's' : ''}
              </Badge>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agendamentosProf.map((agendamento: any) => {
                const cliente = clientes.find(c => c.id === agendamento.cliente_id);
                const animal = animais.find(a => a.id === agendamento.animal_id);

                return (
                  <Card 
                    key={agendamento.id} 
                    className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelect(agendamento)}
                  >
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Horário e Status */}
                      <div className="bg-slate-50 p-3 sm:w-32 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-slate-100">
                        <span className="text-xl font-bold text-slate-800">{agendamento.horario}</span>
                        <Badge variant="outline" className={`mt-2 text-[10px]
                          ${agendamento.status === 'Concluído' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                          ${agendamento.status === 'Confirmado' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${agendamento.status === 'Agendado' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                          ${agendamento.status === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        `}>
                          {agendamento.status}
                        </Badge>
                      </div>

                      {/* Detalhes */}
                      <div className="p-3 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <PawPrint className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-900 text-sm">{animal?.nome || 'Animal não encontrado'}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-600">{cliente?.nome || 'Cliente não encontrado'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agendamento.servicos?.map((servico: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0">
                              {servico}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="p-2 flex flex-row sm:flex-col justify-end gap-1 bg-slate-50/50 border-t sm:border-t-0 sm:border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(agendamento)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(agendamento.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
