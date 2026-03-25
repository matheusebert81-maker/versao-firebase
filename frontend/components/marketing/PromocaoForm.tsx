import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function PromocaoForm({ promocao, onSave, onCancel }: { promocao?: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(
    promocao || {
      nome: '',
      codigo: '',
      descricao: '',
      tipo_desconto: 'percentual',
      valor_desconto: 10,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
      ativo: true,
    }
  );

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border space-y-6">
      <div>
        <Label htmlFor="nome">Nome da Promoção</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e: any) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="codigo">Código do Cupom</Label>
        <Input
          id="codigo"
          value={formData.codigo}
          onChange={(e: any) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
          placeholder="Ex: VERAO20"
          required
        />
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e: any) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo de Desconto</Label>
          <Select
            value={formData.tipo_desconto}
            onValueChange={(value: any) => setFormData({ ...formData, tipo_desconto: value })}
          >
            <SelectTrigger id="tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentual">Percentual (%)</SelectItem>
              <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="valor">Valor</Label>
          <Input
            id="valor"
            type="number"
            value={formData.valor_desconto}
            onChange={(e: any) =>
              setFormData({ ...formData, valor_desconto: parseFloat(e.target.value) || 0 })
            }
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="inicio">Data de Início</Label>
          <Input
            id="inicio"
            type="date"
            value={formData.data_inicio}
            onChange={(e: any) => setFormData({ ...formData, data_inicio: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="fim">Data de Fim</Label>
          <Input
            id="fim"
            type="date"
            value={formData.data_fim}
            onChange={(e: any) => setFormData({ ...formData, data_fim: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked: boolean) => setFormData({ ...formData, ativo: checked })}
        />
        <Label htmlFor="ativo">Promoção Ativa</Label>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Promoção</Button>
      </div>
    </form>
  );
}
