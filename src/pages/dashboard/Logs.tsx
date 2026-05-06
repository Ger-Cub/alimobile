import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ServerCrash, AlertCircle, Info } from "lucide-react";

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/admin/logs");
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case "ERROR":
                return <Badge variant="destructive" className="flex gap-1 items-center"><ServerCrash className="w-3 h-3" /> ERROR</Badge>;
            case "WARN":
                return <Badge variant="secondary" className="bg-yellow-600 text-white hover:bg-yellow-700 flex gap-1 items-center"><AlertCircle className="w-3 h-3" /> WARN</Badge>;
            default:
                return <Badge variant="secondary" className="flex gap-1 items-center"><Info className="w-3 h-3" /> INFO</Badge>;
        }
    };

    return (
        <div className="flex-col md:flex space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Logs Système</h2>
                <p className="text-muted-foreground">
                    Supervisez les journaux d'erreurs d'API et les transactions en échec (SerdiPay, n8n, etc.).
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Journaux d'événements</CardTitle>
                    <CardDescription>
                        Dernières erreurs capturées par le backend.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Niveau</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>ID Transaction</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            Aucun log trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs whitespace-nowrap">
                                                {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>{getLevelBadge(log.level)}</TableCell>
                                            <TableCell className="font-mono text-xs">{log.source}</TableCell>
                                            <TableCell className="max-w-md truncate" title={log.message}>
                                                {log.message}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {log.transactionId || "N/A"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
