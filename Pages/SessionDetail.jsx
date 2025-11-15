import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Star,
  Loader2,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

export default function SessionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [expert, setExpert] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sessionId = location.state?.sessionId;
        if (!sessionId) {
          navigate(createPageUrl("MySessions"));
          return;
        }

        const sessionData = await base44.entities.Session.filter({ id: sessionId });
        const currentSession = sessionData[0];
        setSession(currentSession);

        if (currentSession.expert_id) {
          const expertData = await base44.entities.Expert.filter({ id: currentSession.expert_id });
          setExpert(expertData[0]);
        }

        if (currentSession.buyer_rating) {
          setRating(currentSession.buyer_rating);
          setFeedback(currentSession.buyer_feedback || "");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading session:", error);
        navigate(createPageUrl("MySessions"));
      }
    };

    loadData();
  }, [location]);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Session.update(session.id, {
        buyer_rating: rating,
        buyer_feedback: feedback,
        problem_resolved: rating >= 4
      });

      if (expert) {
        const allExpertSessions = await base44.entities.Session.filter({ 
          expert_id: expert.id,
          buyer_rating: { $exists: true }
        });
        
        const avgRating = allExpertSessions.reduce((sum, s) => sum + (s.buyer_rating || 0), 0) / allExpertSessions.length;
        
        await base44.entities.Expert.update(expert.id, {
          average_rating: avgRating
        });
      }

      alert("Thank you for your feedback!");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const scheduledDate = session.scheduled_time ? new Date(session.scheduled_time) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl("MySessions"))}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to sessions
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{session.problem_title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{session.status}</Badge>
                    <Badge variant="outline">{session.problem_category}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Problem Description</h3>
                <p className="text-slate-700">{session.problem_description}</p>
              </div>

              {session.ai_summary && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">AI Summary</h3>
                  </div>
                  <p className="text-slate-700 mb-4">{session.ai_summary}</p>
                  
                  {session.action_items && session.action_items.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Action Items:</h4>
                      <ul className="space-y-1">
                        {session.action_items.map((item, i) => (
                          <li key={i} className="text-sm text-slate-700 flex gap-2">
                            <span className="text-green-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {session.status === 'completed' && !session.buyer_rating && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Rate Your Session</h3>
                    
                    <div className="mb-4">
                      <p className="text-sm text-slate-700 mb-2">How would you rate this session?</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-700 mb-2">Additional feedback (optional)</p>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What went well? What could be improved?"
                        className="min-h-24"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={rating === 0 || isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {session.buyer_rating && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Your Feedback</h3>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= session.buyer_rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    {session.buyer_feedback && (
                      <p className="text-slate-700">{session.buyer_feedback}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledDate && (
                <>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      Date & Time
                    </div>
                    <p className="font-medium text-slate-900">
                      {format(scheduledDate, 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="text-slate-700">{format(scheduledDate, 'h:mm a')}</p>
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Clock className="w-4 h-4" />
                  Duration
                </div>
                <p className="font-medium text-slate-900">{session.duration_minutes} minutes</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Video className="w-4 h-4" />
                  Format
                </div>
                <p className="font-medium text-slate-900">Video call</p>
              </div>

              {expert && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500 mb-1">Expert</p>
                  <p className="font-semibold text-slate-900">{expert.positioning}</p>
                  {expert.average_rating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{expert.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-500">({expert.total_sessions} sessions)</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
