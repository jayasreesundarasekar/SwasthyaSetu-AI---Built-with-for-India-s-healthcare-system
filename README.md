# 🏥 SwasthyaSetu AI

### **AI-Powered Public Healthcare Resource Intelligence & Emergency Coordination Platform**

> **Predict shortages. Optimize resources. Coordinate healthcare networks before crises become emergencies.**

SwasthyaSetu is an AI-driven healthcare infrastructure intelligence platform designed to help **Public Health Centres (PHCs), district authorities, state health departments, and emergency coordinators** make faster, data-driven decisions about medicines, patient demand, healthcare capacity, and emergency resource allocation.

Instead of treating every PHC as an isolated facility, SwasthyaSetu creates a **connected intelligence layer across the healthcare network** — continuously analyzing inventory, patient footfall, demand patterns, facility capacity, and operational signals to identify emerging risks and recommend coordinated interventions.

---

## 🚨 The Problem

Public healthcare systems operate as interconnected networks, but critical operational information is often fragmented across individual facilities and administrative levels.

A PHC may have:

* Excess medicine stock while another facility is approaching a shortage
* Increasing patient footfall without corresponding resource planning
* Staff or bed capacity under pressure
* Demand patterns that indicate an upcoming shortage
* Emergency conditions requiring rapid redistribution of resources

Traditional systems often answer:

> **"What is happening now?"**

SwasthyaSetu is designed to additionally answer:

> **"What is likely to happen next, where is the risk emerging, and what coordinated action can reduce it?"**

---

# 💡 Our Solution

SwasthyaSetu transforms fragmented healthcare operations into a **predictive, network-level decision-support system**.

```text
                 HEALTHCARE NETWORK
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
     PHC Data       Patient Data      Inventory
        │               │                │
        └───────────────┼────────────────┘
                        ↓
                🧠 AI / ML ENGINE
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
   Forecasting      Anomalies       Optimization
        │               │                │
        └───────────────┼────────────────┘
                        ↓
             🚨 EARLY RISK DETECTION
                        ↓
             🤖 AI RECOMMENDATIONS
                        ↓
             👤 HUMAN APPROVAL
                        ↓
             📋 AUDITABLE ACTION
```

The platform combines **predictive analytics, anomaly detection, constrained resource optimization, scenario simulation, role-based workflows, and explainable AI recommendations** into one healthcare intelligence platform.

---

# ✨ Key Features

## 🧠 1. AI Resource Orchestrator

SwasthyaSetu identifies mismatches between **available resources and predicted demand** across PHCs.

The system can identify situations such as:

```text
PHC A → Medicine surplus
PHC B → Predicted shortage

             ↓

      AI Recommendation

Transfer available stock from
PHC A → PHC B

while maintaining safety-stock
constraints at PHC A.
```

The optimization process considers:

* Current inventory
* Predicted demand
* Safety-stock requirements
* Facility priority
* Distance / transportation burden
* Transfer limits
* Stock-out risk

The objective is to improve network resilience while avoiding unnecessary movement of resources.

---

## 📈 2. AI Demand Forecasting

Historical patient and medicine consumption patterns are analyzed to estimate future demand.

The platform includes an **ARIMA-style forecasting model** incorporating:

* Historical demand
* Trend
* Variability
* Seasonal patterns

Forecasts can be used to identify potential future resource pressure before a shortage occurs.

```text
Historical Demand
       ↓
Trend Analysis
       ↓
Seasonality
       ↓
Forecasting Model
       ↓
Future Demand
       ↓
Stock Risk Analysis
```

---

## 🚨 3. Early Shortage & Risk Detection

SwasthyaSetu continuously evaluates operational signals to identify unusual patterns.

The anomaly detection layer combines statistical techniques including:

* Z-score analysis
* Interquartile range analysis
* Trend deviation
* Combined anomaly scoring

This allows the system to flag abnormal changes in healthcare demand or resource availability.

---

## 🔮 4. 72-Hour Future Network View

Instead of displaying only the current state of the healthcare network, SwasthyaSetu provides a **future-oriented view**.

Authorities can examine projected network conditions across:

* **NOW**
* **+24 hours**
* **+48 hours**
* **+72 hours**

This allows emerging pressure points to be identified before they become critical.

---

## 🧪 5. Emergency Scenario Lab

Healthcare authorities can simulate potential disruptions and immediately observe their projected network impact.

