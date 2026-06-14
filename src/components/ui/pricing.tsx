import { buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { useNavigate } from 'react-router-dom';

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  onSelect?: () => void;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = 'Simple, Transparent Pricing',
  description = 'Choose the plan that works for you',
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#00897B', '#4DB6AC', '#80CBC4'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

  return (
    <div className="container py-12">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-muted-foreground text-base whitespace-pre-line">{description}</p>
      </div>

      <div className="flex justify-center items-center gap-3 mb-10">
        <span className="text-sm font-medium text-muted-foreground">Monthly</span>
        <Label>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
          />
        </Label>
        <span className="text-sm font-semibold">
          Annual <span className="text-teal-600">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={cn(
              'rounded-2xl border-2 p-6 bg-background flex flex-col relative',
              plan.isPopular ? 'border-teal-500 shadow-lg' : 'border-border',
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-teal-600 py-0.5 px-3 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                <Star className="text-white h-3 w-3 fill-current" />
                <span className="text-white text-xs font-semibold">Popular</span>
              </div>
            )}

            <p className="text-base font-semibold text-muted-foreground">{plan.name}</p>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                <NumberFlow
                  value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                  format={{ style: 'decimal', minimumFractionDigits: 0 }}
                  formatter={(value) => `NGN ${value.toLocaleString()}`}
                  transformTiming={{ duration: 400, easing: 'ease-out' }}
                  willChange
                />
              </span>
              <span className="text-sm text-muted-foreground mb-1">/ {plan.period}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isMonthly ? 'billed monthly' : 'billed annually'}
            </p>

            <ul className="mt-5 space-y-2 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <hr className="my-5" />

            <button
              onClick={() => plan.onSelect ? plan.onSelect() : navigate(plan.href)}
              className={cn(
                buttonVariants({ variant: plan.isPopular ? 'default' : 'outline' }),
                'w-full rounded-xl text-base font-semibold',
                plan.isPopular && 'bg-teal-600 hover:bg-teal-700 text-white border-0',
              )}
            >
              {plan.buttonText}
            </button>

            <p className="mt-4 text-xs text-center text-muted-foreground">{plan.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
