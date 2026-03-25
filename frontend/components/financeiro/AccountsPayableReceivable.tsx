import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import db from "@/lib/db";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AccountsPayableReceivable() {
  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas'],
    queryFn: () => db.entities.Despesa.list('-data'),
  });

  const { data: agendamentos = [] } = useQuery({
    queryKey: ['agendamentos'],
    queryFn: () => db.entities.Agendamento.list('-data'),
  });

  const pendingReceivables = agendamentos.filter((a: any) => a.status === 'Pendente' || a.status === 'Em Aberto');
  const pendingPayables = despesas.filter((d: any) => !d.pago);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-emerald-50/50 border-b">
          <CardTitle className="text-emerald-800 flex justify-between items-center">
            Contas a Receber
            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
              R$ {pendingReceivables.reduce((sum, a) => sum + (a.valor_total || 0), 0).toFixed(2)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReceivables.length > 0 ? (
                pendingReceivables.slice(0, 5).map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs">{format(new Date(a.data), "dd/MM/yy")}</TableCell>
                    <TableCell className="font-medium text-xs truncate max-w-[120px]">{a.cliente_nome || 'Cliente'}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">R$ {(a.valor_total || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-400 italic">Nenhum recebível pendente</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-rose-50/50 border-b">
          <CardTitle className="text-rose-800 flex justify-between items-center">
            Contas a Pagar
            <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">
              R$ {pendingPayables.reduce((sum, d) => sum + (d.valor || 0), 0).toFixed(2)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayables.length > 0 ? (
                pendingPayables.slice(0, 5).map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs">{format(new Date(d.data), "dd/MM/yy")}</TableCell>
                    <TableCell className="font-medium text-xs truncate max-w-[120px]">{d.descricao}</TableCell>
                    <TableCell className="text-right font-bold text-rose-600">R$ {(d.valor || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-400 italic">Nenhuma conta a pagar pendente</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
