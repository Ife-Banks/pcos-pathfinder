import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Check } from "lucide-react";
import VASSlider from "@/components/VASSlider";

const EveningCheckIn = () => {
  const navigate = useNavigate();
  const [breastSoreness, setBreastSoreness] = useState(0);
  const [acneSeverity, setAcneSeverity] = useState(0);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setDone(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-info animate-pulse" />
            Evening Check-In
          </div>
        </motion.div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center"
              >
                <Check className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h2 className="text-xl font-bold font-display text-foreground mb-2">Evening check-in done!</h2>
              <p className="text-sm text-muted-foreground">Great job staying consistent. See you tomorrow!</p>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg gradient-clinical flex items-center justify-center">
                  <Moon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display text-foreground">End of day review</h1>
                  <p className="text-sm text-muted-foreground">Rate your symptoms this evening</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-8 flex-1"
            >
              <VASSlider
                label="Cyclic Breast Soreness"
                description="Rate the tenderness or pain in your breasts today."
                value={breastSoreness}
                onChange={setBreastSoreness}
                lowLabel="No Pain"
                highLabel="Worst Imaginable Pain"
              />

              <VASSlider
                label="Acne Severity"
                description="Rate the visibility or discomfort of any skin breakouts today."
                value={acneSeverity}
                onChange={setAcneSeverity}
                lowLabel="None"
                highLabel="Severe"
              />

              {/* Today's snapshot */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <p className="text-xs text-muted-foreground font-display font-semibold mb-3">Today's Symptoms</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "Fatigue", value: "3/10", color: "text-warning" },
                    { label: "Pelvic Pressure", value: "1/10", color: "text-success" },
                    { label: "Breast Soreness", value: `${breastSoreness}/10`, color: breastSoreness > 5 ? "text-destructive" : "text-success" },
                    { label: "Acne", value: `${acneSeverity}/10`, color: acneSeverity > 5 ? "text-destructive" : "text-success" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className={`text-xs font-bold font-display ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="pt-2">
                <Button variant="clinical" size="xl" className="w-full" onClick={handleSubmit}>
                  Complete Evening Check-In
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default EveningCheckIn;
