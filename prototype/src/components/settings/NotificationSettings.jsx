
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Clock } from "lucide-react";

export default function NotificationSettings({ preferences, updatePreference, className = "" }) {
  const notificationPrefs = preferences.notification_preferences || {};

  const updateNotificationPreference = (key, value) => {
    updatePreference('notification_preferences', {
      ...notificationPrefs,
      [key]: value
    });
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-md border-white/50 shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Alerts */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium">Email Alerts</p>
              <p className="text-sm text-gray-500">Get notified via email when conditions are perfect</p>
            </div>
          </div>
          <Switch
            checked={notificationPrefs.email_alerts !== false}
            onCheckedChange={(checked) => updateNotificationPreference('email_alerts', checked)}
          />
        </div>

        {/* Advance Notice */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Advance Notice
          </Label>
          <Select
            value={String(notificationPrefs.advance_notice_hours || 24)}
            onValueChange={(value) => updateNotificationPreference('advance_notice_hours', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select advance notice time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour before</SelectItem>
              <SelectItem value="3">3 hours before</SelectItem>
              <SelectItem value="6">6 hours before</SelectItem>
              <SelectItem value="12">12 hours before</SelectItem>
              <SelectItem value="24">24 hours before</SelectItem>
              <SelectItem value="48">48 hours before</SelectItem>
              <SelectItem value="72">3 days before</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            How far in advance you want to receive weather alerts
          </p>
        </div>

        {/* Alert Frequency */}
        <div className="space-y-3">
          <Label>Alert Frequency</Label>
          <Select
            value={notificationPrefs.alert_frequency || "daily"}
            onValueChange={(value) => updateNotificationPreference('alert_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select alert frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediately">Immediately when conditions match</SelectItem>
              <SelectItem value="daily">Daily summary</SelectItem>
              <SelectItem value="weekly">Weekly summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-3">
          <Label>Quiet Hours</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-start" className="text-sm text-gray-600">From</Label>
              <Input
                id="quiet-start"
                type="time"
                value={notificationPrefs.quiet_hours_start || "22:00"}
                onChange={(e) => updateNotificationPreference('quiet_hours_start', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-end" className="text-sm text-gray-600">To</Label>
              <Input
                id="quiet-end"
                type="time"
                value={notificationPrefs.quiet_hours_end || "07:00"}
                onChange={(e) => updateNotificationPreference('quiet_hours_end', e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            No notifications will be sent during these hours
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
