import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import FMCLayout from "@/components/layout/FMCLayout";
import { 
  Users, 
  AlertTriangle, 
  RefreshCw,
  Activity,
  ArrowRight
} from "lucide-react";
import { fmcAPI } from "@/services/fmcService";
import { PatientCase } from "@/types/fmc";

const FMCMajorRiskDashboardScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [facilityName, setFacilityName] = useState('FMC');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fmcAPI.getCases();
      const casesData = response.data || [];
      
      let filtered = [...casesData];
      if (activeFilter !== 'all') {
        filtered = filtered.filter(c => c.severity === 'very_severe' || c.severity === 'severe' || c.severity === 'moderate');
      }
      
      if (sortBy === 'urgency') {
        filtered.sort((a, b) => {
          const severityOrder = { very_severe: 0, severe: 1, moderate: 2, mild: 3 };
          return (severityOrder[a.severity as keyof typeof severityOrder] || 3) - (severityOrder[b.severity as keyof typeof severityOrder] || 3);
        });
      } else if (sortBy === 'date') {
        filtered.sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime());
      }
      
      setCases(filtered);
    } catch (error: any) {
      console.log('Error fetching cases (using fallback):', error?.message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCases();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCases();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    let fmcName = 'FMC';
    if (user?.center_info?.center_type === 'fmc') {
      fmcName = user.center_info.center_name || 'Lagos University Teaching Hospital';
    }
    setFacilityName(fmcName);
  }, [activeFilter, sortBy]);

  const criticalUnassignedCount = cases.filter(c => c.severity === 'very_severe' && c.status === 'open').length;
  const criticalAssignedCount = cases.filter(c => c.severity === 'very_severe' && c.status === 'assigned').length;
  const highUnassignedCount = cases.filter(c => c.severity === 'severe' && c.status === 'open').length;
  const highAssignedCount = cases.filter(c => c.severity === 'severe' && c.status === 'assigned').length;
  const totalActiveCases = cases.filter(c => c.status !== 'discharged').length;

  if (loading) {
    return (
      <FMCLayout>
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Major Risk Patient Queue — {facilityName}
            </h1>
            <p className="text-sm text-gray-600">Federal Medical Centre Portal</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {criticalUnassignedCount > 0 && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex justify-between items-center">
              <span>
                <strong>{criticalUnassignedCount}</strong> Critical patients unassigned
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate('/fmc/assignment')} className="text-red-600">
                Assign Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Critical Unassigned</p>
              <p className="text-xl font-bold text-red-600">{criticalUnassignedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Critical Assigned</p>
              <p className="text-xl font-bold text-red-800">{criticalAssignedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">High Unassigned</p>
              <p className="text-xl font-bold text-orange-600">{highUnassignedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">High Assigned</p>
              <p className="text-xl font-bold text-orange-800">{highAssignedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Total Active</p>
              <p className="text-xl font-bold text-[#C0392B]">{totalActiveCases}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'critical', 'high'].map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? 'bg-[#C0392B]' : ''}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {cases.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No Major Risk Cases</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {cases.map((case_, index) => (
              <motion.div key={case_.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className={`border-l-4 ${case_.severity === 'very_severe' ? 'border-l-red-500' : 'border-l-orange-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={case_.severity === 'very_severe' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                            {case_.severity === 'very_severe' ? 'Critical' : 'High'}
                          </Badge>
                          <span className="font-medium">{case_.patient?.full_name || 'Unknown'}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {case_.patient?.id?.slice(0, 8)}... • {case_.condition_label || case_.condition} • Risk: {Math.round((case_.opening_score || 0))}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Referring PHC: {case_.hcc?.name || 'Unknown'} • {case_.opened_at ? new Date(case_.opened_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/fmc/patient-detail/${case_.id}`)}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </FMCLayout>
  );
};

export default FMCMajorRiskDashboardScreen;