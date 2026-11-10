import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DailyTip {
  tip_id: number;
  tip: string;
  time_window: string;
  window_label: string;
}

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Health tip</DialogTitle>
          <DialogDescription>{tip.window_label}</DialogDescription>
        </DialogHeader>
        <p className="text-base leading-relaxed">{tip.tip}</p>
      </DialogContent>
    </Dialog>
  );
}
