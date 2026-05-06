import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    User,
    Palette,
    CreditCard,
    Users,
    Save,
    Globe,
    Shield,
    Link as LinkIcon,
    Plus,
    Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner"; // If they use sonner
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [language, setLanguage] = useState("fr");
    const [paymentEnv, setPaymentEnv] = useState(() => localStorage.getItem("paymentEnv") || "test");

    // Admin states
    const [admins, setAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    React.useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const data = await apiFetch("/admin/admins");
            if (Array.isArray(data)) {
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to load admins:", error);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingAdmin(true);
        try {
            await apiFetch("/admin/admins", {
                method: "POST",
                body: JSON.stringify(newAdmin)
            });
            setIsAddAdminOpen(false);
            setNewAdmin({ name: "", email: "", password: "" });
            fetchAdmins();
            toast?.success("Administrateur créé avec succès");
        } catch (error) {
            console.error("Failed to create admin:", error);
            toast?.error("Erreur lors de la création de l'administrateur");
        } finally {
            setCreatingAdmin(false);
        }
    };

    const handleEnvChange = (val: string) => {
        setPaymentEnv(val);
        localStorage.setItem("paymentEnv", val);
        toast?.("Environnement défini sur " + val); // Optional if toast is imported, I will just omit if it's not and only do state change
    };

    const handleSaveLangue = () => {
        alert("Langue sauvegardée");
    };

    return (
        <div className="flex-col md:flex space-y-6 max-w-5xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
                <p className="text-muted-foreground">
                    Gérez les paramètres de votre compte, l'apparence et les configurations de l'application.
                </p>
            </div>

            <Tabs defaultValue="appearance" className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-3/4">
                    <TabsTrigger value="profile" className="space-x-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Profil</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="space-x-2">
                        <Palette className="w-4 h-4" />
                        <span className="hidden sm:inline">Apparence & Langue</span>
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="hidden sm:inline">Paiements</span>
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="space-x-2">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Administrateurs</span>
                    </TabsTrigger>
                </TabsList>

                {/* PROFIL Administrateur */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Administrateur</CardTitle>
                            <CardDescription>
                                Mettez à jour vos informations personnelles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input id="name" defaultValue="Gérard" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="admin@alimobile.com" />
                            </div>
                            <Button>
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* APPARENCE ET LANGUE */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apparence & Langues</CardTitle>
                            <CardDescription>
                                Personnalisez le thème de l'application et la langue par défaut.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium leading-none">Thème Sombre</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Basculer entre le mode clair et sombre.
                                    </p>
                                </div>
                                <Switch
                                    checked={theme === "dark"}
                                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Langue de l'application</Label>
                                    <Select value={language} onValueChange={setLanguage}>
                                        <SelectTrigger id="language">
                                            <div className="flex items-center">
                                                <Globe className="w-4 h-4 mr-2" />
                                                <SelectValue placeholder="Sélectionnez une langue" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fr">Français</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleSaveLangue} variant="secondary">
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer la langue
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PAIEMENTS URL */}
                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration des Paiements (API)</CardTitle>
                            <CardDescription>
                                Gérez les URLs d'API pour les paiements réels (SerdiPay) et Test. Le chatbot utilise l'environnement actif.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/50">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium leading-none">Environnement Actif</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Choisissez quel environnement (Test ou Live) est utilisé par défaut.
                                        </p>
                                    </div>
                                    <Select value={paymentEnv} onValueChange={handleEnvChange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Environnement" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="test">Test (Sandbox)</SelectItem>
                                            <SelectItem value="live">Live (Production)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ADMINISTRATEURS */}
                <TabsContent value="admins" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gestion des Administrateurs</CardTitle>
                                <CardDescription>
                                    Afficher et créer de nouveaux accès administrateurs.
                                </CardDescription>
                            </div>
                            <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Ajouter Admin
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Ajouter un Administrateur</DialogTitle>
                                        <DialogDescription>
                                            Créez un nouveau compte administrateur.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-name">Nom</Label>
                                            <Input
                                                id="admin-name"
                                                required
                                                value={newAdmin.name}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-email">Email</Label>
                                            <Input
                                                id="admin-email"
                                                type="email"
                                                required
                                                value={newAdmin.email}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-password">Mot de passe</Label>
                                            <Input
                                                id="admin-password"
                                                type="password"
                                                required
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={creatingAdmin}>
                                                {creatingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                Créer
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {loadingAdmins ? (
                                    <div className="p-8 flex justify-center items-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : admins.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        Aucun administrateur trouvé.
                                    </div>
                                ) : (
                                    admins.map((admin, index) => (
                                        <div key={admin.id} className={`p-4 flex items-center justify-between ${index !== admins.length - 1 ? 'border-b' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                                                    {admin.name ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{admin.name || "N/A"}</p>
                                                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs font-semibold bg-slate-500/10 text-slate-500 px-2 py-1 rounded-full">
                                                Admin
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
