import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Trash2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function VacinasList() {
  const queryClient = useQueryClient();
  const [selectedVacina, setSelectedVacina] = useState(null);

  const { data: vacinas = [] as any[], isLoading: isLoadingVacinas } = useQuery({
    queryKey: ['vacinas'],
    queryFn: () => api.entities.VacinaHistorico.list(),
  });

  const { data: animais = [] as any[], isLoading: isLoadingAnimais } = useQuery({
    queryKey: ['animais'],
    queryFn: () => api.entities.Animal.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.entities.VacinaHistorico.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vacinas'] })
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro de vacina?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Data inválida";
  };

  if (isLoadingVacinas || isLoadingAnimais) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Animal</TableHead>
            <TableHead>Vacina</TableHead>
            <TableHead>Aplicação</TableHead>
            <TableHead>Reforço</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vacinas.map((v: any) => {
            const animal = animais.find((a: any) => a.id === v.animal_id);
            return (
              <TableRow key={v.id}>
                <TableCell>{animal?.nome || "Desconhecido"}</TableCell>
                <TableCell>{v.vacina}</TableCell>
                <TableCell>{formatDate(v.data_aplicacao)}</TableCell>
                <TableCell>{formatDate(v.data_reforco)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger render={<Button variant="ghost" size="icon" onClick={() => setSelectedVacina(v)} />}>
                        <Eye className="w-4 h-4" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Detalhes da Vacina</DialogTitle></DialogHeader>
                        <div className="space-y-2 text-sm">
                          <p><strong>Animal:</strong> {animal?.nome}</p>
                          <p><strong>Vacina:</strong> {v.vacina}</p>
                          <p><strong>Data Aplicação:</strong> {formatDate(v.data_aplicacao)}</p>
                          <p><strong>Reforço:</strong> {formatDate(v.data_reforco)}</p>
                          <p><strong>Lote:</strong> {v.lote || "-"}</p>
                          <p><strong>Veterinário:</strong> {v.veterinario || "-"}</p>
                          <p><strong>Observações:</strong> {v.observacoes || "-"}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
