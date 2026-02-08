'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  MapPin, Clock, Phone, Star, Scissors, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, User as UserIcon, CheckCircle, MessageSquare, Loader2,
  Map, Wifi, Car, Fan, Accessibility, CreditCard, Sun, Moon, Baby, Dog,
  AlertTriangle, Lock
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { format, addMinutes, parse, isToday, getDay, isPast, addDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// === FIREBASE IMPORTS ===
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import { checkMonthlyLimit } from '@/lib/checkLimits';

const amenitiesMap = [
    { id: 'parking', label: 'Estacionamento', icon: Car },
    { id: 'accessibility', label: 'Acessibilidade', icon: Accessibility },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'card', label: 'Aceita cartão', icon: CreditCard },
    { id: 'ac', label: 'Ambiente climatizado', icon: Fan },
    { id: 'kids', label: 'Atende crianças', icon: Baby },
    { id: 'pets', label: 'Pet friendly', icon: Dog },
];

type Step = 'service' | 'datetime' | 'details' | 'confirm' | 'success';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface BusinessInfo {
  name: string;
  phone: string;
  address?: string;
  rating: number;
  reviews: number;
  gallery: string[];
  hours: { day: string, time: string }[];
  amenities: string[];
  openTime?: string;
  closeTime?: string;
  workingDays?: string[];
  lunchBreak?: boolean;
  lunchStart?: string;
  lunchEnd?: string;
  lunchDays?: string[];
  extraBreak?: boolean;
  extraBreakStart?: string;
  extraBreakEnd?: string;
  extraBreakDays?: string[];
}

export default function PublicBookingPage() {
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const businessId = params.uid as string;
  const { toast } = useToast();
  
  // === ESTADOS DE DADOS ===
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // === ESTADOS DE PLANO E LIMITE ===
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [businessPlan, setBusinessPlan] = useState('start'); // Para controlar o Banner

  // === ESTADOS DO AGENDAMENTO ===
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const todayIndex = useMemo(() => getDay(new Date()) === 0 ? 6 : getDay(new Date()) - 1, []);

  // === 1. CARREGAR DADOS ===
  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;
      try {
        // A. Dados do Negócio
        const userDoc = await getDoc(doc(db, "users", businessId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setBusiness({
            name: data.businessName || "Estabelecimento",
            phone: data.phone || "",
            address: data.address || "Endereço não informado",
            rating: 5.0,
            reviews: 12,
            gallery: data.gallery || [],
            hours: data.hours || [],
            amenities: data.amenities || [],
            openTime: data.openTime || "09:00",
            closeTime: data.closeTime || "18:00",
            workingDays: data.workingDays || ['seg', 'ter', 'qua', 'qui', 'sex'],
            lunchBreak: data.lunchBreak,
            lunchStart: data.lunchStart,
            lunchEnd: data.lunchEnd,
            lunchDays: data.lunchDays || [],
            extraBreak: data.extraBreak,
            extraBreakStart: data.extraBreakStart,
            extraBreakEnd: data.extraBreakEnd,
            extraBreakDays: data.extraBreakDays || []
          });
        }

        // B. Serviços
        const qServices = query(collection(db, "services"), where("userId", "==", businessId));
        const servicesSnap = await getDocs(qServices);
        const servicesList: Service[] = [];
        servicesSnap.forEach(doc => servicesList.push({ id: doc.id, ...doc.data() } as Service));
        setServices(servicesList);

        // C. VERIFICAR LIMITE E PLANO
        const limitCheck = await checkMonthlyLimit(businessId);
        console.log("Plano Recebido do Banco:", limitCheck.plan);
        setIsLimitReached(limitCheck.isBlocked);
        setBusinessPlan(limitCheck.plan); // <--- Captura o plano aqui

      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [businessId]);

  // === 2. CARREGAR AGENDAMENTOS EXISTENTES ===
  useEffect(() => {
    const fetchAppointments = async () => {
        if (!businessId || !selectedDate) return;
        setLoadingSlots(true);
        setBookedTimes([]); 

        try {
            const start = startOfDay(selectedDate);
            const end = endOfDay(selectedDate);

            const q = query(
                collection(db, "appointments"),
                where("userId", "==", businessId),
                where("date", ">=", start),
                where("date", "<=", end)
            );

            const querySnapshot = await getDocs(q);
            const busy: string[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status !== 'cancelado') {
                    busy.push(data.time);
                }
            });
            
            setBookedTimes(busy);
        } catch (error) {
            console.error("Erro ao buscar horários ocupados:", error);
        } finally {
            setLoadingSlots(false);
        }
    };

    fetchAppointments();
  }, [selectedDate, businessId]);

  // === 3. FILTRAR HORÁRIOS ===
  const filteredTimes = useMemo(() => {
    if (!selectedDate || !business) return [];

    const dayMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const currentDayId = dayMap[getDay(selectedDate)];

    if (business.workingDays && !business.workingDays.includes(currentDayId)) {
        return []; 
    }

    const times = [];
    let current = parse(business.openTime || "09:00", 'HH:mm', new Date());
    const end = parse(business.closeTime || "18:00", 'HH:mm', new Date());

    while (current < end) {
        times.push(format(current, 'HH:mm'));
        current = addMinutes(current, 30); 
    }

    return times.filter(time => {
        if (isToday(selectedDate) && isPast(parse(time, 'HH:mm', new Date()))) return false;
        if (bookedTimes.includes(time)) return false;

        const isInBreak = (startStr?: string, endStr?: string) => {
            if (!startStr || !endStr) return false;
            const timeDate = parse(time, 'HH:mm', new Date());
            const start = parse(startStr, 'HH:mm', new Date());
            const end = parse(endStr, 'HH:mm', new Date());
            return timeDate >= start && timeDate < end;
        };

        if (business.lunchBreak && business.lunchDays?.includes(currentDayId)) {
            if (isInBreak(business.lunchStart, business.lunchEnd)) return false;
        }

        if (business.extraBreak && business.extraBreakDays?.includes(currentDayId)) {
            if (isInBreak(business.extraBreakStart, business.extraBreakEnd)) return false;
        }

        return true;
    });
  }, [selectedDate, business, bookedTimes]);


  // === FUNÇÕES DE FLUXO ===
  const handleOpenBookingFlow = (service?: Service) => {
    if (isLimitReached) {
        toast({
            variant: "destructive",
            title: "Agendamento Indisponível",
            description: "Este estabelecimento atingiu o limite de agendamentos do mês."
        });
        return;
    }

    if (service) { setSelectedService(service); setStep('datetime'); } 
    else { setStep('service'); }
    setIsSheetOpen(true);
  };
  
  useEffect(() => {
    if (!isSheetOpen) {
      const timer = setTimeout(() => {
        setStep('service'); setSelectedService(null); setSelectedDate(new Date()); setSelectedTime(null); setCustomerName(''); setCustomerPhone('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSheetOpen]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName && customerPhone) setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone || !business) return;
    setIsSubmitting(true);
    try {
        const [hours, minutes] = selectedTime.split(':');
        const finalDate = new Date(selectedDate);
        finalDate.setHours(parseInt(hours), parseInt(minutes), 0);

        await addDoc(collection(db, "appointments"), {
            userId: businessId,
            clientName: customerName,
            clientPhone: customerPhone,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            servicePrice: selectedService.price.toFixed(2),
            serviceDuration: selectedService.duration + ' min',
            date: finalDate,
            time: selectedTime,
            status: 'pendente',
            createdAt: new Date()
        });
        setStep('success');
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao agendar." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 'success') return;
    const stepOrder: Step[] = ['service', 'datetime', 'details', 'confirm'];
    const currentStepIndex = stepOrder.indexOf(step);
    if (currentStepIndex > 0) setStep(stepOrder[currentStepIndex - 1]);
  };

  const getCalendarLinks = () => {
    if (!selectedService || !selectedDate || !selectedTime) return { google: '' };
    const startDateTime = parse(`${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = addMinutes(startDateTime, selectedService.duration);
    const googleUrl = new URL('https://www.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', `Agendamento: ${selectedService.name}`);
    googleUrl.searchParams.append('dates', `${startDateTime.toISOString().replace(/-|:|\.\d{3}/g, '')}/${endDateTime.toISOString().replace(/-|:|\.\d{3}/g, '')}`);
    return { google: googleUrl.toString() };
  };

  const renderBookingStep = () => {
    const sheetTitle = {
      service: 'Selecione um serviço',
      datetime: 'Escolha data e horário',
      details: 'Seus dados',
      confirm: 'Confirme seu agendamento',
      success: 'Agendamento Confirmado!',
    };

    return (
      <>
        <SheetHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-3 mb-4">
                {step !== 'service' && step !== 'success' && (
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={goBack}>
                    <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
                 <div>
                    <SheetTitle>{sheetTitle[step]}</SheetTitle>
                    <SheetDescription>Passo a passo rápido.</SheetDescription>
                 </div>
            </div>
            {step !== 'success' && <Separator />}
        </SheetHeader>
        <div className="p-6 overflow-y-auto h-[calc(100vh-150px)]">
            {step === 'service' && (
              <div className="space-y-4">
                {services.map((service) => (
                  <Card key={service.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => { setSelectedService(service); setStep('datetime'); }}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration} min • R$ {service.price.toFixed(2)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {step === 'datetime' && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="w-full" locale={ptBR} disabled={(date) => date < addDays(new Date(), -1)} />
                  </CardContent>
                </Card>
                {selectedDate && (
                  <div>
                    <h3 className="text-lg font-semibold text-center mb-4">
                        Horários para {format(selectedDate, "EEEE", { locale: ptBR })}
                    </h3>
                    
                    {loadingSlots ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin"/></div>
                    ) : filteredTimes.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {filteredTimes.map((time) => (
                            <Button key={time} variant={selectedTime === time ? "default" : "outline"} className="w-full" onClick={() => { setSelectedTime(time); setStep('details'); }}>
                            {time}
                            </Button>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/50">
                            <p className="text-muted-foreground">Agenda cheia ou indisponível neste dia.</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {step === 'details' && (
                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                    <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Seu nome</Label>
                        <Input id="name" placeholder="Digite seu nome" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp</Label>
                        <Input id="phone" type="tel" placeholder="(00) 00000-0000" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                    </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg">Continuar</Button>
                </form>
            )}
            {step === 'confirm' && (
              <div className="space-y-6">
                <Card className="text-left bg-muted/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3"><Scissors className="w-5 h-5 text-primary" /><span className="font-medium">{selectedService?.name}</span></div>
                    <div className="flex items-center gap-3"><CalendarIcon className="w-5 h-5 text-primary" /><span className="font-medium">{selectedDate && format(selectedDate, 'PPP', { locale: ptBR })}</span></div>
                    <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /><span className="font-medium">{selectedTime}</span></div>
                    <div className="flex items-center gap-3 font-bold text-lg text-primary">R$ {selectedService?.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Button onClick={handleConfirm} className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : 'Confirmar Agendamento'}
                </Button>
              </div>
            )}
            {step === 'success' && (
              <div className="text-center space-y-6 py-8">
                <div className="bg-green-100 text-green-600 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold">Tudo Certo!</h3>
                <p className="text-muted-foreground">Seu horário está reservado.</p>
                <div className="space-y-2">
                    <Button asChild className="w-full">
                        <Link href={`https://wa.me/${business?.phone}`} target="_blank"><MessageSquare className="mr-2 h-4 w-4"/> Enviar comprovante</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={getCalendarLinks().google} target="_blank"><CalendarIcon className="mr-2 h-4 w-4"/> Google Agenda</Link>
                    </Button>
                </div>
              </div>
            )}
        </div>
      </>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>;
  if (!business) return <div className="h-screen flex items-center justify-center text-muted-foreground">Estabelecimento não encontrado.</div>;

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none">
          {lightboxImage && <Image src={lightboxImage} alt="Galeria" width={1200} height={800} className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
      
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-40 flex items-center px-4 md:px-8 justify-between">
        <h1 className="text-lg font-bold text-foreground truncate max-w-[200px]">{business.name}</h1>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24 flex-1">
         {/* GALERIA */}
         {business.gallery && business.gallery.length > 0 && (
             <Carousel className="mb-8" opts={{ loop: true }}>
              <CarouselContent>
                {business.gallery.map((url, index) => (
                  <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card className="overflow-hidden cursor-pointer" onClick={() => setLightboxImage(url)}>
                            <Image src={url} alt={`Foto ${index}`} width={800} height={600} className="aspect-[4/3] object-cover hover:scale-105 transition-transform duration-300" />
                        </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
         )}

        {/* ALERTA DE LIMITE */}
        {isLimitReached && (
            <Alert variant="destructive" className="mb-8 border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="ml-2 font-bold">Agendamentos Pausados</AlertTitle>
                <AlertDescription className="ml-2 mt-1">
                    Este estabelecimento atingiu o limite mensal de agendamentos pelo sistema. 
                    <br />
                    Por favor, entre em contato diretamente pelo WhatsApp.
                </AlertDescription>
            </Alert>
        )}

        {/* INFO */}
        <div className="sticky top-16 bg-background/80 backdrop-blur-sm z-30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-b mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-bold">{business.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{business.rating} ({business.reviews} avaliações)</span>
            </div>
          </div>
          
          <Button 
            onClick={() => handleOpenBookingFlow()} 
            size="lg" 
            className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all"
            disabled={isLimitReached} 
          >
            {isLimitReached ? <Lock className="mr-2 h-4 w-4"/> : null}
            {isLimitReached ? 'Indisponível' : 'Agendar Horário'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            <aside className="lg:col-span-1 space-y-8 mb-8 lg:mb-0 lg:sticky lg:top-40 self-start">
                <Card>
                    <CardHeader><CardTitle>Localização e Contato</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4 p-2">
                             <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                             <span className="text-sm">{business.address}</span>
                        </div>
                         <Link href={`https://wa.me/${business.phone}`} target="_blank" className="flex items-start gap-4 hover:bg-muted p-2 rounded-md transition-colors">
                            <Phone className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0"/>
                            <span className="text-sm">{business.phone}</span>
                        </Link>
                    </CardContent>
                </Card>

                {business.hours && business.hours.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Horário de Funcionamento</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {business.hours.map((item, index) => (
                                <div key={item.day} className={cn("flex justify-between text-sm", index === todayIndex ? "font-bold text-primary" : "")}>
                                    <span>{item.day}</span>
                                    <span className="text-muted-foreground">{item.time}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </aside>

            <main className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Nossos Serviços</h2>
                {services.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        Nenhum serviço cadastrado por este estabelecimento ainda.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {services.map((service) => (
                            <Card 
                                key={service.id} 
                                className={`transition-colors group ${isLimitReached ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}
                                onClick={() => !isLimitReached && handleOpenBookingFlow(service)}
                            >
                                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{service.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-2">{service.description || "Sem descrição"}</p>
                                        <div className="flex items-center gap-4 text-sm font-medium">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {service.duration} min</span>
                                            <span className="text-primary font-bold">R$ {service.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Button disabled={isLimitReached}>Agendar</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
      </div>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="p-0 sm:max-w-md" side="right">
          {renderBookingStep()}
        </SheetContent>
      </Sheet>

      {/* === BANNER DE DIVULGAÇÃO (SÓ PARA PLANO START) === */}
      {businessPlan === 'start' && (
        <div className="w-full py-4 text-center text-xs text-muted-foreground border-t bg-muted/20">
            <p className="flex items-center justify-center gap-1">
                Agendamento simplificado por 
                <Link href="/" target="_blank" className="font-bold text-primary hover:underline">
                    Agenda Fácil
                </Link>
                - Crie seu sistema grátis.
            </p>
        </div>
      )}
    </div>
  );
}