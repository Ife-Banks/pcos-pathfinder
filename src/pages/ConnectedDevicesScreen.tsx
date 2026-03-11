import { useState } from "react";
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
  ChevronRight,
  Wifi,
  WifiOff,
  Clock,
  Zap,
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

interface ConnectedDevice {
  id: string;
  name: string;
  type: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  battery?: number;
  dataTypes: string[];
}

interface AvailableDevice {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const ConnectedDevicesScreen = () => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState<string | null>(null);

  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([
    {
      id: "1",
      name: "Apple Watch Series 9",
      type: "Apple HealthKit",
      icon: "⌚",
      connected: true,
      lastSync: "2 hours ago",
      battery: 72,
      dataTypes: ["HRV", "Steps", "Sleep", "Heart Rate"],
    },
  ]);

  const availableDevices: AvailableDevice[] = [
    { id: "fitbit", name: "Fitbit", icon: "📟", description: "Connect your Fitbit device" },
    { id: "garmin", name: "Garmin", icon: "🏃", description: "Connect Garmin Connect" },
    { id: "oura", name: "Oura Ring", icon: "💍", description: "Connect Oura for sleep & readiness" },
    { id: "whoop", name: "WHOOP", icon: "🔄", description: "Connect WHOOP band" },
  ];

  const handleSync = (deviceId: string) => {
    setSyncing(deviceId);
    setTimeout(() => {
      setSyncing(null);
      setConnectedDevices(prev =>
        prev.map(d => d.id === deviceId ? { ...d, lastSync: "Just now" } : d)
      );
    }, 2000);
  };

  const handleDisconnect = (deviceId: string) => {
    setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const handleConnect = (deviceId: string) => {
    const device = availableDevices.find(d => d.id === deviceId);
    if (device) {
      setConnectedDevices(prev => [...prev, {
        id: Date.now().toString(),
        name: device.name,
        type: device.name,
        icon: device.icon,
        connected: true,
        lastSync: "Just now",
        battery: 85,
        dataTypes: ["HRV", "Steps", "Sleep"],
      }]);
    }
  };

  const dataTypeIcons: Record<string, React.ElementType> = {
    HRV: Heart,
    Steps: Footprints,
    Sleep: Moon,
    "Heart Rate": Activity,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Connected Devices</h1>
          <p className="text-xs text-muted-foreground">Manage wearable integrations</p>
        </div>
        <Watch className="w-5 h-5 text-primary" />
      </header>

      <div className="p-4 space-y-4">
        {/* Connected Devices */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Connected Devices ({connectedDevices.length})
          </h3>
          
          {connectedDevices.length > 0 ? (
            <div className="space-y-3">
              {connectedDevices.map((device, i) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl gradient-clinical flex items-center justify-center text-2xl shrink-0">
                          {device.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-display font-bold text-foreground">{device.name}</p>
                            <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0 text-[10px]">
                              <Wifi className="h-2.5 w-2.5 mr-1" />
                              Connected
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{device.type}</p>
                          
                          {/* Status Row */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {device.lastSync}
                            </span>
                            {device.battery && (
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {device.battery}%
                              </span>
                            )}
                          </div>

                          {/* Data Types */}
                          <div className="flex flex-wrap gap-2">
                            {device.dataTypes.map(type => {
                              const Icon = dataTypeIcons[type] || Activity;
                              return (
                                <span key={type} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-secondary text-foreground">
                                  <Icon className="h-3 w-3 text-primary" />
                                  {type}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSync(device.id)}
                          disabled={syncing === device.id}
                        >
                          <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing === device.id ? "animate-spin" : ""}`} />
                          {syncing === device.id ? "Syncing..." : "Sync Now"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20">
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect {device.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will stop syncing data from this device. Your existing data will be preserved.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDisconnect(device.id)}>
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <WifiOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-semibold text-foreground mb-1">No Devices Connected</p>
                <p className="text-sm text-muted-foreground">Connect a wearable to sync your health data</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Available Integrations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Available Integrations
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {availableDevices.map((device) => {
                const isConnected = connectedDevices.some(d => d.type === device.name);
                return (
                  <button
                    key={device.id}
                    onClick={() => !isConnected && handleConnect(device.id)}
                    disabled={isConnected}
                    className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left disabled:opacity-50"
                  >
                    <span className="text-2xl">{device.icon}</span>
                    <div className="flex-1">
                      <p className="font-display font-semibold text-foreground text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.description}</p>
                    </div>
                    {isConnected ? (
                      <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Plus className="h-5 w-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sync Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Sync Settings
          </h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">Background Sync</p>
                  <p className="text-xs text-muted-foreground">Automatically sync data in the background</p>
                </div>
                <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0">
                  Enabled
                </Badge>
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">Sync Frequency</p>
                  <p className="text-xs text-muted-foreground">How often to sync wearable data</p>
                </div>
                <span className="text-sm text-foreground font-display">Every 15 min</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="bg-[hsl(var(--info))]/5 border border-[hsl(var(--info))]/20 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Smartphone className="h-5 w-5 text-[hsl(var(--info))] shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Wearable data helps improve your PCOS risk predictions by providing real-time 
              physiological signals like heart rate variability, sleep quality, and activity levels.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectedDevicesScreen;
