/**
 * SwasthyaSetu Backend - Validation & Security Middleware
 * Comprehensive input validation, sanitization, and security checks
 */

const Joi = require('joi');

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const validationSchemas = {
  // Authentication
  auth: {
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required()
    }),

    register: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(100).required(),
      name: Joi.string().min(2).max(100).required(),
      role: Joi.string().valid('phc_staff', 'district_admin', 'state_director', 'federal_coordinator', 'analytics_viewer').required(),
      phc_id: Joi.number().integer().positive().optional(),
      district_id: Joi.number().integer().positive().optional(),
      state_id: Joi.number().integer().positive().optional()
    })
  },

  // PHC Management
  phc: {
    create: Joi.object({
      name: Joi.string().min(3).max(200).required(),
      district_id: Joi.number().integer().positive().required(),
      state_id: Joi.number().integer().positive().required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      beds_total: Joi.number().integer().positive().min(10).max(500).required(),
      doctors: Joi.number().integer().min(1).max(50).required(),
      nurses: Joi.number().integer().min(1).max(100).required(),
      staff_total: Joi.number().integer().min(5).max(200).required()
    }),

    update: Joi.object({
      name: Joi.string().min(3).max(200).optional(),
      beds_occupied: Joi.number().integer().min(0).optional(),
      doctors_available: Joi.number().integer().min(0).optional(),
      nurses_available: Joi.number().integer().min(0).optional(),
      status: Joi.string().valid('operational', 'limited', 'closed').optional()
    })
  },

  // Inventory Management
  inventory: {
    update: Joi.object({
      quantity: Joi.number().integer().min(0).max(10000).required(),
      reorder_level: Joi.number().integer().min(0).max(5000).optional()
    })
  },

  // Workflow Requests
  workflow: {
    create: Joi.object({
      from_phc_id: Joi.number().integer().positive().required(),
      to_phc_id: Joi.number().integer().positive().required(),
      medicine_id: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).max(10000).required(),
      urgency: Joi.string().valid('low', 'normal', 'high', 'critical').optional(),
      notes: Joi.string().max(500).optional()
    }),

    approve: Joi.object({
      approval_notes: Joi.string().max(500).optional(),
      approved_quantity: Joi.number().integer().min(1).optional()
    })
  },

  // Scenarios
  scenario: {
    create: Joi.object({
      scenario_type: Joi.string()
        .valid('demand_surge', 'supply_disruption', 'medicine_shortage', 'regional_emergency')
        .required(),
      parameters: Joi.object().optional(),
      affected_district: Joi.number().integer().positive().optional(),
      severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional()
    })
  },

  // Forecasting
  forecast: {
    query: Joi.object({
      horizon: Joi.number().integer().min(1).max(365).default(14),
      medicine_id: Joi.number().integer().positive().optional(),
      confidence_threshold: Joi.number().min(0).max(1).optional()
    })
  },

  // Query Parameters
  query: {
    list: Joi.object({
      district_id: Joi.number().integer().positive().optional(),
      state_id: Joi.number().integer().positive().optional(),
      status: Joi.string().optional(),
      limit: Joi.number().integer().min(1).max(1000).default(50),
      offset: Joi.number().integer().min(0).default(0)
    })
  }
};

// ============================================================================
// VALIDATION MIDDLEWARE FACTORY
// ============================================================================

function validateRequest(schema) {
  return (req, res, next) => {
    const dataToValidate = {
      ...req.body,
      ...req.query,
      ...req.params
    };

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorDetails
      });
    }

    // Replace request body/query with validated data
    req.validatedData = value;
    req.body = { ...req.body, ...value };
    req.query = { ...req.query, ...value };

    next();
  };
}

// ============================================================================
// SANITIZATION MIDDLEWARE
// ============================================================================

function sanitizeInput(req, res, next) {
  // Remove dangerous characters from string fields
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/['"]/g, '') // Remove quotes
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
}

// ============================================================================
// RATE LIMITING MIDDLEWARE
// ============================================================================

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();

      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const timestamps = this.requests.get(key);
      
      // Remove old timestamps
      const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
      
      if (validTimestamps.length >= this.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(this.windowMs / 1000)
        });
      }

      validTimestamps.push(now);
      this.requests.set(key, validTimestamps);

      next();
    };
  }
}

