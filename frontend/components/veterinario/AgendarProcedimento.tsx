import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export default function AgendarProcedimento({ internacao, animal, onClose }: { internacao: any, animal: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [procedimento, setProcedimento] = useState("");
  const [data, setData] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: any) => api.entities.Agendamento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      onClose();
    }
  });

  const handleSave = () => {
    if (!procedimento || !data) return;
    createMutation.mutate({
      animal_id: animal.id,
      internacao_id: internacao.id,
      procedimento,
      data_agendada: data,
      status: "Pendente"
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Agendar Procedimento</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Label>Procedimento</Label>
        <Input value={procedimento} onChange={e => setProcedimento(e.target.value)} placeholder="Ex: Curativo, Exame de Sangue" />
        <Label>Data e Hora</Label>
        <Input type="datetime-local" value={data} onChange={e => setData(e.target.value)} />
        <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">Agendar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
