import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { RefreshCw, Download, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { identityApi } from '@/services/api';

export const ManageAccess: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [isResetting, setIsResetting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    // Fallback for demo users who might not have these fields yet
    const qrEnabled = user?.isQrEnabled ?? true;
    const qrToken = user?.qrToken || 'demo-token-placeholder';

    const identityUrl = `${window.location.origin}/medical-identity/${user?.id}?token=${qrToken}`;

    const handleResetQr = async () => {
        if (!confirm('Are you sure? This will invalidate the existing QR code immediately.')) return;

        setIsResetting(true);
        try {
            await identityApi.resetQrCode();
            await refreshUser();
            toast.success('QR Code reset successfully', {
                description: 'Previous links will no longer work.'
            });
        } catch (error) {
            toast.error('Failed to reset QR code');
        } finally {
            setIsResetting(false);
        }
    };

    const handleToggleAccess = async (enabled: boolean) => {
        setIsToggling(true);
        try {
            await identityApi.toggleQrAccess(enabled);
            await refreshUser();
            toast.success(enabled ? 'Public access enabled' : 'Public access disabled');
        } catch (error) {
            toast.error('Failed to update access settings');
        } finally {
            setIsToggling(false);
        }
    };

    const downloadQrCode = () => {
        const svg = document.getElementById('identity-qr');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `medical-identity-${user?.fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Access</h1>
                <p className="mt-1 text-muted-foreground">
                    Control how your medical identity is shared and accessed.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Public Profile Access</CardTitle>
                            <CardDescription>
                                Allow doctors or emergency responders to view your medical records.
                            </CardDescription>
                        </div>
                        <Switch
                            checked={qrEnabled}
                            onCheckedChange={handleToggleAccess}
                            disabled={isToggling}
                        />
                    </div>
                </CardHeader>
            </Card>

            {qrEnabled ? (
                <Card className="overflow-hidden border-primary/20 shadow-md">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Shield className="h-5 w-5" />
                            Active Medical Identity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="p-4 bg-white rounded-xl shadow-inner border">
                                <QRCode
                                    id="identity-qr"
                                    value={identityUrl}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>

                            <div className="w-full max-w-sm space-y-3">
                                <Button
                                    onClick={downloadQrCode}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download QR Code
                                </Button>

                                <Button
                                    onClick={handleResetQr}
                                    disabled={isResetting}
                                    variant="ghost"
                                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                                    Reset QR Code
                                </Button>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm flex items-start gap-3 w-full">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p>
                                    This QR code grants access to your verified medical records.
                                    Anyone scanning it can view your history. You can reset it anytime to revoke access for all previous copies.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <EyeOff className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Access Disabled</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Your medical identity is currently private. Enable access above to generate a secure QR code.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
