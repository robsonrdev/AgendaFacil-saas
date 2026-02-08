'use client';

import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import Image from 'next/image';
import {
    Upload, Copy, Eye, Car, Accessibility, Wifi, CreditCard,
    Fan, Baby, Dog, Loader2, Save, Trash2, Plus, Image as ImageIcon,
    Coffee, CalendarClock, Utensils
} from 'lucide-react';

// === FIREBASE IMPORTS ===
import { auth, db, storage} from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // <--- Adicione essa linha nova


const daysOfWeekData = [
  { id: 'seg', label: 'S', name: 'Segunda' },
  { id: 'ter', label: 'T', name: 'Terça' },
  { id: 'qua', label: 'Q', name: 'Quarta' },
  { id: 'qui', label: 'Q', name: 'Quinta' },
  { id: 'sex', label: 'S', name: 'Sexta' },
  { id: 'sab', label: 'S', name: 'Sábado' },
  { id: 'dom', label: 'D', name: 'Domingo' },
];

const amenitiesList = [
    { id: 'parking', label: 'Estacionamento', icon: Car },
    { id: 'accessibility', label: 'Acessibilidade', icon: Accessibility },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'card', label: 'Aceita cartão', icon: CreditCard },
    { id: 'ac', label: 'Ambiente climatizado', icon: Fan },
    { id: 'kids', label: 'Atende crianças', icon: Baby },
    { id: 'pets', label: 'Pet friendly', icon: Dog },
];

