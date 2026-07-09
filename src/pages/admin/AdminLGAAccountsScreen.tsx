import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { lgaAPI } from '@/services/lgaService';

interface LgaAccount {
  id: string;
  email: string;
  full_name: string;
  lga_name: string;
  state_name: string;
  total_phcs: number;
  is_active: boolean;
  created_at: string;
}

const AdminLGAAccountsScreen = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<LgaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const res = await lgaAPI.listLgaAccounts();
        if (cancelled) return;
        const data = res?.data?.accounts || [];
        setAccounts(
          data.map((a: any) => ({
            id: a.id,
            email: a.user_email,
            full_name: a.full_name,
            lga_name: a.lga_name,
            state_name: a.state_name,
            total_phcs: a.total_phcs ?? 0,
            is_active: a.is_active ?? true,
            created_at: a.created_at,
          }))
        );
      } catch (err: any) {
        if (cancelled) return;
        if (err?.code === 'ERR_CANCELED') return;
        setError('Failed to load LGA accounts');
        console.error('Failed to load LGA accounts:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAccounts();
    return () => { cancelled = true; };
  }, []);

  const filteredAccounts = accounts.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      a.full_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.lga_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LGA Accounts</h1>
            <p className="text-sm text-gray-500">{filteredAccounts.length} LGA admin account(s)</p>
          </div>
          <Button onClick={() => navigate('/system-admin/facilities?tab=create-lga-account')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>

        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All LGA Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or LGA..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mb-3 text-gray-300" />
                <p className="text-sm">No LGA accounts found</p>
                <Button variant="link" onClick={() => navigate('/system-admin/facilities?tab=create-lga-account')}>
                  Create the first account
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>LGA</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>PHCs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map(account => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.full_name}</TableCell>
                      <TableCell className="text-gray-500">{account.email}</TableCell>
                      <TableCell>{account.lga_name}</TableCell>
                      <TableCell>{account.state_name}</TableCell>
                      <TableCell>{account.total_phcs}</TableCell>
                      <TableCell>
                        <Badge className={account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {account.created_at ? new Date(account.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLGAAccountsScreen;