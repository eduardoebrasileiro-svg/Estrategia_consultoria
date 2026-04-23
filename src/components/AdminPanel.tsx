import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError } from '@/src/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Target, 
  ArrowRight,
  ChevronRight,
  User as UserIcon,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { LinkedUser } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const { user } = useAuth();
  const [cpfSearch, setCpfSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<LinkedUser | null>(null);
  
  // Goals/Instructions Form State
  const [newInstruction, setNewInstruction] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');

  const [selectedUserTxs, setSelectedUserTxs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Listen for users linked to this admin
    const q = query(collection(db, 'users'), where('adminId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as LinkedUser[];
      setLinkedUsers(users);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserTxs([]);
      return;
    }

    const q = query(collection(db, 'users', selectedUser.uid, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSelectedUserTxs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const selectedUserSummary = useMemo(() => {
    return selectedUserTxs.reduce((acc, tx) => {
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expenses += tx.amount;
      return acc;
    }, { income: 0, expenses: 0 });
  }, [selectedUserTxs]);

  const handleCpfSearch = async () => {
    if (cpfSearch.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    setSearching(true);
    try {
      const q = query(collection(db, 'users'), where('cpf', '==', cpfSearch), where('role', '==', 'user'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.error('Gasto usuário não encontrado com este CPF');
      } else {
        const foundUser = snapshot.docs[0].data() as LinkedUser;
        foundUser.uid = snapshot.docs[0].id;
        
        if (foundUser.adminId) {
          toast.info('Este usuário já possui um administrador vinculado.');
          return;
        }

        // Send Link Request
        await addDoc(collection(db, 'linkRequests'), {
          adminId: user?.uid,
          adminEmail: user?.email,
          userId: foundUser.uid,
          userCpf: foundUser.cpf,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        
        toast.success('Solicitação de vínculo enviada ao usuário!');
        setCpfSearch('');
      }
    } catch (e) {
      handleFirestoreError(e, 'list', 'users');
    } finally {
      setSearching(false);
    }
  };

  const sendGoal = async () => {
    if (!selectedUser || !goalTitle || !goalAmount) return;
    
    try {
      await addDoc(collection(db, 'users', selectedUser.uid, 'goals'), {
        title: goalTitle,
        targetAmount: parseFloat(goalAmount),
        currentAmount: 0,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Objetivo enviado!');
      setGoalTitle('');
      setGoalAmount('');
    } catch (e) {
      toast.error('Erro ao enviar objetivo');
    }
  };

  const sendInstruction = async () => {
    if (!selectedUser || !newInstruction) return;
    
    try {
      await addDoc(collection(db, 'users', selectedUser.uid, 'instructions'), {
        content: newInstruction,
        sentAt: serverTimestamp(),
        read: false
      });
      toast.success('Instrução enviada!');
      setNewInstruction('');
    } catch (e) {
      toast.error('Erro ao enviar instrução');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: User List & Search */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Vincular Usuário
            </CardTitle>
            <CardDescription>Busque usuários pelo CPF para gestão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CPF do Usuário</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="00000000000" 
                  maxLength={11}
                  className="bg-background border-border"
                  value={cpfSearch}
                  onChange={(e) => setCpfSearch(e.target.value.replace(/\D/g, ''))}
                />
                <Button 
                  size="icon" 
                  onClick={handleCpfSearch} 
                  disabled={searching}
                  className="bg-primary hover:bg-primary/90 min-w-10"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Usuários Vinculados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {linkedUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                Nenhum usuário vinculado ainda.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {linkedUsers.map(u => (
                  <button
                    key={u.uid}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors text-left ${selectedUser?.uid === u.uid ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.email}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{u.cpf}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Area: User Insights & Management */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key={selectedUser.uid}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Gestão de {selectedUser.email}</h2>
                    <p className="text-muted-foreground text-sm">Visualize métricas e envie orientações.</p>
                 </div>
                 <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Ativo
                 </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receita Total do Usuário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-emerald-400">
                      {selectedUserSummary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Despesa Total do Usuário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-rose-400">
                      {selectedUserSummary.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instructions Card */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-blue-400" />
                       Enviar Instrução
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">Mensagem</Label>
                       <Input 
                          placeholder="Ex: Tente economizar no lazer este mês..."
                          className="bg-background border-border"
                          value={newInstruction}
                          onChange={(e) => setNewInstruction(e.target.value)}
                       />
                    </div>
                    <Button onClick={sendInstruction} className="w-full bg-blue-600 hover:bg-blue-500">
                       <Send className="w-4 h-4 mr-2" /> Enviar Mensagem
                    </Button>
                  </CardContent>
                </Card>

                {/* Goals Card */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                       <Target className="w-4 h-4 text-emerald-400" />
                       Definir Objetivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground">Título</Label>
                         <Input 
                            placeholder="Ex: Fundo de Emergência"
                            className="bg-background border-border"
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                         />
                      </div>
                      <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground">Valor Alvo (R$)</Label>
                         <Input 
                            type="number"
                            placeholder="1000.00"
                            className="bg-background border-border"
                            value={goalAmount}
                            onChange={(e) => setGoalAmount(e.target.value)}
                         />
                      </div>
                    </div>
                    <Button onClick={sendGoal} className="w-full bg-emerald-600 hover:bg-emerald-500">
                       <Target className="w-4 h-4 mr-2" /> Criar Lançamento
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="p-8 border border-dashed border-border rounded-2xl text-center">
                 <p className="text-muted-foreground text-sm">Dashboard de indicadores do usuário em breve...</p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Nenhum Usuário Selecionado</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Selecione um usuário na lista ao lado para gerenciar suas metas e instruções.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
