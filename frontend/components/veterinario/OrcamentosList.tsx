import React, { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OrcamentosList() {
  const [showForm, setShowForm] = useState(false);
  
  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: () => api.entities.Orcamento.list('-data_criacao'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.entities.Cliente.list(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Orçamentos e Propostas</h2>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
        </Button>
      </div>

      {showForm ? (
        <div className="text-center py-12 text-slate-500">Formulário de orçamento em implementação.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orcamentos.map((orc: any) => {
            const cliente = clientes.find((c: any) => c.id === orc.cliente_id);
            return (
              <Card key={orc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{orc.titulo}</CardTitle>
                      <p className="text-sm text-slate-500">{cliente?.nome}</p>
                    </div>
                    <BadgeStatus status={orc.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Valor Total:</span>
                      <span className="font-bold text-slate-900">R$ {orc.valor_final.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Data:</span>
                      <span>{new Date(orc.data_criacao).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="w-4 h-4 mr-2" /> Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BadgeStatus({ status }: { status: string }) {
  const styles: any = {
    "Aprovado": "bg-green-100 text-green-800",
    "Recusado": "bg-red-100 text-red-800",
    "Rascunho": "bg-slate-100 text-slate-800",
    "Aguardando Aprovação": "bg-yellow-100 text-yellow-800"
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles["Rascunho"]}`}>{status}</span>;
}
