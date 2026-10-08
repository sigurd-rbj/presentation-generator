# Adaptive Production Monitoring Pilot — authored outline

This 11-slide, 12–15 minute review leads with the limited decision, explains the physical and digital boundaries, separates observed measures from interpretation, and closes with a gated request. The production-line schematic and advisory data-flow asset informed editable diagrams; the dashboard wireframe informed the operator-experience summary. The optional robot sketch was not selected.

The fenced JSON is the sole build-time slide plan. Each slide records its message, purpose, support, intended visual, archetype, fields, and fictional source references.

```json
{
  "slides": [
    {
      "number": 1,
      "title": "Adaptive Production Monitoring Pilot",
      "purpose": "Orient the audience to the fictional pilot review and its limited scope.",
      "supportingContent": "Northstar Manufacturing Lab; one cell; 10 production weeks in April–June 2026.",
      "visual": "Template cover with original Northstar wordmark.",
      "archetype": "cover",
      "sourceRefs": [
        "brief.md",
        "sources/project-overview.md"
      ],
      "content": {
        "title": "Adaptive Production Monitoring Pilot",
        "subtitle": "What a 10-week advisory pilot showed—and what to test next",
        "meta": "NORTHSTAR MANUFACTURING LAB / APRIL–JUNE 2026 / FICTIONAL CASE"
      }
    },
    {
      "number": 2,
      "title": "The pilot supports a gated test on one adjacent line",
      "purpose": "State the proposed decision and distinguish observations from unresolved proof.",
      "supportingContent": "Matched downtime observation, reviewed flags, operator context, causal and recall limits, eight-week request.",
      "visual": "Editable supported-versus-open decision panels.",
      "archetype": "standardContent",
      "sourceRefs": [
        "sources/pilot-results.md",
        "sources/operator-feedback.txt",
        "sources/risks-and-open-questions.md",
        "sources/roadmap.md"
      ],
      "content": {
        "title": "The pilot supports a gated test on one adjacent line",
        "body": "Observed gains and operator value warrant a limited validation, with evidence gaps made explicit.",
        "page": "02",
        "visualSpec": {
          "type": "decisionPanels",
          "kicker": "DECISION IN BRIEF",
          "supported": {
            "title": "Observed signals",
            "items": [
              "Downtime: 30 to 20 h in matched 400 h windows",
              "18 of 24 advisory flags judged relevant",
              "Operators valued cross-station context"
            ]
          },
          "openQuestions": {
            "title": "Decision limits",
            "items": [
              "No causal proof or throughput uplift",
              "Recall remains unknown",
              "Second-line reliability and wording untested"
            ]
          },
          "decision": "Request: eight-week, advisory-only validation on one adjacent line."
        }
      }
    },
    {
      "number": 3,
      "title": "Five stations and 18 channels anchored the pilot",
      "purpose": "Make the physical pilot boundary and monitored signals concrete.",
      "supportingContent": "Infeed 3, orientation 4, robotic assembly 5, vision inspection 4, pack-out 2 condition channels; one cell only.",
      "visual": "Editable five-station line diagram based on production-line-schematic.svg.",
      "archetype": "largeVisual",
      "sourceRefs": [
        "sources/project-overview.md",
        "assets/production-line-schematic.svg"
      ],
      "content": {
        "title": "Five stations and 18 channels anchored the pilot",
        "body": "One mixed-model assembly cell; condition monitoring stayed separate from equipment control.",
        "page": "03",
        "visualSpec": {
          "type": "productionLine",
          "kicker": "PHYSICAL SCOPE / ONE FLEXIBLE CELL",
          "stations": [
            {
              "name": "Infeed",
              "detail": "Conveyor entry",
              "sensors": "3"
            },
            {
              "name": "Orient",
              "detail": "Part positioning",
              "sensors": "4"
            },
            {
              "name": "Robot",
              "detail": "Assembly handling",
              "sensors": "5"
            },
            {
              "name": "Vision",
              "detail": "Inspection state",
              "sensors": "4"
            },
            {
              "name": "Pack-out",
              "detail": "Finished modules",
              "sensors": "2"
            }
          ],
          "note": "The shadow connected interruptions and drift across station boundaries.",
          "footnote": "Pilot scope: 10 production weeks · 400 scheduled hours · 16,800 completed cycles."
        }
      }
    },
    {
      "number": 4,
      "title": "The digital shadow had no control authority",
      "purpose": "Explain the signal path and the read-only safety boundary.",
      "supportingContent": "1 Hz production sampling, edge context, station-state service, healthy baseline, dashboard; no PLC/robot/safety write path.",
      "visual": "Editable four-stage architecture adapted from advisory-data-flow.svg.",
      "archetype": "processArchitecture",
      "sourceRefs": [
        "sources/system-architecture.md",
        "assets/advisory-data-flow.svg"
      ],
      "content": {
        "title": "The digital shadow had no control authority",
        "body": "1 Hz condition samples became trends and advisory drift scores for human review.",
        "page": "04",
        "visualSpec": {
          "type": "architecture",
          "kicker": "READ-ONLY CONDITION DATA PATH",
          "nodes": [
            {
              "label": "Cell",
              "title": "18 channels",
              "detail": "Five stations · 1 Hz"
            },
            {
              "label": "Edge",
              "title": "Gateway",
              "detail": "Time, recipe, mode"
            },
            {
              "label": "Service",
              "title": "Shadow",
              "detail": "State and 7-day baseline"
            },
            {
              "label": "Operator",
              "title": "Dashboard",
              "detail": "Trends, flags, review"
            }
          ],
          "guardrail": "No write path to the PLC, robot controller, or safety system."
        }
      }
    },
    {
      "number": 5,
      "title": "Observed results need careful interpretation",
      "purpose": "Transition from system design to evidence and foreground the observational design.",
      "supportingContent": "Baseline and pilot had matched scheduled hours, but conditions were not experimentally controlled.",
      "visual": "Template section divider.",
      "archetype": "sectionDivider",
      "sourceRefs": [
        "sources/pilot-results.md",
        "sources/risks-and-open-questions.md"
      ],
      "content": {
        "sectionTitle": "Observed results need careful interpretation",
        "sectionNote": "Comparable hours; uncontrolled operating conditions.",
        "page": "05"
      }
    },
    {
      "number": 6,
      "title": "One cell produced useful operational signals",
      "purpose": "Show key pilot observations with correct denominators.",
      "supportingContent": "Pilot volume, availability, reviewed-flag precision, and separately reviewed drift events.",
      "visual": "Four editable KPI cards with explicit qualifiers.",
      "archetype": "kpiResults",
      "sourceRefs": [
        "sources/pilot-results.md",
        "sources/project-overview.md"
      ],
      "content": {
        "title": "One cell produced useful operational signals",
        "body": "Scope and review counts matter as much as the headline values.",
        "page": "06",
        "visualSpec": {
          "type": "kpiCards",
          "kicker": "PILOT OBSERVATIONS / 10 PRODUCTION WEEKS",
          "items": [
            {
              "value": "16,800",
              "label": "Completed cycles",
              "detail": "Pilot volume only"
            },
            {
              "value": "95.0%",
              "label": "Availability",
              "detail": "92.5% baseline"
            },
            {
              "value": "75%",
              "label": "Reviewed-flag precision",
              "detail": "18 relevant of 24 flags"
            },
            {
              "value": "8 of 12",
              "label": "Reviewed drift events",
              "detail": "Flagged before notice"
            }
          ],
          "footnote": "Selected event review only; recall is unknown. Median lead among the eight early events: 11 min."
        }
      }
    },
    {
      "number": 7,
      "title": "Downtime and acknowledgement were lower in matched windows",
      "purpose": "Compare operational measures without implying causation.",
      "supportingContent": "Each window had 400 scheduled hours; downtime 30 to 20 h; median flag-to-acknowledgement 16 to 10 min.",
      "visual": "Two editable baseline-versus-pilot bar pairs.",
      "archetype": "standardContent",
      "sourceRefs": [
        "sources/pilot-results.md",
        "sources/risks-and-open-questions.md"
      ],
      "content": {
        "title": "Downtime and acknowledgement were lower in matched windows",
        "body": "Both windows had 400 scheduled hours; product mix and staffing were not controlled.",
        "page": "07",
        "visualSpec": {
          "type": "comparison",
          "kicker": "MATCHED 10-WEEK WINDOWS / OBSERVATIONAL COMPARISON",
          "measures": [
            {
              "label": "Unplanned downtime",
              "baseline": 30,
              "pilot": 20,
              "maximum": 40,
              "unit": "h",
              "change": "10 h lower · 33.3% reduction"
            },
            {
              "label": "Median flag-to-ack",
              "baseline": 16,
              "pilot": 10,
              "maximum": 20,
              "unit": "min",
              "change": "6 min lower · 37.5% reduction"
            }
          ],
          "callout": "These associations do not establish that monitoring caused the change."
        }
      }
    },
    {
      "number": 8,
      "title": "Operators valued context and asked for clearer advisories",
      "purpose": "Bring qualitative experience into the decision without treating it as a survey.",
      "supportingContent": "Cross-station history and handover value; amber-banner confusion, signal and recipe context, duplicate marking.",
      "visual": "Balanced text columns informed by the optional dashboard wireframe.",
      "archetype": "twoColumn",
      "sourceRefs": [
        "sources/operator-feedback.txt",
        "assets/operator-dashboard-wireframe.svg"
      ],
      "content": {
        "title": "Operators valued context and asked for clearer advisories",
        "leftHeading": "What helped",
        "leftBody": [
          "Cross-station history helped trace where a stop began across the cell.",
          "Keep station history visible while reviewing a flag on the dashboard.",
          "Event context made shift handover easier.",
          "Trends supported investigation of gradual drift."
        ],
        "rightHeading": "What to refine",
        "rightBody": [
          "At first, the amber advisory banner resembled a machine alarm.",
          "Label it clearly as review-only.",
          "Show exact signal, timestamp, and recipe.",
          "Allow duplicate or not-actionable dispositions.",
          "Check experience on the night shift."
        ],
        "page": "08"
      }
    },
    {
      "number": 9,
      "title": "Broader rollout still needs evidence on recall and reliability",
      "purpose": "State evidence limitations and concrete second-line technical questions.",
      "supportingContent": "Missed events not comprehensively labelled; selected drift-event review; recipe/shift effects and long-outage replay remain open.",
      "visual": "Editable observed-versus-open panels.",
      "archetype": "standardContent",
      "sourceRefs": [
        "sources/risks-and-open-questions.md",
        "sources/pilot-results.md",
        "sources/system-architecture.md"
      ],
      "content": {
        "title": "Broader rollout still needs evidence on recall and reliability",
        "body": "The one-cell review cannot establish general detection performance or production impact.",
        "page": "09",
        "visualSpec": {
          "type": "decisionPanels",
          "kicker": "INTERPRETATION BOUNDARY",
          "supported": {
            "title": "What was reviewed",
            "items": [
              "24 advisory flags; 18 judged relevant",
              "12 drift events; 8 flagged early",
              "One cell for 10 production weeks"
            ]
          },
          "openQuestions": {
            "title": "What remains open",
            "items": [
              "Missed events were not fully labelled",
              "Recipe and shift effects need testing",
              "Long-outage replay and clocks need proof"
            ]
          },
          "decision": "Keep the shadow advisory and read-only during the next validation."
        }
      }
    },
    {
      "number": 10,
      "title": "An eight-week validation creates four decision gates",
      "purpose": "Show a limited sequenced plan with measurable exit conditions.",
      "supportingContent": "Connect/qualify, baseline, operator validation, compare/decide; future 98% timestamp target and governance sign-off.",
      "visual": "Editable four-phase timeline.",
      "archetype": "roadmap",
      "sourceRefs": [
        "sources/roadmap.md",
        "sources/risks-and-open-questions.md"
      ],
      "content": {
        "title": "An eight-week validation creates four decision gates",
        "body": "One adjacent line; explicit owners, measurements, and a later go/no-go review.",
        "page": "10",
        "visualSpec": {
          "type": "timeline",
          "kicker": "PROPOSED NEXT PHASE / NOT YET APPROVED",
          "phases": [
            {
              "period": "WEEKS 1–2",
              "title": "Connect",
              "detail": "Interfaces, recipe IDs, timestamps, cyber review"
            },
            {
              "period": "WEEKS 3–4",
              "title": "Baseline",
              "detail": "Both shifts, downtime definitions, replay test"
            },
            {
              "period": "WEEKS 5–6",
              "title": "Validate",
              "detail": "Flag relevance, duplicates, advisory wording"
            },
            {
              "period": "WEEKS 7–8",
              "title": "Decide",
              "detail": "Repeat measures; cross-function go/no-go"
            }
          ],
          "guardrail": "Future target: ≥98% timestamp completeness; review access, retention, and control boundaries."
        }
      }
    },
    {
      "number": 11,
      "title": "Approve the next test, not a rollout",
      "purpose": "End with the specific authorization sought and its limit.",
      "supportingContent": "Eight-week advisory-only test on one adjacent line; return for go/no-go after gate review.",
      "visual": "Template closing slide with a concise decision request.",
      "archetype": "closing",
      "sourceRefs": [
        "brief.md",
        "sources/roadmap.md"
      ],
      "content": {
        "message": "Approve the next test, not a rollout",
        "nextStep": "Eight-week advisory-only validation on one adjacent line; return for a go/no-go decision."
      }
    }
  ]
}
```
