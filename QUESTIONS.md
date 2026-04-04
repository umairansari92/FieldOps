# Clarifying Questions

If this were a real-world scenario where I had direct access to the Product Manager, these are the questions I would have asked before or during implementation:

1.  **Job Cancellation Logic**: When an admin cancels a job, what should happen to the assigned technician's schedule? Should the system automatically log a punitive metric, or is cancelation almost always a client-driven benign event?
2.  **Notification Channels**: Are in-app notifications sufficient? Field technicians are rarely staring at a dashboard; they usually need SMS or Push Notifications to their mobile devices. Do we have a preferred provider (e.g., Twilio) in mind for phase 2?
3.  **Technician Rejection**: As currently built, admins *dictate* assignments. Does a technician have the right to decline a job (due to illness, missing parts, scheduling conflict)? 
4.  **Client Visibility Boundaries**: Should clients see *all* internal notes left by technicians? I built the current system assuming full transparency on the timeline, but usually, companies have "internal only" notes versus "client facing" notes.
5.  **Offline Support**: Field workers frequently lose cell service inside buildings or basements. Is offline-first architecture (e.g., Service Workers with Background Sync) a priority for the mobile tech view?
