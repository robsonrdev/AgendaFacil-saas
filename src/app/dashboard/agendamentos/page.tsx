'use client';

import { useState, useEffect } from 'react';
import {
  MoreVertical,
  PlusCircle,
  Upload,
  Filter,
  Search,
  Pencil,
  XCircle,
  CheckCircle,
  MessageSquareQuote,
  Send,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { format, isToday, isTomorrow, formatDistanceToNowStrict, isPast, differenceInMinutes, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

// === FIREBASE IMPORTS ===
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs, orderBy, Timestamp 
} from 'firebase/firestore';

// Tipagem atualizada para o Firebase
type Appointment = {
  id: string;
  date: Date; // Convertido do Timestamp
  time: string;
  customer: {
    name: string;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    price: string;
    duration: string;
  };
  status: 'confirmado' | 'pendente' | 'cancelado';
};

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

// Configurações de Cores e Status (Mantido do seu código)
const statusConfig = {
  confirmado: {
    label: 'Confirmado',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
} as const;

const urgencyStyles = {
    atrasado: 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground font-semibold border-zinc-200 dark:border-zinc-700',
    agora: 'bg-zinc-200 dark:bg-zinc-700 font-semibold border-zinc-300 dark:border-zinc-600 animate-pulse',
    atencao: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    normal: 'bg-transparent border-transparent text-foreground'
};

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estados do Firebase
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Novo Agendamento
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newTime, setNewTime] = useState('');

  // Atualiza o relógio a cada minuto (para urgência)
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerId);
  }, []);

  // === 1. Conexão e Busca de Dados ===
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // A. Carregar Serviços (para o Select)
        const qServices = query(collection(db, "services"), where("userId", "==", currentUser.uid));
        const servicesSnap = await getDocs(qServices);
        const loadedServices: Service[] = [];
        servicesSnap.forEach(doc => {
            const data = doc.data();
            loadedServices.push({ 
                id: doc.id, 
                name: data.name, 
                price: data.price, 
                duration: data.duration 
            });
        });
        setServices(loadedServices);

        // B. Carregar Agendamentos do Dia Selecionado
        // Precisamos filtrar do Inicio do dia (00:00) até o Fim do dia (23:59)
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);

        const qAppt = query(
          collection(db, "appointments"), 
          where("userId", "==", currentUser.uid),
          where("date", ">=", start),
          where("date", "<=", end),
          orderBy("date", "asc")
        );

        const unsubscribeSnapshot = onSnapshot(qAppt, (snapshot) => {
          const lista: Appointment[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Converte Timestamp do Firestore para Date do JS
            const apptDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
            
            lista.push({
                id: doc.id,
                date: apptDate,
                time: data.time,
                customer: { name: data.clientName, phone: data.clientPhone || '' },
                service: { 
                    id: data.serviceId, 
                    name: data.serviceName, 
                    price: data.servicePrice || '0,00',
                    duration: data.serviceDuration || '0 min'
                },
                status: data.status
            });
          });
          setAppointments(lista);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      }
    });
    return () => unsubscribeAuth();
  }, [selectedDate]); // Recarrega quando muda a data

  // === 2. Lógica de Criação ===
  const handleNewAppointment = async () => {
    if (!newClientName || !newServiceId || !newTime) {
        toast({ variant: "destructive", title: "Preencha os campos obrigatórios" });
        return;
    }

    try {
        const service = services.find(s => s.id === newServiceId);
        
        // Cria a data correta combinando o dia selecionado + horário digitado
        const [hours, minutes] = newTime.split(':');
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0);

        await addDoc(collection(db, "appointments"), {
            userId: user.uid,
            clientName: newClientName,
            clientPhone: newClientPhone,
            serviceId: service?.id,
            serviceName: service?.name,
            servicePrice: service?.price.toFixed(2),
            serviceDuration: service?.duration + ' min',
            date: appointmentDate,
            time: newTime,
            status: 'pendente',
            createdAt: new Date()
        });

        toast({ title: "Agendamento criado!" });
        setIsNewOpen(false);
        setNewClientName('');
        setNewClientPhone('');
        setNewTime('');
        setNewServiceId('');
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao criar agendamento" });
    }
  };

  // === 3. Lógica de Atualização (Status) ===
  const handleUpdateStatus = async (id: string, newStatus: 'confirmado' | 'cancelado') => {
    try {
        await updateDoc(doc(db, "appointments", id), {
            status: newStatus
        });
        toast({ 
            title: newStatus === 'confirmado' ? 'Agendamento confirmado!' : 'Agendamento cancelado.' 
        });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao atualizar status" });
    }
  };

  // === 4. Utilitários (Copiados do seu código) ===
  const getAppointmentUrgency = (appointmentDate: Date): keyof typeof urgencyStyles => {
    const diff = differenceInMinutes(appointmentDate, currentTime);
    if (isPast(appointmentDate) && diff < -1) return 'atrasado';
    if (diff >= 0 && diff <= 15) return 'agora';
    if (diff > 15 && diff <= 60) return 'atencao';
    return 'normal';
  };

  const handleCopyConfirmation = (appt: Appointment) => {
    const getRelativeDateText = (date: Date): string => {
      if (isToday(date)) return 'hoje';
      if (isTomorrow(date)) return 'amanhã';
      return `em ${formatDistanceToNowStrict(date, { locale: ptBR, unit: 'day' })}`;
    };

    const message = `Olá, ${appt.customer.name}! 👋
Passando para confirmar o seu agendamento conosco:

📅 Data: ${format(appt.date, 'PPP', { locale: ptBR })} (${getRelativeDateText(appt.date)})
⏰ Horário: ${appt.time}
💼 Serviço: ${appt.service.name}
💰 Valor: R$ ${appt.service.price}

Qualquer imprevisto, é só nos avisar.
Esperamos por você! 😊`;

    navigator.clipboard.writeText(message)
      .then(() => toast({ title: 'Mensagem copiada!' }))
      .catch(() => toast({ variant: 'destructive', title: 'Falha ao copiar' }));
  };

  const handleSendMessage = (phone: string) => {
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone) {
      window.open(`https://wa.me/55${sanitizedPhone}`, '_blank');
    } else {
      toast({ variant: 'destructive', title: 'Telefone inválido', description: 'Cadastre o telefone do cliente.' });
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os seus agendamentos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Exportar
          </Button>

          {/* MODAL DE NOVO AGENDAMENTO */}
          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Agendamento
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome do Cliente</Label>
                        <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ex: João Silva" />
                    </div>
                    <div className="space-y-2">
                        <Label>Telefone (WhatsApp)</Label>
                        <Input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="(00) 00000-0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Serviço</Label>
                            <Select value={newServiceId} onValueChange={setNewServiceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} - R$ {s.price}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Horário</Label>
                            <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleNewAppointment}>Salvar Agendamento</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main>
        <Card>
          <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Lista de Agendamentos</CardTitle>
              {/* Filtro Mobile (Sheet) */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    {/* ...Conteúdo do filtro mobile... */}
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* BARRA DE FILTROS DESKTOP */}
            <div className="hidden md:flex items-center gap-2 w-full max-w-2xl">
              {/* DATE PICKER (Substituindo o componente customizado pelo padrão Shadcn) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <div className="relative w-full flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar cliente..." className="pl-9" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
                <div className="py-10 flex justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2"/> Carregando agenda...</div>
            ) : appointments.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    Nenhum agendamento para este dia.
                </div>
            ) : (
             <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horário</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => {
                    const urgency = getAppointmentUrgency(appt.date);
                    return (
                        <TableRow key={appt.id}>
                          <TableCell>
                            <Badge variant="outline" className={cn("px-2 py-1 font-semibold", urgencyStyles[urgency])}>
                                {appt.time}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{appt.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{appt.customer.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div>{appt.service.name}</div>
                            <div className="text-xs text-muted-foreground">{appt.service.duration}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={statusConfig[appt.status].className}>
                              {statusConfig[appt.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            R$ {appt.service.price}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleCopyConfirmation(appt)}>
                                  <MessageSquareQuote className="mr-2 h-4 w-4" /> Copiar mensagem
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendMessage(appt.customer.phone)}>
                                  <Send className="mr-2 h-4 w-4" /> Enviar mensagem
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, 'confirmado')}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Confirmar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, 'cancelado')} className="text-red-600">
                                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                    );
                   })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {appointments.map((appt) => {
                const urgency = getAppointmentUrgency(appt.date);
                return (
                    <Card key={appt.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold">{appt.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{appt.service.name}</p>
                          <p className="text-sm font-semibold">R$ {appt.service.price}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, 'confirmado')}>
                                Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, 'cancelado')} className="text-red-600">
                                Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <Badge variant="outline" className={cn("px-3 py-1 text-lg font-bold", urgencyStyles[urgency])}>
                          {appt.time}
                        </Badge>
                        <Badge variant="outline" className={statusConfig[appt.status].className}>
                          {statusConfig[appt.status].label}
                        </Badge>
                      </div>
                    </Card>
                );
              })}
            </div>
            </>
           )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}