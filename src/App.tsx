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
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import UserLinkManager from './components/UserLinkManager';
import InstructionBox from './components/InstructionBox';
import GoalBoard from './components/GoalBoard';
import { useAuth } from './context/AuthContext';
import { auth, db, handleFirestoreError } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PlusCircle, 
  Wallet2, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Search,
  Users as UsersIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function App() {
  const { user, profile, isAdmin, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txs);
    });

    return () => unsubscribe();
  }, [user]);

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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => 
      tx.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [transactions, searchFilter]);

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        ...data,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, 'create', `users/${user.uid}/transactions`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
    } catch (e) {
      handleFirestoreError(e, 'delete', `users/${user.uid}/transactions/${id}`);
    }
  };

  if (loading) return null;
  if (!user) return <AuthPage />;

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
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-semibold tracking-tight text-white leading-none">Finanz</h1>
                {isAdmin ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0 text-[9px] uppercase tracking-tighter">
                    <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 py-0 text-[9px] uppercase tracking-tighter">
                    <UserIcon className="w-2.5 h-2.5 mr-1" /> User
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Controle Financeiro</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:block text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] block leading-none mb-1">Saldo Atual</span>
                <span className={`text-2xl font-mono font-bold tracking-tight ${summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
             </div>
             
             <div className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {profile?.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
               </div>
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => auth.signOut()}
                className="text-muted-foreground hover:text-white"
               >
                 <LogOut className="w-5 h-5" />
               </Button>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-6xl">
        <UserLinkManager />
        <Tabs defaultValue="dashboard" className="w-full space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <TabsList className="bg-secondary/50 border border-border p-1 rounded-xl h-auto self-start">
              <TabsTrigger value="dashboard" className="rounded-lg py-2.5 px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <LayoutDashboard className="w-4 h-4" />
                Resumo
              </TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-lg py-2.5 px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <ReceiptText className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="rounded-lg py-2.5 px-5 flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <UsersIcon className="w-4 h-4" />
                  Gerenciar Clientes
                </TabsTrigger>
              )}
              <TabsTrigger value="add" className="rounded-lg py-2.5 px-5 flex items-center gap-2 md:hidden">
                <PlusCircle className="w-4 h-4" />
                Novo
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar lançamentos..." 
                className="pl-9 bg-secondary/30 border-border h-10 text-sm"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Sidebar Section */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <TransactionForm onAdd={handleAddTransaction} />
              </motion.div>
              
              {!isAdmin && <InstructionBox />}
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

                {!isAdmin && <GoalBoard />}
                
                <div className="lg:hidden">
                   <h3 className="text-lg font-medium text-white mb-6">Últimos Lançamentos</h3>
                   <TransactionList 
                      transactions={filteredTransactions.slice(0, 5)} 
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
                      transactions={filteredTransactions} 
                      onDelete={handleDeleteTransaction} 
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="m-0 focus-visible:outline-none">
                   <AdminPanel />
                </TabsContent>
              )}

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

      <footer className="mt-auto py-8 border-t border-border bg-background">
         <div className="container mx-auto px-6 flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
               {isAdmin ? 'Modo Administrativo Ativado' : 'Painel de Usuário Conectado'}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  Sincronizado
               </div>
               <span>{user.email}</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
