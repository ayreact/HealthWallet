/**
 * HealthWallet Nigeria - Patient Dashboard
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Shield, Plus, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, recordsApi, familyApi } from '@/services/api';
import type { DashboardStats, ActivityItem, MedicalRecord, FamilyPool } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import { WalletCard } from '@/components/common/WalletCard';
import { ActivityTimeline } from '@/components/common/ActivityTimeline';
import { InlineLoader } from '@/components/common/HealthLoader';
import { formatDistanceToNow } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [familyPool, setFamilyPool] = useState<FamilyPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, activitiesData, recordsData, poolData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getActivities(5),
          recordsApi.getAll(3),
          familyApi.getPool(),
        ]);
        
        setStats(statsData);
        setActivities(activitiesData);
        setRecentRecords(recordsData);
        setFamilyPool(poolData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return <InlineLoader text="Loading dashboard..." />;
  }

  const quickActions = [
    { label: 'Add Record', icon: FileText, href: '/records', color: 'primary' as const },
    { label: 'Verify Drug', icon: Shield, href: '/verify-drug', color: 'secondary' as const },
    { label: 'Family Fund', icon: Users, href: '/family-fund', color: 'accent' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your health records today.
          </p>
        </div>
        <Button onClick={() => navigate('/records')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Medical Records"
          value={stats?.totalRecords || 0}
          subtitle="Verified on blockchain"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Pool Balance"
          value={`₦${(stats?.poolBalance || 0).toLocaleString()}`}
          subtitle="Family fund available"
          icon={Wallet}
        />
        <StatCard
          title="Pending Claims"
          value={stats?.pendingClaims || 0}
          subtitle="Awaiting approval"
          icon={Users}
        />
        <StatCard
          title="Drugs Verified"
          value={stats?.verifiedDrugs || 0}
          subtitle="NAFDAC checked"
          icon={Shield}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Card */}
          {user && (
            <WalletCard
              walletAddress={user.walletAddress}
              userName={user.fullName}
              userRole={user.role}
            />
          )}

          {/* Recent Records */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Records</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/records')} className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentRecords.length > 0 ? (
                <div className="space-y-3">
                  {recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/records/${record.id}`)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{record.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {record.hospitalName} • {record.type}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No records yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/records')}
                  >
                    Add your first record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => navigate(action.href)}
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {/* Mobile FAB for Add Record */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          size="lg"
          onClick={() => navigate('/records')}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
