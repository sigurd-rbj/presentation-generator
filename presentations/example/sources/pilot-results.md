# Pilot measurement note — fictional data

This invented extract compares a **10-week baseline window** with the **10-week pilot window (April–June 2026)** on the same flexible cell. Each window contains **400 scheduled production hours**. Product mix and staffing were similar enough for a practical review, but neither was experimentally controlled. Values are observations, not proof that the monitoring system caused a change.

| Measure | Baseline | Pilot | Interpretation |
| --- | ---: | ---: | --- |
| Scheduled production time | 400 h | 400 h | Matched denominator |
| Unplanned downtime | 30 h | 20 h | 10 h lower; **33.3%** relative reduction |
| Availability | 92.5% | 95.0% | `(400 - downtime) / 400`; **+2.5 percentage points** |
| Median time from flag to first operator acknowledgement | 16 min | 10 min | **37.5%** lower; historical baseline used the prior alert workflow |
| Completed cycles observed | Not reconciled | 16,800 | Pilot volume only; no defensible throughput improvement claim |

During the pilot, the dashboard raised **24 advisory flags**. Operators judged **18** relevant to a process condition and **6** not actionable, giving **75% reviewed-flag precision (18/24)**. They separately reviewed **12 distinct drift events**; **8** had an advisory flag before independent operator notice. The median lead among those 8 early-flagged events was **11 minutes**. A flag and a drift event are different units and should not be treated as interchangeable.

The pilot did not comprehensively label missed drift events, so recall and overall model accuracy are unknown. No claim of predictive-maintenance effectiveness was tested. The result is a promising reason to validate further, not evidence for production-wide impact.
