IoT-SPMS Mock Demo Implementation Guide
Overview
This document describes how to implement the Smart Parking Management System for University Campus (IoT-SPMS) as a mock-data web demo without a database and without real IoT devices. The proposed implementation still covers the MVP direction in the project documents, including the user-facing application, operator dashboard, policy management, billing flow, user synchronization, and real-time monitoring behavior.

The goal of this version is to validate business logic and UI behavior before integrating real hardware such as RFID readers, sensors, gateways, barriers, and LED panels, or external systems such as HCMUT_SSO, HCMUT_DATACORE, and BKPay.

Implementation goal
The mock demo should simulate the system's seven main use cases: automated entry/exit, temporary access, billing and payment initialization, dynamic guidance, policy configuration, real-time parking monitoring, and user synchronization.
​ It should also reflect the UI direction shown in the design document, which includes dashboard, monitoring, policy, finance, and history modules.
​

This approach is suitable for the prototype stage because the project scope requires a functional demonstration of parking visibility, operator monitoring, pricing logic, and payment flow, while actual device deployment and full infrastructure can be deferred to later phases.
​

Recommended stack
The simplest and most practical stack for this mock version is a single web application built with Next.js + TypeScript. This is enough to implement the required pages, business logic, and live UI simulation in one codebase without introducing unnecessary backend or deployment complexity.

Suggested tools:

Next.js with App Router or Pages Router.

TypeScript for typed mock models.

Zustand or React Context for global in-memory state.

Tailwind CSS for fast dashboard and admin UI development.

Recharts or Chart.js for occupancy, traffic, and billing charts similar to the dashboard concept in the design mockup.
​

Architecture
The implementation should use a single-application mock architecture. Instead of real API calls, database reads, or hardware communication, the application should call local service modules that operate on in-memory data objects and simulated events.

Logical flow
text
User Interface
  -> In-Memory Store
  -> Mock Services
  -> Business Logic
  -> UI Re-render / Simulated Real-time Update
Main layers
Presentation layer: dashboard, monitoring page, entry/exit simulator, ticket simulator, billing page, policy page, sync page, event history page.

Mock service layer: fake SSO, fake DATACORE, fake BKPay, fake RFID, fake sensor, fake barrier, fake LED signage.

State layer: local arrays and objects stored in memory during runtime.

Logic layer: session management, role validation, pricing rules, occupancy calculation, guidance calculation, sync comparison, logging.

Folder structure
A clean project structure for the mock-only implementation can be:

text
src/
  app/ or pages/
    dashboard/
    monitoring/
    simulator/
    policies/
    billing/
    sync/
    history/
  components/
    dashboard/
    monitoring/
    simulator/
    common/
  mock/
    users.ts
    parking-slots.ts
    zones.ts
    sessions.ts
    policies.ts
    billing.ts
    devices.ts
    logs.ts
  services/
    auth-mock.ts
    datacore-mock.ts
    bkpay-mock.ts
    sensor-mock.ts
    gate-mock.ts
    guidance-mock.ts
    billing-mock.ts
    sync-mock.ts
  store/
    app-store.ts
  types/
    user.ts
    parking.ts
    billing.ts
    policy.ts
    device.ts
This separation makes it easier to explain which part of the code simulates external systems and which part implements the actual application logic.

Mock data model
The application should start from predefined mock datasets written in TypeScript or JSON-like objects. These datasets replace both the persistent database and the real external systems during the demo.

Core entities
Entity	Purpose	Example fields
User	Campus member or visitor	id, name, role, faculty, cardId, vehicleType, status
ParkingSlot	Slot state for monitoring	id, zoneId, status, lastUpdated
ParkingZone	Group of slots and signage target	id, name, capacity, availableSlots, status
ParkingSession	Entry/exit tracking	id, userId, cardId, ticketId, entryTime, exitTime, gateId, status
Policy	Pricing and privilege configuration	id, role, vehicleType, rateType, price, exemption, timeRange
BillingRecord	Learner payment demo	id, userId, period, amount, status
DeviceState	Mock device health and state	id, type, zoneId, status, heartbeat
AuditLog	Event history and tracking	id, timestamp, type, actor, message
The documents emphasize role-based privileges, synchronization, occupancy updates, billing records, and operator monitoring, so these entities are enough to support the mock MVP behavior.

In-memory state strategy
Because there is no database, all application data should be loaded once from mock files and stored in a global runtime store. Any updates, such as slot occupancy changes, ticket issuance, or policy edits, should modify this store directly and update the UI immediately.

Recommended store slices:

users

zones

slots

sessions

policies

billingRecords

