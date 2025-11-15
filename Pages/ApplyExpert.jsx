import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Sparkles,
  CheckCircle,
  DollarSign,
  Clock,
  TrendingUp,
  Loader2
} from "lucide-react";

export default function ApplyExpert() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    positioning: "",
    bio: "",
    expertise_areas: "",
    example_problems: "",
    years_experience: "",
    linkedin_url: "",
    portfolio_url: "",
    rate_10min: "",
    rate_20min: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      // Save form data and redirect to login
      localStorage.setItem("expert_application", JSON.stringify(formData));
      base44.auth.redirectToLogin(createPageUrl("ApplyExpert"));
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Expert.create({
        user_id: user.id,
        positioning: formData.positioning,
        bio: formData.bio,
        expertise_areas: formData.expertise_areas.split(',').map(s => s.trim()).filter(Boolean),
        example_problems: formData.example_problems.split('\n').map(s => s.trim()).filter(Boolean),
        years_experience: parseInt(formData.years_experience) || 0,
        linkedin_url: formData.linkedin_url,
        portfolio_url: formData.portfolio_url,
        rate_10min: parseFloat(formData.rate_10min) || 30,
        rate_20min: parseFloat(formData.rate_20min) || 50,
        status: "pending",
        accept_asap_calls: false,
        availability_slots: []
      });

      navigate(createPageUrl("ApplicationSubmitted"));
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("There was an error submitting your application. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            Become an Expert
          </h1>
          <p className="text-slate-600 text-lg">
            Share your expertise, help founders and operators, and earn on your schedule
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Monetize Your Time</h3>
              <p className="text-sm text-slate-600">Set your own rates for 10 or 20 minute sessions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Total Flexibility</h3>
              <p className="text-sm text-slate-600">Control your availability and schedule</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Build Your Brand</h3>
              <p className="text-sm text-slate-600">Get rated and build reputation in your niche</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Expert Application
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>One-line positioning *</Label>
                <Input
                  required
                  value={formData.positioning}
                  onChange={(e) => handleChange('positioning', e.target.value)}
                  placeholder="e.g., I help early-stage SaaS with pricing, packaging, and monetization"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">How would you introduce yourself to a potential client?</p>
              </div>

              <div>
                <Label>Background & Bio *</Label>
                <Textarea
                  required
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Share your experience, roles, and what makes you credible..."
                  className="mt-2 min-h-32"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Expertise Areas *</Label>
                  <Input
                    required
                    value={formData.expertise_areas}
                    onChange={(e) => handleChange('expertise_areas', e.target.value)}
                    placeholder="pricing, growth, product, hiring"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
                </div>

                <div>
                  <Label>Years of Experience *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => handleChange('years_experience', e.target.value)}
                    placeholder="10"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Example Problems You Can Solve *</Label>
                <Textarea
                  required
                  value={formData.example_problems}
                  onChange={(e) => handleChange('example_problems', e.target.value)}
                  placeholder="One problem per line, e.g.:&#10;Should I switch from monthly to annual billing?&#10;How do I structure my first sales hire?&#10;What should I prioritize for retention?"
                  className="mt-2 min-h-24"
                />
                <p className="text-xs text-slate-500 mt-1">One per line</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Portfolio/Website</Label>
                  <Input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => handleChange('portfolio_url', e.target.value)}
                    placeholder="https://yoursite.com"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-3 block">Your Rates (GBP)</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>10-minute session *</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                      <Input
                        required
                        type="number"
                        min="20"
                        max="100"
                        value={formData.rate_10min}
                        onChange={(e) => handleChange('rate_10min', e.target.value)}
                        placeholder="30"
                        className="pl-7"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Typically £20-100</p>
                  </div>

                  <div>
                    <Label>20-minute session *</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                      <Input
                        required
                        type="number"
                        min="40"
                        max="200"
                        value={formData.rate_20min}
                        onChange={(e) => handleChange('rate_20min', e.target.value)}
                        placeholder="50"
                        className="pl-7"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Typically £40-200</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Platform takes 25% commission. You receive 75% of the session rate.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  What happens after you apply?
                </h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• We review your application (usually within 2-3 business days)</li>
                  <li>• We may reach out for a short interview</li>
                  <li>• Once approved, you'll set your availability and start receiving bookings</li>
                  <li>• You'll get paid weekly via bank transfer</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
