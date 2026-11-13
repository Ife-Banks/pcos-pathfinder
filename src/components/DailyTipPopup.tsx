import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { Sun, Sunset, Moon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyTip {
  tip_id: number;
  tip: string;
  time_window: string;
  window_label: string;
}

type TipWindow = "morning" | "afternoon" | "evening" | "night";

const WINDOW_META: Record<
  TipWindow,
  { title: string; accent: string; Icon: typeof Sun }
> = {
  morning: { title: "Morning wellness", accent: "#2F855A", Icon: Sun },
  afternoon: { title: "Afternoon wellness", accent: "#00897B", Icon: Sunset },
  evening: { title: "Evening wellness", accent: "#7C3AED", Icon: Moon },
  night: { title: "Wellness", accent: "#00897B", Icon: Heart },
};

const SHOWN_KEY = "daily_tip_shown";

export default function DailyTipPopup() {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SHOWN_KEY)) return;
    let cancelled = false;
    apiClient
      .get<DailyTip>("/tips/daily-tips/current/")
      .then((res) => {
        if (cancelled) return;
        setTip(res.data);
        setOpen(true);
        sessionStorage.setItem(SHOWN_KEY, "1");
      })
      .catch(() => {
        /* 404 = no tip for this window; stay closed */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!tip) return null;

  const window = (tip.time_window in WINDOW_META
    ? tip.time_window
    : "night") as TipWindow;
  const { title, accent, Icon } = WINDOW_META[window];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Centered card */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-md rounded-[20px] bg-white p-5 shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-all duration-300",
            open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          )}
          style={{ border: `1px solid ${accent}59` }}
          role="dialog"
          aria-label={title}
        >
          <div className="flex items-center gap-2.5">
            <Icon className="h-[22px] w-[22px]" style={{ color: accent }} />
            <h2
              className="text-base font-semibold"
              style={{ color: accent }}
            >
              {title}
            </h2>
          </div>

          <p className="mt-3.5 text-center text-[15px] leading-[1.45] text-gray-800">
            {tip.tip}
          </p>

          <button
            onClick={() => setOpen(false)}
            className="mt-[18px] w-full rounded-xl py-[13px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
