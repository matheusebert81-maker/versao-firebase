import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Shield, UserCog, Mail, Phone, FileText, UserX, CheckCircle2 } from "lucide-react";
import db from "@/lib/db";

export default function AdminUsuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => db.entities.Profissional.list(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => db.entities.Profissional.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
      setShowForm(false);
      setEditingUser(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({id, data}: {id: string, data: any}) => db.entities.Profissional.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
      setShowForm(false);
      setEditingUser(null);
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({id, ativo}: {id: string, ativo: boolean}) => db.entities.Profissional.update(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profissionais'] })
  });

  // Form Handler
  const UserForm = ({ user, onClose }: any) => {
    const [formData, setFormData] = useState(user || {
      nome: "",
      email: "",
      tipo: "Atendente",
      grupo_acesso: "Recepção",
      cpf: "",
      telefone: "",
      ativo: true
    });

    const handleSubmit = (e: any) => {
      e.preventDefault();
      if (user) {
        updateMutation.mutate({ id: user.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              {user ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Nome Completo *</Label>
                <Input 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label>Email de Acesso *</Label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input 
                  value={formData.telefone} 
                  onChange={e => setFormData({...formData, telefone: e.target.value})} 
                />
              </div>

              <div>
                <Label>Cargo / Função</Label>
                <Select value={formData.tipo} onValueChange={v => setFormData({...formData, tipo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Veterinário">Veterinário</SelectItem>
                    <SelectItem value="Atendente">Atendente</SelectItem>
                    <SelectItem value="Banhista">Banhista</SelectItem>
                    <SelectItem value="Tosador">Tosador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 text-blue-700">
                  <Shield className="w-4 h-4" /> Grupo de Acesso
                </Label>
                <Select value={formData.grupo_acesso} onValueChange={v => setFormData({...formData, grupo_acesso: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador (Total)</SelectItem>
                    <SelectItem value="Veterinário">Veterinário (Clínica)</SelectItem>
                    <SelectItem value="Recepção">Recepção (Atendimento)</SelectItem>
                    <SelectItem value="Estética">Estética (Agenda/Serviços)</SelectItem>
                    <SelectItem value="Sem Acesso">Sem Acesso ao Sistema</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500 mt-1">Define as permissões dentro do ERP.</p>
              </div>
              
              <div>
                 <Label>CPF</Label>
                 <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
              </div>

              {formData.tipo === 'Veterinário' && (
                <>
                  <div>
                    <Label>CRMV</Label>
                    <Input 
                      value={formData.crmv || ''} 
                      onChange={e => setFormData({...formData, crmv: e.target.value})} 
                      placeholder="Ex: 12345/SP"
                    />
                  </div>
                  <div>
                    <Label>Especialidade</Label>
                    <Input 
                      value={formData.especialidade || ''} 
                      onChange={e => setFormData({...formData, especialidade: e.target.value})} 
                      placeholder="Ex: Clínico Geral, Cirurgião"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-6 md:col-span-2">
                 <div className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${formData.ativo ? 'bg-green-500' : 'bg-slate-300'}`}
                      onClick={() => setFormData({...formData, ativo: !formData.ativo})}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.ativo ? 'translate-x-5' : 'translate-x-0'}`} />
                 </div>
                 <Label className="cursor-pointer" onClick={() => setFormData({...formData, ativo: !formData.ativo})}>
                    Usuário Ativo
                 </Label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                 {user ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredUsers = usuarios.filter((u: any) => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
               <UserCog className="w-8 h-8 text-blue-600" />
               Gestão de Usuários
            </h1>
            <p className="text-slate-600 mt-1">Administração de contas, cargos e grupos de acesso</p>
          </div>
          <Button onClick={() => { setEditingUser(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white">
            <Plus className="w-5 h-5 mr-2" /> Novo Usuário
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome, email ou cargo..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {showForm && <UserForm user={editingUser} onClose={() => setShowForm(false)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredUsers.map((user: any) => (
             <Card key={user.id} className={`hover:shadow-md transition-shadow border-t-4 ${user.ativo ? 'border-t-blue-500' : 'border-t-slate-300 opacity-75'}`}>
               <CardHeader className="pb-2">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.ativo ? 'bg-blue-600' : 'bg-slate-400'}`}>
                          {user.nome.substring(0,2).toUpperCase()}
                       </div>
                       <div>
                          <CardTitle className="text-lg">{user.nome}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                             <Badge variant="outline" className="text-xs">{user.tipo}</Badge>
                             {!user.ativo && <Badge variant="destructive" className="text-[10px]">INATIVO</Badge>}
                          </div>
                       </div>
                    </div>
                 </div>
               </CardHeader>
               <CardContent className="text-sm space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-slate-600">
                     <Mail className="w-4 h-4" /> {user.email || "Sem email"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                     <Phone className="w-4 h-4" /> {user.telefone || "Sem telefone"}
                  </div>
                  
                  <div className="bg-slate-50 p-2 rounded border mt-3">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Grupo de Acesso
                     </div>
                     <Badge className={`
                        ${user.grupo_acesso === 'Administrador' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                        ${user.grupo_acesso === 'Veterinário' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                        ${user.grupo_acesso === 'Recepção' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                        ${user.grupo_acesso === 'Sem Acesso' ? 'bg-slate-500 text-white' : ''}
                     `}>
                        {user.grupo_acesso}
                     </Badge>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 mt-2 border-t">
                     <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setShowForm(true); }}>
                        Editar
                     </Button>
                     {user.ativo ? (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => toggleActiveMutation.mutate({id: user.id, ativo: false})}>
                           <UserX className="w-4 h-4 mr-1" /> Desativar
                        </Button>
                     ) : (
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => toggleActiveMutation.mutate({id: user.id, ativo: true})}>
                           <CheckCircle2 className="w-4 h-4 mr-1" /> Reativar
                        </Button>
                     )}
                  </div>
               </CardContent>
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
}
