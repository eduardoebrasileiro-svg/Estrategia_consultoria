/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Transaction, Summary } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, ReceiptText, PlusCircle, Wallet2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finanz_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('finanz_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const summary = useMemo<Summary>(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') {
          acc.income += tx.amount;
          acc.balance += tx.amount;
        } else {
          acc.expenses += tx.amount;
          acc.balance -= tx.amount;
        }
        return acc;
      },
      { balance: 0, income: 0, expenses: 0 }
    );
  }, [transactions]);

  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Toaster position="top-center" expand={false} richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm shadow-primary/5">
              <Wallet2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white leading-none mb-1">Gestão Financeira</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Finanz App</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
             <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] block leading-none mb-1">Saldo Atual</span>
                <span className={`text-2xl font-mono font-bold tracking-tight ${summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
             </div>
             <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold text-muted-foreground">
                JD
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-6xl">
        <Tabs defaultValue="dashboard" className="w-full space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <TabsList className="bg-secondary/50 border border-border p-1 rounded-xl h-auto self-start">
              <TabsTrigger value="dashboard" className="rounded-lg py-2.5 px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <LayoutDashboard className="w-4 h-4" />
                Resumo
              </TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-lg py-2.5 px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <ReceiptText className="w-4 h-4" />
                Lançamentos
              </TabsTrigger>
              <TabsTrigger value="add" className="rounded-lg py-2.5 px-5 flex items-center gap-2 md:hidden">
                <PlusCircle className="w-4 h-4" />
                Novo
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Sidebar Form */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <TransactionForm onAdd={handleAddTransaction} />
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-10">
              <TabsContent value="dashboard" className="m-0 space-y-10 focus-visible:outline-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Dashboard summary={summary} transactions={transactions} />
                  </motion.div>
                </AnimatePresence>
                
                <div className="lg:hidden">
                   <h3 className="text-lg font-medium text-white mb-6">Últimos Lançamentos</h3>
                   <TransactionList 
                      transactions={transactions.slice(0, 5)} 
                      onDelete={handleDeleteTransaction} 
                   />
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="m-0 focus-visible:outline-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <TransactionList 
                      transactions={transactions} 
                      onDelete={handleDeleteTransaction} 
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="add" className="m-0 lg:hidden focus-visible:outline-none">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                 >
                   <TransactionForm onAdd={handleAddTransaction} />
                 </motion.div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border bg-background">
         <div className="container mx-auto px-6 flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
               Sincronizado &bull; Cloud Storage
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  Online
               </div>
               <span>v1.2.4</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
