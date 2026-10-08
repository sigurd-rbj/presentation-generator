# System architecture note — fictional design

The five-station cell has **18 condition channels** sampled at **1 Hz during production**. A line-side edge gateway checks timestamp order and channel status, then attaches station ID, recipe, line mode, and UTC time. Events flow to a time-series store and a station-state service. The digital shadow presents the latest station state, a recent event history, and a station-specific seven-day healthy baseline used to calculate an advisory drift score.

The operator dashboard shows a five-station status view, signal trends, the reason for a flag, and an acknowledgement field. An operator can record a disposition and continue investigation in the normal work system. The shadow has **no write path** to the PLC, robot controller, or safety system. It cannot change equipment settings or issue a work order.

The fictional pilot retained raw condition data for **90 days** under a local access policy. The adjacent-line proposal would need a reviewed retention and access design before expansion. The edge gateway can buffer brief network interruptions, but replay behavior and clock synchronization under longer outages have not yet been validated. This is a technical dependency for a credible second-line test.
