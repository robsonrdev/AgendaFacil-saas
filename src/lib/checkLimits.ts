import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getPlanLimits } from '@/lib/plans';

export async function checkMonthlyLimit(userId: string) {
  // 1. Descobrir qual é o plano do usuário
  const userDoc = await getDoc(doc(db, "users", userId));
  
  // CORREÇÃO AQUI: Usa 'start' se o campo plan for undefined/null
  const userData = userDoc.exists() ? userDoc.data() : null;
  const planName = userData?.plan || 'start';

  const limits = getPlanLimits(planName);

  // Se for ilimitado, nem conta (retorna logo)
  if (limits.maxAppointments === Infinity) {
    return { isBlocked: false, current: 0, max: Infinity, plan: planName };
  }

  // 2. Contar agendamentos DESTE mês
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const q = query(
    collection(db, "appointments"),
    where("userId", "==", userId),
    where("date", ">=", start),
    where("date", "<=", end)
  );

  const snapshot = await getCountFromServer(q);
  const count = snapshot.data().count;

  // 3. Verificar se passou do limite
  const isBlocked = count >= limits.maxAppointments;

  return { 
    isBlocked, 
    current: count, 
    max: limits.maxAppointments, 
    plan: planName 
  };
}