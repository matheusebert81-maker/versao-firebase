import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Calendar, Syringe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";

export default function VacinasManager({ animal }: { animal: any }) {
  const queryClient = useQueryClient();
  const [vacina, setVacina] = useState("");
  const [dataAplicacao, setDataAplicacao] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dataReforco, setDataReforco] = useState("");
  const [veterinario, setVeterinario] = useState("");

  const { data: historico = [] } = useQuery({
    queryKey: ['vacinas', animal.id],
    queryFn: () => api.entities.VacinaHistorico.filter({ animal_id: animal.id }, '-data_aplicacao'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.entities.VacinaHistorico.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacinas', animal.id] });
      setVacina("");
      setDataReforco("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.entities.VacinaHistorico.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacinas', animal.id] });
    }
  });

  const handleSave = () => {
    if (!vacina) return;
    createMutation.mutate({
      animal_id: animal.id,
      vacina,
      data_aplicacao: dataAplicacao,
      data_reforco: dataReforco || null,
      veterinario
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Syringe className="w-4 h-4" /> Registrar Vacina</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vacina</Label>
              <Input value={vacina} onChange={e => setVacina(e.target.value)} placeholder="Ex: V10, Raiva" />
            </div>
            <div>
              <Label>Veterinário</Label>
              <Input value={veterinario} onChange={e => setVeterinario(e.target.value)} />
            </div>
            <div>
              <Label>Data Aplicação</Label>
              <Input type="date" value={dataAplicacao} onChange={e => setDataAplicacao(e.target.value)} />
            </div>
            <div>
              <Label>Data Reforço (Opcional)</Label>
              <Input type="date" value={dataReforco} onChange={e => setDataReforco(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" /> Registrar Vacina
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vacina</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Reforço</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((h: any) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.vacina}</TableCell>
                  <TableCell>{format(new Date(h.data_aplicacao), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{h.data_reforco ? format(new Date(h.data_reforco), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(h.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
