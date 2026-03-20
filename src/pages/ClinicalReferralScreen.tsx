import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Shield,
  Stethoscope,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { predictionService, ReferralRecommendation } from "@/services/predictionService";
import { toast } from "@/hooks/use-toast";

const TEAL = '#00897B';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  elevated:  { bg: 'bg-amber-100', text: 'text-amber-700' },
  irregular: { bg: 'bg-orange-100', text: 'text-orange-700' },
  normal:   { bg: 'bg-green-100', text: 'text-green-700' },
  low:      { bg: 'bg-teal-100', text: 'text-teal-700' },
};

const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Urgent:   { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  Priority: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  Routine:  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
};

const TIER_TITLES: Record<string, string> = {
  Critical: "Critical Risk Detected",
  High: "High Risk Detected",
  Moderate: "Elevated Risk Detected",
};

const ClinicalReferralScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskTier, setRiskTier] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [referral, setReferral] = useState<ReferralRecommendation | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [latestRes, referralRes] = await Promise.allSettled([
        predictionService.getLatest(),
        predictionService.getReferral(),
      ]);

      if (latestRes.status === 'fulfilled') {
        const latest = latestRes.value.data;
        setRiskTier(latest.risk_tier);
        setRiskScore(latest.risk_score);
        localStorage.setItem('latest_risk_tier', latest.risk_tier);
        localStorage.setItem('latest_risk_score', String(latest.risk_score));
      }

      if (referralRes.status === 'fulfilled') {
        setReferral(referralRes.value.data);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      setError('Unable to load referral data.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const storedTier = localStorage.getItem('latest_risk_tier');
    const storedScore = localStorage.getItem('latest_risk_score');
    if (storedTier) setRiskTier(storedTier);
    if (storedScore) setRiskScore(Number(storedScore));
    fetchData();
  }, [fetchData]);

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        'https://ai-mshm-backend-d47t.onrender.com/api/v1/reports/generate/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'referral' }),
        }
      );
      const data = await res.json();
      if (data.pdf_url || data.url) {
        window.open(data.pdf_url || data.url, '_blank');
      } else {
        throw new Error('No PDF URL returned');
      }
    } catch {
      toast({
        title: 'PDF generation failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone.replace(/[^0-9]/g, ''));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">Clinical Referral</h1>
            <p className="text-xs text-gray-500">Specialist recommendation</p>
          </div>
        </header>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isLowOrModerate = riskTier === 'Low' || riskTier === 'Moderate';

  if (isLowOrModerate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">Clinical Referral</h1>
            <p className="text-xs text-gray-500">Specialist recommendation</p>
          </div>
        </header>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No referral needed at this time</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Your risk score is within a manageable range. Continue with your regular check-ins.
          </p>
          <Button
            onClick={() => navigate('/risk-score')}
            className="mt-6 rounded-xl text-white"
            style={{ backgroundColor: TEAL }}
          >
            View My Risk Score
          </Button>
        </div>
      </div>
    );
  }

  const urgency = referral?.urgency ?? 'Priority';
  const urgencyColors = URGENCY_COLORS[urgency] ?? URGENCY_COLORS.Priority;
  const tierTitle = TIER_TITLES[riskTier ?? 'High'] ?? 'High Risk Detected';

  const nearbySpecialists = referral?.nearby_specialists ?? [];

  const keyFindings = referral?.key_clinical_findings ?? [
    { label: "LH/FSH Ratio", value: riskScore > 0 ? (2.8).toFixed(1) : "—", status: "elevated" },
    { label: "Free Testosterone", value: riskScore > 0 ? "48 pg/mL" : "—", status: "elevated" },
    { label: "Cycle Length", value: riskScore > 0 ? "45+ days" : "—", status: "irregular" },
    { label: "mFG Score", value: riskScore > 0 ? "12" : "—", status: "elevated" },
  ];

  const recommendedEvaluations = referral?.recommended_evaluations ?? [
    "Complete hormone panel (FSH, LH, testosterone, DHEA-S)",
    "Pelvic ultrasound to assess ovarian morphology",
    "Fasting glucose and insulin levels",
    "Lipid profile assessment",
  ];

  const fallbackProviders = [
    {
      name: "Dr. Sarah Chen, MD",
      specialty: "Reproductive Endocrinology",
      clinic: "Women's Health Specialists",
      address: "123 Medical Center Dr, Suite 400",
      phone: "(555) 123-4567",
      distance: "2.3 miles",
      nextAvailable: "March 15, 2024",
    },
    {
      name: "Dr. Michael Torres, MD",
      specialty: "OB/GYN, PCOS Specialist",
      clinic: "Metro Women's Care",
      address: "456 Healthcare Blvd, Floor 2",
      phone: "(555) 987-6543",
      distance: "4.1 miles",
      nextAvailable: "March 18, 2024",
    },
  ];

  const providers = nearbySpecialists.length > 0
    ? nearbySpecialists.map(s => ({
        name: s.name,
        specialty: s.specialty,
        clinic: s.practice ?? s.specialty,
        address: s.address,
        phone: s.phone ?? "",
        distance: s.distance_miles ? `${s.distance_miles} miles` : "",
        nextAvailable: s.next_available ?? "",
      }))
    : fallbackProviders;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-gray-900">Clinical Referral</h1>
          <p className="text-xs text-gray-500">Specialist recommendation</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-red-700">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchData}>Retry</Button>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border-2 ${urgencyColors.border}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${urgencyColors.bg}`}>
                  <AlertTriangle className={`h-6 w-6 ${urgencyColors.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`border-0 ${urgencyColors.bg} ${urgencyColors.text}`}>
                      {urgency}
                    </Badge>
                    <span className="text-xs text-gray-500">Risk Score: {riskScore.toFixed(2)}</span>
                  </div>
                  <p className="font-display font-bold text-gray-900">{tierTitle}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {referral?.recommendation_timeframe
                      ? `Recommend consultation ${referral.recommendation_timeframe}`
                      : 'Consultation recommended'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
            Recommended Specialist
          </h3>
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${TEAL}, #00695C)` }}>
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-gray-900">
                    {referral?.recommended_specialist ?? 'Reproductive Endocrinologist'}
                  </p>
                  <p className="text-xs text-gray-500">Based on your clinical profile</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">
                {referral?.specialist_reason
                  ?? 'Elevated androgen levels and irregular cycles suggest PCOS requiring specialist evaluation'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
            Key Clinical Findings
          </h3>
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {keyFindings.map((finding) => {
                  const colors = STATUS_COLORS[finding.status] ?? STATUS_COLORS.normal;
                  return (
                    <div key={finding.label} className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">{finding.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-gray-900">{finding.value}</p>
                        <Badge className={`text-[10px] border-0 ${colors.bg} ${colors.text}`}>
                          {finding.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
            Recommended Evaluations
          </h3>
          <Card className="border border-gray-200">
            <CardContent className="p-4 space-y-2.5">
              {recommendedEvaluations.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: TEAL + '20' }}>
                    <span className="text-xs font-bold" style={{ color: TEAL }}>{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-900">{action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
            Nearby Specialists
          </h3>
          <div className="space-y-3">
            {providers.map((provider, i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5" style={{ color: TEAL }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-gray-900">{provider.name}</p>
                      <p className="text-xs text-gray-500">{provider.specialty}</p>
                    </div>
                    {provider.distance && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                        {provider.distance}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span>{provider.clinic}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{provider.address}</span>
                    </div>
                    {provider.nextAvailable && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>Next available: {provider.nextAvailable}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg border-gray-300"
                      onClick={() => copyPhone(provider.phone)}
                    >
                      {copiedPhone === provider.phone ? (
                        <><Check className="h-4 w-4 mr-1.5" />Copied</>
                      ) : (
                        <><Phone className="h-4 w-4 mr-1.5" />{provider.phone || 'No phone'}</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg text-white"
                      style={{ backgroundColor: TEAL }}
                    >
                      Book
                      <ExternalLink className="h-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-gray-300"
              onClick={() => navigate('/risk-score')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Score
            </Button>
            <Button
              size="lg"
              className="rounded-xl text-white"
              style={{ backgroundColor: TEAL }}
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
            >
              {generatingPdf ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" />Download PDF</>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gray-100 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              This referral recommendation is based on AI analysis and should be discussed with your
              healthcare provider. The final decision on specialist consultation rests with you and
              your primary care physician.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicalReferralScreen;
