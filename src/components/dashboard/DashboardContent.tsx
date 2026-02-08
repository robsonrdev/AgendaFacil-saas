'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar as CalendarIcon, CheckCircle2, Clock, XCircle, Plus, Loader2,
  DollarSign, Lock, Crown 
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


// === FIREBASE ===
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { startOfDay, endOfDay, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
interface Appointment {
  id: string;
  name: string;
  service: string;
  time: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  date: Date;
  price: number; 
}

const statusVariant = {
  confirmado: 'default',
  pendente: 'secondary',
  cancelado: 'destructive',
} as const;

export function DashboardContent() {
   const [businessName, setBusinessName] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
 
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // === NEW: PLAN STATE ===
  const [userPlan, setUserPlan] = useState('start'); 

  // KPI States
  const [kpiData, setKpiData] = useState({
    totalHoje: 0,
    confirmados: 0,
    pendentes: 0,
    cancelados: 0,
    faturamento: 0, 
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [proximoAgendamento, setProximoAgendamento] = useState<any>(null);
  const [ocupacaoDia, setOcupacaoDia] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && selectedDate) {
        // 1. Fetch User Plan
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserPlan(userDoc.data().plan || 'start');

                if (userData.businessName) {
                    setBusinessName(userData.businessName);
                }
            }
        } catch (error) {
            console.error("Error fetching user data", error);
        }

        // 2. Load Data
        await carregarDados(user.uid, selectedDate);
      }
    });
    return () => unsubscribe();
  }, [selectedDate]);

  const carregarDados = async (userId: string, date: Date) => {
    setLoading(true);
    try {
      const inicio = startOfDay(date);
      const fim = endOfDay(date);

      const q = query(
        collection(db, "appointments"),
        where("userId", "==", userId),
        where("date", ">=", inicio),
        where("date", "<=", fim),
        orderBy("date", "asc")
      );

      const snapshot = await getDocs(q);
      
      const lista: Appointment[] = [];
      const kpis = { totalHoje: 0, confirmados: 0, pendentes: 0, cancelados: 0, faturamento: 0 };
      const horasMap: Record<string, number> = {}; 

      let proximo: Appointment | null = null;
      const horaAtual = new Date();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const apptDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
        
        // Try to get price, otherwise assume 0
        // Agora ele tenta ler 'servicePrice' primeiro. Se não achar, tenta 'price' (garantia).
        const price = Number(data.servicePrice || data.price || 0);

        const appt: Appointment = {
          id: doc.id,
          name: data.clientName,
          service: data.serviceName,
          time: data.time,
          status: data.status,
          date: apptDate,
          price: price
        };

        lista.push(appt);

        // Update KPIs
        kpis.totalHoje++;
        
        // Sum revenue only for non-canceled
        if (data.status !== 'cancelado') {
            kpis.faturamento += price;
        }

        if (data.status === 'confirmado') kpis.confirmados++;
        if (data.status === 'pendente') kpis.pendentes++;
        if (data.status === 'cancelado') kpis.cancelados++;

        // Chart Data
        const horaCheia = data.time.split(':')[0] + ":00";
        if (!horasMap[horaCheia]) horasMap[horaCheia] = 0;
        horasMap[horaCheia]++;

        // Next Appointment
        if (isSameDay(date, new Date())) {
            if (!proximo && apptDate > horaAtual && data.status !== 'cancelado') {
                proximo = appt;
            }
        } else if (date > new Date()) {
            if (!proximo && data.status !== 'cancelado') {
                proximo = appt;
            }
        }
      });

      const dadosGrafico = Object.keys(horasMap).sort().map(hora => ({
        name: hora,
        agendamentos: horasMap[hora]
      }));

      const metaDiaria = 8;
      const ocupacao = Math.min(Math.round((kpis.confirmados / metaDiaria) * 100), 100);

      setAppointments(lista);
      setKpiData(kpis);
      setChartData(dadosGrafico);
      setProximoAgendamento(proximo);
      setOcupacaoDia(ocupacao);
      setLoading(false);

    } catch (error) {
      console.error("Dashboard error:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  }

  // Visual Lock Logic
  const isFreePlan = userPlan === 'start';

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{businessName}</h1>
            <p className="text-muted-foreground">
              Visão geral para {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'hoje'}.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/agendamentos">
                <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Novo agendamento
                </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="grid flex-1 items-start gap-4 sm:gap-6 lg:gap-8">
        
        {/* KPI CARDS */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          
          {/* REVENUE CARD (Locked for Free Plan) */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Estimado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isFreePlan ? (
                    <div className="flex items-center gap-2 filter blur-sm select-none opacity-50">
                        <div className="text-2xl font-bold">R$ 450,00</div>
                        <Lock className="w-4 h-4" />
                    </div>
                ) : (
                    <div className="text-2xl font-bold">R$ {kpiData.faturamento.toFixed(2)}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    {isFreePlan ? 'Disponível no PRO' : 'Baseado nos agendamentos'}
                </p>
            </CardContent>
            {isFreePlan && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-muted-foreground/50" />
                </div>
            )}
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.confirmados}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.pendentes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.cancelados}</div>
            </CardContent>
          </Card>
        </div>

        {/* NEXT APPOINTMENT AND OCCUPANCY */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                  {selectedDate && isSameDay(selectedDate, new Date()) ? 'Próximo Cliente' : 'Primeiro Cliente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proximoAgendamento ? (
                  <div className="flex flex-col">
                    <p className="text-xl font-bold">{proximoAgendamento.time}</p>
                    <p className="text-md font-semibold">{proximoAgendamento.name}</p>
                    <p className="text-sm text-muted-foreground">{proximoAgendamento.service}</p>
                  </div>
              ) : (
                  <p className="text-muted-foreground text-sm">Nenhum cliente na fila.</p>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Meta Diária (8 atendimentos)</CardTitle>
              <CardDescription>{ocupacaoDia}% da meta atingida.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center pt-2">
              <Progress value={ocupacaoDia} className="h-3" />
            </CardContent>
          </Card>
        </div>

        {/* CHART AND LIST */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* BAR CHART (WITH PRO LOCK) */}
          <Card className="col-span-1 md:col-span-4 relative overflow-hidden">
            <CardHeader>
              <CardTitle>Fluxo do Dia</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {chartData.length > 0 ? (
                // ✅ FIX: Wrapped ResponsiveContainer in a div with fixed height
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                borderColor: 'hsl(var(--border))' 
                            }} 
                        />
                        <Bar 
                            dataKey="agendamentos" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                </div>
              ) : (
                  // Height preserved for empty state to prevent layout shift
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Nenhum dado para o gráfico nesta data.
                  </div>
              )}
            </CardContent>

            {/* LOCK OVERLAY FOR FREE PLAN */}
            {isFreePlan && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-6 border-2 border-dashed border-primary/20 m-2 rounded-lg">
                    <div className="bg-primary/10 p-4 rounded-full mb-3">
                        <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Desbloqueie os Gráficos</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-4">
                        Veja o fluxo de horários e faturamento detalhado com o plano PRO.
                    </p>
                    <Link href="/#precos">
                        <Button className="gap-2">
                             Fazer Upgrade
                        </Button>
                    </Link>
                </div>
            )}
          </Card>

          {/* APPOINTMENT LIST (ALWAYS UNLOCKED) */}
          <Card className="col-span-1 md:col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Agenda do Dia</CardTitle>
              <CardDescription>
                {appointments.length} clientes marcados para {selectedDate ? format(selectedDate, "dd/MM") : ''}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Agenda livre.</p>
              ) : (
                <ul className="space-y-4">
                    {appointments.map((appt) => (
                    <li
                        key={appt.id}
                        className="flex flex-col items-start gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4 sm:border-0 sm:p-0"
                    >
                        <div className="flex-1">
                        <p className="font-semibold">{appt.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {appt.service} • {appt.time}
                        </p>
                        </div>
                        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-2">
                        <Badge
                            variant={statusVariant[appt.status] || 'default'}
                        >
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </Badge>
                        {/* If price exists and user is PRO, show value */}
                        {!isFreePlan && appt.price > 0 && (
                            <span className="text-xs font-medium text-muted-foreground">R$ {appt.price}</span>
                        )}
                        </div>
                    </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}