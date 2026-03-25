import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle,
  TrendingDown,
  Scan,
  ShoppingCart,
  BrainCircuit
} from "lucide-react";
import db from "@/lib/db";

import ProdutoForm from "@/components/ProdutoForm";
import VendaForm from "@/components/VendaForm";
import Dummy from "@/components/Dummy";
const ProdutoDetalhes = Dummy;
const EstoqueInteligente = Dummy;
const EstoqueBaixoAlerts = Dummy;
const ProdutoCard = Dummy;
const BarcodeScannerModal = Dummy;

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showVendaForm, setShowVendaForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<any>(null);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState("all");
  const [viewMode, setViewMode] = useState("all");

  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => db.entities.Produto.list('-created_date'),
    initialData: [],
  });

  const { data: variantes = [] } = useQuery({
    queryKey: ['variantes'],
    queryFn: () => db.entities.ProdutoVariante.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.entities.Produto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowForm(false);
      setEditingProduto(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {id: string, data: any}) => db.entities.Produto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowForm(false);
      setEditingProduto(null);
      setSelectedProduto(null);
    },
  });

  const handleSubmit = (data: any) => {
    if (editingProduto) {
      updateMutation.mutate({ id: editingProduto.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    const produto = produtos.find((p: any) => p.codigo_barras === barcode);
    const variante = variantes.find((v: any) => v.codigo_barras === barcode);

    if (produto) {
      setSelectedProduto(produto);
      setShowScanner(false);
    } else if (variante) {
      const produtoDaVariante = produtos.find((p: any) => p.id === variante.produto_id);
      if (produtoDaVariante) {
        setSelectedProduto(produtoDaVariante);
        setShowScanner(false);
      }
    } else {
      alert("Produto não encontrado com este código de barras");
    }
  };

  const produtosFiltrados = produtos.filter((produto: any) => {
    const matchSearch = 
      produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.codigo_barras?.includes(searchTerm) ||
      produto.categoria?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria = filterCategoria === "all" || produto.categoria === filterCategoria;

    return matchSearch && matchCategoria;
  });

  const produtosEstoqueBaixo = produtosFiltrados.filter((p: any) => 
    p.ativo && p.estoque_atual <= (p.estoque_minimo || 0)
  );

  const produtosSemEstoque = produtosFiltrados.filter((p: any) => 
    p.ativo && p.estoque_atual === 0
  );

  const produtosParaExibir = 
    viewMode === "low-stock" ? produtosEstoqueBaixo :
    viewMode === "out-of-stock" ? produtosSemEstoque :
    produtosFiltrados;

  const categorias = [...new Set(produtos.map((p: any) => p.categoria).filter(Boolean))];

  const valorTotalEstoque = produtos.reduce((sum: number, p: any) => 
    sum + ((p.preco_custo || 0) * (p.estoque_atual || 0)), 0
  );
  
  if (selectedProduto) {
    return (
      <ProdutoDetalhes />
    );
  }

  if (showForm) {
    return (
      <ProdutoForm 
        initialData={editingProduto}
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingProduto(null);
        }}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Produtos</h1>
            <p className="text-slate-600 mt-2">Gerencie o estoque e catálogo</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowScanner(true)}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
            >
              <Scan className="w-4 h-4 mr-2" />
              Escanear
            </Button>
            <Button
              onClick={() => setShowVendaForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-white"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Nova Venda
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {produtosEstoqueBaixo.length > 0 && (
          <EstoqueBaixoAlerts />
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Total de Produtos</p>
              <p className="text-3xl font-bold mt-2">{produtos.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Valor em Estoque</p>
              <p className="text-2xl font-bold mt-2">R$ {valorTotalEstoque.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Estoque Baixo</p>
              <p className="text-3xl font-bold mt-2">{produtosEstoqueBaixo.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Sem Estoque</p>
              <p className="text-3xl font-bold mt-2">{produtosSemEstoque.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nome, código de barras ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Todas as Categorias</option>
                  {categorias.map((cat: any) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-md rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg">
              <Package className="w-4 h-4 mr-2" />
              Todos ({produtosFiltrados.length})
            </TabsTrigger>
            <TabsTrigger value="low-stock" className="rounded-lg">
              <TrendingDown className="w-4 h-4 mr-2" />
              Estoque Baixo ({produtosEstoqueBaixo.length})
            </TabsTrigger>
            <TabsTrigger value="out-of-stock" className="rounded-lg">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Sem Estoque ({produtosSemEstoque.length})
            </TabsTrigger>
             <TabsTrigger value="ai-stock" className="rounded-lg data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <BrainCircuit className="w-4 h-4 mr-2" />
              IA Estoque
            </TabsTrigger>
            </TabsList>

          <TabsContent value={viewMode}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="h-48 bg-slate-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : produtosParaExibir.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtosParaExibir.map((produto: any) => (
                  <ProdutoCard key={produto.id} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-stock">
            <EstoqueInteligente />
          </TabsContent>
        </Tabs>
      </div>

      {showScanner && (
        <BarcodeScannerModal />
      )}

      {showVendaForm && (
        <VendaForm onClose={() => setShowVendaForm(false)} />
      )}
    </div>
  );
}
