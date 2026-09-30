# SwasthyaSetu Backend - Production Deployment Guide

**Version:** 5.0  
**Date:** September 30, 2026  
**Status:** Production-Ready

---

## Quick Deployment Checklist

- [ ] Review system requirements
- [ ] Prepare production environment
- [ ] Set up database (PostgreSQL)
- [ ] Configure environment variables
- [ ] Build Docker image
- [ ] Deploy to container orchestration
- [ ] Set up monitoring & logging
- [ ] Configure SSL/TLS
- [ ] Run health checks
- [ ] Set up automated backups
- [ ] Configure firewall rules
- [ ] Run smoke tests
- [ ] Set up alerts

---

## Prerequisites

### System Requirements

```
CPU: 4+ cores (recommended 8+ for production)
RAM: 8GB minimum (16GB+ recommended)
Disk: 100GB+ (for data and logs)
Network: 100Mbps+ connection
OS: Ubuntu 20.04 LTS, CentOS 8+, or similar
```

### Required Software

```
Docker: 20.10+
Docker Compose: 2.0+
PostgreSQL: 13+
Redis: 6.0+ (optional, for caching)
Nginx: 1.19+
Node.js: 18+ (for local development)
```

---

## Environment Setup

### 1. Create Production Directory

```bash
mkdir -p /opt/swasthyasetu
cd /opt/swasthyasetu
```

### 2. Copy Files

```bash
# Copy all backend files
cp backend_server.js .
cp seed_database.js .
cp package.json .
cp .env.example .env.production
cp Dockerfile .
cp docker-compose.yml .
cp nginx.conf .
```

### 3. Configure Environment

Edit `.env.production`:

```env
# Server
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database (PostgreSQL)
DATABASE_URL=postgresql://swasthyasetu:VERY_SECURE_PASSWORD@postgres:5432/swasthyasetu
DATABASE_TYPE=postgresql
DATABASE_SSL=true

# Authentication
JWT_SECRET=generate-with-openssl-rand-base64-32
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=https://app.swasthyasetu.health,https://dashboard.swasthyasetu.health

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/swasthyasetu/api.log

# Security
HTTPS_ONLY=true
SECURE_COOKIES=true

# Features
ENABLE_FEDERATED_LEARNING=true
ENABLE_ANOMALY_DETECTION=true
ENABLE_SCENARIO_SIMULATION=true
ENABLE_AUDIT_LOGGING=true

# Google Cloud (if using Vertex AI)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcloud-key.json
```

### 4. Generate JWT Secret

```bash
openssl rand -base64 32
# Copy output to JWT_SECRET in .env.production
```

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create user and database
CREATE USER swasthyasetu WITH PASSWORD 'VERY_SECURE_PASSWORD';
CREATE DATABASE swasthyasetu OWNER swasthyasetu;
GRANT ALL PRIVILEGES ON DATABASE swasthyasetu TO swasthyasetu;
\q
```

### 2. Initialize Database Schema

```bash
# Using Docker
docker-compose run backend node seed_database.js

# Or manually
psql postgresql://swasthyasetu:password@localhost/swasthyasetu < schema.sql
```

### 3. Verify Database

```bash
psql postgresql://swasthyasetu:password@localhost/swasthyasetu

# In psql:
\dt          # Show tables
SELECT COUNT(*) FROM phcs;
SELECT COUNT(*) FROM medicines;
\q
```

---

## Docker Deployment

### 1. Build Image

```bash
docker build -t swasthyasetu-api:5.0 .
```

### 2. Tag for Registry

```bash
# Google Container Registry
docker tag swasthyasetu-api:5.0 gcr.io/YOUR_PROJECT_ID/swasthyasetu-api:5.0

# Or Docker Hub
docker tag swasthyasetu-api:5.0 yourusername/swasthyasetu-api:5.0
```

### 3. Push to Registry

```bash
# Google Container Registry
gcloud auth configure-docker
docker push gcr.io/YOUR_PROJECT_ID/swasthyasetu-api:5.0

# Or Docker Hub
docker login
docker push yourusername/swasthyasetu-api:5.0
```

### 4. Deploy with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.yml -p swasthyasetu up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f backend
```

---

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace swasthyasetu
```

### 2. Create ConfigMap and Secrets

```bash
# ConfigMap for environment
kubectl create configmap swasthyasetu-config \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info \
  -n swasthyasetu

# Secret for sensitive data
kubectl create secret generic swasthyasetu-secrets \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=JWT_SECRET=... \
  -n swasthyasetu
```

### 3. Create Deployment

Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: swasthyasetu-api
  namespace: swasthyasetu
spec:
  replicas: 3
  selector:
    matchLabels:
      app: swasthyasetu-api
  template:
    metadata:
      labels:
        app: swasthyasetu-api
    spec:
      containers:
      - name: api
        image: gcr.io/YOUR_PROJECT_ID/swasthyasetu-api:5.0
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: swasthyasetu-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: swasthyasetu-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: swasthyasetu-secrets
              key: JWT_SECRET
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### 4. Create Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: swasthyasetu-api
  namespace: swasthyasetu
spec:
  selector:
    app: swasthyasetu-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

### 5. Deploy

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods -n swasthyasetu
kubectl get svc -n swasthyasetu
```

---

## Cloud-Specific Deployment

