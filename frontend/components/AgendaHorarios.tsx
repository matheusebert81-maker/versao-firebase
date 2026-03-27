import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, PawPrint, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface AgendaHorariosProps {
  agendamentos: any[];
  clientes: any[];
  animais: any[];
  onEdit: (agendamento: any) => void;
  onDelete: (id: string) => void;
  onSelect: (agendamento: any) => void;
}

export default function AgendaHorarios({ agendamentos, clientes, animais, onEdit, onDelete, onSelect }: AgendaHorariosProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page when data changes (e.g. date change)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [agendamentos]);

  // Ordena os agendamentos por horário
  const agendamentosOrdenados = [...agendamentos].sort((a, b) => {
    return a.horario.localeCompare(b.horario);
  });

  // Paginação
  const totalPages = Math.ceil(agendamentosOrdenados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgendamentos = agendamentosOrdenados.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (agendamentosOrdenados.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum agendamento</h3>
          <p className="text-slate-500 max-w-md">
            Não há serviços agendados para este dia.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {paginatedAgendamentos.map((agendamento) => {
          const cliente = clientes.find(c => c.id === agendamento.cliente_id);
          const animal = animais.find(a => a.id === agendamento.animal_id);

          return (
            <Card key={agendamento.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(agendamento)}>
              <div className="flex flex-col md:flex-row">
                {/* Horário e Status */}
                <div className="bg-slate-50 p-4 md:w-48 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100">
                  <span className="text-2xl font-bold text-slate-800">{agendamento.horario}</span>
                  <Badge variant="outline" className={`mt-2
                    ${agendamento.status === 'Concluído' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                    ${agendamento.status === 'Confirmado' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                    ${agendamento.status === 'Agendado' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                    ${agendamento.status === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                  `}>
                    {agendamento.status}
                  </Badge>
                </div>

                {/* Detalhes */}
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <PawPrint className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">{animal?.nome || 'Animal não encontrado'}</span>
                    <span className="text-sm text-slate-500">({animal?.especie})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{cliente?.nome || 'Cliente não encontrado'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agendamento.servicos?.map((servico: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {servico}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="p-4 flex flex-row md:flex-col justify-end gap-2 bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => onEdit(agendamento)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(agendamento.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 mt-6">
          <div className="text-sm text-slate-500">
            Mostrando <span className="font-medium text-slate-700">{startIndex + 1}</span> a <span className="font-medium text-slate-700">{Math.min(startIndex + itemsPerPage, agendamentosOrdenados.length)}</span> de <span className="font-medium text-slate-700">{agendamentosOrdenados.length}</span> agendamentos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 p-0 rounded-lg ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
