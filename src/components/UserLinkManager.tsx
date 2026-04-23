import React, { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { useAuth } from '@/src/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function UserLinkManager() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user || profile?.role !== 'user') return;

    const q = query(
      collection(db, 'linkRequests'), 
      where('userId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleLinkAccept = async (request: any) => {
    try {
      // 1. Update User profile with adminId
      await updateDoc(doc(db, 'users', user!.uid), {
        adminId: request.adminId
      });

      // 2. Clear the request
      await deleteDoc(doc(db, 'linkRequests', request.id));
      
      toast.success('Administrador vinculado com sucesso!');
    } catch (e) {
      toast.error('Erro ao aceitar vínculo');
    }
  };

  const handleLinkDecline = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'linkRequests', requestId));
      toast.info('Solicitação recusada');
    } catch (e) {
      toast.error('Erro ao recusar');
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="space-y-4 mb-10">
      <AnimatePresence>
        {requests.map(req => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">Solicitação de Vínculo</h4>
                    <p className="text-xs text-muted-foreground">O administrador <span className="text-emerald-400 font-medium">{req.adminEmail}</span> deseja gerenciar sua conta.</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                    onClick={() => handleLinkDecline(req.id)}
                  >
                    <X className="w-4 h-4 mr-1" /> Recusar
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => handleLinkAccept(req)}
                  >
                    <Check className="w-4 h-4 mr-1" /> Aceitar Vínculo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
