import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Printer } from "lucide-react";

export default function TermosManager() {
  const [selectedTermo, setSelectedTermo] = useState("");

  const termos = [
    { id: "cirurgia", nome: "Termo de Consentimento - Cirurgia" },
    { id: "anestesia", nome: "Termo de Consentimento - Anestesia" },
    { id: "internacao", nome: "Termo de Consentimento - Internação" },
    { id: "exames", nome: "Autorização para Exames" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Documentos e Termos</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Label>Selecione o Documento</Label>
        <Select value={selectedTermo} onValueChange={(val) => setSelectedTermo(val || "")}>
          <SelectTrigger><SelectValue placeholder="Escolha um termo..." /></SelectTrigger>
          <SelectContent>
            {termos.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        
        {selectedTermo && (
          <div className="p-4 border rounded bg-slate-50">
            <p className="text-sm text-slate-600 mb-4">Pré-visualização do termo selecionado...</p>
            <Button className="w-full bg-slate-800"><Printer className="w-4 h-4 mr-2" /> Imprimir Termo</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
