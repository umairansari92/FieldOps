# Clarifying Questions

If this were a real-world implementation, the following clarifications would be required from the Product Manager to ensure correct system behavior and alignment with business expectations:

1. **Job Cancellation Logic**  
   When a job is cancelled by an admin, how should this affect the assigned technician?  
   - Should the technician's availability be automatically updated?  
   - Should cancellations impact any performance or reliability metrics?

2. **Notification Channels**  
   Are in-app notifications sufficient for technicians?  
   Field technicians are typically not actively monitoring dashboards, so should SMS or push notifications (e.g., via Twilio or Firebase) be considered in future iterations?

3. **Technician Assignment Acceptance**  
   Should technicians have the ability to accept or reject assigned jobs?  
   If rejection is allowed, what should be the fallback mechanism (e.g., reassignment queue)?

4. **Client Visibility Boundaries**  
   Should clients have access to all technician notes?  
   Or should the system support separation between internal notes and client-visible updates?

5. **Offline Support for Technicians**  
   Should the system support offline usage for field technicians?  
   For example, using Service Workers and Background Sync to allow job updates in low or no connectivity environments.

These questions highlight areas where business rules significantly impact system design and would typically be clarified before full-scale development.