### Google Cloud Run

```bash
gcloud run deploy swasthyasetu-api \
  --image gcr.io/YOUR_PROJECT_ID/swasthyasetu-api:5.0 \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars DATABASE_URL=postgresql://... \
  --set-env-vars JWT_SECRET=... \
  --allow-unauthenticated
```

### AWS ECS

```bash
# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster swasthyasetu \
  --service-name api \
  --task-definition swasthyasetu-api:1 \
  --desired-count 3
```

### Azure Container Instances

```bash
az container create \
  --resource-group swasthyasetu \
  --name api \
  --image swasthyasetu-api:5.0 \
  --cpu 2 \
  --memory 2 \
  --environment-variables NODE_ENV=production
```

---

## SSL/TLS Configuration

### 1. Obtain Certificate

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone \
  -d api.swasthyasetu.health \
  -d app.swasthyasetu.health
```

### 2. Copy to Nginx

```bash
sudo cp /etc/letsencrypt/live/api.swasthyasetu.health/fullchain.pem /etc/nginx/certs/certificate.crt
sudo cp /etc/letsencrypt/live/api.swasthyasetu.health/privkey.pem /etc/nginx/certs/private.key

sudo chmod 644 /etc/nginx/certs/certificate.crt
sudo chmod 600 /etc/nginx/certs/private.key
```

### 3. Auto-Renewal

```bash
# Add cron job
sudo crontab -e

# Add line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Monitoring & Logging

### Prometheus Metrics

```bash
# Install Prometheus
docker run -d -p 9090:9090 -v prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# Docker Compose setup
docker-compose -f elk-stack.yml up -d
```

### CloudWatch (AWS)

```bash
# Log to CloudWatch
docker-compose logs | \
  aws logs put-log-events \
    --log-group-name /swasthyasetu/api \
    --log-stream-name production
```

### Stackdriver (Google Cloud)

```bash
# Configure logging
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

---

## Database Backups

### 1. Automated Backups

```bash
# Create backup script
cat > /opt/swasthyasetu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/swasthyasetu"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump postgresql://swasthyasetu:password@postgres/swasthyasetu | \
  gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
EOF

chmod +x /opt/swasthyasetu/backup.sh
```

### 2. Cron Job

```bash
# Daily backup at 2 AM
0 2 * * * /opt/swasthyasetu/backup.sh
```

### 3. Cloud Storage

```bash
# Upload to Google Cloud Storage
gsutil cp /backups/swasthyasetu/*.sql.gz gs://swasthyasetu-backups/
```

---

## Health Checks & Alerts

### Health Endpoint

```bash
# Check API health
curl https://api.swasthyasetu.health/health
# Expected: {"status":"healthy","version":"5.0"}
```

### Monitoring Dashboard

```bash
# Access Prometheus
http://monitoring.swasthyasetu.health:9090

# Access Grafana
http://monitoring.swasthyasetu.health:3000
```

### Alert Setup

```yaml
# Prometheus alert rules
groups:
- name: swasthyasetu
  rules:
  - alert: APIDown
    expr: up{job="swasthyasetu-api"} == 0
    for: 2m
    annotations:
      summary: "SwasthyaSetu API is down"
  
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    annotations:
      summary: "High error rate detected"
```

---

## Performance Tuning

### 1. Database Connection Pooling

```env
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
```

### 2. Redis Caching

```bash
# Enable Redis
docker-compose up -d redis
```

### 3. Nginx Optimization

```nginx
worker_processes auto;
worker_connections 4096;
keepalive_timeout 65;
```

---

## Security Hardening

### 1. Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Network Segmentation

```bash
# Internal network for databases
docker network create swasthyasetu-internal
```

### 3. Secrets Management

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name swasthyasetu/jwt-secret \
  --secret-string "your-secret-key"
```

---

## Troubleshooting

### API Not Starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database connection failed - check DATABASE_URL
# 2. Port already in use - check: lsof -i :5000
# 3. Out of memory - increase Docker memory limit
```

### Database Errors

```bash
# Check database status
docker-compose exec postgres psql -U swasthyasetu -d swasthyasetu -c "SELECT 1"

# Check connection pool
psql postgresql://... -c "SELECT * FROM pg_stat_activity"
```

### High Memory Usage

```bash
# Identify memory leaks
docker stats swasthyasetu_backend

# Check Node.js heap
docker-compose exec backend node --inspect :9229 backend_server.js
```

---

## Maintenance

### Weekly Tasks
- [ ] Check API health
- [ ] Review error logs
- [ ] Verify backups completed

### Monthly Tasks
- [ ] Update dependencies: `npm audit fix`
- [ ] Review performance metrics
- [ ] Test disaster recovery

### Quarterly Tasks
- [ ] Security audit
- [ ] Database optimization
- [ ] Capacity planning

---

## Rollback Procedure

```bash
# Keep last 3 versions
docker images | grep swasthyasetu-api | head -3

# Rollback to previous version
docker-compose down
docker tag swasthyasetu-api:4.9 swasthyasetu-api:latest
docker-compose up -d
```

---

## Support Contacts

- **Technical Issues:** devops@swasthyasetu.health
- **Security:** security@swasthyasetu.health
- **Escalation:** cto@swasthyasetu.health

---

**Production deployment is complete and ready!** 🚀
