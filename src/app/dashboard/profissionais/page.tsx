'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  MoreVertical,
  Trash2,
  Pencil,
  Users,
  User,
  Loader2,
  Lock,  // Novo ícone
  Crown  // Novo ícone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// === FIREBASE IMPORTS ===
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc 
} from 'firebase/firestore';

// === IMPORTAR REGRAS DE PLANOS ===
import { getPlanLimits, PLANS } from '@/lib/plans';

type ProfessionalLevel = 'Iniciante' | 'Profissional' | 'Especialista' | 'Master';

type Professional = {
  id: string; 
  name: string;
  level: ProfessionalLevel;
  description: string;
  photoUrl?: string;
  active: boolean;
};

const levelColors: Record<ProfessionalLevel, string> = {
    Iniciante: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    Profissional: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
    Especialista: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
    Master: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
}

export default function ProfessionalsPage() {
  const { toast } = useToast();
  
  // Estados
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState('start'); // Estado do plano
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false); // Modal de Upgrade
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    level: 'Profissional' as ProfessionalLevel,
    description: '',
    photoUrl: '', 
  });

  // 1. CARREGAR DADOS DO FIREBASE
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            
            // A. Buscar Plano do Usuário
            try {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserPlan(userData.plan || 'start');
                }
            } catch (error) {
                console.error("Erro ao buscar plano", error);
            }

            // B. Buscar Profissionais
            const q = query(
                collection(db, "professionals"),
                where("userId", "==", currentUser.uid)
            );

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const lista: Professional[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    lista.push({
                        id: doc.id,
                        name: data.name,
                        level: data.level,
                        description: data.description,
                        photoUrl: data.photoUrl,
                        active: data.active
                    });
                });
                setProfessionals(lista);
                setLoading(false);
            });

            return () => unsubscribeSnapshot();
        } else {
            setLoading(false);
        }
    });
    return () => unsubscribeAuth();
  }, []);

  // Lógica de Limites
  const limits = getPlanLimits(userPlan);
  const reachedLimit = professionals.length >= limits.maxProfessionals;

  // Resetar form ao fechar
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingProfessional(null);
      setFormData({ name: '', level: 'Profissional', description: '', photoUrl: '' });
      setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        document.body.removeAttribute('data-scroll-locked');
      }, 100);
    }
  }, [isDialogOpen]);

  const handleOpenDialog = (professional: Professional | null) => {
    // BLOQUEIO: Se for novo e atingiu limite
    if (!professional && reachedLimit) {
        setIsUpgradeOpen(true);
        return;
    }

    setEditingProfessional(professional);
    if (professional) {
      setFormData({
        name: professional.name,
        level: professional.level,
        description: professional.description,
        photoUrl: professional.photoUrl || '',
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLevelChange = (value: ProfessionalLevel) => {
      setFormData(prev => ({ ...prev, level: value }))
  }

  // 2. SALVAR (CRIAR OU EDITAR)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
        const professionalData = {
            name: formData.name,
            level: formData.level,
            description: formData.description,
            photoUrl: formData.photoUrl,
            userId: user.uid,
        };

        if (editingProfessional) {
            await updateDoc(doc(db, "professionals", editingProfessional.id), professionalData);
            toast({ title: 'Profissional atualizado!' });
        } else {
            await addDoc(collection(db, "professionals"), {
                ...professionalData,
                active: true,
                createdAt: new Date()
            });
            toast({ title: 'Profissional adicionado!' });
        }
        setIsDialogOpen(false);
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Erro ao salvar" });
    } finally {
        setIsSaving(false);
    }
  };

  // 3. EXCLUIR
  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "professionals", id));
        toast({ variant: "destructive", title: 'Profissional excluído!' });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao excluir" });
    }
  };
  
  // 4. ALTERAR STATUS
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
        setProfessionals(prev => prev.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
        await updateDoc(doc(db, "professionals", id), { active: !currentStatus });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao atualizar status" });
    }
  };

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary"/></div>;
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 h-full">
      <header className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
            <div className="text-muted-foreground flex items-center gap-2">
  Gerencie sua equipe.
  <Badge variant={reachedLimit ? "destructive" : "secondary"} className="ml-1">
     {professionals.length} / {limits.maxProfessionals === Infinity ? '∞' : limits.maxProfessionals}
  </Badge>
