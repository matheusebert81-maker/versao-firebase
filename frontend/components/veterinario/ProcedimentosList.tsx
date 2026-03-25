import React, { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProcedimentosList() {
  const [showModal, setShowModal] = useState(false);
  const [editingProc, setEditingProc] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: procedimentos = [] } = useQuery({
    queryKey: ['procedimentos'],
    queryFn: () => api.entities.Procedimento.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.entities.Procedimento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] });
      setShowModal(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.entities.Procedimento.update(editingProc.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] });
      setShowModal(false);
      setEditingProc(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.entities.Procedimento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] });
    }
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Catálogo de Procedimentos e Serviços</h2>
        <Button onClick={() => { setEditingProc(null); setShowModal(true); }} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" /> Novo Procedimento
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor Base</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedimentos.map((proc: any) => (
            <TableRow key={proc.id}>
              <TableCell className="font-medium">{proc.nome}</TableCell>
              <TableCell>{proc.categoria}</TableCell>
              <TableCell>R$ {proc.valor_base.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => { setEditingProc(proc); setShowModal(true); }}>
                  <Pencil className="w-4 h-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { if(confirm('Excluir?')) deleteMutation.mutate(proc.id); }}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showModal && (
        <ProcedimentoForm 
          procedimento={editingProc} 
          onClose={() => setShowModal(false)}
          onSave={(data: any) => editingProc ? updateMutation.mutate(data) : createMutation.mutate(data)}
        />
      )}
    </div>
  );
}

function ProcedimentoForm({ procedimento, onClose, onSave }: any) {
  const [formData, setFormData] = useState(procedimento || {
    nome: "",
    categoria: "Consulta",
    valor_base: 0,
    descricao: ""
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{procedimento ? 'Editar' : 'Novo'} Procedimento</h3>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={formData.categoria} onValueChange={val => setFormData({...formData, categoria: val})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Consulta", "Cirurgia", "Exame Laboratorial", "Exame Imagem", "Internação (Diária)", "Procedimento Clínico", "Vacina", "Outro"].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor Base (R$)</Label>
            <Input type="number" step="0.01" value={formData.valor_base} onChange={e => setFormData({...formData, valor_base: parseFloat(e.target.value)})} />
          </div>
          <div>
            <Label>Descrição (Opcional)</Label>
            <Input value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => onSave(formData)}>Salvar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
