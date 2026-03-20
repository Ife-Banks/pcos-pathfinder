import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Watch,
  Smartphone,
  Heart,
  Activity,
  Moon,
  Footprints,
  RefreshCw,
  Plus,
  Check,
  X,
  Wifi,
  WifiOff,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { settingsService, Device } from "@/services/settingsService";
import { toast } from "@/hooks/use-toast";

const TEAL = '#00897B';

const DEVICE_DATA_TYPES: Record<string, string[]> = {
  apple_watch: ["HRV", "Sleep", "Activity", "Heart Rate"],
  fitbit: ["HRV", "Sleep", "Steps", "SpO2"],
  garmin: ["HRV", "Activity", "Sleep"],
  oura_ring: ["HRV", "Sleep", "Temperature", "Readiness"],
};

const DEVICE_ICONS: Record<string, string> = {
  apple_watch: "⌚",
  fitbit: "📟",
  garmin: "🏃",
  oura_ring: "💍",
};

const AVAILABLE_DEVICES = [
  { id: "apple_watch", name: "Apple Watch", subtitle: "HealthKit integration" },
  { id: "fitbit", name: "Fitbit", subtitle: "Connect Fitbit account" },
  { id: "garmin", name: "Garmin Connect", subtitle: "Sync Garmin data" },
  { id: "oura_ring", name: "Oura Ring", subtitle: "HRV, sleep & readiness" },
];

const formatRelativeSync = (isoStr: string | null) => {
  if (!isoStr) return "Never";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

const ConnectedDevicesScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsService.getDevices();
      setDevices(res.data);
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      toast({ title: 'Error', description: 'Unable to load devices', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleSync = async (deviceId: string) => {
    setSyncingId(deviceId);
    try {
      await settingsService.syncDevice(deviceId);
      setDevices(prev =>
        prev.map(d => d.id === deviceId ? { ...d, last_synced_at: new Date().toISOString() } : d)
      );
      toast({ title: 'Sync complete', description: 'Your data has been synced.' });
    } catch {
      toast({ title: 'Sync failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    try {
      await settingsService.disconnectDevice(deviceId);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      toast({ title: 'Device disconnected' });
    } catch {
      toast({ title: 'Failed to disconnect', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleConnect = async (deviceType: string) => {
    setConnectingId(deviceType);
    try {
      const res = await settingsService.connectDevice(deviceType);
      setDevices(prev => [...prev, res.data]);
      toast({ title: 'Device connected', description: `${res.data.display_name} has been connected.` });
    } catch {
      toast({ title: 'Connection failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setConnectingId(null);
    }
  };

  const connectedTypes = new Set(devices.map(d => d.device_type));

  const dataTypeIcons: Record<string, React.ElementType> = {
    HRV: Heart,
    Sleep: Moon,
    Activity: Activity,
    Steps: Footprints,
    "Heart Rate": Activity,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-gray-900">Connected Devices</h1>
          <p className="text-xs text-gray-500">Manage wearable integrations</p>
        </div>
        <Watch className="w-5 h-5" style={{ color: TEAL }} />
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <>
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-24 bg-gray-100 rounded" />
              </div>
            ))}
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Connected Devices ({devices.length})
              </h3>

              {devices.length > 0 ? (
                <div className="space-y-3">
                  {devices.map((device) => {
                    const dataTypes = DEVICE_DATA_TYPES[device.device_type] ?? ["HRV", "Activity", "Sleep"];
                    return (
                      <motion.div
                        key={device.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                style={{ background: `linear-gradient(135deg, ${TEAL}, #00695C)` }}>
                                {DEVICE_ICONS[device.device_type] ?? '⌚'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-display font-bold text-gray-900">{device.display_name}</p>
                                  {device.is_active && (
                                    <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                                      <Wifi className="h-2.5 w-2.5 mr-1" />
                                      Connected
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{device.device_type}</p>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatRelativeSync(device.last_synced_at)}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {dataTypes.map(type => {
                                    const Icon = dataTypeIcons[type] || Activity;
                                    return (
                                      <span key={type} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                        <Icon className="h-3 w-3" style={{ color: TEAL }} />
                                        {type}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-lg border-gray-300"
                                onClick={() => handleSync(device.id)}
                                disabled={syncingId === device.id}
                              >
                                <RefreshCw className={`h-4 w-4 mr-1.5 ${syncingId === device.id ? 'animate-spin' : ''}`} />
                                {syncingId === device.id ? 'Syncing...' : 'Sync Now'}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 rounded-lg hover:bg-red-50">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Disconnect {device.display_name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will stop syncing data from this device. Your existing data will be preserved.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDisconnect(device.id)}>
                                      Disconnect
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="border border-dashed border-gray-300">
                  <CardContent className="py-8 text-center">
                    <WifiOff className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-display font-semibold text-gray-700 mb-1">No Devices Connected</p>
                    <p className="text-sm text-gray-400">Connect a wearable to sync your health data</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Add a Device
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-0 divide-y divide-gray-100">
                  {AVAILABLE_DEVICES.map((device) => {
                    const isConnected = connectedTypes.has(device.id);
                    return (
                      <button
                        key={device.id}
                        onClick={() => !isConnected && handleConnect(device.id)}
                        disabled={isConnected || connectingId !== null}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                      >
                        <span className="text-2xl">{DEVICE_ICONS[device.id]}</span>
                        <div className="flex-1">
                          <p className="font-display font-semibold text-gray-900 text-sm">{device.name}</p>
                          <p className="text-xs text-gray-500">{device.subtitle}</p>
                        </div>
                        {isConnected ? (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            {connectingId === device.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="h-4 w-4" style={{ color: TEAL }} />
                                <span className="text-xs font-medium" style={{ color: TEAL }}>Connect</span>
                              </>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <Smartphone className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display font-bold text-gray-900 text-sm">Smartphone Camera (rPPG)</p>
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-[10px] text-green-600 font-medium">Active</span>
                      </div>
                      <p className="text-xs text-gray-500">HRV measured via front camera — always active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex gap-3">
                <Smartphone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Wearable data helps improve your PCOS risk predictions by providing real-time physiological signals like heart rate variability, sleep quality, and activity levels.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectedDevicesScreen;
