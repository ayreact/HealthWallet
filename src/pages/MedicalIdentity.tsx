import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FileText, Shield, User as UserIcon, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { identityApi } from '@/services/api';
import type { User, MedicalRecord } from '@/types';
import { InlineLoader } from '@/components/common/HealthLoader';
import { format } from 'date-fns';

export const MedicalIdentity: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [user, setUser] = useState<User | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadIdentity = async () => {
            if (!userId || !token) {
                setError('Invalid link parameters');
                setIsLoading(false);
                return;
            }

            try {
                const data = await identityApi.getPublicProfile(userId, token);
                setUser(data.user);
                setRecords(data.records);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load identity');
            } finally {
                setIsLoading(false);
            }
        };

        loadIdentity();
    }, [userId, token]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <InlineLoader text="Verifying Identity..." />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
                    <Lock className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground max-w-md">
                    {error || 'This medical identity profile is not accessible or does not exist.'}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-6 pb-20">
            <div className="max-w-md mx-auto space-y-6">
                {/* ID Card Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Shield className="h-32 w-32" />
                    </div>

                    <div className="relative p-6 space-y-6">
                        <div className="flex items-center gap-2 text-primary-foreground/80">
                            <Shield className="h-5 w-5" />
                            <span className="font-semibold tracking-wide text-sm uppercase">Health Identity</span>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{user.fullName}</h1>
                            <p className="text-primary-foreground/80 font-medium">{user.role}</p>
                        </div>

                        <div className="pt-4 border-t border-primary-foreground/20 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                                    <UserIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-primary-foreground/60">Wallet Address</p>
                                    <p className="font-mono text-xs truncate opacity-90">{user.walletAddress}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-primary-foreground/60">Member Since</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(user.createdAt), 'MMMM yyyy')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Records */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Medical History
                        </h2>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {records.length} Records
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {records.map((record) => (
                            <Card key={record.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium truncate">{record.title}</h3>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(record.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{record.hospitalName}</p>

                                            {record.verified && (
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium">
                                                    <Shield className="h-3 w-3" />
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary Section */}
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-foreground/80">
                                        {record.summary}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {records.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No medical records found for this identity.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-muted-foreground">
                        Secured by HealthWallet Blockchain • {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};
