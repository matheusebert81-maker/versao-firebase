import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import db from '@/lib/db';

interface VendaFormProps {
  onClose: () => void;
}

export default function VendaForm({ onClose }: VendaFormProps) {
  const queryClient = useQueryClient();
  const [itens, setItens] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => db.entities.Produto.list(),
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // 1. Criar a venda
      const venda = await db.entities.Venda.create({
        data_venda: new Date().toISOString(),
        valor_total: data.valor_total,
        status: 'Concluída'
      });

      // 2. Atualizar o estoque de cada produto vendido
      for (const item of data.itens) {
        const produto = produtos.find((p: any) => p.id === item.produto_id);
        if (produto) {
          await db.entities.Produto.update(produto.id, {
            ...produto,
            estoque_atual: produto.estoque_atual - item.quantidade
          });
        }
      }

      return venda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      onClose();
    }
  });

  const handleAddItem = () => {
    if (!produtoSelecionado) return;
    
    const produto = produtos.find((p: any) => p.id === produtoSelecionado);
    if (!produto) return;

    if (produto.estoque_atual < quantidade) {
      alert(`Estoque insuficiente. Disponível: ${produto.estoque_atual}`);
      return;
    }

    const itemExistente = itens.find(i => i.produto_id === produtoSelecionado);
    
    if (itemExistente) {
      if (itemExistente.quantidade + quantidade > produto.estoque_atual) {
        alert(`Estoque insuficiente. Disponível: ${produto.estoque_atual}`);
        return;
      }
      setItens(itens.map(i => 
        i.produto_id === produtoSelecionado 
          ? { ...i, quantidade: i.quantidade + quantidade, subtotal: (i.quantidade + quantidade) * i.preco_unitario }
          : i
      ));
    } else {
      setItens([...itens, {
        produto_id: produto.id,
        nome: produto.nome,
        quantidade: quantidade,
        preco_unitario: produto.preco_venda,
        subtotal: quantidade * produto.preco_venda
      }]);
    }

    setProdutoSelecionado('');
    setQuantidade(1);
  };

  const handleRemoveItem = (produto_id: string) => {
    setItens(itens.filter(i => i.produto_id !== produto_id));
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itens.length === 0) {
      alert("Adicione pelo menos um produto à venda.");
      return;
    }
    mutation.mutate({ itens, valor_total: valorTotal });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl border-0 flex flex-col max-h-[90vh]">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-6 shrink-0">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
            Nova Venda (PDV)
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Adicionar Produto */}
            <div className="flex items-end gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex-1 space-y-2">
                <Label htmlFor="produto">Produto</Label>
                <select
                  id="produto"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={produtoSelecionado}
                  onChange={(e) => setProdutoSelecionado(e.target.value)}
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.filter((p: any) => p.estoque_atual > 0).map((produto: any) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} - R$ {produto.preco_venda?.toFixed(2)} (Estoque: {produto.estoque_atual})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24 space-y-2">
                <Label htmlFor="quantidade">Qtd</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button 
                type="button" 
                onClick={handleAddItem}
                disabled={!produtoSelecionado}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Lista de Itens */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium text-center">Qtd</th>
                    <th className="px-4 py-3 font-medium text-right">Preço Un.</th>
                    <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                    <th className="px-4 py-3 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Nenhum produto adicionado à venda.
                      </td>
                    </tr>
                  ) : (
                    itens.map((item, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.nome}</td>
                        <td className="px-4 py-3 text-center">{item.quantidade}</td>
                        <td className="px-4 py-3 text-right text-slate-600">R$ {item.preco_unitario.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">R$ {item.subtotal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveItem(item.produto_id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-lg font-medium text-slate-600 mr-4">Total da Venda:</span>
              <span className="text-3xl font-bold text-green-600">R$ {valorTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end gap-3 p-6 border-t bg-white shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700" 
            disabled={mutation.isPending || itens.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? 'Finalizando...' : 'Finalizar Venda'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
