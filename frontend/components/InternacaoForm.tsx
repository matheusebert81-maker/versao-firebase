import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Save } from 'lucide-react';
import db from '@/lib/db';

interface InternacaoFormProps {
  onClose: () => void;
}

export default function InternacaoForm({ onClose }: InternacaoFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    animal_id: '',
    motivo: '',
    status: 'Observação',
    leito: '',
    observacoes: ''
  });

  const { data: animais = [] } = useQuery({
    queryKey: ['animais'],
    queryFn: () => db.entities.Animal.list(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        data_entrada: new Date().toISOString()
      };
      return db.entities.Internacao.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animal_id || !formData.motivo) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-6">
          <CardTitle className="text-xl font-bold text-slate-800">Nova Internação</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="animal_id">Paciente *</Label>
                <select
                  id="animal_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.animal_id}
                  onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
                  required
                >
                  <option value="">Selecione o paciente</option>
                  {animais.map((animal: any) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nome} ({animal.especie})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status Inicial</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Observação">Observação</option>
                  <option value="Estável">Estável</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="motivo">Motivo da Internação *</Label>
                <Input
                  id="motivo"
                  placeholder="Ex: Pós-operatório, Intoxicação, etc."
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leito">Baia / Leito</Label>
                <Input
                  id="leito"
                  placeholder="Ex: Baia 01, UTI 03"
                  value={formData.leito}
                  onChange={(e) => setFormData({ ...formData, leito: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observacoes">Observações Iniciais</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Detalhes adicionais sobre o estado do paciente..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {mutation.isPending ? 'Salvando...' : 'Registrar Internação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
