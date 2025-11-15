import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProblemSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [problem, setProblem] = useState(location.state?.problem || localStorage.getItem("pending_problem") || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [structured, setStructured] = useState(null);
  const [duration, setDuration] = useState(20);
  const [urgency, setUrgency] = useState("this_week");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        localStorage.removeItem("pending_problem");
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("ProblemSubmit"));
      }
    };
    loadUser();
  }, []);

  const analyzeProblem = async () => {
    if (!problem.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing a business problem for a marketplace that matches founders/operators with experts.

User's problem:
"${problem}"

Extract and structure this information:
1. A clear, concise title (max 10 words)
2. Main category (one of: pricing, growth, product, hiring, operations, marketing, sales, fundraising, technical, legal, other)
3. Key context extracted (company_size, current_metrics, tools_mentioned, industry)
4. Suggested questions the expert should ask
5. Estimated complexity (simple, moderate, complex)

Return structured data.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string" },
            context: {
              type: "object",
              properties: {
                company_size: { type: "string" },
                current_metrics: { type: "string" },
                tools_mentioned: { type: "array", items: { type: "string" } },
                industry: { type: "string" }
              }
            },
            expert_questions: { type: "array", items: { type: "string" } },
            complexity: { type: "string" }
          }
        }
      });

      setStructured(result);
    } catch (error) {
      console.error("Error analyzing problem:", error);
      // Fallback to simple structure
      setStructured({
        title: "Business Decision",
        category: "other",
        context: {},
        expert_questions: [],
        complexity: "moderate"
      });
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (problem && user) {
      analyzeProblem();
    }
  }, [user]);

  const handleNext = async () => {
    if (!structured) return;

    // Create session record
    const session = await base44.entities.Session.create({
      buyer_id: user.id,
      problem_title: structured.title,
      problem_description: problem,
      problem_category: structured.category,
      problem_structured: structured.context,
      urgency,
      duration_minutes: duration,
      status: "pending_payment"
    });

    // Navigate to expert matching
    navigate(createPageUrl("ExpertMatch"), { state: { sessionId: session.id } });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Let's structure your problem
          </h1>
          <p className="text-slate-600">
            Our AI will help clarify the details so we can match you with the right expert
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Your Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Describe your decision or problem</Label>
                  <Textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    onBlur={analyzeProblem}
                    className="min-h-40 mt-2"
                    placeholder="Include context like company size, tools you use, what you've tried, and the stakes..."
                  />
                </div>

                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-blue-600 p-4 bg-blue-50 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is analyzing your problem...</span>
                  </div>
                )}

                {structured && !isAnalyzing && (
                  <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900 mb-1">Structured as:</p>
                        <p className="text-lg font-semibold text-slate-900 mb-2">{structured.title}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-white">
                            {structured.category}
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            {structured.complexity} complexity
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {structured.context && Object.keys(structured.context).length > 0 && (
                      <div className="pl-7">
                        <p className="text-sm font-medium text-slate-700 mb-2">Key context extracted:</p>
                        <div className="space-y-1 text-sm text-slate-600">
                          {structured.context.company_size && (
                            <p>• Company size: {structured.context.company_size}</p>
                          )}
                          {structured.context.current_metrics && (
                            <p>• Metrics: {structured.context.current_metrics}</p>
                          )}
                          {structured.context.industry && (
                            <p>• Industry: {structured.context.industry}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Call Duration</Label>
                    <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes (£20-50)</SelectItem>
                        <SelectItem value="20">20 minutes (£40-100)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Urgency</Label>
                    <Select value={urgency} onValueChange={setUrgency}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP (within hours)</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this_week">This week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">What happens next?</h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      1
                    </div>
                    <p>We'll show you 1-3 matched experts with available slots</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </div>
                    <p>Book your preferred time and pay</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      3
                    </div>
                    <p>Expert reviews your problem before the call</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      4
                    </div>
                    <p>Get AI-generated notes and action items after</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {structured && structured.expert_questions && structured.expert_questions.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <h3 className="font-semibold text-slate-900">Expect these questions</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {structured.expert_questions.slice(0, 3).map((q, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!structured || isAnalyzing}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Find Matching Experts
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
