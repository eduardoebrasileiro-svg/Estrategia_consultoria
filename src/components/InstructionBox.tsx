import React, { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/src/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Clock, CheckCheck } from 'lucide-react';
import { Instruction } from '@/src/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InstructionBox() {
  const { user } = useAuth();
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'instructions'),
      orderBy('sentAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInstructions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Instruction[]);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', user!.uid, 'instructions', id), { read: true });
    } catch (e) {}
  };

  if (instructions.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white uppercase tracking-widest">
           <MessageSquare className="w-4 h-4 text-blue-400" />
           Orientações do Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] pr-2 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {instructions.map(inst => (
              <div 
                key={inst.id} 
                className={`p-3 rounded-xl border ${inst.read ? 'bg-secondary/20 border-border/10' : 'bg-blue-500/5 border-blue-500/20'} transition-all cursor-pointer`}
                onClick={() => !inst.read && markAsRead(inst.id)}
              >
                <p className="text-sm text-foreground/90 leading-relaxed mb-2">{inst.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {inst.sentAt?.toDate ? format(inst.sentAt.toDate(), "dd 'de' MMMM, HH:mm", { locale: ptBR }) : 'Recentemente'}
                  </span>
                  {inst.read && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
