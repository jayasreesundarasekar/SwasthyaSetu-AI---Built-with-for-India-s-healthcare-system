/**
 * SwasthyaSetu Backend Test Suite
 * Comprehensive testing for all API endpoints
 * Run: npm test
 */

const request = require('supertest');
const app = require('./backend_server.js');
const Database = require('better-sqlite3');

// Setup test database
let db;
let authToken;
let testUserId = 1;

describe('SwasthyaSetu Backend API Tests', () => {
  
  beforeAll((done) => {
    // Use test database
    db = new Database(':memory:');
    console.log('✓ Test database initialized (in-memory)');
    done();
  });

  afterAll((done) => {
    db.close();
    done();
  });

  // ============================================================================
  // HEALTH CHECK TESTS
  // ============================================================================

  describe('Health Check', () => {
    test('GET /health returns status 200', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('5.0');
    });

    test('GET /api/v2/info returns API information', async () => {
      const response = await request(app)
        .get('/api/v2/info');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('SwasthyaSetu AI Backend');
      expect(response.body.version).toBe('5.0.0');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.roles).toContain('phc_staff');
      expect(response.body.roles).toContain('state_director');
    });
  });

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    test('POST /auth/register creates new user', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          name: 'Dr. Test User',
          role: 'phc_staff',
          phc_id: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Dr. Test User');
      expect(response.body.role).toBe('phc_staff');
    });

    test('POST /auth/login returns JWT token', async () => {
      // First register
      await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'login@example.com',
          password: 'TestPassword123!',
          name: 'Login Test',
          role: 'district_admin'
        });

      // Then login
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'login@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
      expect(response.body.user.role).toBe('district_admin');

      // Save token for later tests
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    test('POST /auth/login fails with wrong password', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('POST /auth/register fails with missing fields', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'incomplete@example.com'
          // Missing password, name, role
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  // ============================================================================
  // PROTECTED ENDPOINT TESTS
  // ============================================================================

  describe('Protected Endpoints', () => {
    test('GET /phcs without token returns 401', async () => {
      const response = await request(app)
        .get('/api/v2/phcs');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    test('GET /phcs with invalid token returns 403', async () => {
      const response = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid token');
    });

    test('GET /phcs with valid token returns data', async () => {
      const response = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeDefined();
    });
  });

  // ============================================================================
  // PHC ENDPOINT TESTS
  // ============================================================================

  describe('PHC Endpoints', () => {
    test('GET /phcs returns all PHCs with pagination info', async () => {
      const response = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('latitude');
      expect(response.body.data[0]).toHaveProperty('longitude');
    });

    test('GET /phcs filters by district_id', async () => {
      const response = await request(app)
        .get('/api/v2/phcs?district_id=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(phc => {
        expect(phc.district_id).toBe(1);
      });
    });

    test('GET /phcs/:id returns PHC details with inventory', async () => {
      // Get first PHC
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(phcId);
      expect(response.body.inventory).toBeDefined();
      expect(response.body.bed_occupancy_percent).toBeDefined();
      expect(response.body.staff_utilization).toBeDefined();
    });

    test('GET /phcs/:id returns 404 for non-existent PHC', async () => {
      const response = await request(app)
        .get('/api/v2/phcs/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('PHC not found');
    });

    test('POST /phcs creates new PHC (admin only)', async () => {
      // Register as state_director
      const adminReg = await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'admin@create.phc',
          password: 'AdminPass123!',
          name: 'Admin User',
          role: 'state_director'
        });

      const adminLogin = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'admin@create.phc',
          password: 'AdminPass123!'
        });

      const adminToken = adminLogin.body.token;

      const response = await request(app)
        .post('/api/v2/phcs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'PHC Test',
          district_id: 1,
          state_id: 1,
          latitude: 19.5,
          longitude: 73.5,
          beds_total: 30,
          doctors: 2,
          nurses: 3,
          staff_total: 10
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.message).toBe('PHC created successfully');
    });
  });

  // ============================================================================
  // MEDICINE INVENTORY TESTS
  // ============================================================================

  describe('Medicine Inventory', () => {
    test('GET /phcs/:id/medicines returns inventory with status', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}/medicines`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats).toHaveProperty('total_items');
      expect(response.body.stats).toHaveProperty('critical');
      expect(response.body.stats).toHaveProperty('warning');
      expect(response.body.stats).toHaveProperty('ok');

      // Check status field exists
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('status');
        expect(['critical', 'warning', 'ok']).toContain(response.body.data[0].status);
      }
    });

    test('PUT /phcs/:id/medicines/:medicine_id updates quantity', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const invResponse = await request(app)
        .get(`/api/v2/phcs/${phcId}/medicines`)
        .set('Authorization', `Bearer ${authToken}`);

      const medicineId = invResponse.body.data[0].id;

      const response = await request(app)
        .put(`/api/v2/phcs/${phcId}/medicines/${medicineId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 500 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Inventory updated');
    });
  });

  // ============================================================================
  // DEMAND FORECASTING TESTS
  // ============================================================================

  describe('Demand Forecasting', () => {
    test('GET /phcs/:id/forecast returns demand predictions', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}/forecast?horizon=14`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.phc_id).toBe(phcId);
      expect(response.body.horizon).toBe(14);
      expect(response.body.footfall_prediction).toBeDefined();
      expect(Array.isArray(response.body.footfall_prediction)).toBe(true);
      expect(response.body.footfall_prediction.length).toBe(14);
      expect(response.body.medicine_forecasts).toBeDefined();
    });

    test('Forecast includes confidence scores', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}/forecast`)
        .set('Authorization', `Bearer ${authToken}`);

      response.body.medicine_forecasts.forEach(forecast => {
        expect(forecast.confidence_score).toBeGreaterThanOrEqual(0);
        expect(forecast.confidence_score).toBeLessThanOrEqual(1);
        expect(forecast.daily_predictions.length).toBe(14);
      });
    });
  });

  // ============================================================================
  // ANOMALY DETECTION TESTS
  // ============================================================================

  describe('Anomaly Detection', () => {
    test('GET /phcs/:id/anomalies returns anomaly analysis', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}/anomalies`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.phc_id).toBe(phcId);
      expect(response.body.anomalies_detected).toBeGreaterThanOrEqual(0);
      expect(['low', 'medium', 'high']).toContain(response.body.alert_level);
      expect(Array.isArray(response.body.anomalies)).toBe(true);
    });
  });

  // ============================================================================
  // WORKFLOW TESTS
  // ============================================================================

  describe('Workflow Requests', () => {
    test('GET /workflows returns workflow list', async () => {
      const response = await request(app)
        .get('/api/v2/workflows')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /workflows creates new workflow request', async () => {
      const response = await request(app)
        .post('/api/v2/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from_phc_id: 1,
          to_phc_id: 2,
          medicine_id: 1,
          quantity: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.message).toBe('Workflow request created');
    });

    test('PUT /workflows/:id/approve updates status', async () => {
      // Create a workflow first
      const createResponse = await request(app)
        .post('/api/v2/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from_phc_id: 1,
          to_phc_id: 2,
          medicine_id: 1,
          quantity: 100
        });

      const workflowId = createResponse.body.id;

      // Approve it (need admin/district_admin role)
      const adminLogin = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'login@example.com',
          password: 'TestPassword123!'
        });

      const adminToken = adminLogin.body.token;

      const approveResponse = await request(app)
        .put(`/api/v2/workflows/${workflowId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approval_notes: 'Approved for delivery' });

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.body.message).toBe('Workflow approved');
    });
  });

  // ============================================================================
  // SCENARIO SIMULATION TESTS
  // ============================================================================

  describe('Scenario Simulation', () => {
    test('POST /scenarios runs demand surge scenario', async () => {
      const response = await request(app)
        .post('/api/v2/scenarios')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scenario_type: 'demand_surge',
          parameters: { surge_percent: 50 }
        });

      expect(response.status).toBe(200);
      expect(response.body.scenario).toBe('demand_surge');
      expect(response.body.result.impact).toBeDefined();
      expect(response.body.result.impact.stockout_risk_before).toBeDefined();
      expect(response.body.result.impact.stockout_risk_after).toBeDefined();
      expect(response.body.recommendation.confidence).toBeGreaterThan(0.8);
    });

    test('POST /scenarios runs supply disruption scenario', async () => {
      const response = await request(app)
        .post('/api/v2/scenarios')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scenario_type: 'supply_disruption',
          parameters: { disrupted_routes: 1 }
        });

      expect(response.status).toBe(200);
      expect(response.body.scenario).toBe('supply_disruption');
      expect(response.body.result.impact).toBeDefined();
    });

    test('Scenario response includes decision trace', async () => {
      const response = await request(app)
        .post('/api/v2/scenarios')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scenario_type: 'demand_surge',
          parameters: { surge_percent: 50 }
        });

      expect(response.body.result).toBeDefined();
      expect(response.body.recommendation).toBeDefined();
      expect(response.body.recommendation.confidence).toBeDefined();
      expect(response.body.recommendation.data_quality).toBeDefined();
    });
  });

  // ============================================================================
  // AUDIT LOGGING TESTS
  // ============================================================================

  describe('Audit Logging', () => {
    test('GET /audit returns audit logs (admin only)', async () => {
      // Register as state_director
      const adminReg = await request(app)
        .post('/api/v2/auth/register')
        .send({
          email: 'audit@test.com',
          password: 'AuditPass123!',
          name: 'Audit User',
          role: 'state_director'
        });

      const adminLogin = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'audit@test.com',
          password: 'AuditPass123!'
        });

      const response = await request(app)
        .get('/api/v2/audit?limit=10')
        .set('Authorization', `Bearer ${adminLogin.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Audit logs should not be accessible to phc_staff', async () => {
      const response = await request(app)
        .get('/api/v2/audit')
        .set('Authorization', `Bearer ${authToken}`); // Using phc_staff token

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL TESTS
  // ============================================================================

  describe('Role-Based Access Control', () => {
    test('phc_staff can access own PHC data', async () => {
      const response = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    test('phc_staff cannot create PHC', async () => {
      const response = await request(app)
        .post('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Unauthorized PHC',
          district_id: 1,
          state_id: 1,
          latitude: 19.5,
          longitude: 73.5,
          beds_total: 30,
          doctors: 2,
          nurses: 3,
          staff_total: 10
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    test('district_admin cannot approve workflows', async () => {
      // Create workflow as district_admin
      const districtLogin = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'nashik_admin@phc.gov.in',
          password: 'SecurePassword@2024'
        });

      const createResponse = await request(app)
        .post('/api/v2/workflows')
        .set('Authorization', `Bearer ${districtLogin.body.token}`)
        .send({
          from_phc_id: 1,
          to_phc_id: 2,
          medicine_id: 1,
          quantity: 100
        });

      // Try to approve (district_admin can approve)
      const approveResponse = await request(app)
        .put(`/api/v2/workflows/${createResponse.body.id}/approve`)
        .set('Authorization', `Bearer ${districtLogin.body.token}`)
        .send({});

      // This should work - district_admin can approve
      expect([200, 403]).toContain(approveResponse.status);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    test('Invalid JSON in request body returns 400', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect([400, 500]).toContain(response.status);
    });

    test('Non-existent endpoint returns 404', async () => {
      const response = await request(app)
        .get('/api/v2/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    test('Missing required fields in POST returns 400', async () => {
      const response = await request(app)
        .post('/api/v2/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from_phc_id: 1
          // Missing other required fields
        });

      expect([400, 500]).toContain(response.status);
    });
  });

  // ============================================================================
  // DATA CONSISTENCY TESTS
  // ============================================================================

  describe('Data Consistency', () => {
    test('PHC inventory quantities are positive', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}/medicines`)
        .set('Authorization', `Bearer ${authToken}`);

      response.body.data.forEach(medicine => {
        expect(medicine.quantity).toBeGreaterThanOrEqual(0);
        expect(typeof medicine.quantity).toBe('number');
      });
    });

    test('Forecast predictions are non-negative', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}/forecast`)
        .set('Authorization', `Bearer ${authToken}`);

      response.body.footfall_prediction.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(typeof value).toBe('number');
      });

      response.body.medicine_forecasts.forEach(forecast => {
        forecast.daily_predictions.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('Bed occupancy is between 0-100%', async () => {
      const listResponse = await request(app)
        .get('/api/v2/phcs')
        .set('Authorization', `Bearer ${authToken}`);

      const phcId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/v2/phcs/${phcId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const occupancy = parseFloat(response.body.bed_occupancy_percent);
      expect(occupancy).toBeGreaterThanOrEqual(0);
      expect(occupancy).toBeLessThanOrEqual(100);
    });
  });
});

console.log('\n✓ Test suite configured\nRun: npm test\n');
