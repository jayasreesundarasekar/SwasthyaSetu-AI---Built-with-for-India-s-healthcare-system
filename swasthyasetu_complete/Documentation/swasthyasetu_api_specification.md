# SwasthyaSetu AI - API & Integration Layer Specification
## Phase 4B: REST API, Data Models, Webhooks & Event Architecture

---

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Base URL & Versioning](#base-url--versioning)
4. [Data Models](#data-models)
5. [Core Endpoints](#core-endpoints)
6. [Webhook Events](#webhook-events)
7. [Error Handling](#error-handling)
8. [Rate Limiting & Quotas](#rate-limiting--quotas)
9. [Integration Examples](#integration-examples)

---

## API Overview

**SwasthyaSetu API** provides programmatic access to:
- PHC facility data, capacity planning, and resource management
- Medicine inventory tracking and demand forecasting
- Multi-district collaboration workflows
- Real-time emergency response coordination
- Audit logging and compliance reporting

**API Tier Support:**
- **Public API** (v1): Aggregate stats, facility discovery (free, rate-limited)
- **Partner API** (v2): PHC operations, inventory, forecasts (API key required)
- **Enterprise API** (v3): Full workflow, audit, federation (contract required)

---

## Authentication & Authorization

### OAuth 2.0 + RBAC

```
POST /auth/v1/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "phc_south_district_001",
  "client_secret": "sk_live_xxxxxxxxxxxxxx",
  "scope": "phc:read phc:inventory:write workflow:approve"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "phc:read phc:inventory:write workflow:approve",
  "organization_id": "district_south_001",
  "role": "district_admin"
}
```

### API Key (Deprecated, use OAuth 2.0)

```
curl https://api.swasthyasetu.gov.in/v2/phcs \
  -H "Authorization: ApiKey sk_live_xxxxx"
```

### Roles & Permissions Matrix

| Role | Scope | Read | Write | Approve | Delete |
|------|-------|------|-------|---------|--------|
| **phc_staff** | Own PHC data | ✓ | ✓ (own) | ✗ | ✗ |
| **district_admin** | District PHCs | ✓ | ✓ | ✓ | ✗ |
| **state_director** | All state PHCs | ✓ | ✓ | ✓ | ✓ |
| **federal_coordinator** | All India PHCs | ✓ | ✓ (federated) | ✓ | ✗ |
| **analytics_viewer** | Stats only | ✓ | ✗ | ✗ | ✗ |

---

## Base URL & Versioning

| Environment | URL |
|---|---|
| Production | `https://api.swasthyasetu.gov.in/v2` |
| Staging | `https://staging-api.swasthyasetu.gov.in/v2` |
| Development | `http://localhost:8000/v2` |

**Version Support:**
- v1: Legacy (deprecated by March 2027)
- v2: Current (stable, recommended)
- v3: Beta (new federated features)

---

## Data Models

### 1. PHC (Primary Health Center)

```json
{
  "id": "phc_south_001",
  "name": "South District Primary Health Center",
  "code": "PDC-2024-001",
  "state": "maharashtra",
  "district": "south",
  "block": "amravati",
  "location": {
    "latitude": 21.1790,
    "longitude": 77.9974,
    "address": "Main Road, Amravati, MH 444601"
  },
  "contact": {
    "phone": "+91-9876543210",
    "email": "phc.south@health.gov.in",
    "administrator": "Dr. Rajesh Kumar"
  },
  "capacity": {
    "total_beds": 30,
    "occupied_beds": 20,
    "icu_beds": 2,
    "maternity_beds": 4,
    "pediatric_beds": 3,
    "general_beds": 21
  },
  "staffing": {
    "doctors": 3,
    "nurses": 8,
    "aides": 5,
    "technicians": 2
  },
  "services": [
    "emergency",
    "maternity",
    "vaccination",
    "disease_surveillance",
    "tb_services",
    "pediatrics"
  ],
  "status": "operational",
  "last_updated": "2026-09-29T14:32:00Z",
  "metadata": {
    "fhir_compliant": true,
    "hl7_enabled": false,
    "data_residency": "maharashtra_state"
  }
}
```

### 2. Medicine Inventory

```json
{
  "id": "medicine_inv_south_001_amoxicillin",
  "phc_id": "phc_south_001",
  "medicine": {
    "name": "Amoxicillin",
    "strength": "250mg",
    "form": "capsule",
    "manufacturer": "National Pharmaceuticals Limited",
    "batch_number": "NP-2026-0451",
    "expiry_date": "2027-12-31"
  },
  "quantity": {
    "current_stock": 450,
    "unit": "units",
    "reorder_point": 200,
    "max_capacity": 1000
  },
  "pricing": {
    "cost_per_unit": 2.5,
    "total_cost": 1125.0,
    "currency": "INR"
  },
  "consumption": {
    "daily_rate": 45,
    "weekly_rate": 315,
    "monthly_forecast": 1350,
    "trend": "increasing"
  },
  "status": "available",
  "last_restocked": "2026-09-20T10:15:00Z",
  "forecast": {
    "days_until_stockout": 10,
    "confidence_score": 0.92,
    "recommendation": "order_now"
  }
}
```

### 3. Workflow Request

```json
{
  "id": "wr_2024_south_001_amox",
  "type": "medicine_transfer",
  "source_phc": "phc_south_001",
  "destination_phc": "phc_east_001",
  "requested_by": "staff_phc_south_001",
  "created_at": "2026-09-29T12:00:00Z",
  "details": {
    "medicine": "Amoxicillin 250mg",
    "quantity": 500,
    "unit": "units",
    "justification": "Critical stock level. Forecast predicts stockout in 2 days.",
    "priority": "high"
  },
  "approval_chain": [
    {
      "step": 1,
      "role": "phc_staff",
      "status": "completed",
      "approved_by": "staff_phc_south_001",
      "approved_at": "2026-09-29T12:15:00Z",
      "comments": "Confirmed critical need"
    },
    {
      "step": 2,
      "role": "district_admin",
      "status": "pending",
      "assigned_to": "admin_district_south_001",
      "assigned_at": "2026-09-29T12:15:00Z",
      "sla_deadline": "2026-09-29T14:00:00Z"
    },
    {
      "step": 3,
      "role": "state_director",
      "status": "pending",
      "assigned_to": "director_maharashtra_001",
      "sla_deadline": "2026-09-29T18:00:00Z"
    }
  ],
  "resource_availability": {
    "source_available": 1200,
    "source_safe_level": 700,
    "destination_current": 150,
    "destination_after": 650,
    "transfer_feasible": true
  },
  "status": "in_approval",
  "current_step": 2,
  "overall_status_percent": 33
}
```

### 4. Emergency Event

```json
{
  "id": "emergency_2026_0929_001",
  "type": "medicine_shortage",
  "severity": "critical",
  "triggered_at": "2026-09-29T14:32:00Z",
  "triggered_by": "automated_threshold_detection",
  "affected_phcs": ["phc_south_001", "phc_south_002", "phc_south_003"],
  "medicine": "Amoxicillin 250mg",
  "affected_patients": 145,
  "response": {
    "status": "active",
    "activated_at": "2026-09-29T14:35:00Z",
    "protocol": "emergency_supply_mobilization",
    "resources_dispatched": [
      {
        "id": "resource_1",
        "type": "supply_truck",
        "from": "phc_east_001",
        "to": "phc_south_001",
        "quantity": 500,
        "eta_minutes": 45,
        "status": "in_transit"
      }
    ],
    "estimated_resolution": "2026-09-29T15:52:00Z"
  },
  "timeline": [
    {
      "event": "Crisis Detected",
      "time": "2026-09-29T14:32:00Z",
      "description": "Stock fell below critical threshold"
    },
    {
      "event": "Alert Issued",
      "time": "2026-09-29T14:35:00Z",
      "description": "Emergency protocol activated"
    }
  ]
}
```

### 5. Audit Log Entry

```json
{
  "id": "audit_2026_0929_001",
  "timestamp": "2026-09-29T14:32:00Z",
  "actor": {
    "user_id": "staff_phc_south_001",
    "role": "phc_staff",
    "organization": "phc_south_001"
  },
  "action": "medicine_stock_update",
  "resource_type": "medicine_inventory",
  "resource_id": "medicine_inv_south_001_amoxicillin",
  "changes": {
    "current_stock": {
      "old": 550,
      "new": 450
    },
    "last_updated": "2026-09-29T14:32:00Z"
  },
  "status": "success",
  "ip_address": "192.168.1.100",
  "user_agent": "Mobile App v4.2.1 iOS",
  "additional_context": {
    "reason": "Patient dispensing",
    "transaction_id": "txn_001"
  }
}
```

---

## Core Endpoints

### Health Check

```
GET /health

Response:
{
  "status": "operational",
  "timestamp": "2026-09-29T14:32:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "webhooks": "healthy",
    "federated_learning": "healthy"
  }
}
```

### PHCs

#### List PHCs
```
GET /phcs?state=maharashtra&district=south&limit=50&offset=0

Query Parameters:
- state: Filter by state
- district: Filter by district
- status: operational, under_maintenance, closed
- limit: Items per page (1-100, default 20)
- offset: Pagination offset

Response:
{
  "data": [
    { ...phc_object },
    { ...phc_object }
  ],
  "pagination": {
    "total": 18,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

#### Get PHC by ID
```
GET /phcs/phc_south_001

Response:
{ ...phc_object }
```

#### Update PHC Status
```
PATCH /phcs/phc_south_001
Content-Type: application/json

{
  "status": "operational",
  "capacity": {
    "occupied_beds": 22,
    "total_beds": 30
  }
}

Response: { ...updated_phc_object }
```

---

### Medicine Inventory

#### Get Inventory for PHC
```
GET /phcs/phc_south_001/medicines?status=low_stock

Response:
{
  "data": [ ...medicine_inventory_objects ],
  "summary": {
    "total_medicines": 24,
    "low_stock_items": 3,
    "critical_items": 1,
    "last_updated": "2026-09-29T14:32:00Z"
  }
}
```

#### Update Medicine Stock
```
PUT /phcs/phc_south_001/medicines/amoxicillin_250mg

{
  "quantity": 450,
  "operation": "dispensed",
  "reason": "Patient treatment",
  "transaction_id": "txn_001"
}

Response: { ...medicine_inventory_object }
```

#### Get Medicine Forecast (14-day)
```
GET /phcs/phc_south_001/medicines/amoxicillin_250mg/forecast

Response:
{
  "medicine": "Amoxicillin 250mg",
  "forecast": {
    "daily_forecast": [1200, 1180, 1160, ...],
    "confidence": 0.92,
    "alerts": [
      {
        "day": 10,
        "event": "stockout_predicted",
        "stock_at_day": 45,
        "recommended_action": "order_now"
      }
    ]
  }
}
```

---

### Workflows

#### Create Workflow Request
```
POST /workflows

{
  "type": "medicine_transfer",
  "source_phc": "phc_south_001",
  "destination_phc": "phc_east_001",
  "details": {
    "medicine": "Amoxicillin 250mg",
    "quantity": 500
  },
  "priority": "high",
  "justification": "Critical stock"
}

Response:
{
  "id": "wr_2024_south_001_amox",
  "status": "in_approval",
  ...workflow_object
}
```

#### List Pending Approvals
```
GET /workflows?status=pending_approval&assigned_to=admin_district_south_001

Response:
{
  "data": [ ...workflow_objects ],
  "total": 5,
  "pending_count": 3
}
```

#### Approve Workflow Step
```
POST /workflows/wr_2024_south_001_amox/approve

{
  "step": 2,
  "approved_by": "admin_district_south_001",
  "comments": "Approved. Source has sufficient stock.",
  "auto_proceed": true
}

Response:
{
  "workflow_id": "wr_2024_south_001_amox",
  "step_completed": 2,
  "next_step": 3,
  "status": "in_approval"
}
```

#### Reject Workflow
```
POST /workflows/wr_2024_south_001_amox/reject

{
  "step": 2,
  "rejected_by": "admin_district_south_001",
  "reason": "Insufficient source stock for safe transfer"
}

Response: { ...workflow_object_with_status_rejected }
```

---

### Emergency Response

#### Get Active Emergencies
```
GET /emergencies?status=active

Response:
{
  "data": [ ...emergency_objects ],
  "active_count": 1
}
```

#### Create Emergency Event
```
POST /emergencies

{
  "type": "medicine_shortage",
  "severity": "critical",
  "affected_phcs": ["phc_south_001", "phc_south_002"],
  "medicine": "Amoxicillin 250mg"
}

Response: { ...emergency_object }
```

#### Dispatch Resource
```
POST /emergencies/emergency_2026_0929_001/resources

{
  "type": "supply_truck",
  "from": "phc_east_001",
  "to": "phc_south_001",
  "quantity": 500,
  "eta_minutes": 45
}

Response: { ...resource_object }
```

---

### Audit & Compliance

#### Get Audit Logs
```
GET /audit?resource_type=medicine_inventory&start_date=2026-09-01&end_date=2026-09-29&limit=100

Response:
{
  "data": [ ...audit_log_objects ],
  "total": 1456
}
```

#### Export Compliance Report
```
POST /reports/compliance/export

{
  "format": "pdf",
  "date_range": "monthly",
  "include_audit_trail": true,
  "email": "compliance@health.gov.in"
}

Response:
{
  "report_id": "report_2026_0929_001",
  "status": "processing",
  "estimated_ready": "2026-09-29T16:00:00Z"
}
```

---

## Webhook Events

### Event Types & Payloads

Webhooks are HTTP POST requests to subscriber URLs with event data.

#### 1. medicine.stock_low

```json
{
  "event_id": "evt_2026_0929_001",
  "type": "medicine.stock_low",
  "timestamp": "2026-09-29T14:32:00Z",
  "data": {
    "phc_id": "phc_south_001",
    "medicine": "Amoxicillin 250mg",
    "current_stock": 150,
    "reorder_point": 200,
    "days_until_stockout": 3
  },
  "severity": "warning"
}
```

#### 2. medicine.critical_shortage

```json
{
  "event_id": "evt_2026_0929_002",
  "type": "medicine.critical_shortage",
  "timestamp": "2026-09-29T14:32:00Z",
  "data": {
    "phc_id": "phc_south_001",
    "medicine": "Amoxicillin 250mg",
    "current_stock": 45,
    "critical_threshold": 100,
    "patients_affected": 145,
    "emergency_protocol": "activated"
  },
  "severity": "critical"
}
```

#### 3. workflow.approval_required

```json
{
  "event_id": "evt_2026_0929_003",
  "type": "workflow.approval_required",
  "timestamp": "2026-09-29T12:15:00Z",
  "data": {
    "workflow_id": "wr_2024_south_001_amox",
    "type": "medicine_transfer",
    "current_step": 2,
    "assigned_to": "admin_district_south_001",
    "sla_deadline": "2026-09-29T14:00:00Z",
    "details": {
      "from": "phc_south_001",
      "to": "phc_east_001",
      "quantity": 500
    }
  },
  "severity": "info"
}
```

#### 4. bed.capacity_alert

```json
{
  "event_id": "evt_2026_0929_004",
  "type": "bed.capacity_alert",
  "timestamp": "2026-09-29T14:32:00Z",
  "data": {
    "phc_id": "phc_south_001",
    "occupancy_percent": 92,
    "total_beds": 30,
    "occupied_beds": 28,
    "available_beds": 2,
    "forecast_occupancy": 105
  },
  "severity": "warning"
}
```

#### 5. emergency.activated

```json
{
  "event_id": "evt_2026_0929_005",
  "type": "emergency.activated",
  "timestamp": "2026-09-29T14:35:00Z",
  "data": {
    "emergency_id": "emergency_2026_0929_001",
    "emergency_type": "medicine_shortage",
    "affected_phcs": ["phc_south_001", "phc_south_002", "phc_south_003"],
    "severity": "critical",
    "action_required": "immediate"
  },
  "severity": "critical"
}
```

### Webhook Subscription Management

```
POST /webhooks/subscriptions

{
  "url": "https://partner-system.com/webhooks/swasthyasetu",
  "events": ["medicine.stock_low", "workflow.approval_required", "emergency.activated"],
  "active": true
}

Response:
{
  "subscription_id": "ws_sub_2026_0929_001",
  "url": "https://partner-system.com/webhooks/swasthyasetu",
  "created_at": "2026-09-29T14:32:00Z",
  "events": [...],
  "retry_policy": {
    "max_retries": 5,
    "backoff_seconds": 60
  }
}
```

### Webhook Delivery & Retry

- **Delivery**: Sent to subscriber URL with `X-Webhook-Signature` HMAC-SHA256 header
- **Retry**: Exponential backoff (60s, 120s, 300s, 600s, 1200s)
- **Timeout**: 10 seconds per delivery
- **Idempotency**: Use `event_id` to deduplicate

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Source PHC does not have sufficient stock for safe transfer",
    "details": {
      "source_available": 600,
      "source_safe_level": 700,
      "requested": 700,
      "shortfall": 100
    },
    "request_id": "req_2026_0929_001",
    "timestamp": "2026-09-29T14:32:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Workflow request created |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | PHC/workflow not found |
| 409 | Conflict | Duplicate workflow request |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

---

## Rate Limiting & Quotas

### Rate Limits

| Tier | Requests/Min | Requests/Day | Concurrent |
|------|--------------|--------------|-----------|
| Public | 10 | 1,000 | 1 |
| Partner | 100 | 100,000 | 10 |
| Enterprise | Unlimited | Unlimited | 50 |

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1695826320
```

---

## Integration Examples

### Python Example: Create Medicine Transfer Workflow

```python
import requests
import json

API_URL = "https://api.swasthyasetu.gov.in/v2"
ACCESS_TOKEN = "eyJhbGc..."

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

payload = {
    "type": "medicine_transfer",
    "source_phc": "phc_south_001",
    "destination_phc": "phc_east_001",
    "details": {
        "medicine": "Amoxicillin 250mg",
        "quantity": 500
    },
    "priority": "high",
    "justification": "Critical stock forecast"
}

response = requests.post(
    f"{API_URL}/workflows",
    headers=headers,
    json=payload
)

if response.status_code == 201:
    workflow = response.json()
    print(f"Workflow created: {workflow['id']}")
    print(f"Status: {workflow['status']}")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### Node.js Example: Subscribe to Webhooks

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = "ws_secret_xxxxx";

app.post('/webhooks/swasthyasetu', (req, res) => {
  // Verify signature
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  switch (event.type) {
    case 'medicine.critical_shortage':
      console.log(`🚨 Critical shortage: ${event.data.medicine} at ${event.data.phc_id}`);
      // Trigger emergency response
      break;
    case 'workflow.approval_required':
      console.log(`⏳ Approval needed for workflow: ${event.data.workflow_id}`);
      // Send notification to approver
      break;
    case 'emergency.activated':
      console.log(`🆘 Emergency activated: ${event.data.emergency_type}`);
      // Activate emergency protocol
      break;
  }

  res.json({ received: true });
});

app.listen(3000, () => console.log('Webhook server running on :3000'));
```

---

## Summary

SwasthyaSetu API enables:
✓ Real-time inventory synchronization across 426+ PHCs
✓ Automated workflow approval chains with SLA tracking
✓ Event-driven emergency response coordination
✓ Federated learning without centralizing patient data
✓ Comprehensive audit trail for compliance
✓ Multi-language & multi-role integration support

**Next Steps for Integration:**
1. Request API credentials from `api@swasthyasetu.gov.in`
2. Implement OAuth 2.0 token exchange
3. Subscribe to critical events via webhooks
4. Build custom dashboards using data endpoints
5. Set up audit logging callbacks for compliance
