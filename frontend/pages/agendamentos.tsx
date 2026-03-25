import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import db from "@/lib/db";

import AgendamentoForm from "@/components/AgendamentoForm";
import AgendaHorarios from "@/components/AgendaHorarios";
import Dummy from "@/components/Dummy";
const AgendaSemanal = Dummy;
const AgendaPorProfissional = Dummy;
const AgendamentoDetalhes = Dummy;
const NotificacoesPanel = Dummy;
const CalendarioCompleto = Dummy;

export default function Agendamentos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<any>(null);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [viewMode, setViewMode] = useState("day");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const queryClient = useQueryClient();

  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: () => db.entities.Agendamento.list('-data'),
    initialData: [],
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => db.entities.Cliente.list(),
    initialData: [],
  });

  const { data: animais = [] } = useQuery({
    queryKey: ['animais'],
    queryFn: () => db.entities.Animal.list(),
    initialData: [],
  });

  const { data: profissionais = [] } = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => db.entities.Profissional.list(),
    initialData: [],
  });

  const { data: notificacoes = [] } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: () => db.entities.Notificacao.list('-data_envio'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.entities.Agendamento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      setShowForm(false);
      setEditingAgendamento(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {id: string, data: any}) => db.entities.Agendamento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      setShowForm(false);
      setEditingAgendamento(null);
      setSelectedAgendamento(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.entities.Agendamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      setSelectedAgendamento(null);
    },
  });

  const handleSubmit = async (data: any) => {
    if (editingAgendamento) {
      await updateMutation.mutateAsync({ id: editingAgendamento.id, data });
      await enviarNotificacao(editingAgendamento.id, "Reagendamento");
    } else {
      const result = await createMutation.mutateAsync(data);
      if (result) {
        await enviarNotificacao(result.id, "Confirmação");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      await deleteMutation.mutateAsync(id);
      await enviarNotificacao(id, "Cancelamento");
    }
  };

  const handleReagendar = async (agendamentoId: string, novaData: string, novoHorario: string) => {
    const agendamento = agendamentos.find((a: any) => a.id === agendamentoId);
    if (!agendamento) return;

    await updateMutation.mutateAsync({
      id: agendamentoId,
      data: {
        ...agendamento,
        data: novaData,
        horario: novoHorario
      }
    });
    await enviarNotificacao(agendamentoId, "Reagendamento");
  };

  const enviarNotificacao = async (agendamentoId: string, tipo: string) => {
    const agendamento = agendamentos.find((a: any) => a.id === agendamentoId);
    if (!agendamento) return;

    const cliente = clientes.find((c: any) => c.id === agendamento.cliente_id);
    const animal = animais.find((a: any) => a.id === agendamento.animal_id);
    
    if (!cliente) return;

    let mensagem = "";
    let emailSubject = "";
    let emailBody = "";
    
    switch (tipo) {
      case "Confirmação":
        mensagem = `Olá ${cliente.nome}! Confirmamos o agendamento de ${animal?.nome} para ${format(new Date(agendamento.data), "dd/MM/yyyy")} às ${agendamento.horario}. Serviços: ${agendamento.servicos?.join(", ")}. Até lá! 🐾`;
        emailSubject = "Agendamento Confirmado - PetinforCare";
        emailBody = `<h2>Agendamento Confirmado!</h2><p>Olá ${cliente.nome},</p><p>Seu agendamento para <strong>${animal?.nome}</strong> foi confirmado!</p><p><strong>Data:</strong> ${format(new Date(agendamento.data), "dd/MM/yyyy")}</p><p><strong>Horário:</strong> ${agendamento.horario}</p><p><strong>Serviços:</strong> ${agendamento.servicos?.join(", ")}</p><p>Aguardamos você! 🐾</p>`;
        break;
      case "Lembrete 24h":
        mensagem = `Olá ${cliente.nome}! Lembramos que ${animal?.nome} tem agendamento amanhã (${format(new Date(agendamento.data), "dd/MM/yyyy")}) às ${agendamento.horario}. Aguardamos vocês! 🐾`;
        emailSubject = "Lembrete: Agendamento Amanhã - PetinforCare";
        emailBody = `<h2>Lembrete de Agendamento</h2><p>Olá ${cliente.nome},</p><p><strong>${animal?.nome}</strong> tem agendamento <strong>amanhã</strong>!</p><p><strong>Data:</strong> ${format(new Date(agendamento.data), "dd/MM/yyyy")}</p><p><strong>Horário:</strong> ${agendamento.horario}</p><p>Aguardamos vocês! 🐾</p>`;
        break;
      case "Lembrete 2h":
        mensagem = `Olá ${cliente.nome}! ${animal?.nome} tem agendamento hoje às ${agendamento.horario}. Estamos aguardando! 🐾`;
        emailSubject = "Lembrete: Agendamento Hoje - PetinforCare";
        emailBody = `<h2>Seu Agendamento é Hoje!</h2><p>Olá ${cliente.nome},</p><p><strong>${animal?.nome}</strong> tem agendamento <strong>hoje</strong> às <strong>${agendamento.horario}</strong>!</p><p>Estamos aguardando! 🐾</p>`;
        break;
      case "Cancelamento":
        mensagem = `Olá ${cliente.nome}. O agendamento de ${animal?.nome} para ${format(new Date(agendamento.data), "dd/MM/yyyy")} às ${agendamento.horario} foi cancelado. Entre em contato para reagendar.`;
        emailSubject = "Agendamento Cancelado - PetinforCare";
        emailBody = `<h2>Agendamento Cancelado</h2><p>Olá ${cliente.nome},</p><p>O agendamento de <strong>${animal?.nome}</strong> para <strong>${format(new Date(agendamento.data), "dd/MM/yyyy")}</strong> às <strong>${agendamento.horario}</strong> foi cancelado.</p><p>Entre em contato conosco para reagendar.</p>`;
        break;
      case "Reagendamento":
        mensagem = `Olá ${cliente.nome}! O agendamento de ${animal?.nome} foi reagendado para ${format(new Date(agendamento.data), "dd/MM/yyyy")} às ${agendamento.horario}. Confirme o recebimento! 🐾`;
        emailSubject = "Agendamento Reagendado - PetinforCare";
        emailBody = `<h2>Agendamento Reagendado</h2><p>Olá ${cliente.nome},</p><p>O agendamento de <strong>${animal?.nome}</strong> foi reagendado!</p><p><strong>Nova Data:</strong> ${format(new Date(agendamento.data), "dd/MM/yyyy")}</p><p><strong>Novo Horário:</strong> ${agendamento.horario}</p><p>Aguardamos você! 🐾</p>`;
        break;
    }

    try {
      await db.entities.Notificacao.create({
        tipo,
        agendamento_id: agendamentoId,
        destinatario: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        mensagem,
        data_envio: new Date().toISOString(),
        status: "Enviado",
        canal: "WhatsApp"
      });
      
      if (cliente.email && emailSubject && emailBody) {
        await db.integrations.Core.SendEmail({
          to: cliente.email,
          subject: emailSubject,
          body: emailBody
        });
      }
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
    }
  };

  const agendamentosDoDia = agendamentos.filter((a: any) => {
    const dataAgendamento = new Date(a.data);
    return isSameDay(dataAgendamento, selectedDate);
  });

  const agendamentosDaSemana = agendamentos.filter((a: any) => {
    const dataAgendamento = new Date(a.data);
    const inicioSemana = startOfWeek(selectedDate, { locale: ptBR });
    const fimSemana = endOfWeek(selectedDate, { locale: ptBR });
    return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana;
  });

  const handlePreviousDay = () => setSelectedDate(prev => addDays(prev, -1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  if (selectedAgendamento) {
    return (
      <AgendamentoDetalhes />
    );
  }

  if (showForm) {
    return (
      <AgendamentoForm 
        initialData={editingAgendamento}
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingAgendamento(null);
        }}
        clientes={clientes}
        animais={animais}
        profissionais={profissionais}
      />
    );
  }

  const agendamentosConcluidos = agendamentosDoDia.filter((a: any) => a.status === "Concluído").length;
  const agendamentosConfirmados = agendamentosDoDia.filter((a: any) => a.status === "Confirmado").length;
  const agendamentosPendentes = agendamentosDoDia.filter((a: any) => a.status === "Agendado").length;
  const receitaDia = agendamentosDoDia
    .filter((a: any) => a.status === "Concluído")
    .reduce((sum: number, a: any) => sum + (a.valor_total || 0), 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Agendamentos</h1>
            <p className="text-slate-600 mt-2">Gerencie a agenda de serviços</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCalendar(!showCalendar)}
              variant="outline"
              className="border-blue-200 hover:bg-blue-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </Button>
            <Button
              onClick={() => setShowNotifications(!showNotifications)}
              variant="outline"
              className="border-blue-200 hover:bg-blue-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Notificações ({notificacoes.filter((n: any) => n.status === "Pendente").length})
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {showNotifications && (
          <NotificacoesPanel />
        )}

        {showCalendar && (
          <div className="mb-6">
            <CalendarioCompleto />
          </div>
        )}

        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousDay}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="text-center min-w-[200px]">
                  <p className="text-2xl font-bold text-slate-900">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-slate-500">
                    {format(selectedDate, "EEEE", { locale: ptBR })}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextDay}
                  className="rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleToday}
                className="border-blue-200 hover:bg-blue-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Hoje
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Total do Dia</p>
              <p className="text-3xl font-bold mt-2">{agendamentosDoDia.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Concluídos</p>
              <p className="text-3xl font-bold mt-2">{agendamentosConcluidos}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Confirmados</p>
              <p className="text-3xl font-bold mt-2">{agendamentosConfirmados}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm opacity-90">Receita</p>
              <p className="text-2xl font-bold mt-2">R$ {receitaDia.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md rounded-xl p-1">
            <TabsTrigger value="day" className="rounded-lg">
              Dia
            </TabsTrigger>
            <TabsTrigger value="week" className="rounded-lg">
              Semana
            </TabsTrigger>
            <TabsTrigger value="professional" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Profissionais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="day">
            <AgendaHorarios 
              agendamentos={agendamentosDoDia}
              clientes={clientes}
              animais={animais}
              onEdit={(agendamento: any) => {
                setEditingAgendamento(agendamento);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="week">
            <AgendaSemanal />
          </TabsContent>

          <TabsContent value="professional">
            <AgendaPorProfissional />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
