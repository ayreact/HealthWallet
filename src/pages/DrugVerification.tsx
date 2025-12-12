/**
 * HealthWallet Nigeria - Drug Verification Page
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  QrCode, 
  AlertTriangle, 
  Check, 
  HelpCircle,
  Package,
  Building2,
  Calendar,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { drugsApi } from '@/services/api';
import type { DrugVerification } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { HealthLoader } from '@/components/common/HealthLoader';
import { cn } from '@/lib/utils';

export const DrugVerificationPage: React.FC = () => {
  const { toast } = useToast();
  const [nafdacNumber, setNafdacNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<DrugVerification | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nafdacNumber.trim()) return;
    
    setIsVerifying(true);
    setResult(null);
    
    try {
      const verification = await drugsApi.verify(nafdacNumber.trim());
      setResult(verification);
      
      if (verification.status === 'VERIFIED') {
        toast({
          title: 'Drug Verified!',
          description: `${verification.drugName} is authentic.`,
        });
      } else if (verification.status === 'COUNTERFEIT') {
        toast({
          variant: 'destructive',
          title: 'Counterfeit Alert!',
          description: 'This drug may be fake. Do not use.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'Please try again',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const sampleNumbers = ['A4-1394', 'B1-5678', 'C2-9012'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Drug Verification
        </h1>
        <p className="mt-2 text-muted-foreground">
          Verify the authenticity of your medications using NAFDAC numbers
        </p>
      </div>

      {/* Search Card */}
      <Card className="max-w-xl mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter NAFDAC Number (e.g., A1-1234)"
                value={nafdacNumber}
                onChange={(e) => setNafdacNumber(e.target.value.toUpperCase())}
                className="pl-11 h-12 text-lg"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1 h-12" 
                disabled={!nafdacNumber.trim() || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <HealthLoader size="sm" />
                    <span className="ml-2">Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Verify Drug
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card className={cn(
          'max-w-xl mx-auto overflow-hidden animate-scale-in',
          result.status === 'VERIFIED' && 'border-success',
          result.status === 'COUNTERFEIT' && 'border-destructive',
          result.status === 'NOT_FOUND' && 'border-warning'
        )}>
          {/* Status Header */}
          <div className={cn(
            'px-6 py-8 text-center',
            result.status === 'VERIFIED' && 'bg-success/10',
            result.status === 'COUNTERFEIT' && 'bg-destructive/10',
            result.status === 'NOT_FOUND' && 'bg-warning/10'
          )}>
            <div className={cn(
              'h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4',
              result.status === 'VERIFIED' && 'bg-success text-success-foreground',
              result.status === 'COUNTERFEIT' && 'bg-destructive text-destructive-foreground',
              result.status === 'NOT_FOUND' && 'bg-warning text-warning-foreground'
            )}>
              {result.status === 'VERIFIED' && <Check className="h-10 w-10" />}
              {result.status === 'COUNTERFEIT' && <AlertTriangle className="h-10 w-10" />}
              {result.status === 'NOT_FOUND' && <HelpCircle className="h-10 w-10" />}
            </div>
            
            <h2 className={cn(
              'text-2xl font-bold',
              result.status === 'VERIFIED' && 'text-success',
              result.status === 'COUNTERFEIT' && 'text-destructive',
              result.status === 'NOT_FOUND' && 'text-warning'
            )}>
              {result.status === 'VERIFIED' && 'Authentic Drug'}
              {result.status === 'COUNTERFEIT' && 'Counterfeit Alert!'}
              {result.status === 'NOT_FOUND' && 'Not Found'}
            </h2>
            
            <p className="mt-2 text-muted-foreground">
              {result.status === 'VERIFIED' && 'This medication is registered and verified by NAFDAC.'}
              {result.status === 'COUNTERFEIT' && 'This drug has been flagged as counterfeit. Do not consume.'}
              {result.status === 'NOT_FOUND' && 'No record found for this NAFDAC number.'}
            </p>
          </div>
          
          {/* Drug Details */}
          {result.status === 'VERIFIED' && result.drugName && (
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Drug Name</p>
                    <p className="font-medium text-foreground">{result.drugName}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturer</p>
                    <p className="font-medium text-foreground">{result.manufacturer}</p>
                  </div>
                </div>
                
                {result.batchNumber && (
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Batch Number</p>
                      <p className="font-medium text-foreground">{result.batchNumber}</p>
                    </div>
                  </div>
                )}
                
                {result.expiryDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium text-foreground">{result.expiryDate}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>NAFDAC Number:</strong> {result.nafdacNumber}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This verification was performed using the EMDEX service.
                </p>
              </div>
            </CardContent>
          )}
          
          {/* Counterfeit Warning */}
          {result.status === 'COUNTERFEIT' && (
            <CardContent className="pt-6">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h3 className="font-semibold text-destructive mb-2">⚠️ Important Safety Warning</h3>
                <ul className="text-sm text-destructive space-y-1">
                  <li>• Do not consume this medication</li>
                  <li>• Report to NAFDAC immediately</li>
                  <li>• Return to the pharmacy for a refund</li>
                  <li>• Contact emergency services if consumed</li>
                </ul>
              </div>
              
              <Button variant="destructive" className="w-full mt-4">
                Report to NAFDAC
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {/* Info Section */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Find the NAFDAC number on your medication packaging
                </p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the number or scan the barcode
                </p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get instant verification from EMDEX
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
