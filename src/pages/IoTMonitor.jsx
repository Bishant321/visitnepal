import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CloudRain, Wind, Droplets, AlertTriangle, CheckCircle, 
  Users, Thermometer, Activity, MapPin, TrendingUp, TrendingDown
} from "lucide-react";
import { format } from "date-fns";

export default function IoTMonitor() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const { data: sensorData = [] } = useQuery({
    queryKey: ['iotSensorData'],
    queryFn: () => base44.entities.IoTSensorData.list("-created_date", 100),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Simulate real-time data generation
  useEffect(() => {
    const interval = setInterval(async () => {
      if (destinations.length === 0) return;
      
      const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
      const sensorTypes = ['weather', 'air_quality', 'crowd_level', 'temperature', 'humidity'];
      const randomSensor = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
      
      let value, unit, status;
      switch(randomSensor) {
        case 'temperature':
          value = Math.round(15 + Math.random() * 15);
          unit = '°C';
          status = value > 30 ? 'warning' : 'normal';
          break;
        case 'humidity':
          value = Math.round(40 + Math.random() * 40);
          unit = '%';
          status = value > 80 ? 'warning' : 'normal';
          break;
        case 'air_quality':
          value = Math.round(50 + Math.random() * 150);
          unit = 'AQI';
          status = value > 150 ? 'critical' : value > 100 ? 'warning' : 'normal';
          break;
        case 'crowd_level':
          value = Math.round(50 + Math.random() * 200);
          unit = 'people';
          status = value > 150 ? 'warning' : 'normal';
          break;
        case 'weather':
          value = Math.round(Math.random() * 100);
          unit = '% clear';
          status = value < 30 ? 'warning' : 'normal';
          break;
      }

      try {
        await base44.entities.IoTSensorData.create({
          destination_id: randomDest.id,
          destination_name: randomDest.name,
          sensor_type: randomSensor,
          value,
          unit,
          status,
          location: randomDest.region,
          timestamp: new Date().toISOString()
        });
        queryClient.invalidateQueries({ queryKey: ['iotSensorData'] });
      } catch (error) {
        console.error('Failed to create sensor data');
      }
    }, 15000); // Generate new data every 15 seconds

    return () => clearInterval(interval);
  }, [destinations]);

  const sensorIcons = {
    weather: CloudRain,
    air_quality: Wind,
    crowd_level: Users,
    temperature: Thermometer,
    humidity: Droplets
  };

  const statusColors = {
    normal: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    warning: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
    critical: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" }
  };

  // Group latest readings by destination
  const latestByDestination = sensorData.reduce((acc, reading) => {
    if (!acc[reading.destination_name]) {
      acc[reading.destination_name] = {};
    }
    if (!acc[reading.destination_name][reading.sensor_type]) {
      acc[reading.destination_name][reading.sensor_type] = reading;
    }
    return acc;
  }, {});

  // Calculate statistics
  const stats = [
    { 
      label: "Active Sensors", 
      value: Object.keys(latestByDestination).length * 5,
      icon: Activity, 
      color: "text-blue-600" 
    },
    { 
      label: "Critical Alerts", 
      value: sensorData.filter(d => d.status === 'critical').length,
      icon: AlertTriangle, 
      color: "text-red-600" 
    },
    { 
      label: "Destinations Monitored", 
      value: Object.keys(latestByDestination).length,
      icon: MapPin, 
      color: "text-green-600" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-blue-50/30 to-cyan-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IoT Travel Monitor</h1>
          <p className="text-gray-600">Real-time environmental and crowd data from destinations across Nepal</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-12 h-12 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Data Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Live data • Updates every 15 seconds</span>
        </div>

        {/* Destination Cards */}
        <div className="space-y-6">
          {Object.entries(latestByDestination).map(([destName, sensors]) => {
            const hasWarning = Object.values(sensors).some(s => s.status === 'warning' || s.status === 'critical');
            
            return (
              <Card key={destName} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      {destName}
                    </CardTitle>
                    {hasWarning && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Alert
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(sensors).map(([sensorType, reading]) => {
                      const Icon = sensorIcons[sensorType] || Activity;
                      const colors = statusColors[reading.status];
                      
                      return (
                        <Card key={sensorType} className={`border ${colors.border} ${colors.bg}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Icon className={`w-5 h-5 ${colors.text}`} />
                              <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                                {reading.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1 capitalize">
                              {sensorType.replace('_', ' ')}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {reading.value}
                              <span className="text-sm font-normal text-gray-600 ml-1">
                                {reading.unit}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {format(new Date(reading.created_date), "HH:mm:ss")}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {Object.keys(latestByDestination).length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Initializing Sensors...</h3>
                <p className="text-gray-500">IoT data will appear here shortly</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader className="bg-gradient-to-r from-stone-50 to-blue-50">
            <CardTitle>Recent Sensor Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sensorData.slice(0, 20).map((reading) => {
                const Icon = sensorIcons[reading.sensor_type] || Activity;
                const colors = statusColors[reading.status];
                
                return (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{reading.destination_name}</p>
                        <p className="text-xs text-gray-600 capitalize">{reading.sensor_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{reading.value} {reading.unit}</p>
                      <p className="text-xs text-gray-500">{format(new Date(reading.created_date), "HH:mm:ss")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}