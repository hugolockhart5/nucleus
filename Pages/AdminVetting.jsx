import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Clock
} from "lucide-react";

export default function AdminVetting() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: pendingExperts, isLoading } = useQuery({
    queryKey: ['pendingExperts'],
    queryFn: async () => {
      return await base44.entities.Expert.filter({ status: 'pending' }, '-created_date');
    },
    enabled: !!user,
    initialData: []
  });

  const handleApprove = async (expertId) => {
    if (!confirm("Approve this expert application?")) return;

    try {
      await base44.entities.Expert.update(expertId, { status: 'approved' });
      queryClient.invalidateQueries(['pendingExperts']);
      alert("Expert approved!");
    } catch (error) {
      console.error("Error approving expert:", error);
      alert("Error approving expert. Please try again.");
    }
  };

  const handleReject = async (expertId) => {
    if (!confirm("Reject this expert application?")) return;

    try {
      await base44.entities.Expert.update(expertId, { status: 'rejected' });
      queryClient.invalidateQueries(['pendingExperts']);
      alert("Expert rejected.");
    } catch (error) {
      console.error("Error rejecting expert:", error);
      alert("Error rejecting expert. Please try again.");
    }
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Expert Vetting Queue</h1>
        <p className="text-slate-600">Review and approve expert applications</p>
      </div>

      {pendingExperts.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No pending applications</h3>
            <p className="text-slate-600">All expert applications have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingExperts.map(expert => (
            <Card key={expert.id} className="shadow-lg border-0">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{expert.positioning}</CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pending Review
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(expert.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(expert.id)}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Bio</h3>
                  <p className="text-slate-700">{expert.bio}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Expertise Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.expertise_areas?.map((area, i) => (
                        <Badge key={i} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Details</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>Years of experience: {expert.years_experience}</p>
                      <p>10min rate: £{expert.rate_10min}</p>
                      <p>20min rate: £{expert.rate_20min}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Example Problems They Can Solve</h3>
                  <ul className="space-y-1">
                    {expert.example_problems?.map((problem, i) => (
                      <li key={i} className="text-sm text-slate-700">• {problem}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  {expert.linkedin_url && (
                    <a
                      href={expert.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      LinkedIn Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {expert.portfolio_url && (
                    <a
                      href={expert.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      Portfolio
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
