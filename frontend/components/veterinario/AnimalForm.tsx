import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

export default function AnimalForm({ animal, clientes, onSubmit, onCancel, isLoading, preSelectedClienteId }: { animal?: any, clientes: any[], onSubmit: (data: any) => void, onCancel: () => void, isLoading?: boolean, preSelectedClienteId?: string | null }) {
  const [formData, setFormData] = useState(animal || {
    cliente_id: preSelectedClienteId || "",
    nome: "",
    especie: "Cão",
    raca: "",
    data_nascimento: "",
    peso: "",
    porte: "Médio",
    tipo_pelagem: "Curto/Liso",
    cor: "",
    sexo: "Macho",
    castrado: false,
    temperamento: "Calmo",
    observacoes_especiais: "",
    alergias: "",
    tem_alergia: false
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (formData.peso && parseFloat(formData.peso) <= 0) {
        alert("Peso deve ser maior que zero.");
        return;
    }
    
    if (formData.data_nascimento) {
        const birthDate = new Date(formData.data_nascimento);
        const today = new Date();
        if (birthDate > today) {
            alert("Data de nascimento inválida ou futura.");
            return;
        }
    }

    onSubmit(formData);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onCancel}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {animal ? 'Editar Animal' : 'Novo Animal'}
            </h1>
            <p className="text-slate-600 mt-1">Preencha os dados do pet</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="cliente_id">Tutor *</Label>
                  <Select
                    value={formData.cliente_id}
                    onValueChange={(value) => handleChange('cliente_id', value)}
                    required
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nome">Nome do Animal *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="especie">Espécie *</Label>
                  <Select
                    value={formData.especie}
                    onValueChange={(value) => handleChange('especie', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cão">Cão</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="raca">Raça</Label>
                  <Input
                    id="raca"
                    value={formData.raca}
                    onChange={(e) => handleChange('raca', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo}
                    onValueChange={(value) => handleChange('sexo', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleChange('data_nascimento', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={(e) => handleChange('peso', parseFloat(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => handleChange('cor', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle>Características Físicas</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="porte">Porte *</Label>
                  <Select
                    value={formData.porte}
                    onValueChange={(value) => handleChange('porte', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pequeno">Pequeno</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo_pelagem">Tipo de Pelagem</Label>
                  <Select
                    value={formData.tipo_pelagem}
                    onValueChange={(value) => handleChange('tipo_pelagem', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Curto/Liso">Curto/Liso</SelectItem>
                      <SelectItem value="Longo/Liso">Longo/Liso</SelectItem>
                      <SelectItem value="Encaracolado">Encaracolado</SelectItem>
                      <SelectItem value="Sem pelo">Sem pelo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="temperamento">Temperamento</Label>
                  <Select
                    value={formData.temperamento}
                    onValueChange={(value) => handleChange('temperamento', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calmo">Calmo</SelectItem>
                      <SelectItem value="Agitado">Agitado</SelectItem>
                      <SelectItem value="Agressivo">Agressivo</SelectItem>
                      <SelectItem value="Medroso">Medroso</SelectItem>
                      <SelectItem value="Sociável">Sociável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <input
                    id="castrado"
                    type="checkbox"
                    checked={formData.castrado}
                    onChange={(e) => handleChange('castrado', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300"
                  />
                  <Label htmlFor="castrado" className="cursor-pointer">Castrado</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle>Observações e Alergias</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="observacoes_especiais">Observações Especiais</Label>
                  <Textarea
                    id="observacoes_especiais"
                    value={formData.observacoes_especiais}
                    onChange={(e) => handleChange('observacoes_especiais', e.target.value)}
                    rows={4}
                    placeholder="Ex: Agressivo com outros animais, medroso, precisa de cuidados especiais..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="alergias">Possui Alergias?</Label>
                  <Select 
                    value={formData.tem_alergia ? "Sim" : "Não"} 
                    onValueChange={(val) => {
                        const hasAllergy = val === "Sim";
                        setFormData((prev: any) => ({...prev, tem_alergia: hasAllergy, alergias: hasAllergy ? prev.alergias : ""}));
                    }}
                  >
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Não">Não</SelectItem>
                        <SelectItem value="Sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {formData.tem_alergia && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="alergias_desc" className="text-red-600">Especifique as Alergias *</Label>
                        <Textarea
                            id="alergias_desc"
                            value={formData.alergias}
                            onChange={(e) => handleChange('alergias', e.target.value)}
                            rows={3}
                            required
                            placeholder="Ex: Dipirona, Frango, Grama..."
                            className="mt-2 border-red-200 focus:border-red-500"
                        />
                      </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Animal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
