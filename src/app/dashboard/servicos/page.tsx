'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreVertical,
  Scissors,
  Trash2,
  Pencil,
  Loader2,
  Clock,
  Banknote
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger } from '@/components/ui/sidebar';

// === FIREBASE IMPORTS ===
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';

type Service = {
  id: string; 
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
  userId?: string;
};

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
  });

  // 1. Conexão Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/entrar');
      } else {
        setUser(currentUser);

        const q = query(
          collection(db, "services"),
          where("userId", "==", currentUser.uid)
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const listaServicos: Service[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            listaServicos.push({
              id: doc.id,
              name: data.name,
              description: data.description || '',
              duration: data.duration,
              price: data.price,
              active: data.active !== undefined ? data.active : true,
            });
          });
          setServices(listaServicos);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Limpar formulário ao fechar
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingService(null);
      setFormData({ name: '', description: '', duration: '', price: '' });
      setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        document.body.removeAttribute('data-scroll-locked');
      }, 100);
    }
  }, [isDialogOpen]);

  const handleOpenDialog = (service: Service | null) => {
    setEditingService(service);
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        duration: String(service.duration),
        price: String(service.price),
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // 2. Salvar (Criar ou Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const serviceData = {
      name: formData.name,
      description: formData.description,
      duration: Number(formData.duration),
      price: Number(formData.price),
      userId: user.uid,
    };

    try {
      if (editingService) {
        const docRef = doc(db, "services", editingService.id);
        await updateDoc(docRef, serviceData);
        toast({ title: 'Serviço atualizado!', description: `${serviceData.name} foi atualizado.` });
      } else {
        await addDoc(collection(db, "services"), {
          ...serviceData,
          active: true,
          createdAt: new Date()
        });
        toast({ title: 'Serviço criado!', description: `${serviceData.name} adicionado ao menu.` });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({ variant: "destructive", title: "Erro ao salvar", description: "Tente novamente." });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Excluir Serviço
  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "services", id));
        toast({ variant: "destructive", title: 'Serviço excluído!', description: 'O serviço foi removido.' });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao excluir" });
    }
  };

  // 4. Ativar/Desativar
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Atualização Otimista
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !currentStatus } : s));
    
    try {
      const docRef = doc(db, "services", id);
      await updateDoc(docRef, { active: !currentStatus });
    } catch (error) {
      // Reverte se der erro
      setServices(prev => prev.map(s => s.id === id ? { ...s, active: currentStatus } : s));
      toast({ variant: "destructive", title: "Erro ao atualizar status." });
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Serviços</h1>
            <p className="text-muted-foreground">
              Adicione e gerencie os serviços que você oferece.
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog(null)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </header>

      <main>
        {services.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(service)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(service.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px] mt-1">
                        {service.description || 'Sem descrição.'}
                    </CardDescription>
                  </div>
                  
                  <div className="space-y-4 mt-4">
                    {/* Infos de Preço e Duração */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-primary">
                            <Banknote className="w-4 h-4" />
                            <span>R$ {service.price.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Switch Ativo/Inativo */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center space-x-2">
                        <Switch
                            id={`active-${service.id}`}
                            checked={service.active}
                            onCheckedChange={() => handleToggleActive(service.id, service.active)}
                        />
                        <Label htmlFor={`active-${service.id}`} className={service.active ? '' : 'text-muted-foreground'}>
                            {service.active ? 'Visível' : 'Oculto'}
                        </Label>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg text-center">
             <div className="bg-muted p-4 rounded-full mb-4">
                <Scissors className="h-8 w-8 text-muted-foreground" />
             </div>
             <h3 className="text-xl font-semibold">Nenhum serviço cadastrado</h3>
             <p className="text-muted-foreground max-w-sm mt-2 mb-6">
               Comece criando seu primeiro serviço para que seus clientes possam agendar.
             </p>
             <Button onClick={() => handleOpenDialog(null)}>
               <Plus className="mr-2 h-4 w-4" /> Criar Serviço
             </Button>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Atualize os detalhes do serviço.' : 'Preencha as informações do novo serviço.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do serviço</Label>
                <Input id="name" placeholder="Ex: Corte Masculino" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea id="description" placeholder="Detalhes do serviço..." value={formData.description} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (min)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="duration" type="number" className="pl-9" placeholder="30" value={formData.duration} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="price" type="number" step="0.01" className="pl-9" placeholder="40.00" value={formData.price} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}