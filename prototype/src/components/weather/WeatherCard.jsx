import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Eye, 
  Thermometer,
  Mountain,
  TreePine
} from "lucide-react";

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
  clear: Sun,
  overcast: Cloud
};

export default function WeatherCard({ 
  location, 
  temperature, 
  condition, 
  windSpeed, 
  visibility,
  adventureScore,
  recommendedActivity,
  className = ""
}) {
  const WeatherIcon = weatherIcons[condition?.toLowerCase()] || Sun;
  
  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getActivityIcon = (activity) => {
    switch(activity?.toLowerCase()) {
      case 'hiking': return TreePine;
      case 'snowboarding':
      case 'skiing': return Mountain;
      default: return Mountain;
    }
  };

  const ActivityIcon = getActivityIcon(recommendedActivity);

  return (
    <Card className={`bg-white/80 backdrop-blur-md border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">{location}</CardTitle>
          <div className="flex items-center gap-2">
            <WeatherIcon className="w-8 h-8 text-blue-500" />
            <span className="text-3xl font-bold text-gray-900">{temperature}°</span>
          </div>
        </div>
        <p className="text-lg text-gray-600 capitalize">{condition}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{visibility} km</span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Adventure Score</span>
            <Badge className={`font-bold ${getScoreColor(adventureScore)}`}>
              {adventureScore}/100
            </Badge>
          </div>
          
          {recommendedActivity && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl">
              <ActivityIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">
                Perfect for {recommendedActivity}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}