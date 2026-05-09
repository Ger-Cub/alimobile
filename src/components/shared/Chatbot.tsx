import React, { useState, useRef, useEffect } from "react";
import { X, Send, ChevronDown, CheckCircle2, Loader2, Bot, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    id: string;
    role: "assistant" | "user";
    text?: string;
    options?: { label: string; value: string; price?: number }[];
    isInput?: boolean;
    inputType?: "text" | "number";
    inputPlaceholder?: string;
    action?: string;
    isLoading?: boolean;
};

const CANAL_BOUQUETS: Record<string, { label: string; value: string; price: number }[]> = {
    RDC: [
        { label: "Access", value: "Access", price: 10 },
        { label: "Evasion", value: "Evasion", price: 20 },
        { label: "Access+", value: "Access+", price: 27 },
        { label: "Tout Canal", value: "Tout Canal", price: 50 },
        { label: "DSTV", value: "DSTV", price: 10 },
        { label: "Evasion + DSTV", value: "Evasion + DSTV", price: 30 },
        { label: "Access+ + DSTV", value: "Access+ + DSTV", price: 31 },
        { label: "Réactivation", value: "Réactivation", price: 0 },
    ],
    Burundi: [
        { label: "Access", value: "Access", price: 7 },
        { label: "Evasion", value: "Evasion", price: 13 },
        { label: "Access+", value: "Access+", price: 18 },
        { label: "Tout Canal", value: "Tout Canal", price: 30 },
        { label: "DSTV", value: "DSTV", price: 6 },
        { label: "Evasion + DSTV", value: "Evasion + DSTV", price: 19 },
        { label: "Access+ + DSTV", value: "Access+ + DSTV", price: 23 },
        { label: "Réactivation", value: "Réactivation", price: 0 },
    ],
    Rwanda: [
        { label: "Access", value: "Access", price: 4.8 },
        { label: "Evasion", value: "Evasion", price: 7.8 },
        { label: "Access+", value: "Access+", price: 14.8 },
        { label: "Tout Canal", value: "Tout Canal", price: 26 },
        { label: "DSTV", value: "DSTV", price: 4 },
        { label: "Evasion + DSTV", value: "Evasion + DSTV", price: 17 },
        { label: "Access+ + DSTV", value: "Access+ + DSTV", price: 23 },
        { label: "Réactivation", value: "Réactivation", price: 0 },
    ],
};