devices

logs

uiState

This design is sufficient for a demo because persistence across browser refresh is not required. Resetting to the initial mock dataset after reload is acceptable for prototype validation.
​

Required pages
The design mockup already shows five major UI modules: system overview dashboard, real-time monitoring, policy management, finance/BKPay, and user/history records.
​ For a stronger demo, the implementation should expose these as dedicated pages plus a small simulator page.

1. Dashboard
The dashboard should show overall occupancy, available slots, maintenance or fault count, recent alerts, and traffic trends. This aligns with the design mockup where KPI cards and charts summarize parking availability, occupancy, and system health.
​

Suggested widgets:

Total slots

Available slots

Occupied slots

Faulty devices count

Current active sessions

Hourly traffic chart

Latest alerts panel

2. Real-time monitoring
The monitoring page should display a zone map or parking grid where each slot is color-coded as available, occupied, maintenance, or uncertain. This matches the design document's digital-twin style monitoring interface and the functional requirement for near real-time availability updates.

Suggested controls:

Toggle slot status manually.

Trigger gateway disconnection.

Trigger signage fault.

Trigger administrative override for a zone.

3. Entry/Exit simulator
This page should simulate UC-01 by allowing a user or operator to choose a mock user/card and trigger an entry or exit event. The system should validate the user, create or close a parking session, update occupancy, and append an audit log entry.

Suggested actions:

Select mock user.

Tap at entry gate.

Tap at exit gate.

Show barrier open/denied state.

Show reason for rejection if invalid.

4. Temporary ticket simulator
This page should simulate UC-02 by allowing a visitor or user without an ID card to request a temporary ticket. The system should generate a unique session and ticket reference in memory and show the ticket data on screen instead of printing physically.
​

Suggested actions:

Create temporary ticket.

Operator-assisted ticket issuance.

Trigger printer failure message.

Trigger barrier malfunction message.

5. Policy management
The policy page should let an admin edit mock pricing rules, exemptions, and role-based privileges. This directly supports the project requirement that administrators manage pricing tiers, exemptions, and privileges dynamically.

Suggested editable fields:

User role

Vehicle type

Hourly or per-turn rate

Exemption flag

Temporary free-entry period

Zone restriction

6. Billing and BKPay simulator
This page should aggregate learner sessions from in-memory data, calculate charges using the current policy set, and simulate a BKPay request. The design mockup includes payment status tracking and billing-cycle tools, so the page should show Paid, Pending, and Retry Required states visibly.

Suggested actions:

Run billing cycle.

Generate billing record.

Send to mock BKPay.

Force timeout or retry response.

7. Synchronization page
This page should simulate UC-07 by comparing the local user list to a separate mock DATACORE dataset. It should display added users, updated roles, revoked privileges, and the sync report result.
​

Suggested actions:

Sync now.

View new users.

View changed roles.

Show authentication failure.

Show timeout and retry simulation.

8. Event history
This page should show all entry, exit, policy, sync, billing, and device events as an audit timeline or table. This supports the audit and traceability expectations described for operators, security personnel, and administrators.

Mapping use cases to mock behavior
Use case	Mock implementation
UC-01 Automated entry/exit	Simulate RFID tap from selected user; validate mock role; update sessions and occupancy.
​
UC-02 Temporary access	Generate local ticket and session ID; show fallback exceptions in UI.
​
UC-03 Billing and payment	Aggregate mock sessions, apply policies, return fake BKPay status.
UC-04 Dynamic guidance	Recalculate zone recommendation when slot states change; update virtual LED panel text.
​
UC-05 Policy configuration	Edit rules in memory and immediately affect billing/access behavior.
UC-06 Real-time monitoring	Toggle slot occupancy and fault states, then recompute totals and signage.
UC-07 User synchronization	Compare local users with mock DATACORE dataset and produce sync report.
​
Mock services to build
The mock application should expose small service modules to keep logic organized and testable.

auth-mock.ts
Responsibilities:

Validate mock card ID.

Return user profile and role.

Simulate SSO success or failure.

sensor-mock.ts
Responsibilities:

Toggle slot states.

Emit periodic random changes with timers.

Mark gateway status as connected or disconnected.

gate-mock.ts
Responsibilities:

Simulate barrier open/close.

Simulate printer failure.

Simulate manual override.

guidance-mock.ts
Responsibilities:

Count available slots by zone.

Mark zone state as Available, Nearly Full, Full, or Uncertain.

Generate signage text such as Zone A: Left - 12 Slots or FULL.
​

billing-mock.ts
Responsibilities:

Aggregate learner sessions.

