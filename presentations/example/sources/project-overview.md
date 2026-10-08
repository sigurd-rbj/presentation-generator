# Project overview — fictional Northstar Manufacturing Lab

Northstar Manufacturing Lab is an invented small industrial engineering group. Its Adaptive Production Monitoring Pilot concerns one flexible assembly cell that produces mixed-model actuator modules. Five sequential stations handle **infeed, orientation, robotic assembly, vision inspection, and pack-out**. Operators had difficulty connecting short interruptions and gradual process drift across a shift; the existing station screens showed current alarms but little cross-station context.

The fictional pilot ran for **10 production weeks, April–June 2026**, on this one cell. It observed **16,800 completed cycles** during **400 scheduled production hours**. The team installed **18 condition-sensor channels**: 3 at infeed, 4 at orientation, 5 at robotic assembly, 4 at vision inspection, and 2 at pack-out. Signals include motor current, vibration, temperature, position, and inspection-state readings. These are condition channels, not a complete inventory of every control-system signal.

The project question was whether a station-level digital shadow could reveal emerging drift early enough for an operator to investigate while leaving the PLC, robot controller, and safety system in charge. The pilot was **read-only with respect to equipment control**. It displayed trends and advisory flags; it could not alter speed, stop a cycle, or create a maintenance work order. A matched historical baseline was selected for operational comparison, but the pilot was not a controlled causal experiment.

The team hopes to use the pilot review to decide whether to test the same approach on one adjacent line. It has not requested approval for autonomous control or a site-wide deployment.
