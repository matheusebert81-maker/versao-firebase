import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Package,
  Users,
  PieChart as PieChartIcon,
  BarChart3
} from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, startOfYear, format, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import db from "@/lib/db";

import AccountsPayableReceivable from "@/components/financeiro/AccountsPayableReceivable";
import CashFlowProjection from "@/components/financeiro/CashFlowProjection";

const ProductProfitability = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader><CardTitle>Rentabilidade por Produto</CardTitle></CardHeader>
    <CardContent><p className="text-slate-500 italic">Análise de margem de contribuição por item de estoque.</p></CardContent>
  </Card>
);

const ServiceProfitability = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader><CardTitle>Rentabilidade por Serviço</CardTitle></CardHeader>
    <CardContent><p className="text-slate-500 italic">Análise de lucro por tipo de procedimento clínico.</p></CardContent>
  </Card>
);

const FinancialPeriodAnalysis = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card className="bg-white border-0 shadow-sm p-4">
      <p className="text-xs font-bold text-slate-400 uppercase">Ticket Médio</p>
      <p className="text-xl font-bold text-slate-900 mt-1">R$ 185,40</p>
    </Card>
    <Card className="bg-white border-0 shadow-sm p-4">
      <p className="text-xs font-bold text-slate-400 uppercase">Margem Bruta</p>
      <p className="text-xl font-bold text-slate-900 mt-1">64%</p>
    </Card>
    <Card className="bg-white border-0 shadow-sm p-4">
      <p className="text-xs font-bold text-slate-400 uppercase">Inadimplência</p>
      <p className="text-xl font-bold text-rose-600 mt-1">2.4%</p>
    </Card>
    <Card className="bg-white border-0 shadow-sm p-4">
      <p className="text-xs font-bold text-slate-400 uppercase">ROI Marketing</p>
      <p className="text-xl font-bold text-emerald-600 mt-1">3.8x</p>
    </Card>
  </div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Financeiro() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const { data: agendamentos = [] } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: () => db.entities.Agendamento.list(),
    initialData: [],
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas'],
    queryFn: () => db.entities.Despesa.list('-data'),
    initialData: [],
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ['vendas'],
    queryFn: () => db.entities.Venda.list('-data_venda'),
    initialData: [],
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => db.entities.Produto.list(),
    initialData: [],
  });

  const { data: profissionais = [] } = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => db.entities.Profissional.list(),
    initialData: [],
  });

  // Cálculos de períodos
  const hoje = new Date();
  const inicioMesAtual = startOfMonth(hoje);
  const fimMesAtual = endOfMonth(hoje);
  const inicioMesPassado = startOfMonth(subMonths(hoje, 1));
  const fimMesPassado = endOfMonth(subMonths(hoje, 1));
  const inicioMesAnoPassado = startOfMonth(subMonths(hoje, 12));
  const fimMesAnoPassado = endOfMonth(subMonths(hoje, 12));
  const inicioAno = startOfYear(hoje);

  // Receitas por período
  const calcularReceita = (inicio: Date, fim: Date) => {
    const agendamentosPeriodo = agendamentos.filter((a: any) => {
      const data = new Date(a.data);
      return data >= inicio && data <= fim && a.status === 'Concluído';
    });
    
    const vendasPeriodo = vendas.filter((v: any) => {
      const data = new Date(v.data_venda);
      return data >= inicio && data <= fim;
    });

    const receitaServicos = agendamentosPeriodo.reduce((sum: number, a: any) => sum + (a.valor_total || 0), 0);
    const receitaProdutos = vendasPeriodo.reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0);

    return { receitaServicos, receitaProdutos, total: receitaServicos + receitaProdutos };
  };

  // Despesas por período
  const calcularDespesas = (inicio: Date, fim: Date) => {
    return despesas
      .filter((d: any) => {
        const data = new Date(d.data);
        return data >= inicio && data <= fim;
      })
      .reduce((sum: number, d: any) => sum + (d.valor || 0), 0);
  };

  const receitaMesAtual = calcularReceita(inicioMesAtual, fimMesAtual);
  const receitaMesPassado = calcularReceita(inicioMesPassado, fimMesPassado);
  const receitaMesAnoPassado = calcularReceita(inicioMesAnoPassado, fimMesAnoPassado);

  const despesasMesAtual = calcularDespesas(inicioMesAtual, fimMesAtual);
  const despesasMesPassado = calcularDespesas(inicioMesPassado, fimMesPassado);
  const despesasMesAnoPassado = calcularDespesas(inicioMesAnoPassado, fimMesAnoPassado);

  const lucroMesAtual = receitaMesAtual.total - despesasMesAtual;
  const lucroMesPassado = receitaMesPassado.total - despesasMesPassado;
  const lucroMesAnoPassado = receitaMesAnoPassado.total - despesasMesAnoPassado;

  // Crescimento percentual vs Mês Passado
  const crescimentoReceita = receitaMesPassado.total > 0
    ? ((receitaMesAtual.total - receitaMesPassado.total) / receitaMesPassado.total * 100).toFixed(1)
    : 0;

  const crescimentoDespesas = despesasMesPassado > 0
    ? ((despesasMesAtual - despesasMesPassado) / despesasMesPassado * 100).toFixed(1)
    : 0;

  const crescimentoLucro = lucroMesPassado !== 0
    ? ((lucroMesAtual - lucroMesPassado) / Math.abs(lucroMesPassado) * 100).toFixed(1)
    : 0;

  // Crescimento vs Ano Passado
  const crescimentoReceitaAno = receitaMesAnoPassado.total > 0
    ? ((receitaMesAtual.total - receitaMesAnoPassado.total) / receitaMesAnoPassado.total * 100).toFixed(1)
    : 0;

  // Dados para Gráfico de Receitas e Despesas (Últimos 6 meses)
  const ultimos6Meses = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(hoje, 5 - i);
    return {
      mes: format(d, 'MMM', { locale: ptBR }),
      ano: format(d, 'yyyy'),
      inicio: startOfMonth(d),
      fim: endOfMonth(d)
    };
  });

  const chartData = ultimos6Meses.map(periodo => {
    const rec = calcularReceita(periodo.inicio, periodo.fim).total;
    const desp = calcularDespesas(periodo.inicio, periodo.fim);
    return {
      name: periodo.mes,
      Receita: rec,
      Despesas: desp,
      Lucro: rec - desp
    };
  });

  // Dados para Gráfico de Despesas por Categoria (Mês Atual)
  const despesasMesAtualList = despesas.filter((d: any) => {
    const data = new Date(d.data);
    return data >= inicioMesAtual && data <= fimMesAtual;
  });

  const despesasPorCategoria = despesasMesAtualList.reduce((acc: any, curr: any) => {
    const cat = curr.categoria || 'Outros';
    acc[cat] = (acc[cat] || 0) + (curr.valor || 0);
    return acc;
  }, {});

  const pieData = Object.keys(despesasPorCategoria).map(key => ({
    name: key,
    value: despesasPorCategoria[key]
  })).sort((a, b) => b.value - a.value);

  const MetricCard = ({ title, value, subtitle, trend, trendYear, icon: Icon, color }: any) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>
              R$ {value.toFixed(2)}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
            
            <div className="mt-4 space-y-1">
              {trend !== undefined && (
                <div className="flex items-center">
                  {parseFloat(trend) >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${parseFloat(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">vs mês anterior</span>
                </div>
              )}
              
              {trendYear !== undefined && (
                <div className="flex items-center">
                  {parseFloat(trendYear) >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${parseFloat(trendYear) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trendYear > 0 ? '+' : ''}{trendYear}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">vs ano anterior</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-600 mt-2">
            Relatórios e análises financeiras • {format(hoje, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={receitaMesAtual.total}
            subtitle={`Serviços: R$ ${receitaMesAtual.receitaServicos.toFixed(2)} | Produtos: R$ ${receitaMesAtual.receitaProdutos.toFixed(2)}`}
            trend={crescimentoReceita}
            trendYear={crescimentoReceitaAno}
            icon={DollarSign}
            color="text-green-600"
          />
          <MetricCard
            title="Despesas Total"
            value={despesasMesAtual}
            trend={crescimentoDespesas}
            icon={TrendingDown}
            color="text-red-600"
          />
          <MetricCard
            title="Lucro Líquido"
            value={lucroMesAtual}
            trend={crescimentoLucro}
            icon={TrendingUp}
            color={lucroMesAtual >= 0 ? "text-blue-600" : "text-red-600"}
          />
        </div>

        {/* Tabs para diferentes visualizações */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white shadow-md rounded-xl p-1 overflow-x-auto">
            <TabsTrigger value="overview" className="rounded-lg">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="rounded-lg">
              Fluxo de Caixa
            </TabsTrigger>
            <TabsTrigger value="accounts" className="rounded-lg">
              Contas
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg">
              Serviços
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg">
              Despesas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinancialPeriodAnalysis />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-white">
                  <CardTitle className="text-lg text-slate-800 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Receitas vs Despesas (6 meses)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `R$${value}`} />
                      <Tooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, '']}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-white">
                  <CardTitle className="text-lg text-slate-800 flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-purple-600" />
                    Despesas por Categoria (Mês Atual)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-80 flex flex-col items-center justify-center">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, '']}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-500">Nenhuma despesa registrada neste mês.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowProjection />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountsPayableReceivable />
          </TabsContent>

          <TabsContent value="services">
            <ServiceProfitability />
          </TabsContent>

          <TabsContent value="products">
            <ProductProfitability />
          </TabsContent>

          <TabsContent value="expenses">
            <div className="p-8 text-center text-slate-500">
              <p>Detalhamento de despesas em desenvolvimento.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
