'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  MapPin, Clock, Phone, Star, Scissors, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, User as UserIcon, CheckCircle, MessageSquare, Loader2,
  Map, Wifi, Car, Fan, Accessibility, CreditCard, Sun, Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { format, addMinutes, parse, isToday, getDay, isPast, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Tipos
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
  gallery: string[]; // URLs das imagens
  hours: { day: string, time: string }[];
  amenities: { icon: any, text: string }[];
}

// Dados padrão para preencher o que ainda não temos no banco
const defaultHours = [
    { day: 'Segunda', time: '09:00 - 18:00' },
    { day: 'Terça', time: '09:00 - 18:00' },
    { day: 'Quarta', time: '09:00 - 18:00' },
    { day: 'Quinta', time: '09:00 - 18:00' },
    { day: 'Sexta', time: '09:00 - 19:00' },
    { day: 'Sábado', time: '09:00 - 14:00' },
    { day: 'Domingo', time: 'Fechado' },
];

const defaultAmenities = [
    { icon: Wifi, text: 'Wi-Fi Grátis' },
    { icon: Car, text: 'Estacionamento' },
    { icon: Fan, text: 'Climatizado' },
    { icon: Accessibility, text: 'Acessível' },
];

export default function PublicBookingPage() {
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const businessId = params.uid as string;
  const { toast } = useToast();
  
  // === ESTADOS DE DADOS (FIREBASE) ===
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Horários disponíveis (Estático por enquanto)
  const availableTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  const todayIndex = useMemo(() => getDay(new Date()) === 0 ? 6 : getDay(new Date()) - 1, []); // Ajuste para bater com o array (0=Segunda)

  // === 1. CARREGAR DADOS DO FIREBASE ===
  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;
      try {
        // Busca Empresa
        const userDoc = await getDoc(doc(db, "users", businessId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBusiness({
            name: userData.businessName || userData.representativeName || "Estabelecimento",
            phone: userData.phone || "",
            address: userData.cep || "Endereço não cadastrado",
            rating: 5.0, // Mockado por enquanto
            reviews: 12, // Mockado
            gallery: [ // Mockado (placeholder)
                "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
                "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80",
                "https://images.unsplash.com/photo-1503951914290-934c487a1436?w=800&q=80"
            ],
            hours: defaultHours,
            amenities: defaultAmenities
          });
        }
        // Busca Serviços
        const qServices = query(collection(db, "services"), where("userId", "==", businessId));
        const servicesSnap = await getDocs(qServices);
        const servicesList: Service[] = [];
        servicesSnap.forEach(doc => servicesList.push({ id: doc.id, ...doc.data() } as Service));
        setServices(servicesList);
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [businessId]);

  // === LÓGICA DE NAVEGAÇÃO ===
  const handleOpenBookingFlow = (service?: Service) => {
    if (service) {
      setSelectedService(service);
      setStep('datetime'); // Pula escolha de profissional
    } else {
      setStep('service');
    }
    setIsSheetOpen(true);
  };
  
  // Reseta ao fechar
  useEffect(() => {
    if (!isSheetOpen) {
      const timer = setTimeout(() => {
        setStep('service');
        setSelectedService(null);
        setSelectedDate(new Date());
        setSelectedTime(null);
        setCustomerName('');
        setCustomerPhone('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSheetOpen]);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName && customerPhone) {
      setStep('confirm');
    }
  };

  // === SALVAR NO FIREBASE ===
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
    if (currentStepIndex > 0) {
      setStep(stepOrder[currentStepIndex - 1]);
    }
  };

  // Links de Calendário
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
                  <Card key={service.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleSelectService(service)}>
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
                    <h3 className="text-lg font-semibold text-center mb-4">Horários</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimes.map((time) => (
                        <Button key={time} variant="outline" className="w-full" onClick={() => handleSelectTime(time)}>
                          {time}
                        </Button>
                      ))}
                    </div>
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
                <p className="text-muted-foreground">Seu horário está reservado. O estabelecimento irá confirmar em breve.</p>
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
    <div className="bg-background min-h-screen">
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

      <div className="container mx-auto px-4 py-8 pt-24">
         {/* GALERIA (Mantida visualmente com placeholders bonitos até termos upload real) */}
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

        {/* Banner/Header da Empresa */}
        <div className="sticky top-16 bg-background/80 backdrop-blur-sm z-30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-b mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-bold">{business.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{business.rating} ({business.reviews} avaliações)</span>
            </div>
          </div>
          <Button onClick={() => handleOpenBookingFlow()} size="lg" className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all">
            Agendar Horário
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            {/* Info Lateral */}
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

                <Card>
                    <CardHeader><CardTitle>Comodidades</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {business.amenities.map((item) => (
                            <div key={item.text} className="flex items-center gap-2 text-sm">
                                <item.icon className="h-5 w-5 text-primary"/>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </aside>

            {/* Lista de Serviços */}
            <main className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Nossos Serviços</h2>
                {services.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        Nenhum serviço cadastrado por este estabelecimento ainda.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {services.map((service) => (
                            <Card key={service.id} className="hover:border-primary transition-colors cursor-pointer group" onClick={() => handleOpenBookingFlow(service)}>
                                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{service.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-2">{service.description || "Sem descrição"}</p>
                                        <div className="flex items-center gap-4 text-sm font-medium">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {service.duration} min</span>
                                            <span className="text-primary font-bold">R$ {service.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Button>Agendar</Button>
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
    </div>
  );
}