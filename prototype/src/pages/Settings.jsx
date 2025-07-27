
import React, { useState, useEffect } from "react";
import { UserPreferences, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Thermometer, 
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

import LocationSearchInput from "../components/settings/LocationSearchInput";
import NotificationSettings from "../components/settings/NotificationSettings";
import ActivityPreferences from "../components/settings/ActivityPreferences";

export default function Settings() {
  const [preferences, setPreferences] = useState({
    default_location: "",
    preferred_activities: [],
    notification_preferences: {
      email_alerts: true,
      advance_notice_hours: 24,
      alert_frequency: "daily",
      quiet_hours_start: "22:00",
      quiet_hours_end: "07:00"
    },
    temperature_unit: "celsius"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [existingPrefsId, setExistingPrefsId] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const userPrefs = await UserPreferences.list();
      if (userPrefs.length > 0) {
        const prefs = userPrefs[0];
        setPreferences({
          default_location: prefs.default_location || "",
          preferred_activities: prefs.preferred_activities || [],
          notification_preferences: {
            email_alerts: true,
            advance_notice_hours: 24,
            alert_frequency: "daily",
            quiet_hours_start: "22:00",
            quiet_hours_end: "07:00",
            ...prefs.notification_preferences
          },
          temperature_unit: prefs.temperature_unit || "celsius"
        });
        setExistingPrefsId(prefs.id);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
    setIsLoading(false);
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      if (existingPrefsId) {
        await UserPreferences.update(existingPrefsId, preferences);
      } else {
        const newPrefs = await UserPreferences.create(preferences);
        setExistingPrefsId(newPrefs.id);
      }
      
      // Also update user data if needed
      try {
        await User.updateMyUserData({
          default_location: preferences.default_location
        });
      } catch (userError) {
        console.log("Could not update user data, but preferences saved");
      }
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Customize your adventure alerts and preferences</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>

        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className={saveStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {saveStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={saveStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                {saveStatus === 'success' 
                  ? 'Settings saved successfully!' 
                  : 'Failed to save settings. Please try again.'
                }
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* New Layout Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location & General Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Location & General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Default Location</Label>
                  <LocationSearchInput
                    value={preferences.default_location}
                    onChange={(value) => updatePreference('default_location', value)}
                    placeholder="Search for your location..."
                  />
                  <p className="text-xs text-gray-500">
                    Used for all forecasts and alerts.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-500" />
                    Temperature Unit
                  </Label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="temperature"
                        value="celsius"
                        checked={preferences.temperature_unit === "celsius"}
                        onChange={(e) => updatePreference('temperature_unit', e.target.value)}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span>Celsius (°C)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="temperature"
                        value="fahrenheit"
                        checked={preferences.temperature_unit === "fahrenheit"}
                        onChange={(e) => updatePreference('temperature_unit', e.target.value)}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span>Fahrenheit (°F)</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NotificationSettings 
              preferences={preferences} 
              updatePreference={updatePreference}
              className="h-full"
            />
          </motion.div>

          {/* Activity Preferences */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ActivityPreferences 
              preferences={preferences} 
              updatePreference={updatePreference}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
