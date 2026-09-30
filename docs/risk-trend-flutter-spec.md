# Risk Trend — Flutter Implementation Spec

Specification for implementing the Risk Trend screen in the Flutter mobile app, matching the existing web implementation.

---

## 1. Screen flow

1. On page load, fire 4 mood prediction triggers in the background (**don't block UI** — fire-and-forget), then fetch the history:
   - `POST /mood/predict/mental-health`
   - `POST /mood/predict/metabolic`
   - `POST /mood/predict/cardio-neuro`
   - `POST /mood/predict/reproductive`
   - `GET /predictions/comprehensive/history/` (Bearer token required)
2. While loading: show skeleton placeholders (3 summary cards, chart area, 4 list rows).
3. On success: render summary cards, chart, and weekly list.
4. On error: show an error banner with a **Retry** button. On 401: clear tokens → redirect to login.

---

## 2. Data mapping (important)

The history response is `{ status, data: [...] }` where each record maps:

| Frontend field | API field |
|---|---|
| `id` | `id` |
| `risk_score` | `final_risk_score` (fallback 0) |
| `risk_tier` | `risk_tier` (fallback `"unknown"`) |
| `computed_at` | `computed_at` (ISO string) |
| `data_completeness_pct` | `data_completeness_pct` |

If `data` isn't an array, treat as empty (show "Not enough data yet.").

---

## 3. Sorting & derived values

- Sort ascending by `computed_at` (oldest → newest).
- **latest** = last item, **previous** = second-to-last, **oldest** = first item.
- `Current` score = `latest.risk_score`.
- `vsLastWeek` = `latest.risk_score - previous.risk_score` (null if < 2 records).
- `8-wk Δ` = `latest.risk_score - oldest.risk_score` (null if < 2 records).

---

## 4. Summary cards (top, 3 across)

Each shows a number to 2 decimal places.

- **Current** — latest score, or `—` if none.
- **vs Last Week** — delta with formatting:
  - `null` → gray `—`
  - `|Δ| < 0.005` → gray, no arrow, text like `+0.00`
  - `Δ > 0` → **red (#E74C3C)** with ↗ (up = worse)
  - `Δ < 0` → **teal (#00897B)** with ↘ (down = better)
- **8-wk Δ** — same formatting rules.

---

## 5. Line chart

- Y-axis fixed **0–1**, ticks at `0, 0.25, 0.5, 0.75, 1` (scores are 0–1).
- X-axis: dates formatted `"Mon dd"` (e.g. "Aug 2"); if more than 6 points, show every 2nd label.
- **Reference lines** (dashed):
  - y=0.5, amber `#F39C12`, label "Moderate"
  - y=0.75, red `#E74C3C`, label "High"
- Line: monotone smoothing, teal `#00897B`, 2.5 width.
- Tap a point → tooltip shows `Risk Score : <value to 2 dp>`, and that point becomes the **active** one (bigger dot, white fill + teal ring) — also highlighted in the list below.

---

## 6. Weekly Changes list (reversed → newest first)

Each row, numbered **W1, W2, … Wn** where `Wn` = latest:

- Date (formatted `Mon dd`), `Score: <2 dp>`.
- **Delta vs the previous week** (the record *before* it in ascending order), same red/teal/arrow formatting as the cards.
- First record (oldest, no previous) shows a **"Baseline"** badge instead of a delta.
- Tapping a row also sets the active chart point.
- Empty state: "No weekly data yet."

---

## 7. Flutter implementation notes

- **Auth**: all requests need `Authorization: Bearer <access_token>`; handle refresh on 401 like the other screens.
- **Chart**: use `fl_chart` (`LineChartData` with `minY: 0, maxY: 1`), `HorizontalLine`s at 0.5 and 0.75 for the reference lines, and an axis tooltip on tap.
- **Background triggers**: run the 4 mood POSTs with `unawaited()` / `Future.wait` ignoring failures — they should never block the screen.
- **Colors**: teal `#00897B`, red `#E74C3C`, amber `#F39C12`, gray text `#9CA3AF`.
- **Numbers**: always format to 2 decimals; scores are floats 0–1.

---

## 8. Endpoints summary

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/predictions/comprehensive/history/` | risk score history for chart + list |
| POST | `/mood/predict/mental-health` | background mood trigger |
| POST | `/mood/predict/metabolic` | background mood trigger |
| POST | `/mood/predict/cardio-neuro` | background mood trigger |
| POST | `/mood/predict/reproductive` | background mood trigger |
