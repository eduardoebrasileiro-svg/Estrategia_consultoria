import { Transaction } from '@/src/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="border border-border shadow-sm bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
        <CardTitle className="text-lg font-medium text-white">Lançamentos Recentes</CardTitle>
        <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider font-semibold">
           {transactions.length} total
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/20">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[10px] uppercase tracking-widest font-bold py-4 px-6">Data</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Descrição</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Categoria</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold py-4 px-6">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground/60 italic text-sm">
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((tx) => (
                  <TableRow key={tx.id} className="group hover:bg-muted/10 border-border/10 transition-colors">
                    <TableCell className="text-[11px] text-muted-foreground py-4 px-6 whitespace-nowrap">
                      {format(new Date(tx.date + 'T12:00:00'), 'dd MMM, yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-white tracking-tight">{tx.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-[11px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30">
                        {tx.category}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right py-4 px-6 whitespace-nowrap`}>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold font-mono tracking-tight ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(tx.id)}
                          className="h-6 w-6 text-muted-foreground/0 group-hover:text-rose-500 group-hover:bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
