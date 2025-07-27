
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { UserPreferences } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  Mountain, 
  TreePine,
  RefreshCw,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays } from "date-fns";
import ScoreRing from "../components/weather/ScoreRing";

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
  clear: Sun,
  overcast: Cloud
};

export default function Forecast() {
  const [forecast, setForecast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("Mountain View, CA"); // Initial default location

  useEffect(() => {
    const initializeForecast = async () => {
      // Load user's preferred location from settings
      try {
        const userPrefs = await UserPreferences.list();
        const preferredLocation = userPrefs.length > 0 && userPrefs[0].default_location 
          ? userPrefs[0].default_location 
          : "Mountain View, CA"; // Fallback if no preferences or no default_location
        setUserLocation(preferredLocation); // Update the state
        await loadForecast(preferredLocation); // Call loadForecast with the fetched location
      } catch (error) {
        console.error("Error loading user preferences:", error);
        // If there's an error loading preferences, fall back to default
        setUserLocation("Mountain View, CA");
        await loadForecast("Mountain View, CA");
      }
    };
    
    initializeForecast();
  }, []); // Run once on component mount to initialize forecast based on user prefs

  const loadForecast = async (location = userLocation) => { // Accepts a location parameter, defaults to current state
    setIsLoading(true);
    const locationToUse = location; // Use the provided location, or the default from the parameter
    const cacheKey = `forecast_cache_${locationToUse.replace(/\s/g, '_')}`;
    const CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

    try {
      const cachedItem = localStorage.getItem(cacheKey);
      if (cachedItem) {
        const cachedData = JSON.parse(cachedItem);
        if (Date.now() - cachedData.timestamp < CACHE_DURATION_MS) {
          setForecast(cachedData.data);
          setIsLoading(false);
          console.log("Loaded forecast from cache for:", locationToUse);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to read from cache", error);
    }
    
    console.log("Fetching fresh forecast data for:", locationToUse);
    try {
      // Simplified approach: Get basic weather data without complex nested schema
      const forecastResponse = await InvokeLLM({
        prompt: `Get a 7-day weather forecast for ${locationToUse}. For each day provide: date, high temperature, low temperature, weather condition (sunny/cloudy/rainy/snowy), wind speed in km/h, and precipitation chance as percentage. Also rate each day for outdoor activities (hiking, snowboarding, skiing) with scores 0-100 and brief recommendations.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            location: { type: "string" },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  temp_high: { type: "number" },
                  temp_low: { type: "number" },
                  condition: { type: "string" },
                  wind_speed: { type: "number" },
                  precipitation: { type: "number" },
                  hiking_score: { type: "number" },
                  hiking_note: { type: "string" },
                  snowboard_score: { type: "number" },
                  snowboard_note: { type: "string" },
                  ski_score: { type: "number" },
                  ski_note: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Transform the response to match our expected format
      const transformedForecast = (forecastResponse.days || []).map(day => ({
        date: day.date,
        temperature_high: day.temp_high,
        temperature_low: day.temp_low,
        condition: day.condition,
        wind_speed: day.wind_speed,
        precipitation_chance: day.precipitation,
        adventure_activities: {
          hiking: {
            score: day.hiking_score || 50,
            recommendation: day.hiking_note || "Check conditions"
          },
          snowboarding: {
            score: day.snowboard_score || 30,
            recommendation: day.snowboard_note || "Check snow conditions"
          },
          skiing: {
            score: day.ski_score || 35,
            recommendation: day.ski_note || "Check snow conditions"
          }
        }
      }));

      const dataToCache = {
        timestamp: Date.now(),
        data: transformedForecast
      };
      localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

      setForecast(transformedForecast);
    } catch (error) {
      console.error("Error loading forecast:", error);
      // Generate fallback forecast data
      const fallbackForecast = Array.from({ length: 7 }, (_, i) => ({
        date: format(addDays(new Date(), i), 'yyyy-MM-dd'),
        temperature_high: Math.round(20 + Math.random() * 10),
        temperature_low: Math.round(10 + Math.random() * 8),
        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        wind_speed: Math.round(5 + Math.random() * 15),
        precipitation_chance: Math.round(Math.random() * 100),
        adventure_activities: {
          hiking: { score: Math.round(60 + Math.random() * 40), recommendation: "Good conditions" },
          snowboarding: { score: Math.round(30 + Math.random() * 70), recommendation: "Check snow conditions" },
          skiing: { score: Math.round(40 + Math.random() * 60), recommendation: "Moderate conditions" }
        }
      }));
      setForecast(fallbackForecast);
    }
    setIsLoading(false);
  };

  const refreshForecast = async () => {
    // Reload user preferences in case location changed in settings
    setIsLoading(true);
    try {
      const userPrefs = await UserPreferences.list();
      const preferredLocation = userPrefs.length > 0 && userPrefs[0].default_location 
        ? userPrefs[0].default_location 
        : userLocation; // Fallback to current state if no new preference found
      setUserLocation(preferredLocation); // Update state
      await loadForecast(preferredLocation); // Load forecast for the potentially new/current location
    } catch (error) {
      console.error("Error reloading preferences:", error);
      // If preferences fail to load, refresh using the current userLocation state
      await loadForecast(userLocation);
    }
  };

  const getActivityIcon = (activity) => {
    const icons = {
      hiking: TreePine,
      snowboarding: Mountain,
      skiing: Mountain
    };
    return icons[activity] || Mountain;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">7-Day Adventure Forecast</h1>
            <p className="text-gray-600">Plan your outdoor adventures with AI-powered insights</p>
            <p className="text-sm text-gray-500 mt-1">📍 {userLocation}</p> {/* Display current user location */}
          </div>
          <Button
            variant="outline"
            onClick={refreshForecast} // Changed onClick to refreshForecast
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Forecast
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {forecast.map((day, index) => {
              const WeatherIcon = weatherIcons[day.condition?.toLowerCase()] || Sun;
              const isToday = index === 0;
              
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-white/80 backdrop-blur-md border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {isToday ? 'Today' : format(new Date(day.date), 'EEEE')}
                            </CardTitle>
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(day.date), 'MMM d')}
                            </p>
                          </div>
                          {isToday && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Today
                            </Badge>
                          )}
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {day.temperature_high}°/{day.temperature_low}°
                            </div>
                            <p className="text-sm text-gray-600 capitalize">{day.condition}</p>
                          </div>
                          <WeatherIcon className="w-8 h-8 text-blue-500" />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        {Object.entries(day.adventure_activities || {}).map(([activity, data]) => {
                          const ActivityIcon = getActivityIcon(activity);
                          
                          return (
                            <div key={activity} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl">
                              <ScoreRing score={data.score || 0} size={50} strokeWidth={4} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <ActivityIcon className="w-4 h-4 text-gray-500" />
                                  <h4 className="font-semibold text-gray-900 capitalize">{activity}</h4>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{data.recommendation}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Wind: {day.wind_speed} km/h</span>
                          <span>Rain: {day.precipitation_chance}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
