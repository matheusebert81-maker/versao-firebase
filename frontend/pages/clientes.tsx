import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Phone, Mail, MapPin, User } from "lucide-react";
import db from "@/lib/db";

import ClienteForm from "@/components/veterinario/ClienteForm";
import ClienteDetalhes from "@/components/ClienteDetalhes";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (router.query.new === 'true') {
      setShowForm(true);
      // Remove query param to avoid reopening on refresh
      router.replace('/clientes', undefined, { shallow: true });
    }
  }, [router.query.new, router]);

  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => db.entities.Cliente.list('-created_date'),
    initialData: [],
  });

  const { data: animais = [] } = useQuery({
    queryKey: ['animais'],
    queryFn: () => db.entities.Animal.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.entities.Cliente.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditingCliente(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {id: string, data: any}) => db.entities.Cliente.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditingCliente(null);
      setSelectedCliente(null);
    },
  });

  const handleSubmit = (data: any) => {
    if (editingCliente) {
      updateMutation.mutate({ id: editingCliente.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredClientes = clientes.filter((cliente: any) =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.cpf?.includes(searchTerm)
  );

  const getAnimaisDoCliente = (clienteId: string) => {
    return animais.filter((a: any) => a.cliente_id === clienteId);
  };

  if (selectedCliente) {
    return (
      <ClienteDetalhes 
        cliente={selectedCliente}
        animais={getAnimaisDoCliente(selectedCliente.id)}
        onBack={() => setSelectedCliente(null)}
        onEdit={() => {
          setEditingCliente(selectedCliente);
          setShowForm(true);
        }}
        onDelete={() => {
          if (confirm('Tem certeza que deseja excluir este cliente?')) {
            // Delete logic here
            setSelectedCliente(null);
          }
        }}
      />
    );
  }

  if (showForm) {
    return (
      <ClienteForm 
        cliente={editingCliente}
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingCliente(null);
        }}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Clientes</h1>
            <p className="text-slate-600 mt-2">Gerencie os tutores cadastrados</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Busca */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nome, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="h-20 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredClientes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Nenhum cliente encontrado</p>
            </div>
          ) : (
            filteredClientes.map((cliente: any) => {
              const animaisCliente = getAnimaisDoCliente(cliente.id);
              return (
                <Card 
                  key={cliente.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCliente(cliente)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {cliente.nome?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {animaisCliente.length} {animaisCliente.length === 1 ? 'pet' : 'pets'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {cliente.nome}
                    </h3>
                    
                    <div className="space-y-2">
                      {cliente.telefone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{cliente.telefone}</span>
                        </div>
                      )}
                      {cliente.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{cliente.email}</span>
                        </div>
                      )}
                      {cliente.cidade && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{cliente.cidade}, {cliente.estado}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
