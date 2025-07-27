
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { WeatherAlert, UserPreferences, User } from "@/api/entities"; // Added User import
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Added Card import as per outline
import { RefreshCw, Plus, MapPin, Sparkles, Lock } from "lucide-react"; // Added Sparkles, Lock
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Added Link
import { createPageUrl } from "@/utils"; // Added createPageUrl

import WeatherCard from "../components/weather/WeatherCard";
import AIInsights from "../components/weather/AIInsights";

export default function Dashboard() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("Mountain View, CA");
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null); // Added user state

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me(); // Fetch current user
        setUser(currentUser);

        // Load user's preferred location from settings
        const userPrefs = await UserPreferences.list();
        const preferredLocation = userPrefs.length > 0 && userPrefs[0].default_location
          ? userPrefs[0].default_location
          : "Mountain View, CA";
        setUserLocation(preferredLocation);

        await loadDashboard(currentUser, preferredLocation); // Pass user and preferredLocation to loadDashboard
        await loadAlerts();
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const loadAlerts = async () => {
    try {
      const userAlerts = await WeatherAlert.list();
      setAlerts(userAlerts);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const loadDashboard = async (currentUser, location = userLocation) => { // Modified to accept currentUser and location
    try {
      // Use the location parameter or fallback to userLocation state if explicitly null/undefined
      const locationToUse = location || userLocation;

      const weatherResponse = await InvokeLLM({
        prompt: `Get current weather for ${locationToUse} and analyze for outdoor activities. Provide temperature, condition (sunny/cloudy/rainy/snowy), wind speed, visibility, and rate the day for adventures with a score 0-100 plus recommend the best activity for today.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            location: { type: "string" },
            temperature: { type: "number" },
            condition: { type: "string" },
            wind_speed: { type: "number" },
            visibility: { type: "number" },
            adventure_score: { type: "number" },
            recommended_activity: { type: "string" },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            }
          }
        }
      });

      setCurrentWeather(weatherResponse);

      // Only set insights if user is pro
      if (currentUser?.subscription_status === 'pro') {
        setAiInsights(weatherResponse.insights || []);
      } else {
        setAiInsights([]);
      }

    } catch (error) {
      console.error("Error loading weather data:", error);
      // Fallback data
      setCurrentWeather({
        location: location || userLocation, // Use the provided location for fallback
        temperature: 22,
        condition: "sunny",
        wind_speed: 8,
        visibility: 15,
        adventure_score: 85,
        recommended_activity: "hiking"
      });

      if (currentUser?.subscription_status === 'pro') {
        setAiInsights([
          {
            type: "recommendation",
            title: "Perfect Hiking Weather",
            description: "Clear skies and moderate temperatures make today ideal for hiking trails.",
            confidence: 92
          }
        ]);
      } else {
        setAiInsights([]); // No insights for non-pro users in fallback
      }
    }
  };

  const refreshWeather = async () => {
    setIsLoading(true);
    // Reload user preferences in case location changed
    const userPrefs = await UserPreferences.list();
    const preferredLocation = userPrefs.length > 0 && userPrefs[0].default_location
      ? userPrefs[0].default_location
      : userLocation; // Fallback to current userLocation if no preference found

    setUserLocation(preferredLocation); // Update userLocation state

    await loadDashboard(user, preferredLocation); // Pass the updated user and preferred location
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Adventure Dashboard</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {userLocation}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={refreshWeather}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600">
              <Plus className="w-4 h-4" />
              New Alert
            </Button>
          </div>
        </motion.div>

        {/* Current Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {currentWeather ? (
            <WeatherCard
              location={currentWeather.location}
              temperature={currentWeather.temperature}
              condition={currentWeather.condition}
              windSpeed={currentWeather.wind_speed}
              visibility={currentWeather.visibility}
              adventureScore={currentWeather.adventure_score}
              recommendedActivity={currentWeather.recommended_activity}
            />
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* AI Insights and Quick Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {user?.subscription_status === 'pro' ? (
              <AIInsights insights={aiInsights} />
            ) : (
              <div className="bg-white/80 backdrop-blur-md border-white/50 shadow-xl h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl"> {/* Used div with Card's classes */}
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock AI Insights</h3>
                <p className="text-gray-600 mb-6 max-w-sm">
                  Upgrade to Pro to get detailed adventure analysis, trends, and personalized recommendations powered by AI.
                </p>
                <Link to={createPageUrl("Subscription")}>
                  <Button className="gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-md">
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Active Alerts Summary */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {alerts.filter(alert => alert.is_active).slice(0, 3).map((alert, index) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm capitalize">{alert.activity_type}</p>
                      <p className="text-xs text-gray-500">{alert.location}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                ))}
                {alerts.filter(alert => alert.is_active).length === 0 && (
                  <p className="text-gray-500 text-sm">No active alerts</p>
                )}
              </div>
            </div>

            {/* Adventure Stats */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Perfect Days</span>
                  <span className="font-bold text-green-600">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Alerts Triggered</span>
                  <span className="font-bold text-blue-600">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Adventures Taken</span>
                  <span className="font-bold text-orange-600">2</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
