import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Save, X } from "lucide-react";

const activities = ["hiking", "snowboarding", "skiing", "camping", "climbing", "cycling", "photography", "surfing"];
const weatherConditionOptions = ["sunny", "clear", "partly_cloudy", "cloudy", "rainy", "snowy"];

const defaultConditions = {
  min_temp: 10,
  max_temp: 25,
  max_wind_speed: 20,
  min_visibility: 5,
  weather_conditions: ["sunny", "clear"]
};

export default function AlertForm({ open, alert, onSave, onCancel, defaultLocation }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (open) {
      if (alert) {
        setFormData({
          ...alert,
          alert_conditions: { ...defaultConditions, ...alert.alert_conditions }
        });
      } else {
        setFormData({
          location: defaultLocation || "",
          activity_type: "hiking",
          alert_conditions: defaultConditions,
          is_active: true,
        });
      }
    } else {
      setFormData(null);
    }
  }, [open, alert, defaultLocation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConditionChange = (field, value) => {
    const numericValue = value === "" ? null : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      alert_conditions: { ...prev.alert_conditions, [field]: numericValue }
    }));
  };

  const handleWeatherConditionToggle = (condition) => {
    const currentConditions = formData.alert_conditions.weather_conditions || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    handleConditionChange('weather_conditions', newConditions);
  };
  
  if (!open || !formData) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{alert ? "Edit Alert" : "Create New Alert"}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity">Activity Type</Label>
            <Select value={formData.activity_type} onValueChange={(value) => handleInputChange('activity_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                {activities.map(act => (
                  <SelectItem key={act} value={act} className="capitalize">{act.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-gray-800">Alert Conditions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-temp">Min Temp (°C)</Label>
                <Input id="min-temp" type="number" value={formData.alert_conditions.min_temp ?? ''} onChange={(e) => handleConditionChange('min_temp', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-temp">Max Temp (°C)</Label>
                <Input id="max-temp" type="number" value={formData.alert_conditions.max_temp ?? ''} onChange={(e) => handleConditionChange('max_temp', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-wind">Max Wind (km/h)</Label>
                <Input id="max-wind" type="number" value={formData.alert_conditions.max_wind_speed ?? ''} onChange={(e) => handleConditionChange('max_wind_speed', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-visibility">Min Visibility (km)</Label>
                <Input id="min-visibility" type="number" value={formData.alert_conditions.min_visibility ?? ''} onChange={(e) => handleConditionChange('min_visibility', e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Weather</Label>
              <div className="grid grid-cols-3 gap-2">
                {weatherConditionOptions.map(cond => (
                  <label key={cond} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                    <Checkbox
                      id={`cond-${cond}`}
                      checked={formData.alert_conditions.weather_conditions?.includes(cond)}
                      onCheckedChange={() => handleWeatherConditionToggle(cond)}
                    />
                    <span className="text-sm capitalize">{cond.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}