Supported scenarios include:

### 📈 Patient Demand Surge

Simulates a sudden increase in patient footfall.

### ⚠️ Supply Disruption

Simulates failure or disruption in the healthcare supply chain.

### 💊 Medicine Shortage

Simulates inventory depletion and identifies facilities at risk.

### 🚨 Regional Emergency

Simulates a compound healthcare emergency affecting multiple facilities.

The simulation workflow:

```text
Scenario Trigger
      ↓
Network State Changes
      ↓
AI Detects Risk
      ↓
AI Generates Recommendation
      ↓
Projected Impact
      ↓
Human Review
      ↓
Approve / Reject
```

---

# 🚚 6. Supply-Chain Failure Simulation

SwasthyaSetu models healthcare resource movement across the network.

When a supply route becomes unavailable, the system can evaluate alternative resource paths and identify potential contingency transfers.

This provides authorities with a way to explore:

* Affected facilities
* Resources at risk
* Alternative routes
* Potential redistribution
* Projected impact

---

# 📊 7. Before vs After AI Impact Analysis

Recommendations are accompanied by projected impact analysis.

The platform can compare:

```text
WITHOUT INTERVENTION
        VS
WITH AI-RECOMMENDED INTERVENTION
```

Example metrics include:

* Projected stock-out risk
* Facilities at risk
* Resource availability
* Inventory imbalance
* Shortage window
* Network resilience

> **Important:** Scenario outputs are explicitly treated as projections/simulations rather than real-world guarantees.

---

# 🔍 8. Explainable AI Decision Trace

SwasthyaSetu does not simply provide an AI recommendation.

It also provides a reasoning trail explaining **why the recommendation was generated**.

Example:

```text
✓ Demand forecast indicates increasing requirement
✓ Receiving PHC projected to fall below safety threshold
✓ Nearby PHC has available surplus
✓ Source PHC remains above safety-stock level
✓ Transfer satisfies distance and quantity constraints
```

This makes recommendations easier for healthcare administrators to review and validate.

---

# 👤 9. Human-in-the-Loop Safety

SwasthyaSetu is designed as a **decision-support system, not an autonomous healthcare authority**.

AI:

* Detects
* Predicts
* Analyzes
* Recommends
* Explains

Humans:

* Review
* Approve
* Reject
* Execute
* Take accountability

```text
AI DETECTS
     ↓
AI EXPLAINS
     ↓
HUMAN REVIEWS
     ↓
HUMAN APPROVES / REJECTS
     ↓
SYSTEM RECORDS ACTION
```

AI recommendations do **not** automatically execute resource transfers.

---

# 🛡️ 10. Role-Based Healthcare Governance

The platform supports multiple operational roles:

| Role                | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| PHC Staff           | Manage facility-level information and resource requests   |
| District Admin      | Monitor and coordinate district-level operations          |
| State Director      | Monitor state-wide network conditions and approve actions |
| Federal Coordinator | Higher-level network coordination                         |
| Analytics Viewer    | Access analytical insights                                |

Access is protected using **JWT authentication and role-based access control (RBAC).**

---

# 📋 11. Complete Audit Trail

Healthcare resource decisions require accountability.

SwasthyaSetu records operational actions through an audit system containing information such as:

* User
* Action
* Resource
* Timestamp
* Change information
* Approval information
* Request status

This creates a traceable chain from:

**AI Recommendation → Human Decision → System Action**

---

# 🏥 12. Network-Level Healthcare Intelligence

Instead of focusing on one facility at a time, SwasthyaSetu models healthcare as a connected network.

The platform brings together:

* PHC availability
* Medicine inventory
* Patient footfall
* Demand forecasts
* Facility capacity
* Resource transfers
* Emergency events
* Recommendations
* Operational workflows

This enables authorities to reason about **system-wide resource distribution rather than isolated facility conditions.**

---

# 🧠 AI / ML Architecture

SwasthyaSetu uses multiple analytical components.

### Demand Forecasting

```text
Historical Data
      ↓
Trend + Variability
      ↓
ARIMA-style Forecast
      ↓
Future Demand
```

### Anomaly Detection

```text
Operational Data
      ↓
Z-Score
      +
IQR
      +
Trend Deviation
      ↓
Anomaly Score
      ↓
Risk Flag
```

### Resource Optimization

