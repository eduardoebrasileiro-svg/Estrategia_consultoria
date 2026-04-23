import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, TransactionType } from '@/src/types';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const INCOME_CATEGORIES = ['Salário', 'Investimentos', 'Presentes', 'Freelance', 'Outros'];
export const EXPENSE_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];

export default function TransactionForm({ onAdd }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    if (!category) {
      toast.error('Escolha uma categoria');
      return;
    }

    if (!description.trim()) {
      toast.error('Insira uma descrição');
      return;
    }

    onAdd({
      type,
      amount: numAmount,
      category,
      description,
      date,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    toast.success('Transação adicionada com sucesso!');
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card className="border border-border shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          {type === 'income' ? <PlusCircle className="text-emerald-400 w-5 h-5" /> : <MinusCircle className="text-rose-400 w-5 h-5" />}
          Nova Transação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Aluguel, Supermercado..."
              className="bg-background border-border h-11 focus-visible:ring-emerald-500/30"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-background border-border h-11 focus-visible:ring-emerald-500/30"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Data</Label>
              <Input
                id="date"
                type="date"
                className="bg-background border-border h-11 focus-visible:ring-emerald-500/30 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Tipo</Label>
              <Select value={type} onValueChange={(v) => { setType(v as TransactionType); setCategory(''); }}>
                <SelectTrigger id="type" className="bg-background border-border h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="bg-background border-border h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
             <Button 
                type="button" 
                onClick={() => setType('income')}
                className={`flex-1 h-12 font-semibold transition-all ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
             >
                Receita
             </Button>
             <Button 
                type="button" 
                onClick={() => setType('expense')}
                className={`flex-1 h-12 font-semibold transition-all ${type === 'expense' ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
             >
                Despesa
             </Button>
          </div>

          <Button type="submit" className="w-full h-11 font-bold mt-2 bg-white text-black hover:bg-white/90">
             Confirmar Lançamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
