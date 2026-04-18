import React from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, Database, Globe, Wifi, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AdminHealthScreen = () => {
  const services = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', latency: '45ms' },
    { name: 'Auth Service', status: 'healthy', uptime: '99.8%', latency: '23ms' },
    { name: 'Database', status: 'healthy', uptime: '99.9%', latency: '12ms' },
    { name: 'WebSocket', status: 'warning', uptime: '98.5%', latency: '156ms' },
    { name: 'Email Service', status: 'healthy', uptime: '99.7%', latency: '89ms' },
    { name: 'Storage', status: 'healthy', uptime: '99.9%', latency: '8ms' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500">Real-time system status</p>
        </div>
        <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          All Systems Operational
        </span>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Server className="h-4 w-4" /> Active Services
          </div>
          <p className="text-2xl font-bold">{services.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <CheckCircle className="h-4 w-4" /> Healthy
          </div>
          <p className="text-2xl font-bold text-green-600">{services.filter(s => s.status === 'healthy').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <AlertTriangle className="h-4 w-4" /> Warnings
          </div>
          <p className="text-2xl font-bold text-yellow-600">{services.filter(s => s.status === 'warning').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Cpu className="h-4 w-4" /> CPU Usage
          </div>
          <p className="text-2xl font-bold">34%</p>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-4">Services Status</h2>
        <div className="space-y-3">
          {services.map((service, i) => (
            <motion.div key={service.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {service.status === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-500">Latency: {service.latency}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{service.uptime}</p>
                <p className={`text-sm ${service.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {service.status}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHealthScreen;