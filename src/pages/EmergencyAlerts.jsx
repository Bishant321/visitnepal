import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, Shield, Cloud, Plane, Calendar, Info, Activity,
  Mountain, Bell, BellRing, ChevronDown, ChevronRight, RefreshCw, Siren
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const TREKKING_REGIONS = [
  "Khumbu/Everest", "Annapurna", "Manaslu", "Langtang",
  "Kanchenjunga", "Dolpo", "Mustang", "Rara", "Gosaikunda"
];

const severityConfig = {
  critical: { bg: "bg-red-600", soft: "bg-red-50", text: "text-red-700", border: "border-red-200", ring: "ring-red-500", label: "CRITICAL", pulse: true },
  warning:  { bg: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-500", label: "WARNING", pulse: false },
  info:     { bg: "bg-blue-500", soft: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", ring: "ring-blue-500", label: "INFO", pulse: false },
};

const typeIcons = { weather: Cloud, flight: Plane, festival: Calendar, safety: Shield, general: Info };

export default function EmergencyAlerts() {
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(false);
  const knownAlertIds = useRef(new Set());
  const firstLoad = useRef(true);

  const { data: alerts = [], refetch, isFetching } = useQuery({
    queryKey: ['emergencyTravelAlerts'],
    queryFn: () => base44.entities.TravelAlert.filter({ active: true }, "-created_date"),
    refetchInterval: 15000, // real-time refresh every 15s
  });

  // Track new alerts for immediate notification
  useEffect(() => {
    if (!alerts.length) return;
    const currentIds = new Set(alerts.map(a => a.id));
    if (!firstLoad.current) {
      const newOnes = alerts.filter(a => !knownAlertIds.current.has(a.id) && a.severity === "critical");
      if (newOnes.length && browserNotifEnabled && Notification.permission === "granted") {
        newOnes.forEach(a => {
          new Notification("🚨 Trek Safety Emergency", {
            body: `${a.title} — ${a.region || "Nationwide"}`,
            icon: "/favicon.ico",
          });
        });
      }
    }
    knownAlertIds.current = currentIds;
    firstLoad.current = false;
    setLastUpdated(new Date());
  }, [alerts, browserNotifEnabled]);

  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const trekkingAlerts = alerts.filter(a =>
    TREKKING_REGIONS.some(r => a.region?.toLowerCase().includes(r.toLowerCase())) ||
    a.region === "Nationwide"
  );

  // Group by region
  const byRegion = TREKKING_REGIONS.map(region => ({
    region,
    alerts: trekkingAlerts.filter(a => a.region?.toLowerCase().includes(region.toLowerCase())),
  })).filter(g => g.alerts.length > 0);

  const nationwideAlerts = trekkingAlerts.filter(a => a.region === "Nationwide");
  const otherAlerts = trekkingAlerts.filter(a =>
    !TREKKING_REGIONS.some(r => a.region?.toLowerCase().includes(r.toLowerCase())) &&
    a.region !== "Nationwide"
  );

  const enableBrowserNotif = async () => {
    if (!("Notification" in window)) return alert("Notifications not supported on this device");
    const perm = await Notification.requestPermission();
    if (perm === "granted") setBrowserNotifEnabled(true);
  };

  const handleManualRefresh = () => refetch();

  const AlertCard = ({ alert, prominent }) => {
    const Icon = typeIcons[alert.type] || Info;
    const cfg = severityConfig[alert.severity] || severityConfig.info;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border ${cfg.border} ${cfg.soft} overflow-hidden ${prominent ? "shadow-lg" : ""}`}
      >
        {cfg.pulse && <div className={`h-1 w-full ${cfg.bg} animate-pulse`} />}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${cfg.bg} text-white shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-base leading-tight">{alert.title}</h3>
                <span className={`text-xs font-bold ${cfg.text} whitespace-nowrap`}>{cfg.label}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {alert.region && <Badge variant="outline" className="text-xs">{alert.region}</Badge>}
                <Badge variant="outline" className="text-xs capitalize">{alert.type}</Badge>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{alert.description}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/60">
                <span className="text-xs text-gray-500">
                  {format(new Date(alert.created_date), "MMM d, HH:mm")}
                </span>
                {(alert.start_date || alert.end_date) && (
                  <span className="text-xs text-gray-500">
                    {alert.start_date && format(new Date(alert.start_date), "MMM d")}
                    {alert.start_date && alert.end_date && " → "}
                    {alert.end_date && format(new Date(alert.end_date), "MMM d")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const RegionGroup = ({ region, items }) => {
    const isOpen = expandedRegion === region;
    const critical = items.filter(a => a.severity === "critical").length;
    return (
      <Card className="border-0 shadow-md overflow-hidden">
        <button
          onClick={() => setExpandedRegion(isOpen ? null : region)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-stone-50 to-amber-50/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-900 text-white">
              <Mountain className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">{region}</h3>
              <p className="text-xs text-gray-500">{items.length} active alert{items.length !== 1 && "s"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {critical > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                {critical} CRITICAL
              </span>
            )}
            {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {items.map(a => <AlertCard key={a.id} alert={a} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/40 via-stone-50 to-amber-50/30 pb-24 md:pb-8">
      {/* Hero */}
      <div className="relative h-44 md:h-52 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-amber-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-3">
            <Siren className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Emergency Alert Center</h1>
          <p className="text-amber-200 text-sm">Real-time safety updates for trekking regions</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        {/* Critical Banner */}
        <AnimatePresence>
          {criticalAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="mb-4 rounded-2xl bg-red-600 text-white shadow-2xl shadow-red-500/40 overflow-hidden"
            >
              <div className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{criticalAlerts.length} Critical Emergency Alert{criticalAlerts.length !== 1 && "s"}</p>
                  <p className="text-red-100 text-sm">Immediate action required — review below</p>
                </div>
              </div>
              <div className="bg-red-700/50 px-4 py-2 flex items-center justify-between text-sm">
                <span className="text-red-100">Tap to enable instant phone notifications</span>
                <Button size="sm" onClick={enableBrowserNotif} className="bg-white text-red-700 hover:bg-red-50">
                  <BellRing className="w-4 h-4 mr-1" /> Enable
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status bar */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-2xl shadow-md p-3">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${isFetching ? "text-amber-500 animate-spin" : "text-green-500"}`} />
            <div>
              <p className="text-xs text-gray-500">Live • updated {format(lastUpdated, "HH:mm:ss")}</p>
              <p className="text-sm font-semibold text-gray-900">{alerts.length} active alert{alerts.length !== 1 && "s"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {browserNotifEnabled ? (
              <Badge className="bg-green-100 text-green-700 border border-green-200">
                <BellRing className="w-3 h-3 mr-1" /> Notifications on
              </Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={enableBrowserNotif}>
                <Bell className="w-4 h-4 mr-1" /> Enable Alerts
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={handleManualRefresh} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Critical alerts first */}
        {criticalAlerts.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Critical — Immediate Action
            </h2>
            <div className="space-y-3">
              {criticalAlerts.map(a => <AlertCard key={a.id} alert={a} prominent />)}
            </div>
          </div>
        )}

        {/* Nationwide */}
        {nationwideAlerts.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Nationwide
            </h2>
            <div className="space-y-3">
              {nationwideAlerts.map(a => <AlertCard key={a.id} alert={a} />)}
            </div>
          </div>
        )}

        {/* Trekking regions grouped */}
        {byRegion.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Mountain className="w-4 h-4" /> Trekking Regions
            </h2>
            <div className="space-y-3">
              {byRegion.map(g => <RegionGroup key={g.region} region={g.region} items={g.alerts} />)}
            </div>
          </div>
        )}

        {/* Other regions */}
        {otherAlerts.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Other Regions</h2>
            <div className="space-y-3">
              {otherAlerts.map(a => <AlertCard key={a.id} alert={a} />)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {alerts.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear</h3>
              <p className="text-gray-500">No active emergency alerts. Trek safely!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}