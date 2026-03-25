import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CampanhaForm({ campanha, onSave, onCancel }: { campanha?: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(
    campanha || {
      nome: '',
      assunto: '',
      corpo_email: '',
      segmento_clientes: 'todos',
      promocao_id: ''
    }
  );

  const { data: promocoes = [] } = useQuery({
    queryKey: ['promocoes_ativas'],
    queryFn: () => api.entities.Promocao.filter({ ativo: true })
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border animate-in fade-in-50">
      <div className="space-y-6">
        <div>
          <Label htmlFor="nome">Nome da Campanha</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e: any) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Campanha de Vacinação Antirrábica"
          />
        </div>
        <div>
          <Label htmlFor="assunto">Assunto do Email</Label>
          <Input
            id="assunto"
            value={formData.assunto}
            onChange={(e: any) => setFormData({ ...formData, assunto: e.target.value })}
            placeholder="Ex: Lembrete Importante: Vacine seu Pet!"
          />
        </div>
        <div>
          <Label>Corpo do Email</Label>
          <ReactQuill
            theme="snow"
            value={formData.corpo_email}
            onChange={(value: any) => setFormData({ ...formData, corpo_email: value })}
            className="bg-white h-60 mb-12"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="segmento">Segmento de Clientes</Label>
            <Select
              value={formData.segmento_clientes}
              onValueChange={(value: any) =>
                setFormData({ ...formData, segmento_clientes: value })
              }
            >
              <SelectTrigger id="segmento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Clientes</SelectItem>
                <SelectItem value="tutores_caes">Apenas Tutores de Cães</SelectItem>
                <SelectItem value="tutores_gatos">Apenas Tutores de Gatos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="promocao">Anexar Cupom de Desconto</Label>
            <Select
              value={formData.promocao_id}
              onValueChange={(value: any) =>
                setFormData({ ...formData, promocao_id: value })
              }
            >
              <SelectTrigger id="promocao">
                <SelectValue placeholder="Nenhum cupom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhum</SelectItem>
                {promocoes.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome} ({p.codigo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave}>Salvar Rascunho</Button>
      </div>
    </div>
  );
}
