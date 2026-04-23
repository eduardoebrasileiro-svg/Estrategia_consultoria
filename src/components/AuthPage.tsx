import React, { useState } from 'react';
import { motion } from 'motion/react';
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
import { Wallet2, Gavel, User, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (type: 'login' | 'register', role: 'user' | 'admin' = 'user') => {
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
          role,
          cpf,
          createdAt: serverTimestamp(),
        });
        
        if (role === 'admin') {
          // In a real app, this would be a separate privileged action
          await setDoc(doc(db, 'admins', userCred.user.uid), {
            active: true,
            assignedAt: serverTimestamp(),
          });
        }
        
        toast.success(`Conta de ${role === 'admin' ? 'Administrador' : 'Usuário'} criada!`);
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
      await signInWithPopup(auth, provider);
      toast.success('Login com Google realizado');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl items-center justify-center text-primary mb-4">
          <Wallet2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Finanz</h1>
        <p className="text-muted-foreground">Gestão financeira pessoal e administrativa</p>
      </motion.div>

      <Card className="w-full max-w-md border border-border bg-card">
        <Tabs defaultValue="login">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 border border-border mb-4">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Cadastro
              </TabsTrigger>
            </TabsList>
            <CardTitle className="text-2xl font-bold text-white text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">Acesse sua conta para continuar</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="exemplo@email.com" 
                className="bg-background border-border"
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
                className="bg-background border-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <TabsContent value="login" className="m-0 space-y-4">
              <Button 
                className="w-full h-11 bg-white text-black hover:bg-white/90 font-bold"
                onClick={() => handleEmailAuth('login')}
                disabled={loading}
              >
                Entrar
              </Button>
            </TabsContent>

            <TabsContent value="register" className="m-0 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (Apenas números)</Label>
                <Input 
                  id="cpf" 
                  type="text" 
                  maxLength={11}
                  placeholder="000.000.000-00" 
                  className="bg-background border-border"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-4 gap-2 border-border hover:bg-secondary/50 group"
                  onClick={() => handleEmailAuth('register', 'user')}
                  disabled={loading}
                >
                  <User className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                  <div className="text-xs font-semibold">Conta Usuário</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-4 gap-2 border-border hover:bg-secondary/50 group"
                  onClick={() => handleEmailAuth('register', 'admin')}
                  disabled={loading}
                >
                  <Gavel className="w-6 h-6 text-muted-foreground group-hover:text-emerald-400" />
                  <div className="text-xs font-semibold">Conta Admin</div>
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest leading-relaxed">
                Escolha o tipo de acesso desejado para o seu cadastro inicial
              </p>
            </TabsContent>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 border-border hover:bg-secondary/50"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