export default function SettingsPage() {
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [publicLink, setPublicLink] = useState('');

    // === ESTADOS DO FORMULÁRIO ===
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [cep, setCep] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    
    // Configurações de Horário
    const [workingDays, setWorkingDays] = useState<string[]>(['seg', 'ter', 'qua', 'qui', 'sex', 'sab']);
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('18:00');
    
    // === PAUSA 1: ALMOÇO ===
    const [lunchBreak, setLunchBreak] = useState(false);
    const [lunchStart, setLunchStart] = useState('12:00');
    const [lunchEnd, setLunchEnd] = useState('13:00');
    const [lunchDays, setLunchDays] = useState<string[]>(['seg', 'ter', 'qua', 'qui', 'sex']);

    // === PAUSA 2: ESPECÍFICA (CAFEZINHO/OUTRA) ===
    const [extraBreak, setExtraBreak] = useState(false);
    const [extraBreakStart, setExtraBreakStart] = useState('16:00');
    const [extraBreakEnd, setExtraBreakEnd] = useState('16:15');
    const [extraBreakDays, setExtraBreakDays] = useState<string[]>(['seg', 'ter', 'qua', 'qui', 'sex']);

const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [gallery, setGallery] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false); // <--- NOVO ESTADO

    // 1. Carregar Dados
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const origin = window.location.origin;
                setPublicLink(`${origin}/agendar/${currentUser.uid}`);

                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setBusinessName(data.businessName || '');
                        setPhone(data.phone || '');
                        setCep(data.cep || '');
                        setAddress(data.address || '');
                        setDescription(data.description || '');
                        
                        if (data.workingDays) setWorkingDays(data.workingDays);
                        if (data.openTime) setOpenTime(data.openTime);
                        if (data.closeTime) setCloseTime(data.closeTime);
                        if (data.amenities) setSelectedAmenities(data.amenities);
                        if (data.gallery) setGallery(data.gallery);
                        
                        // Carrega Almoço
                        if (data.lunchBreak !== undefined) setLunchBreak(data.lunchBreak);
                        if (data.lunchStart) setLunchStart(data.lunchStart);
                        if (data.lunchEnd) setLunchEnd(data.lunchEnd);
                        if (data.lunchDays) setLunchDays(data.lunchDays);

                        // Carrega Pausa Extra
                        if (data.extraBreak !== undefined) setExtraBreak(data.extraBreak);
                        if (data.extraBreakStart) setExtraBreakStart(data.extraBreakStart);
                        if (data.extraBreakEnd) setExtraBreakEnd(data.extraBreakEnd);
                        if (data.extraBreakDays) setExtraBreakDays(data.extraBreakDays);
                    }
                } catch (error) {
                    console.error("Erro ao carregar:", error);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- FUNÇÕES AUXILIARES ---
    const toggleArrayItem = (item: string, list: string[], setList: any) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    // === NOVA FUNÇÃO DE UPLOAD ===
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!user) return;

        setUploading(true);

        try {
            // 1. Cria o caminho no Storage
            const storageRef = ref(storage, `galeria/${user.uid}/${Date.now()}-${file.name}`);
            
            // 2. Sobe a imagem
            await uploadBytes(storageRef, file);
            
            // 3. Pega o link
            const downloadURL = await getDownloadURL(storageRef);

            // 4. Atualiza a lista local (O usuário vai clicar em "Salvar Alterações" depois para gravar no banco)
            setGallery(prev => [...prev, downloadURL]);
            
            toast({ title: "Imagem carregada!", description: "Clique em Salvar Alterações para confirmar." });

        } catch (error) {
            console.error("Erro no upload:", error);
            toast({ variant: "destructive", title: "Erro ao enviar imagem" });
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePhoto = (idx: number) => {
        setGallery(gallery.filter((_, i) => i !== idx));
    };

    // 2. Salvar Tudo
    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const docRef = doc(db, "users", user.uid);
            
            // LÓGICA DE FORMATAÇÃO INTELIGENTE (Para exibir na página pública)
            const hoursFormatted = daysOfWeekData.map(day => {
                if (!workingDays.includes(day.id)) return { day: day.name, time: 'Fechado' };

                let timeStr = `${openTime} - ${closeTime}`;
                let pauses = [];

                if (lunchBreak && lunchDays.includes(day.id)) {
                    pauses.push(`${lunchStart}-${lunchEnd}`);
                }
                if (extraBreak && extraBreakDays.includes(day.id)) {
                    pauses.push(`${extraBreakStart}-${extraBreakEnd}`);
                }

                if (pauses.length > 0) {
                    timeStr += ` (Pausas: ${pauses.join(', ')})`;
                }
                
                return { day: day.name, time: timeStr };
            });

            await setDoc(docRef, {
                businessName, phone, cep, address, description,
                workingDays, openTime, closeTime,
                
                // Salva Pausa 1 (Almoço)
                lunchBreak, lunchStart, lunchEnd, lunchDays,
                
                // Salva Pausa 2 (Extra)
                extraBreak, extraBreakStart, extraBreakEnd, extraBreakDays,

                amenities: selectedAmenities,
                gallery, // Salva o array atualizado com as novas fotos
                hours: hoursFormatted,
                updatedAt: new Date(),
                email: user.email 
            }, { merge: true });

            toast({ title: "Configurações salvas com sucesso!" });
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast({ variant: "destructive", title: "Erro ao salvar" });
        } finally {
            setSaving(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicLink);
        toast({ title: "Link copiado!" });
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <header className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground">Gerencie as informações do seu negócio.</p>
                </div>
            </header>

            <main className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* INFO BÁSICA */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Negócio</CardTitle>
                            <CardDescription>Dados visíveis para o cliente.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                                        <span className="text-3xl font-bold">{businessName ? businessName.charAt(0).toUpperCase() : 'B'}</span>
                                    </div>
                                    <Button variant="outline" size="sm" disabled className="text-xs h-8">Logo (Em breve)</Button>
                                </div>
                                <div className="w-full space-y-2">
                                    <Label>Nome do negócio</Label>
                                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Telefone (WhatsApp)</Label>
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>CEP</Label>
                                    <Input value={cep} onChange={(e) => setCep(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Endereço</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* GALERIA */}
{/* GALERIA */}
                    <Card>
                        <CardHeader><CardTitle>Galeria de Fotos</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            
                            {/* --- MUDANÇA AQUI: BOTÃO DE UPLOAD --- */}
                            <div className="flex gap-2">
                                <label className={`flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    {uploading ? "Enviando..." : "Adicionar Foto"}
                                </label>
                            </div>
                            {/* ------------------------------------- */}

                            {gallery.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {gallery.map((url, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                                            <img src={url} alt="Galeria" className="w-full h-full object-cover" />
                                            <button onClick={() => handleRemovePhoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* HORÁRIOS & PAUSAS (ATUALIZADO) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Horário de Funcionamento</CardTitle>
                            <CardDescription>Defina seu expediente e intervalos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            
                            {/* 1. EXPEDIENTE GERAL */}
                            <div className="space-y-4 pb-6 border-b">
                                <Label className="text-base font-semibold">Expediente Geral</Label>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Dias de trabalho</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOfWeekData.map(day => (
                                            <Button 
                                                key={day.id} 
                                                variant="outline" 
                                                onClick={() => toggleArrayItem(day.id, workingDays, setWorkingDays)}
                                                className={`w-10 h-10 p-0 ${workingDays.includes(day.id) ? 'bg-primary text-primary-foreground' : ''}`}
                                            >
                                                {day.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Abertura</Label><Input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Fechamento</Label><Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} /></div>
                                </div>
                            </div>

                            {/* 2. INTERVALO DE ALMOÇO */}
                            <div className="space-y-4 pb-6 border-b">
                                <div className="flex items-center gap-2">
                                    <Checkbox id="lunch" checked={lunchBreak} onCheckedChange={(c) => setLunchBreak(c as boolean)} />
                                    <Label htmlFor="lunch" className="flex items-center gap-2 font-medium cursor-pointer">
                                        <Utensils className="w-4 h-4 text-orange-500"/> Intervalo de Almoço
                                    </Label>
                                </div>

                                {lunchBreak && (
                                    <div className="pl-6 space-y-4 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1"><Label>Início</Label><Input type="time" value={lunchStart} onChange={(e) => setLunchStart(e.target.value)} /></div>
                                            <div className="space-y-1"><Label>Fim</Label><Input type="time" value={lunchEnd} onChange={(e) => setLunchEnd(e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs flex gap-2 items-center"><CalendarClock className="w-3 h-3"/> Aplicar almoço nestes dias:</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {daysOfWeekData.map(day => {
                                                    if(!workingDays.includes(day.id)) return null;
                                                    return (
                                                        <Button key={day.id} size="sm" variant="outline" onClick={() => toggleArrayItem(day.id, lunchDays, setLunchDays)} 
                                                            className={`w-8 h-8 p-0 text-xs ${lunchDays.includes(day.id) ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30' : 'text-muted-foreground'}`}>
                                                            {day.label}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. PAUSA ESPECÍFICA */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox id="extra" checked={extraBreak} onCheckedChange={(c) => setExtraBreak(c as boolean)} />
                                    <Label htmlFor="extra" className="flex items-center gap-2 font-medium cursor-pointer">
                                        <Coffee className="w-4 h-4 text-blue-500"/> Pausa Específica (Café/Lanche)
                                    </Label>
                                </div>

                                {extraBreak && (
                                    <div className="pl-6 space-y-4 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1"><Label>Início</Label><Input type="time" value={extraBreakStart} onChange={(e) => setExtraBreakStart(e.target.value)} /></div>
                                            <div className="space-y-1"><Label>Fim</Label><Input type="time" value={extraBreakEnd} onChange={(e) => setExtraBreakEnd(e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs flex gap-2 items-center"><CalendarClock className="w-3 h-3"/> Aplicar pausa nestes dias:</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {daysOfWeekData.map(day => {
                                                    if(!workingDays.includes(day.id)) return null;
                                                    return (
                                                        <Button key={day.id} size="sm" variant="outline" onClick={() => toggleArrayItem(day.id, extraBreakDays, setExtraBreakDays)} 
                                                            className={`w-8 h-8 p-0 text-xs ${extraBreakDays.includes(day.id) ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30' : 'text-muted-foreground'}`}>
                                                            {day.label}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </CardContent>
                    </Card>

                    {/* COMODIDADES */}
                    <Card>
                        <CardHeader><CardTitle>Comodidades</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {amenitiesList.map(amenity => (
                                <div key={amenity.id} className="flex items-center gap-3 rounded-lg border p-3">
                                    <amenity.icon className="h-5 w-5 text-primary" />
                                    <Label htmlFor={amenity.id} className="flex-1 text-sm font-normal cursor-pointer">{amenity.label}</Label>
                                    <Checkbox id={amenity.id} checked={selectedAmenities.includes(amenity.id)} onCheckedChange={() => toggleArrayItem(amenity.id, selectedAmenities, setSelectedAmenities)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center"><Label>Tema</Label><ThemeToggle /></div>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/50 bg-primary/5">
                        <CardHeader><CardTitle>Link Público</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input readOnly value={publicLink} className="bg-background" />
                            <div className="flex gap-2">
                                <Button variant="outline" className="w-full" onClick={handleCopyLink}><Copy className="mr-2 h-4 w-4" /> Copiar</Button>
                                <Button asChild className="w-full" variant="secondary"><Link href={publicLink} target="_blank"><Eye className="mr-2 h-4 w-4" /> Visualizar</Link></Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <footer className="flex justify-end mt-4">
                <Button size="lg" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </footer>
        </div>
    );
}