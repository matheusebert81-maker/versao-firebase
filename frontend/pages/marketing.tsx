import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Megaphone, Ticket, Trash2, Edit, Send, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';
import db from '@/lib/db';

import CampanhaForm from '../components/marketing/CampanhaForm';
import PromocaoForm from '../components/marketing/PromocaoForm';

export default function Marketing() {
  const [view, setView] = useState('list'); // list, form
  const [editingCampanha, setEditingCampanha] = useState<any>(null);
  const [editingPromocao, setEditingPromocao] = useState<any>(null);
  const [showConfirmSend, setShowConfirmSend] = useState<any>(null);
  const queryClient = useQueryClient();

  // Data Queries
  const { data: campanhas = [] } = useQuery({ queryKey: ['campanhas'], queryFn: () => db.entities.Campanha.list('-created_date') });
  const { data: promocoes = [] } = useQuery({ queryKey: ['promocoes'], queryFn: () => db.entities.Promocao.list('-created_date') });
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: () => db.entities.Cliente.list() });
  const { data: animais = [] } = useQuery({ queryKey: ['animais'], queryFn: () => db.entities.Animal.list() });

  // Mutations
  const campanhaMutation = useMutation({
    mutationFn: (data: any) =>
      editingCampanha && editingCampanha.id
        ? db.entities.Campanha.update(editingCampanha.id, data)
        : db.entities.Campanha.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      setView('list');
      setEditingCampanha(null);
    },
  });

  const promocaoMutation = useMutation({
    mutationFn: (data: any) =>
      editingPromocao && editingPromocao.id
        ? db.entities.Promocao.update(editingPromocao.id, data)
        : db.entities.Promocao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocoes'] });
      setView('list');
      setEditingPromocao(null);
    },
  });

  const deleteCampanhaMutation = useMutation({
    mutationFn: (id: string) => db.entities.Campanha.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campanhas'] })
  });

  const deletePromocaoMutation = useMutation({
    mutationFn: (id: string) => db.entities.Promocao.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promocoes'] })
  });

  // Logic to send campaign
  const handleSendCampaign = async (campanha: any) => {
    await db.entities.Campanha.update(campanha.id, { status: 'Enviando' });
    queryClient.invalidateQueries({ queryKey: ['campanhas'] });

    let targetClientes = [];
    if (campanha.segmento_clientes === 'todos') {
      targetClientes = clientes;
    } else {
      const especieFilter = campanha.segmento_clientes === 'tutores_caes' ? 'Cachorro' : 'Gato';
      const animalOwnerIds = new Set(animais.filter((a: any) => a.especie === especieFilter).map((a: any) => a.cliente_id));
      targetClientes = clientes.filter((c: any) => animalOwnerIds.has(c.id));
    }

    let sentCount = 0;
    for (const cliente of targetClientes) {
        if(cliente.email) {
            try {
                await db.integrations.Core.SendEmail({ 
                    to: cliente.email, 
                    subject: campanha.assunto, 
                    body: campanha.corpo_email 
                });
                sentCount++;
            } catch(e) {
                console.error(`Failed to send email to ${cliente.email}`, e);
            }
        }
    }

    await db.entities.Campanha.update(campanha.id, { 
        status: 'Enviada', 
        data_envio: new Date().toISOString(),
        total_enviado: sentCount
    });
    queryClient.invalidateQueries({ queryKey: ['campanhas'] });
    setShowConfirmSend(null);
  };

  if (view === 'form') {
    if (editingCampanha !== null) return (
      <CampanhaForm 
        campanha={editingCampanha} 
        onSave={(data) => campanhaMutation.mutate(data)} 
        onCancel={() => { setView('list'); setEditingCampanha(null); }} 
      />
    );
    if (editingPromocao !== null) return (
      <PromocaoForm 
        promocao={editingPromocao} 
        onSave={(data) => promocaoMutation.mutate(data)} 
        onCancel={() => { setView('list'); setEditingPromocao(null); }} 
      />
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Marketing</h1>
        </div>

        <Tabs defaultValue="campanhas">
            <TabsList className="grid w-full grid-cols-2 md:w-96 bg-white shadow-sm p-1 rounded-xl mb-6">
                <TabsTrigger value="campanhas"><Megaphone className="w-4 h-4 mr-2"/> Campanhas</TabsTrigger>
                <TabsTrigger value="promocoes"><Ticket className="w-4 h-4 mr-2"/> Promoções</TabsTrigger>
            </TabsList>

            <TabsContent value="campanhas">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Campanhas de Email</CardTitle>
                            <Button onClick={() => { setEditingCampanha({}); setView('form'); }}>
                                <Plus className="w-4 h-4 mr-2"/> Nova Campanha
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Segmento</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Enviada em</TableHead>
                                    <TableHead className="text-center">Análise</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campanhas.map((c: any) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.nome}</TableCell>
                                        <TableCell>{c.segmento_clientes}</TableCell>
                                        <TableCell><Badge variant={c.status === 'Enviada' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                                        <TableCell>{c.data_envio ? format(new Date(c.data_envio), 'dd/MM/yyyy') : '-'}</TableCell>
                                        <TableCell className="text-center">
                                            {c.status === 'Enviada' ? (
                                                <div className="flex items-center justify-center gap-2 font-bold text-sm text-slate-600">
                                                    <Users className="w-4 h-4" /> {c.total_enviado}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {c.status === 'Rascunho' && <Button variant="ghost" size="sm" onClick={() => setShowConfirmSend(c)}><Send className="w-4 h-4"/></Button>}
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingCampanha(c); setView('form'); }}><Edit className="w-4 h-4"/></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteCampanhaMutation.mutate(c.id)}><Trash2 className="w-4 h-4"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="promocoes">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                           <CardTitle>Promoções e Cupons</CardTitle>
                            <Button onClick={() => { setEditingPromocao({}); setView('form'); }}>
                                <Plus className="w-4 h-4 mr-2"/> Nova Promoção
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Desconto</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Usos</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promocoes.map((p: any) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.nome}</TableCell>
                                        <TableCell><Badge variant="outline">{p.codigo}</Badge></TableCell>
                                        <TableCell>{p.tipo_desconto === 'percentual' ? `${p.valor_desconto}%` : `R$ ${p.valor_desconto.toFixed(2)}`}</TableCell>
                                        <TableCell><Badge variant={p.ativo ? 'default' : 'secondary'}>{p.ativo ? 'Ativa' : 'Inativa'}</Badge></TableCell>
                                        <TableCell className="text-center font-bold text-slate-600">{p.num_usos || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingPromocao(p); setView('form'); }}><Edit className="w-4 h-4"/></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deletePromocaoMutation.mutate(p.id)}><Trash2 className="w-4 h-4"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        {showConfirmSend && (
            <Dialog open={!!showConfirmSend} onOpenChange={() => setShowConfirmSend(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Envio de Campanha</DialogTitle>
                    </DialogHeader>
                    <p>Você está prestes a enviar a campanha "<strong>{showConfirmSend.nome}</strong>" para o segmento "<strong>{showConfirmSend.segmento_clientes}</strong>". Esta ação não pode ser desfeita.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmSend(null)}>Cancelar</Button>
                        <Button onClick={() => handleSendCampaign(showConfirmSend)} className="bg-blue-600 text-white">
                            {showConfirmSend.status === 'Enviando' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2"/>} Sim, enviar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}
