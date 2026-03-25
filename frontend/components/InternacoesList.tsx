import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import db from '@/lib/db';

export default function InternacoesList() {
  const { data: internacoes = [], isLoading } = useQuery({
    queryKey: ['internacoes'],
    queryFn: () => db.entities.Internacao.list('-data_entrada'),
  });

  const { data: animais = [] } = useQuery({
    queryKey: ['animais'],
    queryFn: () => db.entities.Animal.list(),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Carregando internações...</div>;
  }

  if (internacoes.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum paciente internado</h3>
          <p className="text-slate-500 max-w-md">
            No momento, não há nenhum animal em internação. Clique em "Nova Internação" para registrar um paciente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {internacoes.map((internacao: any) => {
        const animal = animais.find((a: any) => a.id === internacao.animal_id);
        const isCritical = internacao.status === 'Crítico';
        
        return (
          <Card key={internacao.id} className={`overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow ${isCritical ? 'ring-2 ring-red-500' : ''}`}>
            <div className={`h-2 w-full ${
              internacao.status === 'Crítico' ? 'bg-red-500' :
              internacao.status === 'Estável' ? 'bg-green-500' :
              internacao.status === 'Observação' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{animal?.nome || 'Animal Desconhecido'}</h3>
                  <p className="text-sm text-slate-500">{animal?.especie} • {animal?.raca}</p>
                </div>
                <Badge variant="outline" className={`
                  ${internacao.status === 'Crítico' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                  ${internacao.status === 'Estável' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                  ${internacao.status === 'Observação' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                `}>
                  {internacao.status}
                </Badge>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <AlertTriangle className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="font-medium mr-1">Motivo:</span> {internacao.motivo}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="font-medium mr-1">Entrada:</span> 
                  {format(new Date(internacao.data_entrada), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Activity className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="font-medium mr-1">Baia/Leito:</span> {internacao.leito || 'Não definido'}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
                  <FileText className="w-4 h-4 mr-2" />
                  Prontuário
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