const INITIAL_MSG: Message = {
    id: "m1",
    role: "assistant",
    text: "Bienvenue sur le service Ali Mobile 👇",
    options: [
        { label: "Canal+", value: "canal+" },
        { label: "Voda-E", value: "vodae" },
    ],
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
    const [inputValue, setInputValue] = useState("");
    const [state, setState] = useState({
        service: "",
        country: "",
        packageName: "",
        amount: 0,
        decoderNumber: "",
        telecom: "",
        customerPhone: "",
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isFullscreen]);

    const addMsg = (message: Omit<Message, "id">) =>
        setMessages((prev) => [
            ...prev,
            { ...message, id: Math.random().toString(36).slice(2) },
        ]);

    const resetAll = () => {
        setState({
            service: "",
            country: "",
            packageName: "",
            amount: 0,
            decoderNumber: "",
            telecom: "",
            customerPhone: "",
        });
        setMessages([INITIAL_MSG]);
    };

    const handleOption = (
        action: string,
        opt: { label: string; value: string; price?: number }
    ) => {
        addMsg({ role: "user", text: opt.label });
        const ns = { ...state };
        let next: Omit<Message, "id"> | null = null;

        if (action === "select_service") {
            ns.service = opt.label;
            if (opt.value === "canal+") {
                next = {
                    role: "assistant",
                    text: "Sélectionnez votre pays 👇",
                    options: [
                        { label: "RDC 🇨🇩", value: "RDC" },
                        { label: "Burundi 🇧🇮", value: "Burundi" },
                        { label: "Rwanda 🇷🇼", value: "Rwanda" },
                    ],
                    action: "select_country",
                };
            } else {
                next = {
                    role: "assistant",
                    text: "Sélectionnez une option 👇",
                    options: [
                        { label: "Création de compte Voda-E", value: "creation" },
                        { label: "Commande Voda-E", value: "commande" },
                    ],
                    action: "select_vodae_type",
                };
            }
        } else if (action === "select_country") {
            ns.country = opt.value;
            next = {
                role: "assistant",
                text: `Choisissez votre bouquet en ${opt.label} 👇`,
                options: CANAL_BOUQUETS[opt.value] || [],
                action: "select_package",
            };
        } else if (action === "select_package") {
            ns.packageName = opt.value;
            ns.amount = opt.price || 0;
            next = {
                role: "assistant",
                text: "Saisir le numéro du compte/décodeur",
                isInput: true,
                inputType: "text",
                inputPlaceholder: "N° compte/décodeur",
                action: "input_decoder",
            };
        } else if (action === "select_vodae_type") {
            if (opt.value === "commande") {
                next = {
                    role: "assistant",
                    text: "Saisir le numéro de compte Voda-E",
                    isInput: true,
                    inputType: "text",
                    inputPlaceholder: "N° compte Voda-E",
                    action: "input_decoder",
                };
            } else {
                next = {
                    role: "assistant",
                    text: "Non disponible via Web pour l'instant. Retour au menu.",
                    options: [{ label: "Menu Principal", value: "menu" }],
                    action: "reset",
                };
            }
        } else if (action === "select_telecom") {
            ns.telecom = opt.value;
            next = {
                role: "assistant",
                text: `📱 Saisissez votre numéro ${opt.label} au format international\n\nFormat : indicatif pays + numéro (sans le 0 initial)\n✅ Exemple M-Pesa RDC : 243812345678\n✅ Exemple Airtel RDC : 243991234567\n\n⚠️ Ce numéro sera débité de ${ns.amount}$\n⚠️ Le numéro doit appartenir à ${opt.label}`,
                isInput: true,
                inputType: "text",
                inputPlaceholder: "ex: 243812345678",
                action: "input_phone",
            };
        } else if (action === "confirm_payment") {
            if (opt.value === "confirm") {
                doPayment(ns);
                setState(ns);
                return;
            } else {
                resetAll();
                return;
            }
        } else if (action === "reset") {
            resetAll();
            return;
        }

        setState(ns);
        if (next) setTimeout(() => addMsg(next as Omit<Message, "id">), 400);
    };

    const handleInput = (action: string, value: string) => {
        if (!value.trim()) return;
        addMsg({ role: "user", text: value });
        setInputValue("");
        const ns = { ...state };
        let next: Omit<Message, "id"> | null = null;

        if (action === "input_decoder") {
            ns.decoderNumber = value;
            if (ns.service === "Voda-E") {
                next = {
                    role: "assistant",
                    text: "Saisir le montant à recharger en USD 👇\n\n(Minimum : 5 USD)",
                    isInput: true,
                    inputType: "number",
                    inputPlaceholder: "Montant en USD (ex: 10)",
                    action: "input_amount",
                };
            } else {
                next = {
                    role: "assistant",
                    text: "Choisissez un opérateur 👇",
                    options: [
                        { label: "M-Pesa / Vodacom", value: "MP" },
                        { label: "Airtel Money", value: "AM" },
                        { label: "Orange Money", value: "OM" },
                        { label: "Africell", value: "AF" },
                    ],
                    action: "select_telecom",
                };
            }
        } else if (action === "input_amount") {
            const parsed = parseFloat(value);
            if (isNaN(parsed) || parsed < 5) {
                setTimeout(() => addMsg({
                    role: "assistant",
                    text: "Montant invalide. Le minimum est 5 USD. Veuillez réessayer.",
                    isInput: true,
                    inputType: "number",
                    inputPlaceholder: "Montant en USD (min: 5)",
                    action: "input_amount",
                }), 400);
                setState(ns);
                return;
            }
            ns.amount = parsed;
            next = {
                role: "assistant",
                text: "Choisissez un opérateur 👇",
                options: [
                    { label: "M-Pesa / Vodacom", value: "MP" },
                    { label: "Airtel Money", value: "AM" },
                    { label: "Orange Money", value: "OM" },
                    { label: "Africell", value: "AF" },
                ],
                action: "select_telecom",
            };
        } else if (action === "input_phone") {
            ns.customerPhone = value;
            next = {
                role: "assistant",
                text: `Confirmez 👇\n\nService: ${ns.service}\nPaquet: ${ns.packageName || "Recharge"}\nMontant: ${ns.amount} USD\nCompte: ${ns.decoderNumber}\nTél: ${ns.customerPhone}`,
                options: [
                    { label: "✅ Confirmer", value: "confirm" },
                    { label: "❌ Annuler", value: "cancel" },
                ],
                action: "confirm_payment",
            };
        }

        setState(ns);
        if (next) setTimeout(() => addMsg(next as Omit<Message, "id">), 400);
    };

    const doPayment = async (cs: typeof state) => {
        addMsg({ role: "assistant", text: "Initialisation du paiement...", isLoading: true });
        try {
            const paymentEnv = localStorage.getItem("paymentEnv") || "test";
            const endpoint = paymentEnv === "live" ? "/payment/initiate" : "/payment/initiate-test";

            const res = await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify({
                    customerPhone: cs.customerPhone,
                    customerName: "Client Web",
                    chatId: "Web-" + Math.random().toString(36).slice(2),
                    platform: "Web",
                    decoderNumber: cs.decoderNumber,
                    amount: cs.amount,
                    telecom: cs.telecom,
                    service: cs.service,
                    country: cs.country,
                    packageName: cs.packageName,
                }),
            });

            const transactionId = res.transactionId;
            setMessages((prev) => [
                ...prev.map((m) => ({ ...m, isLoading: false })),
                {
                    id: Math.random().toString(36).slice(2),
                    role: "assistant" as const,
                    text: "Transaction en cours... Autorisez le paiement sur votre mobile. Ce chatbot se mettra à jour automatiquement.",
                },
            ]);

            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                if (attempts > 40) {
                    clearInterval(poll);
                    addMsg({
                        role: "assistant",
                        text: "Timeout. Vérifiez votre transaction.",
                        options: [{ label: "Menu Principal", value: "menu" }],
                        action: "reset",
                    });
                    return;
                }
                try {
                    const s = await apiFetch(`/payment/status/${transactionId}`);
                    if (s.status === "PAID" || s.status === "ACTIVATED") {
                        clearInterval(poll);
                        addMsg({
                            role: "assistant",
                            text: `✅ Paiement confirmé !\n\nVotre compte/décodeur ${cs.decoderNumber} a été validé.`,
                            options: [{ label: "Menu Principal", value: "menu" }],
                            action: "reset",
                        });
                    } else if (s.status === "FAILED") {
                        clearInterval(poll);
                        addMsg({
                            role: "assistant",
                            text: "❌ Paiement échoué. Vérifiez vos fonds.",
                            options: [{ label: "Menu Principal", value: "menu" }],
                            action: "reset",
                        });
                    }
                } catch (_) {
                }
            }, 3000);
        } catch (_) {
            addMsg({
                role: "assistant",
                text: "Désolé, une erreur technique est survenue lors de votre demande de paiement. Veuillez réessayer ultérieurement.",
                options: [{ label: "Menu Principal", value: "menu" }],
                action: "reset",
            });
        }
    };

    const lastMsg = messages[messages.length - 1];

    return (
        <div className={cn(
            "fixed bottom-0 right-0 z-[100] flex items-end justify-end pointer-events-none transition-all duration-200",
            isOpen && isMobile ? "p-0 inset-0" : "p-6"
        )}>
            <AnimatePresence mode="wait">
                {!isOpen ? (
                    <motion.button
                        key="launcher"
                        layoutId="chatbot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl pointer-events-auto relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-700 to-red-500 group-hover:scale-110 transition-transform duration-500" />
                        <Bot className="w-8 h-8 text-white relative z-10" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-red-400 rounded-full z-0"
                        />
                    </motion.button>
                ) : (
                    <motion.div
                        key="window"
                        layoutId="chatbot"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            width: (isFullscreen || isMobile) ? "100%" : 380,
                            height: (isFullscreen || isMobile) ? (isMobile ? "100%" : "calc(100vh - 48px)") : 580,
                            maxWidth: isFullscreen ? "600px" : (isMobile ? "100%" : "380px"),
                        }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ type: "spring", damping: 20, stiffness: 500 }}
                        className={cn(
                            "bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden flex flex-col pointer-events-auto",
                            (isFullscreen || isMobile) 
                                ? "rounded-none sm:rounded-3xl mx-auto mb-0" 
                                : "rounded-3xl sm:mb-2 sm:mr-2"
                        )}
                    >
                        {/* Header */}
                        <div className="relative flex items-center gap-3 p-5 border-b border-border/50 bg-card/50 shrink-0">
                            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20 rotate-3">
                                    <Bot className="w-6 h-6 text-white -rotate-3" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-base tracking-tight">Ali Mobile</p>
                                    <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
                                </div>
                                <p className="text-[10px] font-semibold text-green-500 uppercase tracking-widest">Assistant Intelligent</p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setMessages([INITIAL_MSG])}
                                    className="p-2 rounded-xl hover:bg-muted/80 transition-all text-muted-foreground"
                                    title="Réinitialiser"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {!isMobile && (
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="p-2 rounded-xl hover:bg-muted/80 transition-all text-muted-foreground hidden sm:block"
                                        title={isFullscreen ? "Réduire" : "Plein écran"}
                                    >
                                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all text-muted-foreground"
                                    title="Fermer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth" ref={scrollRef}>
                            <div className="flex justify-center pb-2">
                                <span className="text-[10px] bg-red-500/5 text-red-600 dark:text-red-400 border border-red-500/10 px-4 py-1.5 rounded-full flex items-center gap-2 font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-3 h-3" /> Service Officiel Ali Mobile
                                </span>
                            </div>

                            <AnimatePresence initial={false}>
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2, delay: i === messages.length - 1 ? 0.05 : 0 }}
                                        className={cn("flex", msg.role === "assistant" ? "justify-start" : "justify-end")}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[88%] px-4 py-3 text-sm shadow-sm",
                                                msg.role === "assistant"
                                                    ? "bg-card border border-border/50 text-foreground rounded-2xl rounded-tl-none"
                                                    : "bg-red-600 text-white rounded-2xl rounded-tr-none shadow-red-600/10"
                                            )}
                                        >
                                            {msg.text && (
                                                <p className="whitespace-pre-line leading-relaxed font-medium">{msg.text}</p>
                                            )}
                                            {msg.isLoading && (
                                                <div className="flex items-center gap-3 mt-2 text-muted-foreground text-[11px] font-bold uppercase tracking-tight">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> Initialisation...
                                                </div>
                                            )}
                                            
                                            {msg.role === "assistant" && msg.options && i === messages.length - 1 && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="mt-4 flex flex-col gap-2"
                                                >
                                                    {msg.options.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleOption(msg.action || "select_service", opt)}
                                                            className="w-full text-left px-4 py-3 text-xs rounded-xl bg-background/50 border border-border hover:border-red-600 hover:bg-red-600/5 hover:text-red-600 transition-all flex justify-between items-center group"
                                                        >
                                                            <span className="font-bold">{opt.label}</span>
                                                            <div className="flex items-center gap-2">
                                                                {opt.price !== undefined && (
                                                                    <span className="text-muted-foreground font-semibold">${opt.price}</span>
                                                                )}
                                                                <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <AnimatePresence>
                            {lastMsg?.role === "assistant" && lastMsg.isInput && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="p-5 border-t border-border/50 bg-card/80 backdrop-blur-md shrink-0"
                                >
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleInput(lastMsg.action || "", inputValue);
                                        }}
                                        className="flex gap-3"
                                    >
                                        <input
                                            type={lastMsg.inputType || "text"}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={lastMsg.inputPlaceholder || "Écrivez ici..."}
                                            className="flex-1 bg-background border border-border/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/50 text-foreground placeholder:text-muted-foreground transition-all shadow-inner"
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputValue.trim()}
                                            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-5 py-3 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20 active:scale-95"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
