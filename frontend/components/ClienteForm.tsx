import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

interface ClienteFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ClienteForm({ initialData, onSubmit, onCancel }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    email: initialData?.email || '',
    telefone: initialData?.telefone || '',
    cpf: initialData?.cpf || '',
    endereco: initialData?.endereco || '',
    cidade: initialData?.cidade || '',
    estado: initialData?.estado || '',
    cep: initialData?.cep || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onCancel} className="mr-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {initialData ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: João da Silva"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="joao@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    required
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Rua, Número, Bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Sua Cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Cliente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
