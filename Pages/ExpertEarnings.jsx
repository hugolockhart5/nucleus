import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
  Download
} from "lucide-react";
import { format } from "date-fns";

export default function ExpertEarnings() {
  const [user, setUser] = useState(null);
  const [expert, setExpert] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const expertData = await base44.entities.Expert.filter({ user_id: currentUser.id });
        if (expertData.length > 0) {
          setExpert(expertData[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadData();
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['expertEarnings', expert?.id],
    queryFn: async () => {
      if (!expert) return [];
      return await base44.entities.Session.filter({ 
        expert_id: expert.id,
        status: 'completed'
      }, '-completed_date');
    },
    enabled: !!expert,
    initialData: []
  });

  const totalEarnings = sessions.reduce((sum, s) => sum + (s.expert_payout_gbp || 0), 0);
  const thisMonthEarnings = sessions
    .filter(s => {
      const sessionDate = new Date(s.scheduled_time);
      const now = new Date();
      return sessionDate.getMonth() === now.getMonth() && 
             sessionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, s) => sum + (s.expert_payout_gbp || 0), 0);

  if (!user || !expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Earnings & Payouts</h1>
        <p className="text-slate-600">Track your earnings from expert sessions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Earnings</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">£{totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">This Month</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">£{thisMonthEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Completed Sessions</p>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{sessions.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No completed sessions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{session.problem_title}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>{format(new Date(session.scheduled_time), 'MMM d, yyyy')}</span>
                        <Badge variant="outline">{session.duration_minutes}min</Badge>
                        <Badge variant="outline">{session.problem_category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        £{session.expert_payout_gbp?.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">You earned</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 mt-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Payout Information</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Payouts are processed weekly on Mondays</li>
            <li>• Minimum payout threshold: £50</li>
            <li>• Payments sent via bank transfer (Stripe Connect)</li>
            <li>• Platform fee: 25% (already deducted from amounts shown)</li>
            <li>• Tax responsibility: You're responsible for declaring earnings</li>
          </ul>
          <p className="text-xs text-slate-600 mt-4">
            Note: Full Stripe Connect integration coming soon. For MVP, payouts are tracked but processed manually.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
