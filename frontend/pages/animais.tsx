import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, PawPrint, Calendar, Weight } from "lucide-react";
import { format } from "date-fns";
import db from "@/lib/db";

import AnimalForm from "@/components/veterinario/AnimalForm";
import AnimalDetalhes from "@/components/veterinario/AnimalDetalhes";

export default function Animais() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [editingAnimal, setEditingAnimal] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: animais = [], isLoading } = useQuery({
    queryKey: ['animais'],
    queryFn: () => db.entities.Animal.list('-created_date'),
    initialData: [],
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => db.entities.Cliente.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.entities.Animal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animais'] });
      setShowForm(false);
      setEditingAnimal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {id: string, data: any}) => db.entities.Animal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animais'] });
      setShowForm(false);
      setEditingAnimal(null);
      setSelectedAnimal(null);
    },
  });

  const handleSubmit = (data: any) => {
    if (editingAnimal) {
      updateMutation.mutate({ id: editingAnimal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredAnimais = animais.filter((animal: any) => {
    const cliente = clientes.find((c: any) => c.id === animal.cliente_id);
    return (
      animal.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.raca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getCliente = (clienteId: string) => {
    return clientes.find((c: any) => c.id === clienteId);
  };

  if (selectedAnimal) {
    return (
      <AnimalDetalhes 
        animal={selectedAnimal}
        cliente={getCliente(selectedAnimal.cliente_id)}
        onClose={() => setSelectedAnimal(null)}
        onEdit={() => {
          setEditingAnimal(selectedAnimal);
          setShowForm(true);
        }}
      />
    );
  }

  if (showForm) {
    return (
      <AnimalForm 
        animal={editingAnimal}
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingAnimal(null);
        }}
        clientes={clientes}
      />
    );
  }

  const porteColors: any = {
    'Pequeno': 'bg-blue-100 text-blue-700',
    'Médio': 'bg-yellow-100 text-yellow-700',
    'Grande': 'bg-red-100 text-red-700'
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Animais</h1>
            <p className="text-slate-600 mt-2">Gerencie os pets cadastrados</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Animal
          </Button>
        </div>

        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nome do animal, raça ou tutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="h-32 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredAnimais.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <PawPrint className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Nenhum animal encontrado</p>
            </div>
          ) : (
            filteredAnimais.map((animal: any) => {
              const cliente = getCliente(animal.cliente_id);
              const idade = animal.data_nascimento 
                ? Math.floor((new Date().getTime() - new Date(animal.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                : null;

              return (
                <Card
                  key={animal.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedAnimal(animal)}
                >
                  {animal.foto_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={animal.foto_url} 
                        alt={animal.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 group-hover:text-green-600 transition-colors">
                          {animal.nome}
                        </h3>
                        <p className="text-sm text-slate-600">{cliente?.nome || 'Sem tutor'}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${porteColors[animal.porte] || 'bg-slate-100'}`}>
                        {animal.porte || 'Desconhecido'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <PawPrint className="w-4 h-4 text-slate-400" />
                        <span>{animal.especie} • {animal.raca}</span>
                      </div>
                      {animal.data_nascimento && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{idade} {idade === 1 ? 'ano' : 'anos'}</span>
                        </div>
                      )}
                      {animal.peso && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Weight className="w-4 h-4 text-slate-400" />
                          <span>{animal.peso} kg</span>
                        </div>
                      )}
                    </div>

                    {animal.temperamento && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                          {animal.temperamento}
                        </span>
                      </div>
                    )}
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
