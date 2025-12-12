/**
 * HealthWallet Nigeria - Wallet/Identity Card Component
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WalletCardProps {
  walletAddress: string;
  userName: string;
  userRole: string;
  showQR?: boolean;
  className?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  walletAddress,
  userName,
  userRole,
  showQR = true,
  className,
}) => {
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: 'Address Copied',
      description: 'Wallet address copied to clipboard',
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className={cn('overflow-hidden gradient-hero', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-hero-foreground/70 uppercase tracking-wider">
              Medical Identity
            </p>
            <h3 className="mt-2 text-xl font-bold text-hero-foreground truncate">
              {userName}
            </h3>
            <p className="mt-1 text-sm text-hero-foreground/80">
              {userRole}
            </p>
            
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-hero-foreground/60 mb-1">Wallet Address</p>
                <p className="font-mono text-sm text-hero-foreground">
                  {truncateAddress(walletAddress)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAddress}
                className="text-hero-foreground/70 hover:text-hero-foreground hover:bg-hero-foreground/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(`https://amoy.polygonscan.com/address/${walletAddress}`, '_blank')}
                className="text-hero-foreground/70 hover:text-hero-foreground hover:bg-hero-foreground/10"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showQR && (
            <Link to="/manage-access">
              <div className="flex-shrink-0 ml-4">
                <div className="h-20 w-28 bg-hero-foreground rounded-lg flex items-center justify-center">
                  <QrCode className="h-14 w-14 text-hero" />
                </div>
                <p className="mt-1 text-xs text-center text-hero-foreground/60">Click to view QR code</p>
              </div>
            </Link>
          )}
        </div>
        
        {/* Blockchain indicator */}
        <div className="mt-4 pt-4 border-t border-hero-foreground/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-hero-foreground/70">Polygon Network</span>
          </div>
          <span className="text-xs text-hero-foreground/60">Amoy Testnet</span>
        </div>
      </CardContent>
    </Card>
  );
};
