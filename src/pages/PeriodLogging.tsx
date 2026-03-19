import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Check, AlertCircle, RefreshCw } from "lucide-react";
import { format, eachDayOfInterval, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { menstrualService, CriterionFlags, DerivedFeatures, Predictions } from "@/services/menstrualService";

const PRIMARY_PURPLE = '#4A3F8F';
const DARK_PURPLE = '#2C2F6B';
const LIGHT_PURPLE = '#B8B0E8';
const LIGHTEST_PURPLE = '#E8E6F5';

type Step = 1 | 2 | 3 | 4;

interface WizardState {
  period_start_date: string;
  period_end_date: string;
  days_count: number;
  bleeding_scores: number[];
  has_ovulation_peak: boolean;
  unusual_bleeding: boolean;
}

const intensityColors = [
  '#E8E6F5', // 1 - Spotting
  '#B8B0E8', // 2 - Light
  '#4A3F8F', // 3 - Medium
  '#2C2F6B', // 4 - Heavy
];

const intensityLabels = ['Spotting', 'Light', 'Medium', 'Heavy'];

const severityColors: Record<string, string> = {
  'Minimal': '#27AE60',
  'Mild': '#F39C12',
  'Moderate': '#E67E22',
  'Severe': '#E74C3C',
  'Extreme': '#922B21',
};

const diseaseLabels: Record<string, string> = {
  'Infertility': 'Infertility / Anovulation',
  'Dysmenorrhea': 'Dysmenorrhea (Pelvic Pain)',
  'PMDD': 'PMDD',
  'Endometrial': 'Endometrial Cancer Risk',
  'T2D': 'Type 2 Diabetes',
  'CVD': 'Cardiovascular Disease',
};

const PeriodLogging = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [predictionsError, setPredictionsError] = useState(false);
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [dateError, setDateError] = useState<string>('');
  
  const [bleedingScores, setBleedingScores] = useState<number[]>([]);
  const [hasOvulationPeak, setHasOvulationPeak] = useState(false);
  const [unusualBleeding, setUnusualBleeding] = useState(false);
  
  const [criterionFlags, setCriterionFlags] = useState<CriterionFlags | null>(null);
  const [derivedFeatures, setDerivedFeatures] = useState<DerivedFeatures | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [cyclesUsed, setCyclesUsed] = useState(0);
  const [totalCyclesStored, setTotalCyclesStored] = useState(0);

  useEffect(() => {
    if (startDate && endDate && endDate <= startDate) {
      setDateError('End date must be after start date');
    } else {
      setDateError('');
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      setBleedingScores(days.map(() => 2));
    }
  }, [startDate, endDate]);

  const getDaysCount = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  const handleStep1Continue = () => {
    if (!startDate || !endDate || dateError) return;
    setStep(2);
  };

  const handleStep2Continue = () => {
    setStep(3);
  };

  const handleSave = async () => {
    if (!startDate || !endDate) return;
    
    setSaving(true);
    setLoadingText('Saving your cycle...');
    
    try {
      // CALL 1: Log cycle
      const logResponse = await menstrualService.logCycle({
        period_start_date: format(startDate, 'yyyy-MM-dd'),
        period_end_date: format(endDate, 'yyyy-MM-dd'),
        bleeding_scores: bleedingScores,
        has_ovulation_peak: hasOvulationPeak,
        unusual_bleeding: unusualBleeding,
        rppg_ovulation_day: null,
      });
      
      setCriterionFlags(logResponse.data.criterion_flags);
      setTotalCyclesStored(logResponse.data.total_cycles_stored);
      
      setLoadingText('Running predictions...');
      
      // CALL 2: Get predictions
      try {
        const predictResponse = await menstrualService.getMenstrualPrediction();
        setPredictions(predictResponse.data.predictions);
        setDerivedFeatures(predictResponse.data.derived_features);
        setCyclesUsed(predictResponse.data.cycles_used);
        setCriterionFlags(predictResponse.data.criterion_flags);
        setPredictionsError(false);
      } catch (predictErr) {
        console.error('Prediction error:', predictErr);
        setPredictionsError(true);
      }
      
      setStep(4);
    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setLoadingText('');
    }
  };

  const handleRetryPredictions = async () => {
    setLoadingText('Running predictions...');
    try {
      const predictResponse = await menstrualService.getMenstrualPrediction();
      setPredictions(predictResponse.data.predictions);
      setDerivedFeatures(predictResponse.data.derived_features);
      setCyclesUsed(predictResponse.data.cycles_used);
      setPredictionsError(false);
    } catch (err) {
      console.error('Retry error:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate predictions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingText('');
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'EEE, MMM d, yyyy');
  };

  const getIntensityColor = (score: number) => intensityColors[score - 1] || intensityColors[0];
  
  const getSeverityColor = (severity: string) => severityColors[severity] || severityColors['Minimal'];

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {[
        { num: 1, label: 'Period Dates' },
        { num: 2, label: 'Bleeding' },
        { num: 3, label: 'Review' },
      ].map((s, i) => (
        <div key={s.num} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
              step === s.num
                ? 'text-white'
                : step > s.num
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            )}
            style={step === s.num ? { backgroundColor: PRIMARY_PURPLE } : step > s.num ? {} : {}}
          >
            {step > s.num ? <Check className="w-4 h-4" /> : s.num}
          </div>
          {i < 2 && (
            <div
              className={cn('flex-1 h-0.5', step > s.num ? 'bg-green-500' : 'bg-gray-200')}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Log Your Period
      </h2>
      <p className="text-sm text-gray-500 mb-6">When did your period start and end?</p>

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Period Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-12',
                  !startDate && 'text-gray-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Select start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(d) => {
                  setStartDate(d);
                  if (endDate && d && d > endDate) setEndDate(undefined);
                }}
                disabled={(date) => date > new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Period End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-12',
                  !endDate && 'text-gray-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Select end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {dateError && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {dateError}
          </p>
        )}

        {startDate && endDate && !dateError && (
          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
            {getDaysCount()}-day period
          </p>
        )}
      </div>

      <Button
        onClick={handleStep1Continue}
        disabled={!startDate || !endDate || !!dateError}
        className="w-full mt-6 h-12 rounded-xl text-white font-semibold"
        style={{ backgroundColor: PRIMARY_PURPLE }}
      >
        Next
      </Button>
    </motion.div>
  );

  const renderStep2 = () => {
    const days = startDate && endDate ? eachDayOfInterval({ start: startDate, end: endDate }) : [];
    
    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Daily Bleeding Intensity
        </h2>
        <p className="text-sm text-gray-500 mb-6">Rate each day of your period</p>

        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
          {days.map((day, index) => (
            <div key={day.toISOString()} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Day {index + 1} - {format(day, 'EEE, MMM d')}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((score) => (
                  <button
                    key={score}
                    onClick={() => {
                      const newScores = [...bleedingScores];
                      newScores[index] = score;
                      setBleedingScores(newScores);
                    }}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-lg border transition-all text-xs font-medium',
                      bleedingScores[index] === score
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-700'
                    )}
                    style={{
                      backgroundColor: bleedingScores[index] === score ? getIntensityColor(score) : 'white',
                    }}
                  >
                    {intensityLabels[score - 1]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white cursor-pointer">
            <span className="text-sm text-gray-700">Ovulation peak detected this cycle?</span>
            <input
              type="checkbox"
              checked={hasOvulationPeak}
              onChange={(e) => setHasOvulationPeak(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: PRIMARY_PURPLE }}
            />
          </label>
          
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white cursor-pointer">
            <span className="text-sm text-gray-700">Any unusual bleeding outside this period?</span>
            <input
              type="checkbox"
              checked={unusualBleeding}
              onChange={(e) => setUnusualBleeding(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: PRIMARY_PURPLE }}
            />
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
            Back
          </Button>
          <Button
            onClick={handleStep2Continue}
            className="flex-1 h-12 rounded-xl text-white font-semibold"
            style={{ backgroundColor: PRIMARY_PURPLE }}
          >
            Next
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderStep3 = () => {
    const days = startDate && endDate ? eachDayOfInterval({ start: startDate, end: endDate }) : [];
    
    return (
      <motion.div
        key="step3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Review & Save
        </h2>
        <p className="text-sm text-gray-500 mb-6">Confirm your cycle details before saving</p>

        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">PERIOD DATES</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Start:</span>
              <span className="text-gray-900 font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">End:</span>
              <span className="text-gray-900 font-medium">{formatDate(endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration:</span>
              <span className="text-gray-900 font-medium">{getDaysCount()} days</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">BLEEDING PATTERN</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {bleedingScores.map((score, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-purple-300"
                style={{ backgroundColor: getIntensityColor(score) }}
                title={`Day ${i + 1}: ${intensityLabels[score - 1]}`}
              />
            ))}
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>1=Spotting</span>
            <span>2=Light</span>
            <span>3=Medium</span>
            <span>4=Heavy</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">OTHER DETAILS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ovulation peak detected:</span>
              <span className="text-gray-900 font-medium">{hasOvulationPeak ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unusual bleeding:</span>
              <span className="text-gray-900 font-medium">{unusualBleeding ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {saving && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {loadingText || 'Saving...'}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => setStep(2)} disabled={saving} className="flex-1 h-12 rounded-xl">
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-12 rounded-xl text-white font-semibold"
            style={{ backgroundColor: PRIMARY_PURPLE }}
          >
            {saving ? 'Saving...' : 'Save & Get Predictions'}
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderStep4 = () => {
    const getPillBadge = (condition: string, triggered: boolean) => {
      if (!triggered) return null;
      
      const labels: Record<string, string> = {
        'oligomenorrhea': 'Oligomenorrhea (cycle >35 days)',
        'amenorrhea_risk': 'Amenorrhea Risk (<8 periods/year)',
        'irregular_cycle_pattern': 'Irregular Pattern (CLV >7 days)',
      };
      
      return (
        <span
          key={condition}
          className="inline-block px-3 py-1 text-sm rounded-full"
          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
        >
          {labels[condition] || condition}
        </span>
      );
    };

    const renderCriterionBanner = () => {
      if (!criterionFlags) return null;
      
      const isPositive = criterionFlags.criterion_1_positive === 1;
      
      return (
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            borderLeft: `4px solid ${isPositive ? '#E67E22' : '#27AE60'}`,
            backgroundColor: isPositive ? '#FFFBF0' : '#F0FFF4',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{isPositive ? '⚠️' : '✅'}</span>
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: isPositive ? '#E67E22' : '#27AE60' }}
              >
                {isPositive ? 'Cycle Pattern Detected — Rotterdam Criterion 1' : 'No Cycle Irregularity Detected'}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{criterionFlags.summary}</p>
              
              {isPositive && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {criterionFlags.criteria.map((c) => getPillBadge(c.condition, c.triggered))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderStatChips = () => {
      if (!derivedFeatures) return null;
      
      const clvColor = derivedFeatures.CLV > 7 ? '#E74C3C' : '#27AE60';
      
      return (
        <div className="flex gap-3 mb-8">
          <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Avg Cycle Length</p>
            <p className="text-lg font-semibold text-gray-900">{derivedFeatures.mean_cycle_len.toFixed(1)} days</p>
          </div>
          <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Cycles Logged</p>
            <p className="text-lg font-semibold text-gray-900">{cyclesUsed}</p>
          </div>
          <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Cycle Variability</p>
            <p className="text-lg font-semibold" style={{ color: clvColor }}>{derivedFeatures.CLV.toFixed(1)} days</p>
          </div>
        </div>
      );
    };

    const renderPredictions = () => {
      if (predictionsError) {
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 mb-4">Predictions unavailable — something went wrong</p>
            <Button
              onClick={handleRetryPredictions}
              className="text-white"
              style={{ backgroundColor: PRIMARY_PURPLE }}
            >
              Retry Predictions
            </Button>
          </div>
        );
      }

      if (!predictions) return null;

      const diseaseEntries = Object.entries(predictions).sort((a, b) => b[1].risk_score - a[1].risk_score);

      return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-purple-50 px-5 py-4 border-b border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900">Disease Risk Predictions</h3>
            <p className="text-sm text-gray-500">Based on your menstrual cycle history</p>
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">Disease</th>
                <th className="text-center px-5 py-3 text-sm font-semibold text-gray-700">Risk Score</th>
                <th className="text-center px-5 py-3 text-sm font-semibold text-gray-700">Severity</th>
              </tr>
            </thead>
            <tbody>
              {diseaseEntries.map(([key, pred], index) => {
                const isFlagged = pred.risk_flag === 1;
                return (
                  <tr
                    key={key}
                    className={cn(index % 2 === 0 ? 'bg-white' : 'bg-gray-50', isFlagged && 'bg-red-50')}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isFlagged && <span>🚩</span>}
                        <span className={cn('font-medium', isFlagged && 'text-red-700')}>
                          {diseaseLabels[key] || key}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="mb-1 font-medium text-gray-900">
                        {(pred.risk_score * 100).toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px] mx-auto">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${pred.risk_score * 100}%`,
                            backgroundColor: getSeverityColor(pred.severity),
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className="inline-block px-3 py-1 text-sm rounded-full font-semibold text-white"
                        style={{ backgroundColor: getSeverityColor(pred.severity) }}
                      >
                        {pred.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <motion.div
        key="step4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        {renderCriterionBanner()}
        {renderStatChips()}
        {renderPredictions()}

        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/cycle-history')}
            className="flex-1 h-12 rounded-xl"
          >
            View Cycle History
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 h-12 rounded-xl text-white font-semibold"
            style={{ backgroundColor: PRIMARY_PURPLE }}
          >
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {step < 4 && (
        <div className="px-6 pt-8 pb-6" style={{ backgroundColor: PRIMARY_PURPLE }}>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => step === 1 ? navigate('/dashboard') : setStep(s => (s - 1) as Step)}
              className="text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Log Period</h1>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm ml-8">
            <span>Step {step} of 3</span>
          </div>
        </div>
      )}

      <div className="px-6 py-6 max-w-lg mx-auto">
        {step < 4 && renderStepIndicator()}
        
        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PeriodLogging;