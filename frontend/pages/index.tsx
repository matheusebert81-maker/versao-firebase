import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  PawPrint,
  Syringe,
  Package,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import db from "@/lib/db";
import Link from "next/link";

export default function Dashboard() {
  const { data: agendamentos = [] } = useQuery({
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

  const { data: vacinas = [] } = useQuery({
    queryKey: ['vacinas'],
    queryFn: () => db.entities.VacinaHistorico.list(),
    initialData: [],
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas'],
    queryFn: () => db.entities.Despesa.list(),
    initialData: [],
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => db.entities.Produto.list(),
    initialData: [],
  });

  // Cálculos do mês atual
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  const inicioMesPassado = startOfMonth(subMonths(hoje, 1));
  const fimMesPassado = endOfMonth(subMonths(hoje, 1));
  const inicioAno = startOfYear(hoje);

  const agendamentosMes = agendamentos.filter((a: any) => {
    const data = new Date(a.data);
    return data >= inicioMes && data <= fimMes;
  });

  const agendamentosMesPassado = agendamentos.filter((a: any) => {
    const data = new Date(a.data);
    return data >= inicioMesPassado && data <= fimMesPassado;
  });

  const faturamentoMes = agendamentosMes
    .filter((a: any) => a.status === 'Concluído')
    .reduce((sum: number, a: any) => sum + (a.valor_total || 0), 0);

  const faturamentoMesPassado = agendamentosMesPassado
    .filter((a: any) => a.status === 'Concluído')
    .reduce((sum: number, a: any) => sum + (a.valor_total || 0), 0);

  const despesasMes = despesas
    .filter((d: any) => {
      const data = new Date(d.data);
      return data >= inicioMes && data <= fimMes;
    })
    .reduce((sum: number, d: any) => sum + (d.valor || 0), 0);

  const lucroMes = faturamentoMes - despesasMes;
  
  const crescimento = faturamentoMesPassado > 0 
    ? ((faturamentoMes - faturamentoMesPassado) / faturamentoMesPassado * 100).toFixed(1)
    : 0;

  // Vacinas próximas do vencimento (próximos 7 dias)
  const vacinasVencendo = vacinas.filter((v: any) => {
    if (!v.data_reforco) return false;
    const dataReforco = new Date(v.data_reforco);
    const diasRestantes = Math.ceil((dataReforco.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes >= 0 && diasRestantes <= 7;
  });

  // Produtos com estoque baixo
  const produtosEstoqueBaixo = produtos.filter((p: any) => 
    p.estoque_atual <= (p.estoque_minimo || 0)
  );

  // Agendamentos de hoje
  const agendamentosHoje = agendamentos.filter((a: any) => {
    const dataAgendamento = new Date(a.data);
    return format(dataAgendamento, 'yyyy-MM-dd') === format(hoje, 'yyyy-MM-dd');
  });

  // Dados para o Gráfico de Faturamento (Últimos 6 meses)
  const ultimos6Meses = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(hoje, 5 - i);
    return {
      mes: format(d, 'MMM', { locale: ptBR }),
      inicio: startOfMonth(d),
      fim: endOfMonth(d)
    };
  });

  const chartData = ultimos6Meses.map(periodo => {
    const fat = agendamentos
      .filter((a: any) => a.status === 'Concluído' && new Date(a.data) >= periodo.inicio && new Date(a.data) <= periodo.fim)
      .reduce((sum: number, a: any) => sum + (a.valor_total || 0), 0);
    
    return {
      name: periodo.mes,
      Faturamento: fat,
    };
  });

  const StatsCard = ({ title, value, icon: Icon, bgColor, subtitle, trend }: any) => (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">
              {value}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${bgColor} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${bgColor.replace('bg-', 'text-')}`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center mt-3 text-xs">
            <span className={`flex items-center font-bold ${parseFloat(trend) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${parseFloat(trend) < 0 ? 'rotate-180' : ''}`} />
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-slate-400 ml-1.5 font-medium">vs mês anterior</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header com Ações Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Olá, <span className="text-blue-600">Bem-vindo!</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Aqui está o resumo da sua clínica para hoje, {format(hoje, "d 'de' MMMM", { locale: ptBR })}.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/agendamentos">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
            </Button>
          </Link>
          <Link href="/animais">
            <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 px-6">
              <PawPrint className="w-4 h-4 mr-2" /> Novo Paciente
            </Button>
          </Link>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Agenda', icon: Calendar, href: '/agendamentos', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pacientes', icon: PawPrint, href: '/animais', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Clientes', icon: Users, href: '/clientes', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Financeiro', icon: DollarSign, href: '/financeiro', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Estoque', icon: Package, href: '/produtos', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Vacinas', icon: Syringe, href: '/vacinas', color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map((shortcut, i) => (
          <Link key={i} href={shortcut.href}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                <div className={`p-3 rounded-2xl ${shortcut.bg} group-hover:scale-110 transition-transform`}>
                  <shortcut.icon className={`w-6 h-6 ${shortcut.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-600">{shortcut.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Faturamento (Mês)" 
          value={`R$ ${faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          bgColor="bg-emerald-500"
          trend={crescimento}
        />
        <StatsCard 
          title="Agendamentos Hoje" 
          value={agendamentosHoje.length}
          icon={Calendar}
          bgColor="bg-blue-600"
          subtitle={`${agendamentosMes.length} este mês`}
        />
        <StatsCard 
          title="Novos Pacientes" 
          value={animais.length}
          icon={PawPrint}
          bgColor="bg-indigo-500"
          subtitle="Base total de pacientes"
        />
        <StatsCard 
          title="Lucro Líquido" 
          value={`R$ ${lucroMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          bgColor={lucroMes >= 0 ? "bg-cyan-500" : "bg-rose-500"}
          subtitle={`Despesas: R$ ${despesasMes.toFixed(2)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Desempenho */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Desempenho de Vendas
              </CardTitle>
              <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-md px-2 py-1 outline-none">
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Faturamento']}
                />
                <Area type="monotone" dataKey="Faturamento" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Próximos do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {agendamentosHoje.length > 0 ? (
                agendamentosHoje.slice(0, 5).map((agendamento: any) => {
                  const animal = animais.find((a: any) => a.id === agendamento.animal_id);
                  return (
                    <div key={agendamento.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {agendamento.horario}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{animal?.nome || 'Paciente'}</p>
                          <p className="text-xs text-slate-500 font-medium">{agendamento.servicos?.[0] || 'Consulta'}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center">
                  <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">Sem agendamentos para hoje</p>
                </div>
              )}
            </div>
            {agendamentosHoje.length > 5 && (
              <div className="p-4 text-center border-t border-slate-50">
                <Link href="/agendamentos" className="text-xs font-bold text-blue-600 hover:underline">
                  Ver todos os {agendamentosHoje.length} agendamentos
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alertas de Vacinas */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-amber-500" />
              Alertas de Vacina
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {vacinasVencendo.length > 0 ? (
              <div className="space-y-3">
                {vacinasVencendo.slice(0, 3).map((vacina: any) => {
                  const animal = animais.find((a: any) => a.id === vacina.animal_id);
                  return (
                    <div key={vacina.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="text-sm font-bold text-amber-900">{animal?.nome}</p>
                          <p className="text-xs text-amber-700 font-medium">{vacina.vacina}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-100">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Tudo em dia!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Estoque */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-rose-500" />
              Reposição de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {produtosEstoqueBaixo.length > 0 ? (
              <div className="space-y-3">
                {produtosEstoqueBaixo.slice(0, 3).map((produto: any) => (
                  <div key={produto.id} className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <div>
                        <p className="text-sm font-bold text-rose-900">{produto.nome}</p>
                        <p className="text-xs text-rose-700 font-medium">{produto.estoque_atual} un. em estoque</p>
                      </div>
                    </div>
                    <Link href="/produtos">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-100">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Estoque abastecido</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Vencimentos */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-500" />
              Próximos Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {despesas.filter((d: any) => !d.pago).length > 0 ? (
              <div className="space-y-3">
                {despesas.filter((d: any) => !d.pago).slice(0, 3).map((despesa: any) => (
                  <div key={despesa.id} className="p-3 bg-rose-50/30 rounded-xl border border-rose-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-rose-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{despesa.descricao}</p>
                        <p className="text-xs text-rose-600 font-bold">R$ {despesa.valor.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(despesa.data), 'dd/MM')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Nenhuma conta pendente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro Rápido */}
        <Card className="border-0 shadow-sm bg-slate-900 text-white">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400 font-medium">
                <span>Receitas</span>
                <span className="text-emerald-400">R$ {faturamentoMes.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400 font-medium">
                <span>Despesas</span>
                <span className="text-rose-400">R$ {despesasMes.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full" style={{ width: `${Math.min((despesasMes / faturamentoMes) * 100, 100) || 0}%` }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Saldo Previsto</p>
                  <p className="text-2xl font-bold text-white mt-1">R$ {lucroMes.toFixed(2)}</p>
                </div>
                <Link href="/financeiro">
                  <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold text-xs px-4">
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
