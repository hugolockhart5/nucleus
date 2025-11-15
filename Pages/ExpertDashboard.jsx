import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
  FileText
} from "lucide-react";
import { format, isFuture, isPast } from "date-fns";

export default function ExpertDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expert, setExpert] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const expertData = await base44.entities.Expert.filter({ user_id: currentUser.id });
        if (expertData.length === 0) {
          navigate(createPageUrl("ApplyExpert"));
        } else {
          setExpert(expertData[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['expertSessions', expert?.id],
    queryFn: async () => {
      if (!expert) return [];
      return await base44.entities.Session.filter({ expert_id: expert.id }, '-scheduled_time');
    },
    enabled: !!expert,
    initialData: []
  });

  const upcomingSessions = sessions.filter(s => 
    s.scheduled_time && isFuture(new Date(s.scheduled_time))
  );

  const completedSessions = sessions.filter(s => s.status === 'completed');

  const totalEarnings = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.expert_payout_gbp || 0), 0);

  if (!user || !expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (expert.status === 'pending') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Application Under Review</h2>
            <p className="text-slate-600 mb-6">
              Thank you for applying! We're reviewing your application and will get back to you within 2-3 business days.
            </p>
            <Button onClick={() => navigate(createPageUrl("Home"))} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (expert.status === 'rejected') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Application Not Approved</h2>
            <p className="text-slate-600 mb-6">
              Unfortunately, we're unable to approve your application at this time. If you have questions, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Expert Dashboard</h1>
        <p className="text-slate-600">Welcome back, {user.full_name || 'Expert'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Upcoming Sessions</p>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{upcomingSessions.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Sessions</p>
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{expert.total_sessions || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Earnings</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">£{totalEarnings.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Average Rating</p>
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {expert.average_rating > 0 ? expert.average_rating.toFixed(1) : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card className="shadow-lg border-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No upcoming sessions scheduled</p>
              <p className="text-sm text-slate-500 mt-2">
                Make sure your availability is set to receive bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map(session => (
                <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{session.problem_title}</h3>
                      <Badge variant="outline">{session.problem_category}</Badge>
                    </div>
                    <Badge className="bg-blue-600">
                      {session.duration_minutes}min
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(session.scheduled_time), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(session.scheduled_time), 'h:mm a')}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      £{session.expert_payout_gbp?.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-slate-600 line-clamp-2">{session.problem_description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => navigate(createPageUrl("ExpertAvailability"))}>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Manage Availability</h3>
            <p className="text-sm text-slate-600">Set your schedule and time slots</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => navigate(createPageUrl("ExpertEarnings"))}>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">View Earnings</h3>
            <p className="text-sm text-slate-600">Track payments and payouts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Your Profile</h3>
            <p className="text-sm text-slate-600">{expert.positioning}</p>
            <Badge variant="outline" className="mt-2">
              {expert.expertise_areas?.length || 0} expertise areas
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
