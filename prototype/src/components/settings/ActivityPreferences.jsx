import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain,
  TreePine,
  Bike,
  Tent,
  Camera,
  Waves
} from "lucide-react";
import { motion } from "framer-motion";

const activities = [
  { 
    id: 'hiking', 
    name: 'Hiking', 
    icon: TreePine, 
    description: 'Trail hiking and walking',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'snowboarding', 
    name: 'Snowboarding', 
    icon: Mountain, 
    description: 'Powder and groomed runs',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    id: 'skiing', 
    name: 'Skiing', 
    icon: Mountain, 
    description: 'Alpine and cross-country',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  { 
    id: 'cycling', 
    name: 'Cycling', 
    icon: Bike, 
    description: 'Road and mountain biking',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  { 
    id: 'camping', 
    name: 'Camping', 
    icon: Tent, 
    description: 'Outdoor camping trips',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  { 
    id: 'climbing', 
    name: 'Rock Climbing', 
    icon: Mountain, 
    description: 'Indoor and outdoor climbing',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  { 
    id: 'photography', 
    name: 'Photography', 
    icon: Camera, 
    description: 'Landscape photography',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    id: 'surfing', 
    name: 'Surfing', 
    icon: Waves, 
    description: 'Ocean and wave conditions',
    color: 'bg-teal-100 text-teal-800 border-teal-200'
  }
];

export default function ActivityPreferences({ preferences, updatePreference }) {
  const preferredActivities = preferences.preferred_activities || [];

  const toggleActivity = (activityId) => {
    const newActivities = preferredActivities.includes(activityId)
      ? preferredActivities.filter(id => id !== activityId)
      : [...preferredActivities, activityId];
    
    updatePreference('preferred_activities', newActivities);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-green-500" />
          Activity Preferences
        </CardTitle>
        <p className="text-gray-600 text-sm mt-1">
          Select activities you're interested in for personalized alerts and insights
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            const isSelected = preferredActivities.includes(activity.id);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  onClick={() => toggleActivity(activity.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                        {isSelected && (
                          <Badge className="bg-green-100 text-green-800 text-xs border-green-200">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {preferredActivities.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Selected Activities</h4>
            <div className="flex flex-wrap gap-2">
              {preferredActivities.map(activityId => {
                const activity = activities.find(a => a.id === activityId);
                return activity ? (
                  <Badge key={activityId} className={activity.color}>
                    {activity.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}