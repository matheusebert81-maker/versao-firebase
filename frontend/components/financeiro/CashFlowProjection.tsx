import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import db from "@/lib/db";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CashFlowProjection() {
  const { data: agendamentos = [] } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: () => db.entities.Agendamento.list(),
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas'],
    queryFn: () => db.entities.Despesa.list(),
  });

  // Projection for next 15 days
  const projectionData = React.useMemo(() => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: 15 }).map((_, i) => addDays(today, i));
    
    let cumulativeBalance = 15000; // Mock initial balance

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      
      const dayIncome = agendamentos
        .filter((a: any) => format(new Date(a.data), 'yyyy-MM-dd') === dayStr)
        .reduce((sum, a) => sum + (a.valor_total || 0), 0);
        
      const dayExpense = despesas
        .filter((d: any) => format(new Date(d.data), 'yyyy-MM-dd') === dayStr)
        .reduce((sum, d) => sum + (d.valor || 0), 0);
        
      cumulativeBalance += (dayIncome - dayExpense);
      
      return {
        name: format(day, 'dd/MM'),
        Saldo: cumulativeBalance,
        Entradas: dayIncome,
        Saídas: dayExpense
      };
    });
  }, [agendamentos, despesas]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-white border-b">
        <CardTitle className="text-lg text-slate-800">Projeção de Fluxo de Caixa (Próximos 15 dias)</CardTitle>
      </CardHeader>
      <CardContent className="p-6 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `R$${val}`} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, '']}
            />
            <Legend iconType="circle" />
            <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