```text
Supply
  +
Demand
  +
Safety Stock
  +
Distance
  +
Facility Priority
       ↓
Constrained Optimization
       ↓
Transfer Recommendation
```

---

# 🏗️ System Architecture

```text
┌───────────────────────────────────────────────┐
│                 USER INTERFACE                │
│                                               │
│ Citizen / PHC / District / State Authorities │
└──────────────────────┬────────────────────────┘
                       │
                       ↓
┌───────────────────────────────────────────────┐
│             SWASTHYASETU PLATFORM             │
│                                               │
│ Dashboards • Mission Control • Simulations   │
│ Forecasts • Alerts • Recommendations          │
└──────────────────────┬────────────────────────┘
                       │
                       ↓
┌───────────────────────────────────────────────┐
│                 REST API LAYER                │
│                                               │
│ Authentication • RBAC • Validation • Logging │
└──────────────────────┬────────────────────────┘
                       │
              ┌────────┴────────┐
              ↓                 ↓
┌─────────────────────┐ ┌──────────────────────┐
│   AI / ML ENGINE    │ │     DATABASE         │
│                     │ │                      │
│ Forecasting         │ │ PHCs                 │
│ Anomaly Detection   │ │ Medicines            │
│ Optimization        │ │ Inventory            │
│ Scenario Analysis   │ │ Patient Footfall     │
└─────────────────────┘ │ Forecasts            │
                        │ Workflows            │
                        │ Audit Logs            │
                        └──────────────────────┘
```

---

# 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js
* Responsive dashboard interfaces
* Interactive Mission Control interface

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* Role-Based Access Control
* Input validation
* Audit logging

### Data & Database

* SQLite for development/demo
* PostgreSQL support for production
* Redis support in the deployment architecture

### AI / Analytics

* ARIMA-style demand forecasting
* Statistical anomaly detection
* Constrained resource optimization
* Scenario simulation
* Network risk analysis

### DevOps

* Docker
* Docker Compose
* Nginx
* Production deployment architecture
* Health checks and monitoring

### Testing

* Jest
* Automated backend tests
* API validation

---

# 📊 Platform Architecture at a Glance

| Layer              | Capability                                         |
| ------------------ | -------------------------------------------------- |
| Experience Layer   | Dashboards, Mission Control, responsive interfaces |
| Intelligence Layer | Forecasting, anomaly detection, optimization       |
| Simulation Layer   | Emergency and supply-chain scenarios               |
| Decision Layer     | AI recommendations + explainable decision traces   |
| Governance Layer   | Human approval + RBAC + audit logs                 |
| Data Layer         | PHC, inventory, demand, patient and workflow data  |
| API Layer          | Secure REST APIs                                   |

---

# 🗄️ Data Model

The backend maintains structured healthcare operational data including:

* Users
* PHCs
* Medicines
* PHC Inventory
* Patient Footfall
* Demand Forecasts
* Workflow Requests
* Audit Logs
* Emergency Events
* AI Recommendations

The database architecture is designed to support relationships between **facilities, resources, demand, predictions, and decisions.**

---

# 🔐 Security & Governance

SwasthyaSetu incorporates several safeguards appropriate for a healthcare decision-support environment:

* JWT-based authentication
* Role-based access control
* Input validation
* SQL injection protection
* Audit logging
* Rate limiting
* Security middleware
* Human approval workflows
* Decision traceability
* Explicit separation between AI recommendation and human authorization

---

# 🚀 Quick Start

## Frontend Demo

The frontend interfaces are self-contained HTML applications.

Open the desired interface directly in a browser:

```bash
cd swasthyasetu_complete/Frontend
```

For the main hackathon demonstration, use:

```text
swasthyasetu_mission_control.html
```

---

## Backend

Navigate to the backend database directory:

```bash
cd swasthyasetu_complete/Backend/Database
```

Install dependencies:

```bash
npm install
```

Seed the development database:

```bash
node seed_database.js
```

Start the backend:

```bash
npm start
```

The API runs on:

```text
http://localhost:5000
```

Health check:

```bash
curl http://localhost:5000/health
```

---

# 🐳 Docker Deployment

The project includes Docker deployment configuration.

```bash
cd swasthyasetu_complete/Backend/Deployment

docker-compose up -d
```

The architecture supports:

* PostgreSQL
* Redis
* Node.js API
* Nginx reverse proxy

---

