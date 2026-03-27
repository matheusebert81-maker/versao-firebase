import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface AgendamentoFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  clientes: any[];
  animais: any[];
  profissionais: any[];
}

export default function AgendamentoForm({ initialData, onSubmit, onCancel, clientes, animais, profissionais }: AgendamentoFormProps) {
  const [formData, setFormData] = useState({
    cliente_id: initialData?.cliente_id || '',
    animal_id: initialData?.animal_id || '',
    profissional_id: initialData?.profissional_id || '',
    data: initialData?.data || '',
    horario: initialData?.horario || initialData?.hora || '',
    servicos: initialData?.servicos || (initialData?.tipo_servico ? [initialData.tipo_servico] : []),
    status: initialData?.status || 'Agendado',
    observacoes: initialData?.observacoes || '',
    valor_total: initialData?.valor_total || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'tipo_servico') {
      setFormData(prev => ({ ...prev, servicos: [value] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      valor_total: formData.valor_total ? parseFloat(formData.valor_total.toString()) : 0
    });
  };

  const animaisDoCliente = animais.filter(a => a.cliente_id === formData.cliente_id);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onCancel} className="mr-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {initialData ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select 
                    value={formData.cliente_id} 
                    onValueChange={(value) => {
                      handleSelectChange('cliente_id', value);
                      handleSelectChange('animal_id', ''); // Reset animal when client changes
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animal_id">Paciente *</Label>
                  <Select 
                    value={formData.animal_id} 
                    onValueChange={(value) => handleSelectChange('animal_id', value)}
                    required
                    disabled={!formData.cliente_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {animaisDoCliente.map(animal => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissional_id">Profissional</Label>
                  <Select 
                    value={formData.profissional_id} 
                    onValueChange={(value) => handleSelectChange('profissional_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {profissionais.map(prof => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.nome} ({prof.especialidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_servico">Tipo de Serviço *</Label>
                  <Select 
                    value={formData.servicos?.[0] || ''} 
                    onValueChange={(value) => handleSelectChange('tipo_servico', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta Clínica</SelectItem>
                      <SelectItem value="Vacina">Vacinação</SelectItem>
                      <SelectItem value="Exame">Exame Laboratorial</SelectItem>
                      <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                      <SelectItem value="Retorno">Retorno</SelectItem>
                      <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    required
                    value={formData.data}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario">Hora *</Label>
                  <Input
                    id="horario"
                    name="horario"
                    type="time"
                    required
                    value={formData.horario}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agendado">Agendado</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                      <SelectItem value="Faltou">Faltou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_total">Valor Estimado (R$)</Label>
                  <Input
                    id="valor_total"
                    name="valor_total"
                    type="number"
                    step="0.01"
                    value={formData.valor_total}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Detalhes adicionais sobre o agendamento..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Agendamento
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
