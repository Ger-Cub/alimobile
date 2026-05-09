import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Mail, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

const loginSchema = z.object({
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    rememberMe: z.boolean().default(false),
});

const forgotPasswordSchema = z.object({
    email: z.string().email("Veuillez entrer une adresse email valide"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { setTheme } = useTheme();

    // Enforce light theme on login page if preferred, but allow toggle
    useEffect(() => {
        const currentTheme = localStorage.getItem('theme');
        if (!currentTheme || currentTheme === 'system') {
            setTheme('light');
        }
    }, [setTheme]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const forgotPasswordForm = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success("Bienvenue, connexion réussie !");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Email ou mot de passe incorrect");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onForgotPasswordSubmit = async (data: ForgotPasswordValues) => {
        setForgotPasswordLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Lien de réinitialisation envoyé à " + data.email);
            forgotPasswordForm.reset();
            setForgotPasswordOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue");
            console.error("Forgot password error:", error);
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden transition-colors duration-500">
            {/* Theme Toggle & Back Button */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au site
                </Button>
                <ThemeToggle />
            </div>

            {/* Background Orbs and Gradients */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-10">
                <Card className="border-border/50 bg-card/50 backdrop-blur-2xl text-card-foreground shadow-2xl shadow-primary/5">
                    <CardHeader className="space-y-2 text-center pt-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/10 group hover:scale-110 transition-transform duration-300 border border-primary/10">
                                <img 
                                  src="/logo-alimobile.png" 
                                  alt="AliMobile Logo" 
                                  className="w-14 h-14 object-contain group-hover:rotate-6 transition-transform" 
                                />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            AliMobile Admin
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-base font-medium">
                            Accédez à votre tableau de bord sécurisé.
                        </CardDescription>
                    </CardHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <CardContent className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-foreground font-semibold">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        placeholder="admin@alimobile.com"
                                                        className="pl-10 bg-background/50 border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground h-11 transition-all hover:bg-background"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-foreground font-semibold">Mot de passe</FormLabel>
                                                <button
                                                    type="button"
                                                    onClick={() => setForgotPasswordOpen(true)}
                                                    className="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
                                                >
                                                    Oublié ?
                                                </button>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="pl-10 pr-10 bg-background/50 border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground h-11 transition-all hover:bg-background"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors group-focus-within:text-primary"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4.5 w-4.5" />
                                                        ) : (
                                                            <Eye className="h-4.5 w-4.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rememberMe"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 pt-1">
                                            <Checkbox
                                                id="rememberMe"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <Label htmlFor="rememberMe" className="text-sm font-semibold text-muted-foreground cursor-pointer">
                                                Se souvenir de moi
                                            </Label>
                                        </div>
                                    )}
                                />
                            </CardContent>

                            <CardFooter className="pb-8">
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold text-base transition-all duration-200 shadow-lg shadow-primary/20 border-none"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Authentification...
                                        </div>
                                    ) : (
                                        "Se connecter"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                <p className="mt-8 text-center text-muted-foreground text-sm font-medium">
                    Propulsé par <span className="text-foreground font-bold underline decoration-primary/30">AliMobile Dashboard</span>
                </p>
            </div>

            {/* Forgot Password Dialog */}
            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                <DialogContent className="border-border bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Réinitialiser le mot de passe</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...forgotPasswordForm}>
                        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                            <FormField
                                control={forgotPasswordForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-foreground font-bold">Adresse email</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    placeholder="admin@alimobile.com"
                                                    className="pl-10 bg-background/50 border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground h-11 transition-all"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setForgotPasswordOpen(false)}
                                    className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                    disabled={forgotPasswordLoading}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/10"
                                    disabled={forgotPasswordLoading}
                                >
                                    {forgotPasswordLoading ? (
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Envoi...
                                        </div>
                                    ) : (
                                        "Envoyer le lien"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}