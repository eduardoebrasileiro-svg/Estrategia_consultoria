import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet2, Gavel, User, LogIn, UserPlus, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [step, setStep] = useState<0 | 1>(0);
  const [authRole, setAuthRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (type: 'login' | 'register') => {
    if (!email || !password || (type === 'register' && !cpf)) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (type === 'register' && cpf.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }
    
    setLoading(true);
    try {
      if (type === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          email,
          role: authRole,
          cpf,
          createdAt: serverTimestamp(),
        });
        
        if (authRole === 'admin') {
          await setDoc(doc(db, 'admins', userCred.user.uid), {
            active: true,
            assignedAt: serverTimestamp(),
          });
        }
        
        toast.success(`Conta de ${authRole === 'admin' ? 'Administrador' : 'Usuário'} criada!`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Login realizado com sucesso');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // For Google login, we need to ensure the profile is initialized if it doesn't exist
      // The AuthContext already handles profile initialization, but we could add role check here if needed.
      toast.success('Obrigado! Entrando com Google...');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const selectRole = (role: 'user' | 'admin') => {
    setAuthRole(role);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl items-center justify-center text-primary mb-4 shadow-xl shadow-primary/5">
          <Wallet2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Finanz</h1>
        <p className="text-muted-foreground font-medium tracking-wide">Gestão Inteligente & Auditoria</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full max-w-md space-y-6"
          >
            <Card className="border-border bg-[#18181B] shadow-2xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-white">Como deseja acessar?</CardTitle>
                <CardDescription>Selecione seu perfil para continuar</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 pt-6">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-between h-24 px-6 border-border hover:bg-primary/5 hover:border-primary/50 group transition-all"
                  onClick={() => selectRole('user')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Usuário Pessoal</p>
                      <p className="text-xs text-muted-foreground">Controle suas finanças diárias</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>

                <Button 
                  variant="outline" 
                  className="flex items-center justify-between h-24 px-6 border-border hover:bg-emerald-500/5 hover:border-emerald-500/50 group transition-all"
                  onClick={() => selectRole('admin')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Gavel className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Administrador</p>
                      <p className="text-xs text-muted-foreground">Finaças corporativas e auditoria</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <Card className="border-border bg-[#18181B] shadow-2xl overflow-hidden">
              <div className="bg-primary/10 px-6 py-3 flex items-center justify-between border-b border-border/50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep(0)}
                  className="text-muted-foreground hover:text-white -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Badge variant="outline" className="bg-background/50 text-[10px] uppercase tracking-widest font-bold">
                  {authRole === 'admin' ? 'Modo Admin' : 'Modo Usuário'}
                </Badge>
              </div>

              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent h-12 border-b border-border/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <CardHeader className="pt-6">
                  <CardTitle className="text-xl font-bold text-white">
                    {authRole === 'admin' ? 'Portal da Auditoria' : 'Meu Painel Pessoal'}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@contato.com" 
                        className="bg-[#0A0A0B] border-border h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-[#0A0A0B] border-border h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <TabsContent value="register" className="m-0 space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF (Apenas números)</Label>
                        <Input 
                          id="cpf" 
                          type="text" 
                          maxLength={11}
                          placeholder="000.000.000-00" 
                          className="bg-[#0A0A0B] border-border h-11"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </TabsContent>
                  </div>

                  <TabsContent value="login" className="m-0 pt-4">
                    <Button 
                      className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold text-lg rounded-xl shadow-lg"
                      onClick={() => handleEmailAuth('login')}
                      disabled={loading}
                    >
                      Acessar Painel
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="m-0 pt-4">
                    <Button 
                      className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-bold text-lg rounded-xl shadow-lg shadow-primary/20"
                      onClick={() => handleEmailAuth('register')}
                      disabled={loading}
                    >
                      Finalizar Cadastro
                    </Button>
                  </TabsContent>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                      <span className="bg-[#18181B] px-4 text-muted-foreground">Ou continue com</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-border hover:bg-secondary/20 rounded-xl"
                    onClick={signInWithGoogle}
                    disabled={loading}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                    </svg>
                    Autenticar com Google
                  </Button>
                </CardContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
