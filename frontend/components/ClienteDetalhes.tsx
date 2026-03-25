import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, Dog } from 'lucide-react';

interface ClienteDetalhesProps {
  cliente: any;
  animais: any[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClienteDetalhes({ cliente, animais, onBack, onEdit, onDelete }: ClienteDetalhesProps) {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Detalhes do Cliente</h1>
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <span className="text-white font-bold text-3xl">
                  {cliente.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{cliente.nome}</h2>
              <p className="text-slate-500 mb-4">Cliente desde {new Date(cliente.created_date).toLocaleDateString('pt-BR')}</p>
              
              <div className="w-full space-y-3 text-left mt-4">
                {cliente.telefone && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                    {cliente.telefone}
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    {cliente.email}
                  </div>
                )}
                {cliente.cidade && (
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                    {cliente.cidade}, {cliente.estado}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dog className="w-5 h-5 mr-2" />
                Pets ({animais.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {animais.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhum pet cadastrado para este cliente.</p>
              ) : (
                <div className="space-y-4">
                  {animais.map(animal => (
                    <div key={animal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                          {animal.foto_url ? (
                            <img src={animal.foto_url} alt={animal.nome} className="w-full h-full object-cover" />
                          ) : (
                            <Dog className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{animal.nome}</h4>
                          <p className="text-sm text-slate-500">{animal.especie} • {animal.raca}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Ver Prontuário</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
