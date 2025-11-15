import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Code
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!problem.trim()) return;

    // Check if user is logged in
    if (!user) {
      // Save problem to localStorage and redirect to login
      localStorage.setItem("pending_problem", problem);
      base44.auth.redirectToLogin(createPageUrl("ProblemSubmit"));
      return;
    }

    navigate(createPageUrl("ProblemSubmit"), { state: { problem } });
  };

  const exampleProblems = [
    {
      icon: DollarSign,
      category: "Pricing",
      problem: "Should I switch from monthly to annual billing?",
      color: "emerald"
    },
    {
      icon: TrendingUp,
      category: "Growth",
      problem: "Sign-ups are up but activation is down. What's wrong?",
      color: "blue"
    },
    {
      icon: Users,
      category: "Hiring",
      problem: "How should I structure my first SDR's comp plan?",
      color: "purple"
    },
    {
      icon: Target,
      category: "Product",
      problem: "Which feature should I prioritize for retention?",
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          {/* Logo & Nav */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-slate-900">Nucleus</h1>
                <p className="text-sm text-slate-600">Decisions, clarified in minutes</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin()}
                    className="text-slate-700"
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl("ApplyExpert"))}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Become an Expert
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate(createPageUrl("MySessions"))}
                  variant="outline"
                >
                  My Sessions
                </Button>
              )}
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              For SaaS Founders & Operators
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Get clarity on your next decision.
              <span className="text-blue-600"> Fast.</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Book a 10-20 minute call with a vetted operator who's solved your exact problem. 
              Within hours, not weeks.
            </p>

            {/* Problem Input */}
            <Card className="max-w-3xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <label className="block text-left mb-3 text-sm font-medium text-slate-700">
                  What decision are you facing?
                </label>
                <Textarea
                  placeholder="E.g., 'We're seeing 40% trial signup but only 12% activation. We've tried email sequences and in-app tutorials. Our product is a project management tool for agencies. What should we focus on first?'"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="min-h-32 text-base resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-slate-500">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    AI will help structure your problem
                  </p>
                  <Button
                    onClick={handleSubmit}
                    disabled={!problem.trim() || isProcessing}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    Find an Expert
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust indicators */}
            <div className="flex justify-center gap-8 mt-12 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>10-20 minute calls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Vetted experts only</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI-generated notes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              From problem to clarity in 3 steps
            </h3>
            <p className="text-lg text-slate-600">
              No proposals. No retainers. Just focused help when you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Describe your problem</h4>
                <p className="text-slate-600">
                  Our AI helps you structure it and extracts key details — company size, tools, metrics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Match with an expert</h4>
                <p className="text-slate-600">
                  See 1-3 recommended operators who've solved exactly this. Book the next available slot.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Get actionable clarity</h4>
                <p className="text-slate-600">
                  10-20 minute focused call. AI generates summary, action items, and next steps.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Example Problems */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              The kinds of problems we solve
            </h3>
            <p className="text-lg text-slate-600">
              Micro-decisions that unlock progress
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {exampleProblems.map((item, index) => {
              const colorClasses = {
                emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
                blue: "bg-blue-50 border-blue-200 text-blue-700",
                purple: "bg-purple-50 border-purple-200 text-purple-700",
                amber: "bg-amber-50 border-amber-200 text-amber-700"
              };

              return (
                <Card 
                  key={index}
                  className={`border-2 ${colorClasses[item.color]} hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => setProblem(item.problem)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[item.color]}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2 text-xs">
                          {item.category}
                        </Badge>
                        <p className="text-slate-700 font-medium">
                          "{item.problem}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stop Googling. Start solving.
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Book your first expert call and get unstuck today.
          </p>
          <Button
            size="lg"
            onClick={() => document.querySelector('textarea')?.focus()}
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
          >
            Describe Your Problem
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
