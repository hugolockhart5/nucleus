import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Loader2,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

export default function AdminSessions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['allSessions'],
    queryFn: async () => {
      const allSessions = await base44.entities.Session.list('-created_date');
      
      // Fetch expert data for each session
      const sessionsWithData = await Promise.all(
        allSessions.map(async (session) => {
          let expertData = null;
          if (session.expert_id) {
            const experts = await base44.entities.Expert.filter({ id: session.expert_id });
            expertData = experts[0];
          }
          return { ...session, expert: expertData };
        })
      );
      
      return sessionsWithData;
    },
    enabled: !!user,
    initialData: []
  });

  const totalRevenue = sessions.reduce((sum, s) => sum + (s.price_gbp || 0), 0);
  const platformFees = sessions.reduce((sum, s) => sum + (s.platform_fee_gbp || 0), 0);

  const statusGroups = {
    scheduled: sessions.filter(s => s.status === 'scheduled'),
    completed: sessions.filter(s => s.status === 'completed'),
    all: sessions
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">All Sessions</h1>
        <p className="text-slate-600">Platform-wide session monitoring and analytics</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Sessions</p>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{sessions.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">£{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Platform Fees</p>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">£{platformFees.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Completed</p>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{statusGroups.completed.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Session List</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({statusGroups.all.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({statusGroups.scheduled.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({statusGroups.completed.length})</TabsTrigger>
            </TabsList>

            {['all', 'scheduled', 'completed'].map(tab => (
              <TabsContent key={tab} value={tab}>
                <div className="space-y-3">
                  {statusGroups[tab].length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No sessions in this category</p>
                  ) : (
                    statusGroups[tab].map(session => (
                      <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">{session.problem_title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline">{session.status}</Badge>
                              <Badge variant="outline">{session.problem_category}</Badge>
                              {session.expert && (
                                <Badge variant="outline" className="bg-blue-50">
                                  {session.expert.positioning?.substring(0, 30)}...
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">£{session.price_gbp?.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">{session.duration_minutes}min</p>
                          </div>
                        </div>
                        {session.scheduled_time && (
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(session.scheduled_time), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(session.scheduled_time), 'h:mm a')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
