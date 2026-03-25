import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface AnimalFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  clientes: any[];
}

export default function AnimalForm({ initialData, onSubmit, onCancel, clientes }: AnimalFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    especie: initialData?.especie || '',
    raca: initialData?.raca || '',
    sexo: initialData?.sexo || '',
    data_nascimento: initialData?.data_nascimento || '',
    peso: initialData?.peso || '',
    porte: initialData?.porte || '',
    temperamento: initialData?.temperamento || '',
    cliente_id: initialData?.cliente_id || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
            {initialData ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cliente_id">Tutor (Cliente) *</Label>
                  <Select 
                    value={formData.cliente_id} 
                    onValueChange={(value) => handleSelectChange('cliente_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome} ({cliente.telefone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Animal *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Rex"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="especie">Espécie *</Label>
                  <Select 
                    value={formData.especie} 
                    onValueChange={(value) => handleSelectChange('especie', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Canina">Canina (Cachorro)</SelectItem>
                      <SelectItem value="Felina">Felina (Gato)</SelectItem>
                      <SelectItem value="Ave">Ave</SelectItem>
                      <SelectItem value="Roedor">Roedor</SelectItem>
                      <SelectItem value="Reptil">Réptil</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="raca">Raça</Label>
                  <Input
                    id="raca"
                    name="raca"
                    value={formData.raca}
                    onChange={handleChange}
                    placeholder="Ex: Poodle, SRD"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select 
                    value={formData.sexo} 
                    onValueChange={(value) => handleSelectChange('sexo', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    name="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    name="peso"
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porte">Porte</Label>
                  <Select 
                    value={formData.porte} 
                    onValueChange={(value) => handleSelectChange('porte', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pequeno">Pequeno</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperamento">Temperamento</Label>
                  <Input
                    id="temperamento"
                    name="temperamento"
                    value={formData.temperamento}
                    onChange={handleChange}
                    placeholder="Ex: Dócil, Agressivo, Medroso"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Paciente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
