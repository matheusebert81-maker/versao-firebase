import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Calendar, Weight, PawPrint, FileText } from 'lucide-react';

interface AnimalDetalhesProps {
  animal: any;
  cliente: any;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AnimalDetalhes({ animal, cliente, onBack, onEdit, onDelete }: AnimalDetalhesProps) {
  const idade = animal.data_nascimento 
    ? Math.floor((new Date().getTime() - new Date(animal.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Prontuário do Paciente</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit} className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={onDelete} className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-lg">
                {animal.foto_url ? (
                  <img src={animal.foto_url} alt={animal.nome} className="w-full h-full object-cover" />
                ) : (
                  <PawPrint className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{animal.nome}</h2>
              <p className="text-slate-500 font-medium">{animal.especie} • {animal.raca}</p>
              
              <div className="w-full space-y-4 text-left mt-6">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center"><Calendar className="w-4 h-4 mr-2" /> Idade</span>
                  <span className="font-medium text-slate-700">{idade !== null ? `${idade} anos` : 'N/I'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center"><Weight className="w-4 h-4 mr-2" /> Peso</span>
                  <span className="font-medium text-slate-700">{animal.peso ? `${animal.peso} kg` : 'N/I'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center"><PawPrint className="w-4 h-4 mr-2" /> Sexo</span>
                  <span className="font-medium text-slate-700">{animal.sexo || 'N/I'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center"><FileText className="w-4 h-4 mr-2" /> Tutor</span>
                  <span className="font-medium text-blue-600 cursor-pointer hover:underline">{cliente?.nome || 'N/I'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Histórico Clínico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p>Nenhum registro clínico encontrado.</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Adicionar Evolução
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
