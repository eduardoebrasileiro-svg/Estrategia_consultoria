import { Summary, Transaction } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

interface DashboardProps {
  summary: Summary;
  transactions: Transaction[];
}

export default function Dashboard({ summary, transactions }: DashboardProps) {
  // Prepare data for category chart (Expenses only)
  const expenseCategories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));

  // Prepare data for monthly chart
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return formatMonth(d);
  }).reverse();

  function formatMonth(d: Date) {
    return d.toLocaleString('pt-BR', { month: 'short' });
  }

  const barData = last6Months.map(month => {
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return formatMonth(tDate) === month;
    });

    return {
      name: month,
      receitas: monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      despesas: monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });

  const COLORS = ['#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#06b6d4', '#06b6d4', '#3b82f6'];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border bg-card shadow-sm hover:border-border/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Entradas</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
               <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm hover:border-border/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Saídas</CardTitle>
            <div className="p-2 bg-rose-500/10 rounded-lg">
               <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm hover:border-border/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Economia do Mês</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
               <BarChartIcon className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-white tracking-tight">
                {summary.income > 0 ? `${Math.round(((summary.income - summary.expenses) / summary.income) * 100)}%` : '0%'}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-border bg-card/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-emerald-500" />
              Entradas vs Saídas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717A' }} 
                />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ 
                    backgroundColor: '#18181B', 
                    borderRadius: '12px', 
                    border: '1px solid #27272A', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    color: '#E4E4E7'
                  }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                />
                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                Nenhuma despesa para exibir.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#18181B', 
                        borderRadius: '12px', 
                        border: '1px solid #27272A', 
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                        color: '#E4E4E7'
                      }}
                    formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
