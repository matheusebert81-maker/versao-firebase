import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Stethoscope, ClipboardList, Activity, Pill } from "lucide-react";

export default function AnamneseForm({ animal, veterinarioId, onClose }: { animal: any, veterinarioId: string, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    queixa_principal: "",
    historico: "",
    exame_fisico: "",
    diagnostico_presuntivo: "",
    tratamento: "",
    observacoes: ""
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.entities.Anamnese.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anamneses', animal.id] });
      onClose();
    }
  });

  const handleSave = () => {
    if (!formData.queixa_principal) return;
    createMutation.mutate({
      ...formData,
      animal_id: animal.id,
      profissional_id: veterinarioId,
      data: new Date().toISOString(),
      tipo: "Consulta Clínica"
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-bold">
              <ClipboardList className="w-4 h-4 text-blue-500" /> Queixa Principal
            </Label>
            <Input 
              value={formData.queixa_principal} 
              onChange={e => setFormData({...formData, queixa_principal: e.target.value})} 
              placeholder="Ex: Vômito e diarreia há 2 dias" 
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-bold">
              <History className="w-4 h-4 text-blue-500" /> Histórico / Anamnese
            </Label>
            <Textarea 
              value={formData.historico} 
              onChange={e => setFormData({...formData, historico: e.target.value})} 
              rows={3} 
              placeholder="Histórico do paciente..." 
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-bold">
              <Activity className="w-4 h-4 text-blue-500" /> Exame Físico
            </Label>
            <Textarea 
              value={formData.exame_fisico} 
              onChange={e => setFormData({...formData, exame_fisico: e.target.value})} 
              rows={3} 
              placeholder="Frequência cardíaca, temperatura, mucosas..." 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-bold">
              <Stethoscope className="w-4 h-4 text-blue-500" /> Diagnóstico Presuntivo
            </Label>
            <Input 
              value={formData.diagnostico_presuntivo} 
              onChange={e => setFormData({...formData, diagnostico_presuntivo: e.target.value})} 
              placeholder="Ex: Gastroenterite hemorrágica" 
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-bold">
              <Pill className="w-4 h-4 text-blue-500" /> Tratamento / Conduta
            </Label>
            <Textarea 
              value={formData.tratamento} 
              onChange={e => setFormData({...formData, tratamento: e.target.value})} 
              rows={3} 
              placeholder="Medicamentos aplicados, exames solicitados..." 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold">Observações Internas</Label>
            <Textarea 
              value={formData.observacoes} 
              onChange={e => setFormData({...formData, observacoes: e.target.value})} 
              rows={3} 
              placeholder="Notas adicionais..." 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose} className="rounded-full px-6">Cancelar</Button>
        <Button 
          onClick={handleSave} 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg shadow-blue-200"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Salvando..." : "Salvar no Prontuário"}
        </Button>
      </div>
    </div>
  );
}

import { History } from "lucide-react";
