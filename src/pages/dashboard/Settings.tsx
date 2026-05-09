import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
    Plus,
    Loader2,
    Sun,
    Moon,
    Monitor
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { user, updateProfile } = useAuth();
    const [language, setLanguage] = useState("fr");
    const [paymentEnv, setPaymentEnv] = useState(() => localStorage.getItem("paymentEnv") || "test");

    // Profile states
    const [profileName, setProfileName] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileName(user.name || "");
        }
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await updateProfile(profileName);
            toast.success("Profil mis à jour avec succès");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Erreur lors de la mise à jour du profil");
        } finally {
            setSavingProfile(false);
        }
    };

    // Admin states
    const [admins, setAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    useEffect(() => {
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
            toast.success("Administrateur créé avec succès");
        } catch (error) {
            console.error("Failed to create admin:", error);
            toast.error("Erreur lors de la création de l'administrateur");
        } finally {
            setCreatingAdmin(false);
        }
    };

    const handleEnvChange = (val: string) => {
        setPaymentEnv(val);
        localStorage.setItem("paymentEnv", val);
        toast.success("Environnement défini sur " + val);
    };

    const handleSaveLangue = () => {
        toast.success("Langue sauvegardée");
    };

    const themeOptions = [
        { value: "light", label: "Clair", icon: Sun },
        { value: "dark", label: "Sombre", icon: Moon },
        { value: "system", label: "Système", icon: Monitor },
    ];

    return (
        <div className="flex-col md:flex space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Paramètres</h2>
                <p className="text-muted-foreground">
                    Gérez les paramètres de votre compte, l'apparence et les configurations de l'application.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <div className="w-full overflow-x-auto pb-1 custom-scrollbar">
                    <TabsList className="flex w-max min-w-full md:grid md:grid-cols-4 md:w-3/4 bg-muted p-1 rounded-xl">
                        <TabsTrigger value="profile" className="flex-1 space-x-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap px-4">
                            <User className="w-4 h-4" />
                            <span>Profil</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex-1 space-x-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap px-4">
                            <Palette className="w-4 h-4" />
                            <span>Apparence</span>
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex-1 space-x-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap px-4">
                            <CreditCard className="w-4 h-4" />
                            <span>Paiements</span>
                        </TabsTrigger>
                        <TabsTrigger value="admins" className="flex-1 space-x-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap px-4">
                            <Users className="w-4 h-4" />
                            <span>Admins</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* PROFIL Administrateur */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground">Profil Administrateur</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Mettez à jour vos informations personnelles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-foreground">Nom complet</Label>
                                    <Input
                                        id="name"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="Votre nom"
                                        className="bg-background border-border focus-visible:ring-red-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-foreground">
                                        Email
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">(non modifiable)</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        value={user?.email || ""}
                                        readOnly
                                        disabled
                                        className="bg-muted border-border text-muted-foreground cursor-not-allowed opacity-70"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                                >
                                    {savingProfile
                                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        : <Save className="w-4 h-4 mr-2" />
                                    }
                                    Enregistrer
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* APPARENCE ET LANGUE */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground">Apparence & Langues</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Personnalisez le thème de l'application et la langue par défaut.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Theme Section */}
                            <div className="space-y-4 border-b border-border pb-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-foreground">Thème de l'application</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Ce thème s'applique à toutes les pages du tableau de bord.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {themeOptions.map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => setTheme(value)}
                                            className={cn(
                                                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                                                theme === value
                                                    ? "border-red-600 bg-red-600/5 text-red-500 shadow-inner"
                                                    : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:bg-muted/50"
                                            )}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-xs font-medium">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language Section */}
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="language" className="text-foreground">Langue de l'application</Label>
                                    <Select value={language} onValueChange={setLanguage}>
                                        <SelectTrigger id="language" className="bg-background border-border text-foreground focus:ring-red-600">
                                            <div className="flex items-center">
                                                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <SelectValue placeholder="Sélectionnez une langue" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            <SelectItem value="fr">Français</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleSaveLangue} variant="secondary" className="bg-muted text-foreground hover:bg-muted/80 border-0">
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer la langue
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PAIEMENTS URL */}
                <TabsContent value="payments" className="space-y-4">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground">Configuration des Paiements</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Gérez les environnements de paiement pour le chatbot et le tableau de bord.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border border-border p-4 rounded-xl bg-muted/20">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium leading-none text-foreground">Environnement Actif</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Passez du mode Test au mode Live.
                                        </p>
                                    </div>
                                    <Select value={paymentEnv} onValueChange={handleEnvChange}>
                                        <SelectTrigger className="w-[180px] bg-background border-border text-foreground focus:ring-red-600">
                                            <SelectValue placeholder="Environnement" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
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
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                            <div>
                                <CardTitle className="text-foreground">Gestion des Administrateurs</CardTitle>
                                <CardDescription className="text-muted-foreground mt-1">
                                    Afficher et créer de nouveaux accès administrateurs.
                                </CardDescription>
                            </div>
                            <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Ajouter
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-popover border-border text-popover-foreground">
                                    <DialogHeader>
                                        <DialogTitle>Ajouter un Administrateur</DialogTitle>
                                        <DialogDescription className="text-muted-foreground">
                                            Créez un nouveau compte administrateur.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-name" className="text-foreground">Nom</Label>
                                            <Input
                                                id="admin-name"
                                                required
                                                value={newAdmin.name}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                                className="bg-background border-border focus-visible:ring-red-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-email" className="text-foreground">Email</Label>
                                            <Input
                                                id="admin-email"
                                                type="email"
                                                required
                                                value={newAdmin.email}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                                className="bg-background border-border focus-visible:ring-red-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="admin-password" className="text-foreground">Mot de passe</Label>
                                            <Input
                                                id="admin-password"
                                                type="password"
                                                required
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                className="bg-background border-border focus-visible:ring-red-600"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={creatingAdmin} className="bg-red-600 hover:bg-red-700 text-white">
                                                {creatingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                Créer
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="rounded-xl border border-border bg-muted/10 overflow-hidden">
                                {loadingAdmins ? (
                                    <div className="p-8 flex justify-center items-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                                    </div>
                                ) : admins.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground italic">
                                        Aucun administrateur trouvé.
                                    </div>
                                ) : (
                                    admins.map((admin, index) => (
                                        <div key={admin.id} className={`p-4 flex items-center justify-between ${index !== admins.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/30 transition-colors`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center font-bold border border-red-600/20">
                                                    {admin.name ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{admin.name || "N/A"}</p>
                                                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs font-semibold bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
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
