# Risks and open questions — fictional review

The pilot covered **one cell for 10 production weeks**. Its baseline and pilot each had **400 scheduled hours**, but production conditions were not experimentally controlled. The observed reduction from **30 to 20 unplanned downtime hours** may reflect factors beyond the advisory dashboard. Baseline cycle counts were not reconciled, so there is no reliable throughput uplift estimate.

The **18 relevant flags out of 24** reviewed describe precision among raised flags only. They do not establish recall: missed events were not comprehensively labelled. The **8 early flags among 12 reviewed drift events** came from a selected event review and should not be presented as general detection rate. Longer-term sensor drift, recipe changes, and different operator behavior on a second line remain open.

Technical questions for the next phase include clock synchronization after longer network outages, duplicate event handling, recipe-specific baselines, the edge gateway's buffering limit, and who owns alert-threshold changes. The current **90-day** raw-data retention design needs access and deletion review before expansion. Operator feedback also identified an amber advisory banner that could be mistaken for a control alarm.

One review question ties several risks together: **Can an advisory digital shadow remain trustworthy across recipe changes, network interruptions, and shift-to-shift operating patterns?** The adjacent-line validation should gather evidence for that question rather than assume the pilot has answered it.

Safety boundary: the shadow is read-only. A future proposal to change that boundary would require separate design and approval; it is not part of the eight-week validation request.
