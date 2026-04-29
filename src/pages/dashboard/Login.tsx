
import { useState } from "react";
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
import { Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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
            // Simuler l'appel API pour réinitialiser le mot de passe
            // À remplacer par un vrai appel API
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
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
            {/* Background Orbs and Gradients */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,0.8)_100%)] z-0" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-10">
                <Card className="border-white/5 bg-slate-900/40 backdrop-blur-2xl text-white shadow-2xl shadow-black/50">
                    <CardHeader className="space-y-2 text-center pt-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/20 group hover:scale-110 transition-transform duration-300">
                                <ShieldCheck className="w-8 h-8 text-white group-hover:rotate-6 transition-transform" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            AliMobile Admin
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base">
                            Ravi de vous revoir ! Connectez-vous à votre espace.
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
                                            <FormLabel className="text-slate-200 font-medium">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                                                    <Input
                                                        placeholder="admin@alimobile.com"
                                                        className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-red-500 focus:ring-red-500/20 text-white placeholder:text-slate-600 h-11 transition-all hover:bg-slate-800/80"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-slate-200 font-medium">Mot de passe</FormLabel>
                                                <button
                                                    type="button"
                                                    onClick={() => setForgotPasswordOpen(true)}
                                                    className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
                                                >
                                                    Oublié ?
                                                </button>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="pl-10 pr-10 bg-slate-800/50 border-slate-700/50 focus:border-red-500 focus:ring-red-500/20 text-white placeholder:text-slate-600 h-11 transition-all hover:bg-slate-800/80"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-400 transition-colors group-focus-within:text-red-500"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4.5 w-4.5" />
                                                        ) : (
                                                            <Eye className="h-4.5 w-4.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
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
                                                className="border-slate-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                            />
                                            <Label htmlFor="rememberMe" className="text-sm font-medium text-slate-400 cursor-pointer">
                                                Se souvenir de moi
                                            </Label>
                                        </div>
                                    )}
                                />
                            </CardContent>

                            <CardFooter className="pb-8">
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-base transition-all duration-200 shadow-lg shadow-red-600/20 border-none"
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

                <p className="mt-8 text-center text-slate-500 text-sm">
                    Propulsé par <span className="text-slate-300 font-semibold">AliMobile Dashboard</span>
                </p>
            </div>

            {/* Forgot Password Dialog */}
            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                <DialogContent className="border-white/10 bg-slate-900 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Réinitialiser le mot de passe</DialogTitle>
                        <DialogDescription className="text-slate-400">
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
                                        <FormLabel className="text-slate-200 font-medium">Adresse email</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                                                <Input
                                                    placeholder="admin@alimobile.com"
                                                    className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-red-500 focus:ring-red-500/20 text-white placeholder:text-slate-600 h-11 transition-all"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setForgotPasswordOpen(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                    disabled={forgotPasswordLoading}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
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
