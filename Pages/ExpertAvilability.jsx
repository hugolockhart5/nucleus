import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Save, Loader2 } from "lucide-react";

export default function ExpertAvailability() {
  const [user, setUser] = useState(null);
  const [expert, setExpert] = useState(null);
  const [acceptAsap, setAcceptAsap] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const expertData = await base44.entities.Expert.filter({ user_id: currentUser.id });
        if (expertData.length > 0) {
          setExpert(expertData[0]);
          setAcceptAsap(expertData[0].accept_asap_calls || false);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.Expert.update(expert.id, {
        accept_asap_calls: acceptAsap
      });
      alert("Availability settings saved!");
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Error saving settings. Please try again.");
    }
    setIsSaving(false);
  };

  if (!user || !expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Availability Settings</h1>
        <p className="text-slate-600">Control when you're available for sessions</p>
      </div>

      <Card className="shadow-lg border-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Instant Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="asap"
              checked={acceptAsap}
              onCheckedChange={setAcceptAsap}
            />
            <div className="flex-1">
              <Label htmlFor="asap" className="text-base font-medium cursor-pointer">
                Accept ASAP calls
              </Label>
              <p className="text-sm text-slate-600 mt-1">
                Allow users to book you for urgent sessions within the next few hours. You'll receive instant notifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <p className="text-amber-900 mb-4">
              <strong>Coming Soon:</strong> Full calendar integration with Google Calendar and Outlook
            </p>
            <p className="text-sm text-amber-800">
              For now, you'll receive email notifications for all bookings with calendar invites you can accept.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
