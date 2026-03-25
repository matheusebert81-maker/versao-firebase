import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface ProdutoFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ProdutoForm({ initialData, onSubmit, onCancel }: ProdutoFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    codigo_barras: initialData?.codigo_barras || '',
    categoria: initialData?.categoria || '',
    preco_custo: initialData?.preco_custo || '',
    preco_venda: initialData?.preco_venda || '',
    estoque_atual: initialData?.estoque_atual || '',
    estoque_minimo: initialData?.estoque_minimo || '',
    unidade_medida: initialData?.unidade_medida || 'un',
    ativo: initialData?.ativo ?? true,
    descricao: initialData?.descricao || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo.toString()) : 0,
      preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda.toString()) : 0,
      estoque_atual: formData.estoque_atual ? parseInt(formData.estoque_atual.toString()) : 0,
      estoque_minimo: formData.estoque_minimo ? parseInt(formData.estoque_minimo.toString()) : 0,
    });
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
            {initialData ? 'Editar Produto' : 'Novo Produto'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Ração Golden 15kg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo_barras">Código de Barras</Label>
                  <Input
                    id="codigo_barras"
                    name="codigo_barras"
                    value={formData.codigo_barras}
                    onChange={handleChange}
                    placeholder="0000000000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => handleSelectChange('categoria', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ração">Ração</SelectItem>
                      <SelectItem value="Medicamento">Medicamento</SelectItem>
                      <SelectItem value="Acessório">Acessório</SelectItem>
                      <SelectItem value="Higiene">Higiene e Beleza</SelectItem>
                      <SelectItem value="Petisco">Petisco</SelectItem>
                      <SelectItem value="Brinquedo">Brinquedo</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
                  <Input
                    id="preco_custo"
                    name="preco_custo"
                    type="number"
                    step="0.01"
                    value={formData.preco_custo}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_venda">Preço de Venda (R$) *</Label>
                  <Input
                    id="preco_venda"
                    name="preco_venda"
                    type="number"
                    step="0.01"
                    required
                    value={formData.preco_venda}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoque_atual">Estoque Atual *</Label>
                  <Input
                    id="estoque_atual"
                    name="estoque_atual"
                    type="number"
                    required
                    value={formData.estoque_atual}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                  <Input
                    id="estoque_minimo"
                    name="estoque_minimo"
                    type="number"
                    value={formData.estoque_minimo}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                  <Select 
                    value={formData.unidade_medida} 
                    onValueChange={(value) => handleSelectChange('unidade_medida', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade (un)</SelectItem>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="g">Grama (g)</SelectItem>
                      <SelectItem value="l">Litro (l)</SelectItem>
                      <SelectItem value="ml">Mililitro (ml)</SelectItem>
                      <SelectItem value="cx">Caixa (cx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Detalhes adicionais sobre o produto..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Produto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