// ============================================================================
// SQL INJECTION PREVENTION
// ============================================================================

function preventSQLInjection(req, res, next) {
  const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'EXEC', 'UNION', 'DECLARE'];
  
  const checkValue = (val) => {
    if (typeof val === 'string') {
      const upper = val.toUpperCase();
      for (const keyword of sqlKeywords) {
        if (upper.includes(keyword) && (upper.includes('--') || upper.includes(';'))) {
          return true; // Potential SQL injection detected
        }
      }
    }
    return false;
  };

  const checkObject = (obj) => {
    if (!obj) return false;
    for (const key in obj) {
      if (checkValue(obj[key]) || (typeof obj[key] === 'object' && checkObject(obj[key]))) {
        return true;
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query)) {
    return res.status(400).json({
      error: 'Invalid input detected'
    });
  }

  next();
}

// ============================================================================
// BUSINESS LOGIC VALIDATION
// ============================================================================

function validateWorkflowConstraints(phcs, medicine) {
  return (req, res, next) => {
    const { from_phc_id, to_phc_id, quantity } = req.body;

    // Check PHCs exist and are operational
    const fromPhc = phcs.find(p => p.id === from_phc_id);
    const toPhc = phcs.find(p => p.id === to_phc_id);

    if (!fromPhc || !toPhc) {
      return res.status(400).json({ error: 'Invalid PHC IDs' });
    }

    if (fromPhc.status !== 'operational' || toPhc.status !== 'operational') {
      return res.status(400).json({ error: 'One or both PHCs are not operational' });
    }

    // Check transfer quantity is reasonable
    if (quantity <= 0 || quantity > 10000) {
      return res.status(400).json({ error: 'Invalid transfer quantity' });
    }

    // Check from PHC has sufficient inventory
    const inventory = fromPhc.medicines[req.body.medicine_id] || 0;
    if (inventory < quantity) {
      return res.status(400).json({
        error: 'Insufficient inventory',
        available: inventory,
        requested: quantity
      });
    }

    next();
  };
}

// ============================================================================
// ROLE-SPECIFIC VALIDATION
// ============================================================================

function validateRoleActionPermissions(requiredRoles) {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions for this action',
        required_roles: requiredRoles,
        user_role: req.user.role
      });
    }

    // Additional permission checks
    if (req.body.phc_id && req.user.role === 'phc_staff') {
      if (req.body.phc_id !== req.user.phc_id) {
        return res.status(403).json({
          error: 'PHC staff can only access their own PHC'
        });
      }
    }

    if (req.body.district_id && req.user.role === 'district_admin') {
      if (req.body.district_id !== req.user.district_id) {
        return res.status(403).json({
          error: 'District admin can only access their own district'
        });
      }
    }

    next();
  };
}

// ============================================================================
// AUDIT TRAIL MIDDLEWARE
// ============================================================================

function auditTrail(db) {
  return (req, res, next) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to capture response
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log successful action
        if (req.user && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
          const auditQuery = `
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, change_data, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          try {
            db.prepare(auditQuery).run(
              req.user.id,
              req.method,
              req.path.split('/')[3],
              req.params.id,
              JSON.stringify(req.body),
              req.ip
            );
          } catch (e) {
            console.warn('Audit logging error:', e.message);
          }
        }
      }

      return originalJson(data);
    };

    next();
  };
}

// ============================================================================
// EXPORT MIDDLEWARE COLLECTION
// ============================================================================

module.exports = {
  // Validators
  validationSchemas,
  validateRequest,
  
  // Sanitization
  sanitizeInput,
  
  // Security
  RateLimiter,
  preventSQLInjection,
  
  // Business Logic
  validateWorkflowConstraints,
  validateRoleActionPermissions,
  
  // Audit
  auditTrail,

  // Helper to create middleware chain
  createValidationChain: (schema) => {
    return [
      sanitizeInput,
      preventSQLInjection,
      validateRequest(schema)
    ];
  }
};