# 🧪 Testing

Run the backend test suite:

```bash
npm test
```

The project includes automated tests covering API and backend functionality.

---

# 🎯 Hackathon Demo Flow

For a high-impact demonstration, the recommended flow is:

### 01 — Show the Network

Open **Mission Control** and introduce the healthcare network.

### 02 — Show the Current State

Demonstrate PHC status, inventory, demand and operational indicators.

### 03 — Create an Emergency

Trigger a scenario such as:

**50% Patient Surge**

### 04 — Show AI Detection

Demonstrate how the platform identifies facilities under pressure.

### 05 — Show AI Recommendation

Display the recommended resource redistribution.

### 06 — Explain the Decision

Open the **AI Decision Trace**.

### 07 — Show Projected Impact

Compare the projected network state before and after intervention.

### 08 — Human Approval

Demonstrate the review → approve/reject workflow.

### 09 — Audit Trail

Show that the action is recorded for accountability.

---

# 🌟 What Makes SwasthyaSetu Different?

Most healthcare dashboards are designed around **monitoring**.

SwasthyaSetu is designed around **anticipation and coordinated decision-making**.

```text
Traditional Dashboard

Data → Dashboard → Human Interpretation


SwasthyaSetu

Data
 ↓
AI Analysis
 ↓
Prediction
 ↓
Risk Detection
 ↓
Optimization
 ↓
Explanation
 ↓
Human Decision
 ↓
Auditable Action
```

The core idea is simple:

> **Don't wait for a healthcare resource shortage to become a crisis. Detect the risk early, understand the cause, identify available resources elsewhere in the network, and support humans in taking coordinated action.**

---

# 🏆 Innovation Highlights

### 🔮 Predictive Instead of Reactive

Identifies potential future demand and resource pressure.

### 🧠 Multi-Model Intelligence

Combines forecasting, anomaly detection and optimization.

### 🌐 Network-Level Thinking

Connects facilities instead of treating each PHC independently.

### 🧪 What-If Simulation

Allows authorities to explore emergency scenarios before they occur.

### 🔍 Explainable Recommendations

Shows why an intervention was recommended.

### 👤 Human-in-the-Loop

AI recommends; authorized humans remain responsible for decisions.

### 📋 Auditable

Actions and approvals are recorded for accountability.

### 🏗️ Deployment Ready

Includes API architecture, database support, Docker configuration and testing infrastructure.

---

# 📌 Project Status

**Status:** Hackathon Prototype / Functional Demonstration Platform

The project includes:

* Interactive frontend interfaces
* Mission Control demonstration environment
* Backend REST API
* Database architecture
* AI/ML components
* Forecasting
* Anomaly detection
* Resource optimization
* Emergency scenario simulation
* Human approval workflows
* RBAC authentication
* Audit logging
* Docker deployment configuration
* Automated backend tests
* Technical documentation

---

# 🔭 Future Roadmap

SwasthyaSetu can be extended with real-world healthcare integrations such as:

* Government health information systems
* Real-time medicine inventory feeds
* Hospital Management Systems
* Pharmacy and warehouse systems
* Ambulance and emergency response networks
* Real-time bed occupancy feeds
* Staff attendance systems
* Epidemiological surveillance
* Weather and disaster intelligence
* State-wide federated learning
* Privacy-preserving cross-district analytics
* Mobile-first workflows for frontline healthcare workers

The architecture is designed so that additional data sources can be integrated without changing the core decision-support workflow.

---

# 👥 Intended Users

SwasthyaSetu is designed for:

* Public Health Centre staff
* District healthcare administrators
* State health departments
* Emergency coordinators
* Healthcare supply-chain managers
* Public health analysts
* Government health planners

---

# ⚠️ Responsible AI

SwasthyaSetu is a **decision-support prototype**.

AI-generated forecasts and recommendations are intended to assist authorized healthcare personnel and should not replace professional judgment, official protocols, or emergency command structures.

Scenario simulations represent projected outcomes under defined assumptions and should not be interpreted as guaranteed real-world results.

---

# 📜 License

This project was developed as a hackathon prototype.

Add the appropriate license before public production deployment.

---

# ❤️ Built With a Simple Mission

### **Make healthcare resources smarter, faster, and more coordinated.**

**SwasthyaSetu AI**

> **From fragmented healthcare data → to predictive intelligence → to coordinated action.**