Apply policy rates or discounts.

Produce billing records.

Simulate payment responses from BKPay.

sync-mock.ts
Responsibilities:

Compare local users and mock DATACORE users.

Add, update, or revoke records in the in-memory store.

Produce a sync report and log entries.
​

Real-time simulation approach
The project requires near real-time parking status and signage updates, with a target that signage should reflect slot changes within 5 seconds.
​ In the mock version, this can be demonstrated entirely in the browser using timers and store updates.

Recommended methods:

Use setInterval to simulate random slot occupancy changes every 3 to 5 seconds.

Use event handlers to trigger immediate updates when the operator clicks a control.

Recalculate zone totals after every slot state change.

Re-render dashboard KPIs, signage text, and history logs from the same shared store.

A simple simulation loop can be:

Randomly select a slot.

Toggle its status.

Recompute zone availability.

Recompute signage state.

Push a log entry.

Update dashboard and monitoring UI.

Logging strategy
Even without a database, logging should still be visible because the system requirements emphasize auditability for entry, exit, payment, synchronization, and policy changes.
​ Each major action should append a structured log object into an in-memory logs array.

Suggested log categories:

ENTRY_GRANTED

ENTRY_DENIED

EXIT_COMPLETED

TEMP_TICKET_CREATED

POLICY_UPDATED

SYNC_COMPLETED

SYNC_FAILED

BILLING_GENERATED

PAYMENT_PENDING

DEVICE_FAULT

ZONE_STATUS_CHANGED

Minimal logic examples
Parking session creation
When a valid user taps at the entry gate, the application should:

Find the user by cardId.

Validate active status and privileges.

Create a new session object.

Mark a selected or auto-assigned slot as occupied.

Update zone counters.

Add an audit log entry.
​

Exit handling
When a user taps at exit, the application should:

Find the active session.

Calculate elapsed time.

Apply role-based or vehicle-based policy.

Mark payment requirement if applicable.

Close the session and free the slot.

Update dashboard and logs.
​

Zone guidance calculation
For each zone, the application should count occupied and available slots, then derive the display state:

Available if enough slots remain.

Nearly Full if remaining slots are below a threshold.

Full if there are no remaining slots.

Uncertain if gateway or sensor simulation is disconnected.
​

Suggested demo scenarios
The best demo is not just showing pages, but showing end-to-end flows that match the report's use cases and UI design.

Scenario 1: Normal member entry
Choose a student user.

Tap entry.

Show session creation.

Update occupancy and dashboard cards.

Update monitoring grid and signage text.

Scenario 2: Visitor temporary access
Click temporary ticket issue.

Create a visitor session.

Show ticket reference.

Show barrier open state.

Add event to history.
​

Scenario 3: Policy change effect
Change student pricing or free-entry rule.

Re-run billing.

Show changed fee result immediately.

Scenario 4: Zone becomes full
Mark the last available slot in Zone A as occupied.

Show signage changes to FULL.

Redirect signage recommendation to Zone B.
​

Scenario 5: User synchronization
Edit mock DATACORE dataset.

Run sync now.

Show changed role or revoked privilege.

Add sync report entry to history.
​

Scenario 6: BKPay timeout
Run billing.

Force a timeout response.

Show Pending Retry status in billing page and log history.

What not to implement in this version
To keep the scope aligned with a mock prototype, the following should not be implemented yet:

Real database models or migrations.

Real HCMUT_SSO, DATACORE, or BKPay integration.

Real RFID, gateway, sensor, barrier, or LED communication.

MQTT, WebSocket backend, or message broker.

Deployment-scale microservice architecture.

These items are part of a future production-oriented phase, while the current version focuses on validating flows, UI interactions, policy logic, and monitoring behavior.

Step-by-step implementation plan
Phase 1: Project setup
Initialize Next.js with TypeScript.

Add Tailwind CSS.

Add Zustand or define a global state context.

Create mock type definitions and initial datasets.

Phase 2: Core state and mock services
Build app-store.ts.

Create mock service modules.

Add helper functions for occupancy, pricing, and logging.

Phase 3: Main pages
Build Dashboard.

Build Monitoring page.

Build Entry/Exit simulator.

Build Temporary Ticket simulator.

Build Policy page.

Build Billing page.

Build Sync page.

Build Event History page.

Phase 4: Real-time simulation
Add timer-based slot changes.

Add fault simulation toggles.

Add signage state updates.

Add traffic chart updates.

Phase 5: Demo polishing
Add seed reset button.

Add scenario buttons for lecturer demo.

Add visual alerts and status badges.

Add loading or processing animations for sync and billing actions.