
import React, { useState, useEffect } from "react";
import { WeatherAlert, UserPreferences } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import AlertCard from "../components/alerts/AlertCard";
import AlertForm from "../components/alerts/AlertForm";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("Mountain View, CA"); // Default location
  const [userPreferences, setUserPreferences] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Load user preferences to get location and preferred activities
        const userPrefs = await UserPreferences.list();
        if (userPrefs.length > 0) {
          setUserPreferences(userPrefs[0]);
          if (userPrefs[0].default_location) {
            setUserLocation(userPrefs[0].default_location);
          }
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
        // Fallback to default location if preferences fail to load
        setUserLocation("Mountain View, CA"); 
      }
      
      await loadAlerts();
      setIsLoading(false);
    };
    
    initialize();
  }, []);

  const loadAlerts = async () => {
    try {
      const userAlerts = await WeatherAlert.list("-created_date");
      setAlerts(userAlerts);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const handleToggleAlert = async (alertId, isActive) => {
    try {
      await WeatherAlert.update(alertId, { is_active: isActive });
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_active: isActive }
            : alert
        )
      );
    } catch (error) {
      console.error("Error updating alert:", error);
    }
  };

  const handleEditAlert = (alert) => {
    setCurrentAlert(alert);
    setIsFormOpen(true);
  };
  
  const handleCreateAlert = () => {
    setCurrentAlert(null);
    setIsFormOpen(true);
  };
  
  const handleSaveAlert = async (formData) => {
    try {
      if (formData.id) { // Editing existing alert
        const updatedAlert = await WeatherAlert.update(formData.id, formData);
        setAlerts(prev => prev.map(a => (a.id === formData.id ? updatedAlert : a)));
      } else { // Creating new alert
        const newAlert = await WeatherAlert.create(formData);
        setAlerts(prev => [newAlert, ...prev]);
      }
      setIsFormOpen(false);
      setCurrentAlert(null);
    } catch (error) {
      console.error("Failed to save alert:", error);
      // Optionally: show an error message to the user
    }
  };

  const createQuickAlert = async (activityType) => {
    try {
      const newAlert = await WeatherAlert.create({
        location: userLocation,
        activity_type: activityType,
        alert_conditions: getDefaultConditions(activityType),
        is_active: true
      });
      
      setAlerts(prev => [newAlert, ...prev]); // Add new alert to the top
    } catch (error) {
      console.error("Error creating quick alert:", error);
    }
  };

  const getDefaultConditions = (activityType) => {
    const conditions = {
      hiking: {
        min_temp: 10, // Celsius
        max_temp: 30, // Celsius
        max_wind_speed: 20, // km/h or mph, depending on unit system
        min_visibility: 5, // km or miles
        weather_conditions: ["sunny", "clear", "partly_cloudy"]
      },
      snowboarding: {
        min_temp: -10,
        max_temp: 5,
        max_wind_speed: 25,
        min_visibility: 2,
        weather_conditions: ["snowy", "clear"]
      },
      skiing: {
        min_temp: -8,
        max_temp: 3,
        max_wind_speed: 30,
        min_visibility: 3,
        weather_conditions: ["snowy", "clear"]
      },
      // Add more activity types and their default conditions as needed
    };
    return conditions[activityType] || conditions.hiking; // Default to hiking if activity type not found
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Adventure Alerts</h1>
            <p className="text-gray-600">Manage your personalized weather alerts</p>
            <p className="text-sm text-gray-500 mt-1">📍 Default location: {userLocation}</p>
          </div>
          <Button 
            onClick={handleCreateAlert}
            className="gap-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </Button>
        </motion.div>

        {/* Quick Create Alerts for Preferred Activities */}
        {userPreferences?.preferred_activities?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Create Alerts</CardTitle>
                <p className="text-sm text-gray-600">
                  Create alerts for your preferred activities in {userLocation}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {userPreferences.preferred_activities.map(activity => (
                    <Button
                      key={activity}
                      variant="outline"
                      size="sm"
                      onClick={() => createQuickAlert(activity)}
                      className="gap-2 capitalize"
                    >
                      <Plus className="w-3 h-3" />
                      {activity.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Existing alerts grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/50 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AlertCard
                  alert={alert}
                  onToggle={handleToggleAlert}
                  onEdit={handleEditAlert}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && alerts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Alerts Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first adventure alert for {userLocation} to get notified when conditions are perfect.
              </p>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
                onClick={() => userPreferences?.preferred_activities?.[0] && createQuickAlert(userPreferences.preferred_activities[0])}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </div>
          </motion.div>
        )}

        {/* Form Modal */}
        <AlertForm
          open={isFormOpen}
          alert={currentAlert}
          onSave={handleSaveAlert}
          onCancel={() => setIsFormOpen(false)}
          defaultLocation={userLocation}
        />
      </div>
    </div>
  );
}
