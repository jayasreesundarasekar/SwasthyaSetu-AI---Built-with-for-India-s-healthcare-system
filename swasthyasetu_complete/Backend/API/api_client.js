/**
 * SwasthyaSetu Frontend API Client
 * Use this in your React components to connect to the real backend
 * No more mock data - all calls go to actual API endpoints
 */

class SwasthyaSetuAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error.message);
      throw error;
    }
  }

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  /**
   * Register a new user
   */
  async register(email, password, name, role, phc_id = null) {
    const response = await this.request('POST', '/api/v2/auth/register', {
      email,
      password,
      name,
      role,
      phc_id
    });

    return response;
  }

  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await this.request('POST', '/api/v2/auth/login', {
      email,
      password
    });

    // Store token and user info
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    this.token = response.token;
    this.user = response.user;

    return response;
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.token = null;
    this.user = {};
  }

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!this.token;
  }

  // ============================================================================
  // PHC ENDPOINTS
  // ============================================================================

  /**
   * Get all PHCs with optional filtering
   */
  async getPHCs(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = `/api/v2/phcs${query ? `?${query}` : ''}`;
    return await this.request('GET', endpoint);
  }

  /**
   * Get specific PHC details
   */
  async getPHC(phcId) {
    return await this.request('GET', `/api/v2/phcs/${phcId}`);
  }

  /**
   * Create new PHC (admin only)
   */
  async createPHC(phcData) {
    return await this.request('POST', '/api/v2/phcs', phcData);
  }

  /**
   * Get current network state (all PHCs at a glance)
   */
  async getNetworkState() {
    const phcs = await this.getPHCs();
    
    let critical = 0, warning = 0, stable = 0;

    phcs.data.forEach(phc => {
      const occupancy = (phc.beds_occupied / phc.beds_total) * 100;
      if (occupancy > 95) critical++;
      else if (occupancy > 80) warning++;
      else stable++;
    });

    return {
      total_phcs: phcs.data.length,
      critical,
      warning,
      stable,
      phcs: phcs.data
    };
  }

  // ============================================================================
  // MEDICINE INVENTORY ENDPOINTS
  // ============================================================================

  /**
   * Get medicine inventory for a PHC
   */
  async getInventory(phcId) {
    return await this.request('GET', `/api/v2/phcs/${phcId}/medicines`);
  }

  /**
   * Update medicine quantity for a PHC
   */
  async updateInventory(phcId, medicineId, quantity) {
    return await this.request('PUT', `/api/v2/phcs/${phcId}/medicines/${medicineId}`, {
      quantity
    });
  }

  /**
   * Check medicine expiry status across PHCs
   */
  async getExpiryAlerts() {
    const phcs = await this.getPHCs();
    const alerts = [];

    for (const phc of phcs.data) {
      const inventory = await this.getInventory(phc.id);
      
      inventory.data.forEach(medicine => {
        if (medicine.expiry_date) {
          const expiryDate = new Date(medicine.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

          if (daysUntilExpiry < 30 && daysUntilExpiry > 0) {
            alerts.push({
              medicine: medicine.name,
              phc: phc.name,
              days_until_expiry: daysUntilExpiry,
              quantity: medicine.quantity
            });
          }
        }
      });
    }

    return alerts;
  }

  // ============================================================================
  // DEMAND FORECASTING ENDPOINTS
  // ============================================================================

  /**
   * Get demand forecast for a PHC
   */
  async getForecast(phcId, horizon = 14, medicineId = null) {
    const query = new URLSearchParams({
      horizon,
      ...(medicineId && { medicine_id: medicineId })
    }).toString();

    return await this.request('GET', `/api/v2/phcs/${phcId}/forecast?${query}`);
  }

  /**
   * Get forecasts for all PHCs
   */
  async getAllForecasts(horizon = 14) {
    const phcs = await this.getPHCs();
    const forecasts = {};

    for (const phc of phcs.data) {
      try {
        const forecast = await this.getForecast(phc.id, horizon);
        forecasts[phc.id] = forecast;
      } catch (e) {
        console.warn(`Could not get forecast for PHC ${phc.id}`);
      }
    }

    return forecasts;
  }

  // ============================================================================
  // WORKFLOW ENDPOINTS
  // ============================================================================

  /**
   * Get all workflow requests
   */
  async getWorkflows(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = `/api/v2/workflows${query ? `?${query}` : ''}`;
    return await this.request('GET', endpoint);
  }

  /**
   * Create workflow request (transfer medicine)
   */
  async createWorkflow(fromPhcId, toPhcId, medicineId, quantity) {
    return await this.request('POST', '/api/v2/workflows', {
      from_phc_id: fromPhcId,
      to_phc_id: toPhcId,
      medicine_id: medicineId,
      quantity
    });
  }

  /**
   * Approve workflow request
   */
  async approveWorkflow(workflowId, approvalNotes = '') {
    return await this.request('PUT', `/api/v2/workflows/${workflowId}/approve`, {
      approval_notes: approvalNotes
    });
  }

  /**
   * Get pending approvals for current user
   */
  async getPendingApprovals() {
    const workflows = await this.getWorkflows({ status: 'pending' });
    return workflows.data;
  }

  // ============================================================================
  // ANOMALY DETECTION ENDPOINTS
  // ============================================================================

  /**
   * Detect anomalies in PHC data
   */
  async detectAnomalies(phcId) {
    return await this.request('GET', `/api/v2/phcs/${phcId}/anomalies`);
  }

  /**
   * Get all anomalies across network
   */
  async getAllAnomalies() {
    const phcs = await this.getPHCs();
    const anomalies = [];

    for (const phc of phcs.data) {
      try {
        const result = await this.detectAnomalies(phc.id);
        if (result.anomalies.length > 0) {
          anomalies.push({
            phc: phc.name,
            alert_level: result.alert_level,
            anomalies_detected: result.anomalies_detected,
            anomalies: result.anomalies
          });
        }
      } catch (e) {
        console.warn(`Could not detect anomalies for PHC ${phc.id}`);
      }
    }

    return anomalies;
  }

  // ============================================================================
  // SCENARIO SIMULATION ENDPOINTS
  // ============================================================================

  /**
   * Run scenario simulation
   */
  async runScenario(scenarioType, parameters = {}) {
    return await this.request('POST', '/api/v2/scenarios', {
      scenario_type: scenarioType,
      parameters
    });
  }

  /**
   * Run demand surge scenario
   */
  async simulateDemandSurge(surgePercent = 50) {
    return await this.runScenario('demand_surge', { surge_percent: surgePercent });
  }

  /**
   * Run supply disruption scenario
   */
  async simulateSupplyDisruption(disruptedRoutes = 1) {
    return await this.runScenario('supply_disruption', { disrupted_routes: disruptedRoutes });
  }

  /**
   * Run medicine shortage scenario
   */
  async simulateMedicineShortage(medicineId = null) {
    return await this.runScenario('medicine_shortage', { medicine_id: medicineId });
  }

  /**
   * Run regional emergency scenario
   */
  async simulateRegionalEmergency(affectedDistrict = null) {
    return await this.runScenario('regional_emergency', { affected_district: affectedDistrict });
  }

  // ============================================================================
  // AUDIT & COMPLIANCE ENDPOINTS
  // ============================================================================

  /**
   * Get audit logs
   */
  async getAuditLogs(limit = 100, offset = 0) {
    return await this.request('GET', `/api/v2/audit?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get recent actions by current user
   */
  async getMyAuditLog() {
    return await this.getAuditLogs(50);
  }

  // ============================================================================
  // DASHBOARD DATA ENDPOINTS
  // ============================================================================

  /**
   * Get data for Authority Dashboard
   */
  async getDashboardData() {
    const networkState = await this.getNetworkState();
    const anomalies = await this.getAllAnomalies();
    const workflowsPending = await this.getPendingApprovals();

    return {
      network_state: networkState,
      anomalies,
      pending_approvals: workflowsPending.length,
      workflow_data: workflowsPending
    };
  }

  /**
   * Get data for Mission Control (live demo)
   */
  async getMissionControlData() {
    const networkState = await this.getNetworkState();
    const forecasts = await this.getAllForecasts(3); // 3-day forecast
    const anomalies = await this.getAllAnomalies();

    return {
      network_state: networkState,
      forecasts,
      anomalies,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get PHC staff dashboard
   */
  async getStaffDashboard(phcId) {
    const phc = await this.getPHC(phcId);
    const inventory = await this.getInventory(phcId);
    const forecast = await this.getForecast(phcId);
    const workflows = await this.getWorkflows({ phc_id: phcId });

    return {
      phc,
      inventory,
      forecast,
      workflows: workflows.data
    };
  }

  // ============================================================================
  // API INFO
  // ============================================================================

  /**
   * Get API information
   */
  async getAPIInfo() {
    return await this.request('GET', '/api/v2/info');
  }

  /**
   * Check server health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (e) {
      return { status: 'unhealthy', error: e.message };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create and export single instance
const api = new SwasthyaSetuAPI(
  process.env.REACT_APP_API_URL || 'http://localhost:5000'
);

// ============================================================================
// REACT HOOKS FOR EASY INTEGRATION
// ============================================================================

/**
 * Custom React hook for API calls
 * Usage in components:
 *   const { data, loading, error } = useAPI(() => api.getPHCs());
 */
if (typeof window !== 'undefined' && window.React) {
  const React = window.React;

  window.useAPI = function(apiCall, dependencies = []) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await apiCall();
          setData(result);
          setError(null);
        } catch (err) {
          setError(err.message);
          setData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, dependencies);

    return { data, loading, error };
  };
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SwasthyaSetuAPI, api };
}

// For browser global access
window.SwasthyaSetuAPI = SwasthyaSetuAPI;
window.api = api;
