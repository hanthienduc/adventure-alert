import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Mountain, 
  TreePine, 
  Bike, 
  Tent, 
  MapPin, 
  Settings2 
} from "lucide-react";

const activityIcons = {
  hiking: TreePine,
  snowboarding: Mountain,
  skiing: Mountain,
  cycling: Bike,
  camping: Tent,
  climbing: Mountain
};

export default function AlertCard({ 
  alert, 
  onToggle, 
  onEdit, 
  className = "" 
}) {
  const Icon = activityIcons[alert.activity_type] || Mountain;
  
  const getActivityColor = (activity) => {
    const colors = {
      hiking: "bg-green-100 text-green-800 border-green-200",
      snowboarding: "bg-blue-100 text-blue-800 border-blue-200",
      skiing: "bg-cyan-100 text-cyan-800 border-cyan-200",
      cycling: "bg-yellow-100 text-yellow-800 border-yellow-200",
      camping: "bg-orange-100 text-orange-800 border-orange-200",
      climbing: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[activity] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-md border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 capitalize">
                {alert.activity_type}
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                {alert.location}
              </div>
            </div>
          </div>
          <Switch
            checked={alert.is_active}
            onCheckedChange={() => onToggle(alert.id, !alert.is_active)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Badge className={`${getActivityColor(alert.activity_type)} font-medium`}>
          {alert.activity_type.replace('_', ' ')} Alert
        </Badge>
        
        {alert.alert_conditions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Conditions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {alert.alert_conditions.min_temp && (
                <div className="text-gray-600">
                  Min: {alert.alert_conditions.min_temp}°C
                </div>
              )}
              {alert.alert_conditions.max_temp && (
                <div className="text-gray-600">
                  Max: {alert.alert_conditions.max_temp}°C
                </div>
              )}
              {alert.alert_conditions.max_wind_speed && (
                <div className="text-gray-600">
                  Wind: ≤{alert.alert_conditions.max_wind_speed} km/h
                </div>
              )}
              {alert.alert_conditions.min_visibility && (
                <div className="text-gray-600">
                  Visibility: ≥{alert.alert_conditions.min_visibility} km
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(alert)}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}