import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Building, PlusCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import LGALayout from '@/components/layout/LGALayout';
import { lgaAPI } from '@/services/lgaService';

interface DashboardStats {
  lga_name: string;
  state_name: string;
  total_phcs: number;
  total_workers: number;
  total_patients: number;
  phcs: Array<{
    id: string;
    name: string;
    code: string;
    status: string;
    worker_count: number;
    patient_count: number;
  }>;
}

const LGADashboardScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await lgaAPI.getLgaDashboard();
        if (cancelled) return;
        setStats(res.data);
      } catch (err: any) {
        if (cancelled) return;
        if (err?.code === 'ERR_CANCELED') return;
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    {
      title: 'Total PHCs',
      value: stats?.total_phcs ?? '-',
      icon: Building,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      title: 'Total Workers',
      value: stats?.total_workers ?? '-',
      icon: Building2,
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      title: 'State',
      value: stats?.state_name ?? '-',
      icon: Building2,
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ];

  const content = (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.full_name || 'LGA Admin'}
          </h1>
          <p className="text-sm text-gray-500">
            {stats?.lga_name ? `${stats.lga_name} Local Government Area` : 'LGA Dashboard'}
          </p>
        </div>
        <Button onClick={() => navigate('/lga/create-phc')} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New PHC
        </Button>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{card.title}</p>
                        <p className="text-2xl font-bold mt-1">{card.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${card.bg}`}>
                        <card.icon className={`h-6 w-6 ${card.text}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {stats?.phcs && stats.phcs.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">PHC Facilities</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/lga/phcs')}>
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.phcs.slice(0, 5).map(phc => (
                    <div key={phc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{phc.name}</p>
                        <p className="text-xs text-gray-500">{phc.code}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  return <LGALayout>{content}</LGALayout>;
};

export default LGADashboardScreen;