</div>
          </div>
        </div>
        
        {/* Botão Condicional */}
        <Button 
            onClick={() => handleOpenDialog(null)} 
            className={`w-full md:w-auto ${reachedLimit ? 'opacity-90' : ''}`}
            variant={reachedLimit ? "secondary" : "default"}
        >
          {reachedLimit ? <Lock className="mr-2 h-4 w-4 text-orange-500" /> : <Plus className="mr-2 h-4 w-4" />}
          {reachedLimit ? 'Limite Atingido' : 'Novo Profissional'}
        </Button>
      </header>
      
      <main className="flex-1">
        {professionals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {professionals.map((pro) => (
              <Card key={pro.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={pro.photoUrl} alt={pro.name} className="object-cover" />
                      <AvatarFallback><User className="h-8 w-8 text-muted-foreground"/></AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{pro.name}</CardTitle>
                      <Badge variant="outline" className={cn("mt-1", levelColors[pro.level])}>{pro.level}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(pro)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(pro.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{pro.description || 'Nenhuma descrição fornecida.'}</p>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`active-switch-${pro.id}`}
                        checked={pro.active}
                        onCheckedChange={() => handleToggleActive(pro.id, pro.active)}
                      />
                      <Label htmlFor={`active-switch-${pro.id}`} className={pro.active ? 'text-foreground' : 'text-muted-foreground'}>
                        {pro.active ? 'Ativo' : 'Inativo'}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
           <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full py-12">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-2xl font-bold tracking-tight">Nenhum profissional</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                       Adicione os membros da sua equipe.
                    </p>
                    <Button onClick={() => handleOpenDialog(null)} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                    </Button>
                </div>
            </div>
        )}
      </main>

      {/* FORM MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
            <DialogDescription>
             {editingProfessional ? 'Atualize os detalhes.' : 'Preencha os dados do novo membro.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
               <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.photoUrl} className="object-cover" />
                    <AvatarFallback><User className="h-10 w-10 text-muted-foreground"/></AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <Label htmlFor="photoUrl" className="text-xs">URL da Foto</Label>
                    <Input id="photoUrl" placeholder="https://..." value={formData.photoUrl} onChange={handleInputChange} className="text-xs h-8"/>
                </div>
               </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Nível</Label>
                 <Select value={formData.level} onValueChange={handleLevelChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Profissional">Profissional</SelectItem>
                        <SelectItem value="Especialista">Especialista</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={formData.description} onChange={handleInputChange}/>
              </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null} Salvar
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === MODAL DE UPGRADE === */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="sm:max-w-md text-center">
            <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                    <Crown className="w-10 h-10 text-primary" />
                </div>
            </div>
            <DialogHeader>
                <DialogTitle className="text-xl text-center">Aumente sua Equipe!</DialogTitle>
                <DialogDescription className="text-center pt-2">
                    Você atingiu o limite de <strong>{limits.maxProfessionals} profissional</strong> do plano <strong>{PLANS[userPlan as keyof typeof PLANS]?.label || 'Start'}</strong>.
                    <br/><br/>
                    Faça o upgrade para o plano <strong>PRO</strong> e adicione até 3 profissionais, ou <strong>Business</strong> para equipe ilimitada.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center mt-4">
                <Button variant="outline" onClick={() => setIsUpgradeOpen(false)}>Talvez depois</Button>
                {/* Link para a seção de preços na Landing Page */}
                <Link href="/#precos">
                    <Button className="bg-gradient-to-r from-primary to-purple-600 border-0 hover:opacity-90">
                        Ver Planos
                    </Button>
                </Link>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}