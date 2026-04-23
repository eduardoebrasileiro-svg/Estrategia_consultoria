import React, { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/src/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy, Clock } from 'lucide-react';
import { Goal } from '@/src/types';
import { motion } from 'motion/react';

export default function GoalBoard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'goals'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Goal[]);
    });

    return () => unsubscribe();
  }, [user]);

  if (goals.length === 0) return null;

  return (
    <div className="space-y-6">
       <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-500" />
          Seus Objetivos
       </h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <Card key={goal.id} className="border-border bg-card overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white tracking-tight">{goal.title}</h4>
                      <p className="text-xs text-muted-foreground">Meta: {goal.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    {progress === 100 ? <Trophy className="w-5 h-5 text-yellow-500" /> : <Clock className="w-5 h-5 text-emerald-500/50" />}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                      <span>Progresso</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-emerald-500"
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
       </div>
    </div>
  );
}
