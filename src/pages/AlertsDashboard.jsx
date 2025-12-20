import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Plane, Calendar, Shield, Info, Bell, BellOff, Settings } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function AlertsDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTypes, setSelectedTypes] = useState(["all"]);
  const [selectedRegions, setSelectedRegions] = useState(["all"]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['travelAlerts'],
    queryFn: () => base44.entities.TravelAlert.filter({ active: true }, "-created_date"),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Load user preferences
  useEffect(() => {
    const savedPreferences = user?.alert_preferences;
    if (savedPreferences) {
      setSelectedTypes(savedPreferences.types || ["all"]);
      setSelectedRegions(savedPreferences.regions || ["all"]);
      setNotificationsEnabled(savedPreferences.notifications !== false);
    }
  }, [user]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs) => base44.auth.updateMe({ 
      alert_preferences: prefs 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const savePreferences = () => {
    updatePreferencesMutation.mutate({
      types: selectedTypes,
      regions: selectedRegions,
      notifications: notificationsEnabled
    });
    alert("✅ Alert preferences saved!");
  };

  const alertTypes = [
    { value: "all", label: "All Alerts", icon: Info },
    { value: "weather", label: "Weather", icon: Cloud },
    { value: "flight", label: "Flights", icon: Plane },
    { value: "festival", label: "Festivals", icon: Calendar },
    { value: "safety", label: "Safety", icon: Shield }
  ];

  const regions = ["all", "Kathmandu Valley", "Pokhara", "Khumbu/Everest", "Annapurna", "Chitwan", "Lumbini", "Nationwide"];

  const severityStyles = {
    info: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    warning: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
    critical: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" }
  };

  const typeIcons = {
    weather: Cloud,
    flight: Plane,
    festival: Calendar,
    safety: Shield,
    general: Info
  };

  const filteredAlerts = alerts.filter(alert => {
    const typeMatch = selectedTypes.includes("all") || selectedTypes.includes(alert.type);
    const regionMatch = selectedRegions.includes("all") || 
                        selectedRegions.includes(alert.region) ||
                        alert.region === "Nationwide";
    return typeMatch && regionMatch;
  });

  const toggleType = (type) => {
    if (type === "all") {
      setSelectedTypes(["all"]);
    } else {
      const newTypes = selectedTypes.includes("all") 
        ? [type]
        : selectedTypes.includes(type)
          ? selectedTypes.filter(t => t !== type)
          : [...selectedTypes.filter(t => t !== "all"), type];
      setSelectedTypes(newTypes.length ? newTypes : ["all"]);
    }
  };

  const toggleRegion = (region) => {
    if (region === "all") {
      setSelectedRegions(["all"]);
    } else {
      const newRegions = selectedRegions.includes("all")
        ? [region]
        : selectedRegions.includes(region)
          ? selectedRegions.filter(r => r !== region)
          : [...selectedRegions.filter(r => r !== "all"), region];
      setSelectedRegions(newRegions.length ? newRegions : ["all"]);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="relative h-52 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-red-900/90" />
        <div className="relative z-10 text-center text-white px-4">
          <Bell className="w-12 h-12 mx-auto mb-3 animate-pulse" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Travel Alerts Dashboard</h1>
          <p className="text-orange-200">Real-time updates for safe travel</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{alerts.length}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{alerts.length - criticalCount - warningCount}</div>
              <div className="text-sm text-gray-600">Info</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Settings */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex justify-between items-center">
              <CardTitle>Filter & Preferences</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  variant={notificationsEnabled ? "default" : "outline"}
                  size="sm"
                  className={notificationsEnabled ? "bg-green-600" : ""}
                >
                  {notificationsEnabled ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
                  Notifications
                </Button>
                <Button onClick={savePreferences} size="sm" className="bg-orange-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Alert Types</h4>
                <div className="flex flex-wrap gap-2">
                  {alertTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedTypes.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        onClick={() => toggleType(type.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isSelected
                            ? "bg-orange-600 text-white shadow-lg"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-orange-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Regions</h4>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => {
                    const isSelected = selectedRegions.includes(region);
                    return (
                      <button
                        key={region}
                        onClick={() => toggleRegion(region)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          isSelected
                            ? "bg-red-600 text-white shadow-lg"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-red-400"
                        }`}
                      >
                        {region === "all" ? "All Regions" : region}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const Icon = typeIcons[alert.type];
            const styles = severityStyles[alert.severity];
            return (
              <Card key={alert.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${styles.bg}`}>
                      <Icon className={`w-6 h-6 ${styles.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{alert.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`${styles.bg} ${styles.text} ${styles.border} border`}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{alert.type}</Badge>
                            {alert.region && <Badge variant="outline">{alert.region}</Badge>}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {format(new Date(alert.created_date), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-3 leading-relaxed">{alert.description}</p>
                      {(alert.start_date || alert.end_date) && (
                        <div className="mt-3 flex gap-4 text-sm text-gray-600">
                          {alert.start_date && (
                            <span>From: {format(new Date(alert.start_date), "MMM d, yyyy")}</span>
                          )}
                          {alert.end_date && (
                            <span>To: {format(new Date(alert.end_date), "MMM d, yyyy")}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-20 text-center">
              <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching alerts</h3>
              <p className="text-gray-500">Adjust your filters to see more alerts</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}