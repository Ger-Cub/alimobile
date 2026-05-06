import React, { useState, useRef, useEffect } from "react";
import { X, Send, ChevronDown, CheckCircle2, Loader2, Bot, Maximize2, Minimize2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

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
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

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
            // For Voda-E, ask the amount before the operator
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
            // Stop spinner on "Initialisation..." message, then add the next message
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
                    // ignore transient errors
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

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform z-50"
            >
                <Bot className="w-6 h-6 text-white" />
            </button>
        );
    }

    return (
        <div className={cn(
            "fixed bg-background text-foreground border border-border shadow-2xl overflow-hidden flex flex-col z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300 transition-all",
            isFullscreen
                ? "inset-0 w-full h-full rounded-none"
                : "bottom-0 right-0 w-full h-[600px] sm:bottom-6 sm:right-6 sm:w-[340px] sm:max-w-[calc(100vw-24px)] md:h-[540px] sm:rounded-2xl"
        )}>
            {/* Header */}
            <div className="relative flex items-center gap-3 p-4 border-b border-border bg-card">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600" />
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-sm">Ali Mobile AI</p>
                    <p className="text-xs text-green-500">En ligne</p>
                </div>
                <button
                    onClick={() => setMessages([INITIAL_MSG])}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground mr-1"
                    title="Réinitialiser"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hidden sm:block mr-1"
                    title={isFullscreen ? "Réduire" : "Plein écran"}
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground"
                    title="Fermer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                <div className="flex justify-center">
                    <span className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" /> Service Officiel Ali Mobile
                    </span>
                </div>

                {messages.map((msg, i) => (
                    <div
                        key={msg.id}
                        className={cn("flex", msg.role === "assistant" ? "justify-start" : "justify-end")}
                    >
                        <div
                            className={cn(
                                "max-w-[85%] rounded-2xl px-3 py-2.5 text-sm",
                                msg.role === "assistant"
                                    ? "bg-muted border border-border text-foreground"
                                    : "bg-red-600 text-white"
                            )}
                        >
                            {msg.text && (
                                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                            )}
                            {msg.isLoading && (
                                <div className="flex items-center gap-2 mt-1 text-muted-foreground text-xs">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Traitement...
                                </div>
                            )}
                            {msg.role === "assistant" && msg.options && i === messages.length - 1 && (
                                <div className="mt-2.5 flex flex-col gap-1.5">
                                    {msg.options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleOption(msg.action || "select_service", opt)}
                                            className="w-full text-left px-3 py-2 text-xs rounded-xl bg-background border border-border hover:border-red-600 hover:text-red-600 transition-all flex justify-between items-center"
                                        >
                                            <span className="font-medium">{opt.label}</span>
                                            {opt.price !== undefined && (
                                                <span className="text-muted-foreground">${opt.price}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            {lastMsg?.role === "assistant" && lastMsg.isInput && (
                <div className="p-3 border-t border-border bg-card">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleInput(lastMsg.action || "", inputValue);
                        }}
                        className="flex gap-2"
                    >
                        <input
                            type={lastMsg.inputType || "text"}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={lastMsg.inputPlaceholder || "Écrivez ici..."}
                            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/40 text-foreground placeholder:text-muted-foreground"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-2 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
