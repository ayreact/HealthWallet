/**
 * HealthWallet Nigeria - Hospital Portal Page
 */

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  FileText,
  Send,
  QrCode,
  User,
  DollarSign,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { hospitalApi } from '@/services/api';
import type { HospitalInvoice } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { InlineLoader } from '@/components/common/HealthLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { format } from 'date-fns';

export const HospitalPortal: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [invoices, setInvoices] = useState<HospitalInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientWallet: '',
    diagnosis: '',
    cost: '',
    treatmentPlan: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await hospitalApi.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const invoice = await hospitalApi.submitInvoice({
        patientWallet: formData.patientWallet,
        diagnosis: formData.diagnosis,
        cost: parseInt(formData.cost),
        treatmentPlan: formData.treatmentPlan,
      });

      setInvoices(prev => [invoice, ...prev]);
      toast({
        title: 'Invoice Submitted',
        description: 'Payment request has been sent to the patient\'s family pool.',
      });

      setFormData({
        patientWallet: '',
        diagnosis: '',
        cost: '',
        treatmentPlan: '',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (user?.role !== 'HOSPITAL' && user?.role !== 'DOCTOR' && user?.role !== 'ADMIN') {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={Building2}
          title="Hospital Portal"
          description="This portal is only accessible to hospital and medical staff accounts."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Hospital Portal
        </h1>
        <p className="mt-1 text-muted-foreground">
          Submit invoices and manage patient payments through the family fund
        </p>
      </div>

      <Tabs defaultValue="submit">
        <TabsList>
          <TabsTrigger value="submit" className="gap-2">
            <FileText className="h-4 w-4" />
            Submit Invoice
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Invoice History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Patient Lookup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Lookup
                </CardTitle>
                <CardDescription>
                  Find patient by wallet address or scan their QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="patientWallet"
                      placeholder="Patient Wallet Address (0x...)"
                      value={formData.patientWallet}
                      onChange={handleChange}
                      className="pl-10 font-mono text-sm"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>

                {formData.patientWallet && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Patient Found</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {formData.patientWallet.slice(0, 6)}...{formData.patientWallet.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-2">Family Pool: Active</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Invoice
                </CardTitle>
                <CardDescription>
                  Submit an invoice to request payment from the patient's family fund
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      name="diagnosis"
                      placeholder="e.g., Malaria - Plasmodium falciparum"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Treatment Cost (₦)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cost"
                        name="cost"
                        type="number"
                        placeholder="45000"
                        value={formData.cost}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                    <Textarea
                      id="treatmentPlan"
                      name="treatmentPlan"
                      placeholder="Describe the treatment plan and medications..."
                      value={formData.treatmentPlan}
                      onChange={handleChange}
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={!formData.patientWallet || isSubmitting}
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Request Payment from Family Fund'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {isLoading ? (
            <InlineLoader text="Loading invoices..." />
          ) : invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            invoice.status === 'paid' ? 'default' :
                              invoice.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {invoice.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="font-medium text-foreground">{invoice.diagnosis}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Patient: {invoice.patientWallet.slice(0, 8)}...{invoice.patientWallet.slice(-6)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ₦{invoice.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Treatment:</strong> {invoice.treatmentPlan}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="Submitted invoices will appear here"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
