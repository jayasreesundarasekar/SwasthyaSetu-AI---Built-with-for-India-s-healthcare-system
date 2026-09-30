# SwasthyaSetu Backend API Documentation

**Version:** 5.0  
**Base URL:** `http://localhost:5000` (dev) | `https://api.swasthyasetu.health` (prod)  
**API Version:** v2  
**Last Updated:** September 30, 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [PHC Management](#phc-management)
3. [Medicine Inventory](#medicine-inventory)
4. [Demand Forecasting](#demand-forecasting)
5. [Workflows](#workflows)
6. [Anomaly Detection](#anomaly-detection)
7. [Scenario Simulation](#scenario-simulation)
8. [Audit & Compliance](#audit--compliance)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Data Models](#data-models)

---

## Authentication

### Register User

Creates a new user account in the system.

**Endpoint:** `POST /api/v2/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Dr. Priya Sharma",
  "role": "phc_staff",
  "phc_id": 1,
  "district_id": null,
  "state_id": null
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Dr. Priya Sharma",
  "role": "phc_staff",
  "message": "User registered successfully"
}
```

**Roles:**
- `phc_staff` - PHC-level staff
- `district_admin` - District-level administrator
- `state_director` - State-level director
- `federal_coordinator` - Federal coordinator
- `analytics_viewer` - Read-only analytics access

---

### Login

Authenticates user and returns JWT token.

**Endpoint:** `POST /api/v2/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Dr. Priya Sharma",
    "role": "phc_staff",
    "phc_id": 1,
    "district_id": 1,
    "state_id": 1
  }
}
```

**Token Expiry:** 24 hours

**Usage:** Include token in all subsequent requests:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## PHC Management

### List All PHCs

Retrieves all Primary Health Centers (filterable by district/state).

**Endpoint:** `GET /api/v2/phcs`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `district_id` | number | Filter by district |
| `state_id` | number | Filter by state |
| `status` | string | Filter by status (operational/limited/closed) |
| `limit` | number | Results per page (default: 50, max: 1000) |
| `offset` | number | Pagination offset (default: 0) |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v2/phcs?district_id=1&limit=25" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "PHC Panchavati",
      "district_id": 1,
      "state_id": 1,
      "latitude": 19.9374,
      "longitude": 73.7870,
      "beds_total": 40,
      "beds_occupied": 28,
      "doctors_available": 1,
      "nurses_available": 2,
      "staff_total": 12,
      "status": "operational",
      "created_at": "2026-09-01T00:00:00Z",
      "updated_at": "2026-09-30T14:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Get PHC Details

Retrieves detailed information for a specific PHC including inventory and metrics.

**Endpoint:** `GET /api/v2/phcs/:id`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v2/phcs/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "PHC Panchavati",
  "district_id": 1,
  "latitude": 19.9374,
  "longitude": 73.7870,
  "beds_total": 40,
  "beds_occupied": 28,
  "bed_occupancy_percent": "70.0",
  "doctors_available": 1,
  "nurses_available": 2,
  "staff_total": 12,
  "staff_utilization": "75.0",
  "inventory": [
    {
      "id": 1,
      "name": "Paracetamol 500mg",
      "category": "Analgesics",
      "unit": "tablets",
      "quantity": 450,
      "reorder_level": 150,
      "expiry_date": "2027-01-15"
    }
  ],
  "status": "operational"
}
```

---

### Create PHC (Admin Only)

**Endpoint:** `POST /api/v2/phcs`

**Required Role:** `state_director`, `federal_coordinator`

**Request Body:**
```json
{
  "name": "PHC New Location",
  "district_id": 1,
  "state_id": 1,
  "latitude": 19.5,
  "longitude": 73.5,
  "beds_total": 30,
  "doctors": 1,
  "nurses": 2,
  "staff_total": 8
}
```

**Response:** `201 Created`
```json
{
  "id": 17,
  "message": "PHC created successfully"
}
```

---

## Medicine Inventory

### Get Medicine Inventory

Retrieves all medicines at a PHC with stock status.

**Endpoint:** `GET /api/v2/phcs/:id/medicines`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v2/phcs/1/medicines" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Paracetamol 500mg",
      "category": "Analgesics",
      "unit": "tablets",
      "quantity": 450,
      "reorder_level": 150,
      "expiry_date": "2027-01-15",
      "status": "ok"
    },
    {
      "id": 5,
      "name": "Amoxicillin 500mg",
      "category": "Antibiotics",
      "unit": "tablets",
      "quantity": 80,
      "reorder_level": 100,
      "expiry_date": "2026-11-20",
      "status": "critical"
    }
  ],
  "stats": {
    "total_items": 35,
    "critical": 2,
    "warning": 5,
    "ok": 28
  }
}
```

**Status Meanings:**
- `ok` - Quantity ≥ 1.5 × Reorder Level
- `warning` - Quantity between Reorder Level and 1.5 × Reorder Level
- `critical` - Quantity < Reorder Level

---

### Update Medicine Quantity

Updates inventory quantity for a medicine at a PHC.

**Endpoint:** `PUT /api/v2/phcs/:id/medicines/:medicine_id`

**Required Role:** `phc_staff`, `district_admin`

**Request Body:**
```json
{
  "quantity": 500
}
```

**Response:** `200 OK`
```json
{
  "message": "Inventory updated"
}
```

---

## Demand Forecasting

### Get Demand Forecast

Predicts medicine demand for next N days using ARIMA model.

**Endpoint:** `GET /api/v2/phcs/:id/forecast`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `horizon` | number | 14 | Days to forecast (1-365) |
| `medicine_id` | number | - | Specific medicine (optional) |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v2/phcs/1/forecast?horizon=14" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "phc_id": 1,
  "horizon": 14,
  "footfall_prediction": [45, 52, 48, 55, 50, 48, 60, 58, 52, 49, 51, 54, 56, 50],
  "medicine_forecasts": [
    {
      "medicine_id": 1,
      "medicine_name": "Paracetamol 500mg",
      "category": "Analgesics",
      "daily_predictions": [120, 135, 128, 145, 140, 132, 155, 150, 135, 128, 130, 140, 145, 135],
      "average_daily": 138,
      "total_forecast": 1843,
      "confidence_score": 0.92,
      "model_version": "arima-v1"
    }
  ],
  "generated_at": "2026-09-30T14:30:00Z"
}
```

---

## Workflows

### List Workflow Requests

**Endpoint:** `GET /api/v2/workflows`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | pending/approved/rejected/in_transit/delivered |
| `phc_id` | number | Filter by PHC (to or from) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "from_phc_id": 1,
      "to_phc_id": 2,
      "medicine_id": 5,
      "quantity": 200,
      "status": "pending",
      "requested_by": 3,
      "requested_at": "2026-09-30T10:00:00Z",
      "approved_by": null,
      "approved_at": null
    }
  ]
}
```

---

### Create Workflow Request

Creates a request to transfer medicine between PHCs.

**Endpoint:** `POST /api/v2/workflows`

**Required Role:** `phc_staff`, `district_admin`

**Request Body:**
```json
{
  "from_phc_id": 1,
  "to_phc_id": 2,
  "medicine_id": 5,
  "quantity": 200
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "message": "Workflow request created"
}
```

---

### Approve Workflow

**Endpoint:** `PUT /api/v2/workflows/:id/approve`

**Required Role:** `district_admin`, `state_director`

**Request Body:**
```json
{
  "approval_notes": "Approved for emergency supply"
}
```

**Response:** `200 OK`
```json
{
  "message": "Workflow approved"
}
```

---

## Anomaly Detection

### Detect Anomalies

Identifies unusual patterns in PHC data using statistical analysis.

**Endpoint:** `GET /api/v2/phcs/:id/anomalies`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v2/phcs/1/anomalies" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** `200 OK`
```json
{
  "phc_id": 1,
  "anomalies_detected": 2,
  "alert_level": "medium",
  "anomalies": [
    {
      "timestamp": 23,
      "value": 120,
      "zScore": 3.2,
      "isAnomaly": true,
      "confidence": 1.0
    }
  ]
}
```

**Alert Levels:**
- `low` - 0-1 anomalies detected
- `medium` - 2-3 anomalies detected
- `high` - 4+ anomalies detected

---

## Scenario Simulation

### Run Scenario

Simulates different crisis scenarios and generates recommendations.

**Endpoint:** `POST /api/v2/scenarios`

**Required Role:** `district_admin`, `state_director`, `federal_coordinator`

**Request Body:**
```json
{
  "scenario_type": "demand_surge",
  "parameters": {
    "surge_percent": 50
  }
}
```

**Scenario Types:**
- `demand_surge` - Sudden increase in patient volume
- `supply_disruption` - Supply chain failure
- `medicine_shortage` - Specific medicine unavailable
- `regional_emergency` - Major regional crisis

**Response:** `200 OK`
```json
{
  "scenario": "demand_surge",
  "timestamp": "2026-09-30T14:30:00Z",
  "result": {
    "scenario": "demand_surge",
    "surge_multiplier": 1.5,
    "affected_phcs": 8,
    "critical_count": 3,
    "warning_count": 5,
    "impact": {
      "stockout_risk_before": 78,
      "stockout_risk_after": 12,
      "facilities_atrisk_before": 14,
      "facilities_atrisk_after": 3,
      "coverage_days_before": 6,
      "coverage_days_after": 18
    }
  },
  "recommendation": {
    "confidence": 0.92,
    "data_quality": 0.98,
    "requires_approval": true
  }
}
```

---

## Audit & Compliance

### Get Audit Logs

**Endpoint:** `GET /api/v2/audit`

**Required Role:** `state_director`, `federal_coordinator`

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| `limit` | number | 100 |
| `offset` | number | 0 |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "name": "Dr. Priya Sharma",
      "action": "login",
      "resource_type": "user",
      "resource_id": 1,
      "timestamp": "2026-09-30T14:30:00Z"
    }
  ]
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200 OK` | Successful request |
| `201 Created` | Resource created |
| `400 Bad Request` | Invalid input or validation error |
| `401 Unauthorized` | No token provided or invalid token |
| `403 Forbidden` | Insufficient permissions for resource |
| `404 Not Found` | Resource not found |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Server Error` | Internal server error |

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 requests | 1 minute |
| `/auth/register` | 10 requests | 1 hour |
| Most endpoints | 10 requests | 1 second |
| `/scenarios` | 5 requests | 1 second |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1632999000
```

When rate limited:
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Data Models

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Dr. Priya Sharma",
  "role": "phc_staff",
  "phc_id": 1,
  "district_id": 1,
  "state_id": 1,
  "created_at": "2026-09-01T00:00:00Z",
  "updated_at": "2026-09-30T14:30:00Z"
}
```

### PHC

```json
{
  "id": 1,
  "name": "PHC Panchavati",
  "district_id": 1,
  "state_id": 1,
  "latitude": 19.9374,
  "longitude": 73.7870,
  "beds_total": 40,
  "beds_occupied": 28,
  "doctors_available": 1,
  "nurses_available": 2,
  "staff_total": 12,
  "status": "operational",
  "created_at": "2026-09-01T00:00:00Z",
  "updated_at": "2026-09-30T14:30:00Z"
}
```

### Medicine

```json
{
  "id": 1,
  "name": "Paracetamol 500mg",
  "category": "Analgesics",
  "unit": "tablets",
  "created_at": "2026-09-01T00:00:00Z"
}
```

### Inventory

```json
{
  "id": 1,
  "phc_id": 1,
  "medicine_id": 1,
  "quantity": 450,
  "reorder_level": 150,
  "expiry_date": "2027-01-15",
  "last_updated": "2026-09-30T14:30:00Z"
}
```

---

## Best Practices

1. **Always include Authorization header** with valid JWT token
2. **Use appropriate query parameters** for filtering and pagination
3. **Handle errors gracefully** - check status code and error message
4. **Cache responses** where appropriate (GET requests)
5. **Use pagination** when retrieving large datasets
6. **Implement retry logic** for transient failures
7. **Monitor rate limits** and back off when necessary
8. **Validate input** before sending to API
9. **Use HTTPS** in production only
10. **Log all API calls** for debugging and audit trails

---

## Support

For API issues, check:
1. Status code and error message
2. Server logs: `docker-compose logs -f backend`
3. Database: `psql postgresql://...`
4. Health check: `GET /health`

---

**API is production-ready and fully documented!** 🚀
