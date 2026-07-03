import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Loader2, AlertCircle, MapPin } from 'lucide-react';
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
import LGALayout from '@/components/layout/LGALayout';
import { lgaAPI } from '@/services/lgaService';

interface PHC {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}

const LGAPHCListScreen = () => {
  const navigate = useNavigate();
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchPhcs = async () => {
      setLoading(true);
      try {
        const res = await lgaAPI.listPhcs();
        if (cancelled) return;
        const rawData = res?.data?.data ?? res?.data ?? res;
        const data = Array.isArray(rawData.phcs) ? rawData.phcs : Array.isArray(rawData) ? rawData : [];
        setPhcs(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            code: p.code || '',
            address: p.address || '',
            phone: p.phone || p.phone_number || '',
            email: p.email || '',
            status: p.status || 'active',
            created_at: p.created_at,
          }))
        );
      } catch (err: any) {
        if (cancelled) return;
        if (err?.code === 'ERR_CANCELED') return;
        setError('Failed to load PHC facilities');
        console.error('PHC list error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPhcs();
    return () => { cancelled = true; };
  }, []);

  const filteredPhcs = phcs.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  const content = (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PHC Facilities</h1>
          <p className="text-sm text-gray-500">{filteredPhcs.length} facility(s) in your LGA</p>
        </div>
        <Button onClick={() => navigate('/lga/create-phc')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New PHC
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
            <Building2 className="h-5 w-5" />
            All PHC Facilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or code..."
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
          ) : filteredPhcs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">No PHC facilities found</p>
              <Button variant="link" onClick={() => navigate('/lga/create-phc')}>
                Add the first PHC
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPhcs.map(phc => (
                  <TableRow key={phc.id}>
                    <TableCell className="font-medium">{phc.name}</TableCell>
                    <TableCell className="text-gray-500">{phc.code || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-500">
                        {phc.address && <MapPin className="h-3 w-3" />}
                        {phc.address || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{phc.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">
                        {phc.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {phc.created_at ? new Date(phc.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return <LGALayout>{content}</LGALayout>;
};

export default LGAPHCListScreen;