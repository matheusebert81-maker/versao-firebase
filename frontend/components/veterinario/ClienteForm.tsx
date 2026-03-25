import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

export default function ClienteForm({ cliente, onSubmit, onCancel, isLoading }: { cliente?: any, onSubmit: (data: any) => void, onCancel: () => void, isLoading?: boolean }) {
  const [formData, setFormData] = useState(cliente || {
    nome: "",
    cpf: "",
    rg: "",
    telefone: "",
    telefone_secundario: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    observacoes: ""
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const validatePhone = (phone: string) => {
      const nums = phone.replace(/\D/g, "");
      return nums.length >= 10 && nums.length <= 11;
  };

  const handleCepBlur = async () => {
      const cep = formData.cep?.replace(/\D/g, "");
      if (cep?.length === 8) {
          try {
              const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
              const data = await res.json();
              if (!data.erro) {
                  setFormData((prev: any) => ({
                      ...prev,
                      endereco: data.logradouro,
                      bairro: data.bairro,
                      cidade: data.localidade,
                      estado: data.uf
                  }));
              }
          } catch (error) {
              console.error("Erro ao buscar CEP", error);
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.cpf && !validateCPF(formData.cpf)) {
        alert("CPF inválido. Dígitos verificadores não conferem.");
        return;
    }
    if (formData.telefone && !validatePhone(formData.telefone)) {
        alert("Telefone inválido. Formato deve ser (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX.");
        return;
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
              {cliente ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <p className="text-slate-600 mt-1">Preencha os dados do tutor</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleChange('rg', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone Principal *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                  <Input
                    id="telefone_secundario"
                    value={formData.telefone_secundario}
                    onChange={(e) => handleChange('telefone_secundario', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleChange('bairro', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                rows={4}
                placeholder="Adicione observações sobre the cliente..."
              />
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
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
