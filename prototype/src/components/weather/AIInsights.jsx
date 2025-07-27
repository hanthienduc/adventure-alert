import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AIInsights({ insights, className = "" }) {
  const getInsightIcon = (type) => {
    switch(type) {
      case 'recommendation': return CheckCircle2;
      case 'warning': return AlertTriangle;
      case 'trend': return TrendingUp;
      default: return Brain;
    }
  };

  const getInsightColor = (type) => {
    switch(type) {
      case 'recommendation': return "text-green-600 bg-green-50";
      case 'warning': return "text-orange-600 bg-orange-50";
      case 'trend': return "text-blue-600 bg-blue-50";
      default: return "text-purple-600 bg-purple-50";
    }
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-md border-white/50 shadow-xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Brain className="w-6 h-6 text-purple-500" />
          AI Adventure Insights
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {insights?.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          const colorClass = getInsightColor(insight.type);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl ${colorClass} border`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm opacity-90">{insight.description}</p>
                  {insight.confidence && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {(!insights || insights.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>AI insights will appear here based on weather conditions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}