import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Cloud, Plane, Calendar, Shield, Info } from "lucide-react";
import { format } from "date-fns";

export default function Alerts() {
  const [selectedType, setSelectedType] = useState("all");

  const { data: alerts = [] } = useQuery({
    queryKey: ['travelAlerts'],
    queryFn: () => base44.entities.TravelAlert.filter({ active: true }, "-created_date"),
  });

  const alertTypes = [
    { value: "all", label: "All Alerts", icon: Info },
    { value: "weather", label: "Weather", icon: Cloud },
    { value: "flight", label: "Flights", icon: Plane },
    { value: "festival", label: "Festivals", icon: Calendar },
    { value: "safety", label: "Safety", icon: Shield }
  ];

  const severityStyles = {
    info: "bg-blue-100 text-blue-700 border-blue-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    critical: "bg-red-100 text-red-700 border-red-200"
  };

  const typeIcons = {
    weather: Cloud,
    flight: Plane,
    festival: Calendar,
    safety: Shield,
    general: Info
  };

  const filteredAlerts = selectedType === "all" 
    ? alerts 
    : alerts.filter(a => a.type === selectedType);

  return (
    <div className="min-h-screen">
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=400&fit=crop"
            alt="Travel Alerts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-red-900/90" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Travel Alerts</h1>
          <p className="text-xl text-orange-200">Stay informed with real-time updates</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {alertTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedType === type.value
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-orange-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const Icon = typeIcons[alert.type];
            return (
              <Card key={alert.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${severityStyles[alert.severity]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{alert.title}</h3>
                          <div className="flex gap-2">
                            <Badge className={`${severityStyles[alert.severity]} border`}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{alert.type}</Badge>
                            {alert.region && (
                              <Badge variant="outline">{alert.region}</Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(alert.created_date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-3">{alert.description}</p>
                      {(alert.start_date || alert.end_date) && (
                        <div className="mt-3 text-sm text-gray-600">
                          {alert.start_date && <span>From: {format(new Date(alert.start_date), "MMM d, yyyy")}</span>}
                          {alert.start_date && alert.end_date && <span className="mx-2">•</span>}
                          {alert.end_date && <span>To: {format(new Date(alert.end_date), "MMM d, yyyy")}</span>}
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
          <div className="text-center py-20">
            <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No alerts at this time</h3>
            <p className="text-gray-500">All clear! Check back for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}