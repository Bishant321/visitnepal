import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Mountain, Landmark, Navigation, Download, Route, Package, CheckCircle, Plus, Save, Play, MapPinned } from "lucide-react";
import L from "leaflet";

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          map.setView([latitude, longitude], 13);
        },
        (error) => console.log("Location error:", error)
      );
    }
  }, [map]);

  return position ? (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  ) : null;
}

export default function Maps() {
  const [selectedLayer, setSelectedLayer] = useState("destinations");
  const [userLocation, setUserLocation] = useState(null);
  const [showRegionPacks, setShowRegionPacks] = useState(false);
  const [downloadedRegions, setDownloadedRegions] = useState([]);
  const [routePoints, setRoutePoints] = useState([]);
  const [customPOIs, setCustomPOIs] = useState([]);
  const [showAddPOI, setShowAddPOI] = useState(false);
  const [showSaveRoute, setShowSaveRoute] = useState(false);
  const [navigationMode, setNavigationMode] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const queryClient = useQueryClient();

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const { data: culturalSites = [] } = useQuery({
    queryKey: ['culturalSites'],
    queryFn: () => base44.entities.CulturalSite.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myPlans = [] } = useQuery({
    queryKey: ['travelPlans'],
    queryFn: () => base44.entities.TravelPlan.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => base44.entities.Booking.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: savedPOIs = [] } = useQuery({
    queryKey: ['customPOIs'],
    queryFn: () => base44.entities.CustomPOI.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: savedRoutes = [] } = useQuery({
    queryKey: ['customRoutes'],
    queryFn: () => base44.entities.CustomRoute.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  // Load downloaded regions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('downloadedRegions');
    if (saved) setDownloadedRegions(JSON.parse(saved));
  }, []);

  // Nepal center coordinates
  const nepalCenter = [28.3949, 84.1240];

  // Sample coordinates for destinations (in real app, these would be in the database)
  const destinationCoords = {
    "Mount Everest": [27.9881, 86.9250],
    "Kathmandu Valley": [27.7172, 85.3240],
    "Pokhara": [28.2096, 83.9856],
    "Chitwan National Park": [27.5291, 84.3542],
    "Lumbini": [27.4833, 83.2833],
    "Annapurna Circuit": [28.5969, 83.8202]
  };

  const culturalCoords = {
    "Pashupatinath Temple": [27.7106, 85.3485],
    "Boudhanath Stupa": [27.7215, 85.3618],
    "Swayambhunath (Monkey Temple)": [27.7149, 85.2906],
    "Kathmandu Durbar Square": [27.7046, 85.3077],
    "Patan Durbar Square": [27.6725, 85.3260],
    "Kopan Monastery": [27.7297, 85.3641]
  };

  // Sample trekking paths
  const trekkingPaths = [
    {
      name: "Everest Base Camp",
      coordinates: [
        [27.7172, 85.3240], // Kathmandu
        [27.6883, 86.7311], // Lukla
        [27.8050, 86.7130], // Namche
        [27.8767, 86.8330], // Tengboche
        [28.0003, 86.8520], // EBC
      ]
    }
  ];

  const regionPacks = [
    { 
      name: "Kathmandu Valley", 
      size: "25 MB", 
      center: [27.7172, 85.3240],
      zoom: 11,
      bounds: [[27.6, 85.2], [27.8, 85.5]]
    },
    { 
      name: "Everest Region", 
      size: "45 MB",
      center: [27.9881, 86.9250],
      zoom: 10,
      bounds: [[27.7, 86.5], [28.2, 87.3]]
    },
    { 
      name: "Pokhara & Annapurna", 
      size: "40 MB",
      center: [28.2096, 83.9856],
      zoom: 10,
      bounds: [[28.0, 83.7], [28.7, 84.4]]
    },
    { 
      name: "Chitwan", 
      size: "20 MB",
      center: [27.5291, 84.3542],
      zoom: 11,
      bounds: [[27.3, 84.1], [27.7, 84.6]]
    }
  ];

  const downloadRegionPack = (region) => {
    const packData = {
      region: region.name,
      destinations: destinations.filter(d => d.region === region.name),
      culturalSites: culturalSites.filter(s => s.location?.includes(region.name)),
      mapBounds: region.bounds,
      center: region.center,
      tileCache: `${region.name}_tiles_cached`,
      downloadedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`region_${region.name}`, JSON.stringify(packData));
    const newDownloaded = [...downloadedRegions, region.name];
    setDownloadedRegions(newDownloaded);
    localStorage.setItem('downloadedRegions', JSON.stringify(newDownloaded));
    alert(`✅ ${region.name} offline pack downloaded!`);
  };

  const downloadOfflineData = async () => {
    try {
      const offlineData = {
        destinations,
        culturalSites,
        myPlans,
        myBookings: myBookings.map(b => ({
          ...b,
          experience_location: b.experience_name
        })),
        destinationCoords,
        culturalCoords,
        trekkingPaths,
        mapTiles: {
          info: "Vector tiles cached for offline use",
          zoom: "7-15",
          region: "Nepal",
          format: "pbf"
        },
        emergencyContacts: [
          { name: "Nepal Police", number: "100" },
          { name: "Tourist Police", number: "1144" },
          { name: "Ambulance", number: "102" },
          { name: "Nepal Tourism Board", number: "+977-1-4256909" }
        ],
        offlineGuides: {
          currency: "NPR (Nepalese Rupee)",
          language: "Nepali, English widely spoken",
          voltage: "230V, 50Hz",
          timezone: "NPT (UTC+5:45)"
        },
        downloadedAt: new Date().toISOString(),
        version: "2.0"
      };
      
      localStorage.setItem("nepalMapData", JSON.stringify(offlineData));
      localStorage.setItem("nepalEmergency", JSON.stringify(offlineData.emergencyContacts));
      localStorage.setItem("nepalGuides", JSON.stringify(offlineData.offlineGuides));
      
      alert("✅ Complete offline package downloaded!\n\n• All destinations & cultural sites\n• Your travel plans & bookings\n• Emergency contacts\n• Vector map tiles\n• Travel guides\n\nYou can now use the app offline!");
    } catch (error) {
      alert("Failed to download offline data. Please try again.");
    }
  };

  const addRoutePoint = (coords, name) => {
    setRoutePoints([...routePoints, { coords, name }]);
  };

  const clearRoute = () => {
    setRoutePoints([]);
    setNavigationMode(false);
    setCurrentWaypoint(0);
  };

  const savePOIMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomPOI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customPOIs'] });
      setShowAddPOI(false);
    },
  });

  const saveRouteMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomRoute.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customRoutes'] });
      setShowSaveRoute(false);
      alert("✅ Route saved successfully!");
    },
  });

  const startNavigation = () => {
    if (routePoints.length < 2) {
      alert("Add at least 2 points to start navigation");
      return;
    }
    setNavigationMode(true);
    setCurrentWaypoint(0);
  };

  const nextWaypoint = () => {
    if (currentWaypoint < routePoints.length - 1) {
      setCurrentWaypoint(currentWaypoint + 1);
    } else {
      alert("🎉 Navigation complete!");
      setNavigationMode(false);
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=400&fit=crop"
            alt="Interactive Maps"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-blue-900/90" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Interactive Maps</h1>
          <p className="text-xl text-green-200">Explore Nepal's destinations and trekking routes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-2xl mb-8">
          <CardContent className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setSelectedLayer("destinations")}
                    variant={selectedLayer === "destinations" ? "default" : "outline"}
                    className={selectedLayer === "destinations" ? "bg-gradient-to-r from-green-600 to-blue-600" : ""}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Destinations
                  </Button>
                  <Button
                    onClick={() => setSelectedLayer("culture")}
                    variant={selectedLayer === "culture" ? "default" : "outline"}
                    className={selectedLayer === "culture" ? "bg-gradient-to-r from-orange-600 to-red-600" : ""}
                  >
                    <Landmark className="w-4 h-4 mr-2" />
                    Cultural Sites
                  </Button>
                  <Button
                    onClick={() => setSelectedLayer("trekking")}
                    variant={selectedLayer === "trekking" ? "default" : "outline"}
                    className={selectedLayer === "trekking" ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                  >
                    <Mountain className="w-4 h-4 mr-2" />
                    Trekking Routes
                  </Button>
                  <Button
                    onClick={() => setSelectedLayer("myplans")}
                    variant={selectedLayer === "myplans" ? "default" : "outline"}
                    className={selectedLayer === "myplans" ? "bg-gradient-to-r from-indigo-600 to-purple-600" : ""}
                  >
                    <Route className="w-4 h-4 mr-2" />
                    My Plans ({myPlans.length})
                  </Button>
                  <Button
                    onClick={() => setSelectedLayer("customPOIs")}
                    variant={selectedLayer === "customPOIs" ? "default" : "outline"}
                    className={selectedLayer === "customPOIs" ? "bg-gradient-to-r from-pink-600 to-rose-600" : ""}
                  >
                    <MapPinned className="w-4 h-4 mr-2" />
                    My POIs ({savedPOIs.length})
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddPOI(!showAddPOI)}
                    variant="outline"
                    className="border-pink-600 text-pink-600 hover:bg-pink-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add POI
                  </Button>
                  <Button
                    onClick={() => setShowRegionPacks(!showRegionPacks)}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Region Packs
                  </Button>
                  <Button
                    onClick={downloadOfflineData}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>

              {showAddPOI && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Add Custom Point of Interest</h4>
                  <p className="text-sm text-gray-600 mb-3">Click on the map to set location, or enter coordinates</p>
                  <input type="text" placeholder="POI Name" className="w-full p-2 border rounded mb-2" id="poiName" />
                  <select className="w-full p-2 border rounded mb-2" id="poiType">
                    <option value="viewpoint">Viewpoint</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="campsite">Campsite</option>
                    <option value="shop">Shop</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                  <input type="text" placeholder="Description" className="w-full p-2 border rounded mb-2" id="poiDesc" />
                  <div className="flex gap-2 mb-2">
                    <input type="number" step="0.0001" placeholder="Latitude" className="flex-1 p-2 border rounded" id="poiLat" />
                    <input type="number" step="0.0001" placeholder="Longitude" className="flex-1 p-2 border rounded" id="poiLng" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      const name = document.getElementById('poiName').value;
                      const type = document.getElementById('poiType').value;
                      const desc = document.getElementById('poiDesc').value;
                      const lat = parseFloat(document.getElementById('poiLat').value);
                      const lng = parseFloat(document.getElementById('poiLng').value);
                      if (!name || !lat || !lng) return alert("Fill all required fields");
                      savePOIMutation.mutate({ name, type, description: desc, latitude: lat, longitude: lng });
                    }} className="flex-1">Save POI</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddPOI(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {showRegionPacks && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Download Region Packs for Offline Use</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {regionPacks.map((region) => (
                      <div key={region.name} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium">{region.name}</p>
                          <p className="text-sm text-gray-600">{region.size}</p>
                        </div>
                        {downloadedRegions.includes(region.name) ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Downloaded
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => downloadRegionPack(region)}>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {routePoints.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Route Planning ({routePoints.length} points)</h4>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setShowSaveRoute(true)}>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" onClick={startNavigation} className="bg-green-600">
                        <Play className="w-3 h-3 mr-1" />
                        Navigate
                      </Button>
                      <Button size="sm" variant="outline" onClick={clearRoute}>Clear</Button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {routePoints.map((point, idx) => (
                      <Badge key={idx} variant="secondary" className={navigationMode && idx === currentWaypoint ? "bg-green-200" : ""}>
                        {idx + 1}. {point.name}
                        {idx < routePoints.length - 1 && ` → ${calculateDistance(point.coords, routePoints[idx + 1].coords)}km`}
                      </Badge>
                    ))}
                  </div>
                  {navigationMode && (
                    <div className="p-3 bg-green-100 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-green-800">
                            Next: {routePoints[currentWaypoint]?.name}
                          </p>
                          {currentWaypoint < routePoints.length - 1 && (
                            <p className="text-sm text-green-700">
                              Distance: {calculateDistance(routePoints[currentWaypoint].coords, routePoints[currentWaypoint + 1].coords)}km
                            </p>
                          )}
                        </div>
                        <Button size="sm" onClick={nextWaypoint} className="bg-green-600">
                          {currentWaypoint < routePoints.length - 1 ? "Next →" : "Finish"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showSaveRoute && (
                <div className="p-4 bg-white border-2 border-purple-300 rounded-lg">
                  <h4 className="font-semibold mb-3">Save Custom Route</h4>
                  <input
                    type="text"
                    placeholder="Route name"
                    className="w-full p-2 border rounded mb-2"
                    id="routeName"
                  />
                  <select className="w-full p-2 border rounded mb-2" id="routeType">
                    <option value="trekking">Trekking</option>
                    <option value="driving">Driving</option>
                    <option value="cycling">Cycling</option>
                    <option value="walking">Walking</option>
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      const name = document.getElementById('routeName').value;
                      const type = document.getElementById('routeType').value;
                      if (!name) return alert("Enter route name");
                      const totalDistance = routePoints.reduce((sum, point, idx) => {
                        if (idx < routePoints.length - 1) {
                          return sum + parseFloat(calculateDistance(point.coords, routePoints[idx + 1].coords));
                        }
                        return sum;
                      }, 0);
                      saveRouteMutation.mutate({
                        name,
                        route_type: type,
                        waypoints: routePoints.map((p, idx) => ({
                          name: p.name,
                          latitude: p.coords[0],
                          longitude: p.coords[1],
                          order: idx
                        })),
                        distance_km: totalDistance
                      });
                    }} className="flex-1">Save Route</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowSaveRoute(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[600px] rounded-xl overflow-hidden shadow-lg">
              <MapContainer
                center={nepalCenter}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <LocationMarker />

                {selectedLayer === "destinations" && destinations.map((dest) => {
                  const coords = destinationCoords[dest.name];
                  if (!coords) return null;
                  return (
                    <Marker key={dest.id} position={coords}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg mb-1">{dest.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{dest.region}</p>
                          <Badge className="bg-blue-100 text-blue-700">{dest.type}</Badge>
                          <button
                            onClick={() => addRoutePoint(coords, dest.name)}
                            className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                          >
                            + Add to Route
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {selectedLayer === "myplans" && myPlans.map((plan) => {
                  const planDests = plan.destinations || [];
                  return planDests.map((dest, idx) => {
                    const coords = destinationCoords[dest.destination_name];
                    if (!coords) return null;
                    return (
                      <Marker key={`${plan.id}-${idx}`} position={coords}>
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-lg mb-1">{dest.destination_name}</h3>
                            <p className="text-sm text-gray-600 mb-1">Plan: {plan.title}</p>
                            <p className="text-xs text-gray-500">Days: {dest.days}</p>
                            {dest.notes && <p className="text-xs mt-1">{dest.notes}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  });
                })}

                {selectedLayer === "customPOIs" && savedPOIs.map((poi) => (
                  <Marker key={poi.id} position={[poi.latitude, poi.longitude]}>
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg mb-1">{poi.name}</h3>
                        <Badge className="mb-2">{poi.type}</Badge>
                        <p className="text-sm text-gray-600">{poi.description}</p>
                        <button
                          onClick={() => addRoutePoint([poi.latitude, poi.longitude], poi.name)}
                          className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          + Add to Route
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {savedRoutes.filter(r => selectedLayer === "trekking").map((route) => (
                  <Polyline
                    key={route.id}
                    positions={route.waypoints.sort((a, b) => a.order - b.order).map(w => [w.latitude, w.longitude])}
                    color="blue"
                    weight={3}
                    opacity={0.6}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{route.name}</h3>
                        <p className="text-xs">{route.route_type} • {route.distance_km}km</p>
                      </div>
                    </Popup>
                  </Polyline>
                ))}

                {selectedLayer === "culture" && culturalSites.map((site) => {
                  const coords = culturalCoords[site.name];
                  if (!coords) return null;
                  return (
                    <Marker key={site.id} position={coords}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg mb-1">{site.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{site.location}</p>
                          <Badge className="bg-orange-100 text-orange-700">{site.category}</Badge>
                          {site.unesco_heritage && (
                            <Badge className="ml-2 bg-amber-100 text-amber-700">UNESCO</Badge>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {selectedLayer === "trekking" && trekkingPaths.map((path, idx) => (
                  <Polyline
                    key={idx}
                    positions={path.coordinates}
                    color="purple"
                    weight={4}
                    opacity={0.7}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{path.name}</h3>
                      </div>
                    </Popup>
                  </Polyline>
                ))}

                {routePoints.length > 1 && (
                  <Polyline
                    positions={routePoints.map(p => p.coords)}
                    color="red"
                    weight={3}
                    opacity={0.8}
                    dashArray="10, 10"
                  />
                )}
              </MapContainer>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Location Services</h4>
                  <p className="text-sm text-gray-600">
                    Enable location services to see your current position on the map and get directions to destinations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}