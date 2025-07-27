
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added import for Badge component
import { CheckCircle, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { add } from "date-fns";

const features = {
  free: [
    "7-Day Weather Forecast",
    "Basic Adventure Scores",
    "Up to 3 Active Alerts",
  ],
  pro: [
    "Everything in Free, plus:",
    "AI-Powered Adventure Insights",
    "Unlimited Active Alerts",
    "Advanced Forecast Details",
    "Priority Support",
  ],
};

export default function Subscription() {
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await User.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);
  
  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    // In a real app, this would redirect to a Stripe Checkout page.
    // Here, we simulate a successful subscription.
    try {
      const expiryDate = add(new Date(), { years: 1 });
      await User.updateMyUserData({ 
        subscription_status: 'pro',
        subscription_expiry_date: expiryDate.toISOString()
      });

      // Refetch user data to update UI
      const updatedUser = await User.me();
      setUser(updatedUser);
    } catch(error) {
        console.error("Failed to upgrade subscription", error);
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Adventure Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock premium AI features to supercharge your outdoor planning and never miss a perfect day.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 pt-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-lg h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Free</CardTitle>
                <p className="text-gray-500">For the casual adventurer</p>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-4xl font-extrabold text-gray-900">$0<span className="text-lg font-medium">/month</span></p>
                <ul className="space-y-3 text-left">
                  {features.free.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6">
                <Button variant="outline" className="w-full" disabled={user?.subscription_status === 'free'}>
                  Your Current Plan
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl h-full flex flex-col ring-4 ring-blue-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                  <Badge variant="secondary" className="bg-orange-500 text-white border-orange-400">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <p className="opacity-80">For the serious explorer</p>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-4xl font-extrabold">$9.99<span className="text-lg font-medium">/month</span></p>
                <ul className="space-y-3 text-left">
                  {features.pro.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="opacity-95">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6">
                {user?.subscription_status === 'pro' ? (
                   <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-gray-100" disabled>
                     You are a Pro Adventurer!
                   </Button>
                ) : (
                  <Button 
                    variant="secondary"
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Upgrade to Pro"}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
        <p className="text-xs text-gray-500 pt-4">* This is a simulated subscription for demonstration. A real implementation would involve integrating with a payment provider like Stripe.</p>
      </div>
    </div>
  );
}
