import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FMCMobileNav from '@/components/fmc/FMCMobileNav';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  PieChart,
  Activity
} from 'lucide-react';

const FMCAnalyticsScreen = () => {
  const navigate = useNavigate();
  
  const [dateRange, setDateRange] = useState('this_month');
  const [selectedPHC, setSelectedPHC] = useState('');
  
  // Mock data
  const kpiData = {
    totalActiveMajorRisk: 47,
    criticalCases: 12,
    avgDaysToAssignment: 1.8,
    casesResolvedThisMonth: 23
  };

  const severityData = [
    { name: 'Critical', value: 12, color: '#C0392B' },
    { name: 'High', value: 35, color: '#E67E22' }
  ];

  const conditionData = [
    { name: 'PCOS', count: 38, percentage: 81, color: '#9B59B6' },
    { name: 'Hormonal', count: 28, percentage: 60, color: '#E91E63' },
    { name: 'Metabolic', count: 32, percentage: 68, color: '#009688' }
  ];

  const referralSources = [
    { name: 'City General Hospital', count: 18, color: '#3498DB' },
    { name: 'Lagos Mainland PHC', count: 12, color: '#2ECC71' },
    { name: 'Ikeja PHC', count: 8, color: '#F39C12' },
    { name: 'Victoria Island PHC', count: 6, color: '#E74C3C' },
    { name: 'Other PHCs', count: 3, color: '#95A5A6' }
  ];

  const timeToAssignmentData = [
    { range: '0-24 hours', count: 28 },
    { range: '1-2 days', count: 15 },
    { range: '3-5 days', count: 3 },
    { range: '5+ days', count: 1 }
  ];

  const outcomesData = [
    { status: 'Resolved', count: 23, percentage: 49, color: '#27AE60' },
    { status: 'Under Treatment', count: 18, percentage: 38, color: '#3498DB' },
    { status: 'Referred Externally', count: 6, percentage: 13, color: '#E67E22' }
  ];

  const clinicianLoadData = [
    { name: 'Dr. Adekunle', specialty: 'Gynaecology', activeCases: 12, avgTimePerCase: 4.2, status: 'available' },
    { name: 'Dr. Okonkwo', specialty: 'Endocrinology', activeCases: 8, avgTimePerCase: 5.1, status: 'available' },
    { name: 'Dr. Bello', specialty: 'Internal Medicine', activeCases: 15, avgTimePerCase: 3.8, status: 'at_capacity' },
    { name: 'Dr. Eze', specialty: 'Gynaecology', activeCases: 6, avgTimePerCase: 4.5, status: 'available' },
    { name: 'Dr. Okafor', specialty: 'Endocrinology', activeCases: 6, avgTimePerCase: 4.8, status: 'available' }
  ];

  const handlePHCFilter = (phcName: string) => {
    setSelectedPHC(selectedPHC === phcName ? '' : phcName);
  };

  const handleClinicianClick = (clinicianName: string) => {
    // Navigate to clinician's patient list
    navigate(`/fmc/clinicians/${clinicianName.toLowerCase().replace(' ', '-')}`);
  };

  const handleExportCSV = () => {
    alert('Exporting analytics data to CSV...');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src="/api/placeholder/32/32" alt="AI-MSHM" className="w-8 h-8" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI-MSHM</h2>
              <p className="text-xs text-gray-600">FMC Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/fmc/dashboard')}
              className="text-gray-600 hover:text-red-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Population Health Analytics</h1>
              <p className="text-sm text-gray-600">Federal Medical Centre, Lagos</p>
            </div>
            
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </header>

        {/* Date Range Selector */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-900">Date Range:</span>
            <div className="flex gap-2">
              {[
                { value: 'this_week', label: 'This Week' },
                { value: 'this_month', label: 'This Month' },
                { value: 'last_3_months', label: 'Last 3 Months' },
                { value: 'custom', label: 'Custom' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    dateRange === range.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="flex-1 p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-4 border-l-4 border-red-600"
            >
              <p className="text-sm text-gray-600">Total Active Major Risk Cases</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.totalActiveMajorRisk}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 border-l-4 border-red-500"
            >
              <p className="text-sm text-gray-600">Critical Cases</p>
              <p className="text-2xl font-bold text-red-600">{kpiData.criticalCases}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg p-4 border-l-4 border-orange-500"
            >
              <p className="text-sm text-gray-600">Average Days to Assignment</p>
              <p className="text-2xl font-bold text-gray-900">{kpiData.avgDaysToAssignment}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg p-4 border-l-4 border-green-600"
            >
              <p className="text-sm text-gray-600">Cases Resolved This Month</p>
              <p className="text-2xl font-bold text-green-600">{kpiData.casesResolvedThisMonth}</p>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Donut Chart</p>
                  <div className="mt-4 space-y-2">
                    {severityData.map((item) => (
                      <div key={item.name} className="flex items-center justify-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Condition Prevalence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Condition Prevalence</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Bar Chart</p>
                  <div className="mt-4 space-y-2">
                    {conditionData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-4">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-16 bg-gray-200 rounded-full h-2"
                            style={{
                              background: `linear-gradient(to right, ${item.color} ${item.percentage}%, #e5e7eb ${item.percentage}%)`
                            }}
                          ></div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Referral Sources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Sources</h3>
              <div className="space-y-3">
                {referralSources.map((source, index) => (
                  <div key={source.name} className="flex items-center gap-3">
                    <button
                      onClick={() => handlePHCFilter(source.name)}
                      className={`flex-1 flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedPHC === source.name
                          ? 'bg-red-50 border-red-200 border'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{source.name}</span>
                      <span className="text-sm font-bold">{source.count}</span>
                    </button>
                  </div>
                ))}
              </div>
              {selectedPHC && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    Filtered by: {selectedPHC}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Time-to-Assignment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time-to-Assignment Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Histogram</p>
                  <div className="mt-4 space-y-2">
                    {timeToAssignmentData.map((item) => (
                      <div key={item.range} className="flex items-center justify-between gap-4">
                        <span className="text-sm">{item.range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(item.count / 47) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Outcomes Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outcomes Tracker</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {outcomesData.map((outcome) => (
                <div key={outcome.status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: outcome.color }}
                  >
                    {outcome.percentage}%
                  </div>
                  <p className="font-medium text-gray-900">{outcome.status}</p>
                  <p className="text-sm text-gray-600">{outcome.count} cases</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Clinician Load Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinician Load</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Clinician</th>
                    <th className="px-4 py-2 text-left">Specialty</th>
                    <th className="px-4 py-2 text-center">Active Cases</th>
                    <th className="px-4 py-2 text-center">Avg Time/Case</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicianLoadData.map((clinician, index) => (
                    <tr key={clinician.name} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => handleClinicianClick(clinician.name)}>
                      <td className="px-4 py-2 font-medium">{clinician.name}</td>
                      <td className="px-4 py-2">{clinician.specialty}</td>
                      <td className="px-4 py-2 text-center">
                        <span className="font-medium">{clinician.activeCases}</span>
                      </td>
                      <td className="px-4 py-2 text-center">{clinician.avgTimePerCase} days</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          clinician.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {clinician.status === 'available' ? 'Available' : 'At Capacity'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>

      <FMCMobileNav />
    </div>
  );
};

export default FMCAnalyticsScreen;
