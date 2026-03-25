import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, AlertTriangle, Plane, CalendarDays, RefreshCw, CheckCircle, Info } from "lucide-react";
import { format } from "date-fns";

export default function LiveTravelInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLiveInfo = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "MMMM d, yyyy");
      const month = format(new Date(), "MMMM");
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Today's date is ${today}. You are a Nepal travel advisor. Provide CURRENT, DATE-SPECIFIC live travel information for Nepal right now.

Return a JSON with exactly this structure:
{
  "season": "string (current trekking season status: peak/off-season/shoulder, with brief reason)",
  "weather": "string (current typical weather in Nepal in ${month}, 1 sentence)",
  "trekking_conditions": "string (current trail conditions for ${month}, 1 sentence)",
  "top_tip": "string (the single most important travel tip specific to ${month} in Nepal)",
  "festivals_this_month": ["array of Nepal festivals/events happening in ${month}"],
  "flight_advisory": "string (any general flight/travel advisory for Nepal in ${month})",
  "visa_info": "string (current Nepal visa info, 1 sentence)",
  "status": "good" or "caution" or "warning"
}`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            season: { type: "string" },
            weather: { type: "string" },
            trekking_conditions: { type: "string" },
            top_tip: { type: "string" },
            festivals_this_month: { type: "array", items: { type: "string" } },
            flight_advisory: { type: "string" },
            visa_info: { type: "string" },
            status: { type: "string" }
          }
        }
      });
      setData(result);
      setLastUpdated(new Date());
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLiveInfo(); }, []);

  const statusConfig = {
    good: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, label: "Good to Go" },
    caution: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertTriangle, label: "Some Caution" },
    warning: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle, label: "Travel Warning" },
  };

  const st = statusConfig[data?.status] || statusConfig.good;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-amber-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <CalendarDays className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">Live Travel Advice</p>
            <p className="text-xs text-amber-200">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchLiveInfo}
          disabled={loading}
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + i*10}%` }} />
          ))}
        </div>
      ) : data ? (
        <div className="p-5 space-y-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${st.color} border flex items-center gap-1`}>
              <st.icon className="w-3 h-3" />
              Nepal Travel Status: {st.label}
            </Badge>
            {lastUpdated && (
              <span className="text-xs text-gray-400">Updated {format(lastUpdated, "h:mm a")}</span>
            )}
          </div>

          {/* Season */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
            <CalendarDays className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Current Season</p>
              <p className="text-sm text-gray-700">{data.season}</p>
            </div>
          </div>

          {/* Weather */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
            <Cloud className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5">Weather Right Now</p>
              <p className="text-sm text-gray-700">{data.weather}</p>
            </div>
          </div>

          {/* Trekking conditions */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Trail Conditions</p>
              <p className="text-sm text-gray-700">{data.trekking_conditions}</p>
            </div>
          </div>

          {/* Festivals */}
          {data.festivals_this_month?.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
              <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">This Month's Festivals</p>
                <div className="flex flex-wrap gap-1">
                  {data.festivals_this_month.map((f, i) => (
                    <Badge key={i} variant="secondary" className="bg-purple-100 text-purple-700 text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top tip */}
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-0.5">Top Tip for Today</p>
              <p className="text-sm text-gray-700 font-medium">{data.top_tip}</p>
            </div>
          </div>

          {/* Flight & Visa */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Plane className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{data.flight_advisory}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{data.visa_info}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-400 text-sm">
          Could not load live data. <button onClick={fetchLiveInfo} className="text-red-600 underline">Retry</button>
        </div>
      )}
    </div>
  );
}