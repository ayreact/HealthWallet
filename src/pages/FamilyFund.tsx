/**
 * HealthWallet Nigeria - Family Fund Page
 */

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Wallet, 
  Vote, 
  Check, 
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { familyApi } from '@/services/api';
import type { FamilyPool, Claim } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { InlineLoader } from '@/components/common/HealthLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { format } from 'date-fns';

const claimStatusColors: Record<Claim['status'], 'success' | 'pending' | 'failed' | 'info'> = {
  PENDING: 'pending',
  APPROVED: 'success',
  REJECTED: 'failed',
  PAID: 'success',
};

export const FamilyFund: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [pool, setPool] = useState<FamilyPool | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isCreatePoolOpen, setIsCreatePoolOpen] = useState(false);
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  
  // Form states
  const [poolName, setPoolName] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('5000');
  const [fundAmount, setFundAmount] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [poolData, claimsData] = await Promise.all([
        familyApi.getPool(),
        familyApi.getClaims(),
      ]);
      setPool(poolData);
      setClaims(claimsData);
    } catch (error) {
      console.error('Failed to load family fund data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePool = async () => {
    setIsSubmitting(true);
    try {
      const newPool = await familyApi.create({
        name: poolName,
        monthlyContribution: parseInt(monthlyContribution),
      });
      setPool(newPool);
      toast({
        title: 'Family Pool Created!',
        description: `${poolName} has been deployed to the blockchain.`,
      });
      setIsCreatePoolOpen(false);
      setPoolName('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create pool',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFundWallet = async () => {
    setIsSubmitting(true);
    try {
      await familyApi.fund({
        amount: parseInt(fundAmount),
        currency: 'NGN',
      });
      toast({
        title: 'Wallet Funded!',
        description: `₦${parseInt(fundAmount).toLocaleString()} has been added to the pool.`,
      });
      setIsFundOpen(false);
      setFundAmount('');
      loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fund wallet',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClaim = async () => {
    setIsSubmitting(true);
    try {
      const claim = await familyApi.submitClaim({
        amount: parseInt(claimAmount),
        reason: claimReason,
      });
      setClaims(prev => [claim, ...prev]);
      toast({
        title: 'Claim Submitted!',
        description: 'Your claim is now pending approval from family members.',
      });
      setIsClaimOpen(false);
      setClaimAmount('');
      setClaimReason('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to submit claim',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (claimId: string, decision: boolean) => {
    try {
      const updated = await familyApi.vote(claimId, decision);
      setClaims(prev => prev.map(c => c.id === claimId ? updated : c));
      toast({
        title: decision ? 'Vote: Approved' : 'Vote: Rejected',
        description: 'Your vote has been recorded on the blockchain.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to vote',
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  if (isLoading) {
    return <InlineLoader text="Loading family fund..." />;
  }

  if (!pool) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Start Your Family Health Fund
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Create a DAO-powered family pool for transparent, community-governed healthcare funding.
          </p>
          
          <Dialog open={isCreatePoolOpen} onOpenChange={setIsCreatePoolOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Family Pool
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Family Pool</DialogTitle>
                <DialogDescription>
                  Deploy a new family insurance pool on the blockchain
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="poolName">Pool Name</Label>
                  <Input
                    id="poolName"
                    placeholder="e.g., Okafor Family Fund"
                    value={poolName}
                    onChange={(e) => setPoolName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contribution">Monthly Contribution (₦)</Label>
                  <Input
                    id="contribution"
                    type="number"
                    placeholder="5000"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatePoolOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePool} disabled={!poolName || isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Pool'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const pendingClaims = claims.filter(c => c.status === 'PENDING');
  const totalMembers = pool.members.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {pool.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {totalMembers} members • Monthly contribution: ₦{pool.monthlyContribution.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isFundOpen} onOpenChange={setIsFundOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowDownLeft className="h-4 w-4" />
                Fund
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fund Family Pool</DialogTitle>
                <DialogDescription>
                  Add money to the family health insurance pool
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fundAmount">Amount (₦)</Label>
                  <Input
                    id="fundAmount"
                    type="number"
                    placeholder="10000"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Funds will be converted to crypto and added to the pool's smart contract.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsFundOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFundWallet} disabled={!fundAmount || isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Fund Pool'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Submit Claim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Health Claim</DialogTitle>
                <DialogDescription>
                  Request funds from the family pool for medical expenses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="claimAmount">Amount (₦)</Label>
                  <Input
                    id="claimAmount"
                    type="number"
                    placeholder="25000"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimReason">Reason</Label>
                  <Textarea
                    id="claimReason"
                    placeholder="Describe the medical expense..."
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsClaimOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitClaim} disabled={!claimAmount || !claimReason || isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Pool Balance</p>
                <p className="text-3xl font-bold mt-1">
                  ₦{pool.totalBalance.toLocaleString()}
                </p>
              </div>
              <Wallet className="h-10 w-10 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-3xl font-bold mt-1">{totalMembers}</p>
              </div>
              <Users className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
                <p className="text-3xl font-bold mt-1">{pendingClaims.length}</p>
              </div>
              <Clock className="h-10 w-10 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims" className="gap-2">
            <Vote className="h-4 w-4" />
            Claims
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="claims" className="mt-6">
          {claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map((claim) => {
                const votesNeeded = Math.ceil(totalMembers / 2);
                const voteProgress = (claim.votesFor / votesNeeded) * 100;
                
                return (
                  <Card key={claim.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusBadge 
                              status={claimStatusColors[claim.status]} 
                              text={claim.status}
                            />
                            <span className="text-sm text-muted-foreground">
                              by {claim.requesterName}
                            </span>
                          </div>
                          <p className="font-medium text-foreground mb-1">{claim.reason}</p>
                          <p className="text-2xl font-bold text-primary">
                            ₦{claim.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {format(new Date(claim.createdAt), 'MMM d, yyyy')}
                          </p>
                          
                          {claim.status === 'PENDING' && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Approval Progress</span>
                                <span className="font-medium">{claim.votesFor}/{votesNeeded} votes</span>
                              </div>
                              <Progress value={Math.min(voteProgress, 100)} className="h-2" />
                            </div>
                          )}
                          
                          {claim.txHash && (
                            <a
                              href={`https://amoy.polygonscan.com/tx/${claim.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                            >
                              View Transaction
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        
                        {claim.status === 'PENDING' && (
                          <div className="flex gap-2 sm:flex-col">
                            <Button
                              size="sm"
                              onClick={() => handleVote(claim.id, true)}
                              className="gap-1"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVote(claim.id, false)}
                              className="gap-1"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Vote}
              title="No claims yet"
              description="Claims submitted by family members will appear here"
            />
          )}
        </TabsContent>
        
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Members</CardTitle>
              <CardDescription>
                All members can vote on claims and contribute to the pool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pool.members.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{member.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Invite Member
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
