# Public fixture notes (developer-facing; not presentation source)

This fictional fixture tests multi-source synthesis, restraint with unsupported claims, asset selection, long-title and subtitle fitting, production-line and architecture diagrams, KPI cards, baseline/pilot comparison, operator feedback, a gated roadmap, and a decision close. The authored slide sequence is now in `outline.md`; the canonical facts below remain the regression reference.

## Canonical facts for regression review

- Organization/project: Northstar Manufacturing Lab / Adaptive Production Monitoring Pilot; both invented.
- One five-station flexible cell: infeed, orientation, robotic assembly, vision inspection, pack-out.
- Condition channels: **18 total**, distributed **3 + 4 + 5 + 4 + 2** by station.
- Pilot: **10 production weeks, April–June 2026**; **400 scheduled hours** and **16,800 completed cycles** observed.
- Matched historical baseline: **10 weeks**, **400 scheduled hours**; baseline completed-cycle count not reconciled.
- Unplanned downtime: **30 h baseline → 20 h pilot**; 10 h lower, **33.3%** relative reduction.
- Availability: **92.5% → 95.0%**; **+2.5 percentage points**, calculated from scheduled hours and downtime.
- Median flag-to-acknowledgement: **16 → 10 min**, **37.5%** lower.
- Advisory flags: **24 raised; 18 relevant; 6 not actionable**; reviewed-flag precision **75%**.
- Separately reviewed drift events: **12**; **8** flagged before independent notice; median lead among those 8 **11 min**. Recall remains unknown.
- Architecture: **1 Hz** condition sampling during production, station-specific **seven-day** healthy baseline, **90-day** raw-data retention in the pilot design, advisory/read-only path.
- Proposed next gate: **eight weeks** on one adjacent line; **98% timestamp completeness** is a future target, not a pilot observation.

## Interpretation boundaries

No causal proof, production-wide impact, throughput uplift, recall score, predictive-maintenance proof, or autonomous-control claim is supported. Flag precision and early-flagged reviewed events have different denominators. Operator comments are illustrative qualitative notes, not a representative survey.

The files in `assets/` are original vector drawings for optional use. An author should inspect and select them; the loader only inventories assets and does not insert them automatically.
