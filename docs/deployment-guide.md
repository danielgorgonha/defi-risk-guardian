# Enterprise Deployment Guide

## Production-Ready Infrastructure

This guide covers enterprise-grade deployment of Risk Guardian for institutional environments, ensuring high availability, security, and regulatory compliance.

## Prerequisites

### Infrastructure Requirements
- **CPU**: 16+ cores (production), 8+ cores (staging)
- **Memory**: 64GB+ RAM (production), 32GB+ RAM (staging)  
- **Storage**: 1TB+ NVMe SSD with RAID 10
- **Network**: 10Gbps+ with redundant connections
- **OS**: Ubuntu 22.04 LTS or RHEL 8+

### Security Prerequisites
- **SSL Certificates**: Valid certificates for all domains
- **HSM Integration**: Hardware security modules for key management
- **VPN Access**: Secure administrative access
- **Firewall Rules**: Defined security group configurations

## Architecture Overview

### High Availability Setup
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Load Balancer │    │   Load Balancer │
│   (Primary)     │    │   (Secondary)   │    │   (Failover)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
┌─────────────────────────────────────────────────────────────────┐
│                    Application Tier                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Frontend    │ │  API Server  │ │  AI Engine   │            │
│  │  (Next.js)   │ │  (FastAPI)   │ │  (Python ML) │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
┌─────────────────────────────────────────────────────────────────┐
│                     Data Tier                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ PostgreSQL   │ │    Redis     │ │  Time Series │            │
│  │ (Primary)    │ │   Cluster    │ │    DB        │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Docker Production Setup

### 1. Create Production Environment
```bash
# Create production directory structure
mkdir -p /opt/risk-guardian/{config,data,logs,certs}
cd /opt/risk-guardian

# Set proper permissions
chown -R risk-guardian:risk-guardian /opt/risk-guardian
chmod 750 /opt/risk-guardian
```

### 2. Environment Configuration
```bash
# /opt/risk-guardian/config/.env.production
NODE_ENV=production
API_ENV=production

# Database Configuration
POSTGRES_HOST=postgres-primary.internal
POSTGRES_PORT=5432
POSTGRES_DB=risk_guardian_prod
POSTGRES_USER=risk_guardian
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Redis Configuration
REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# API Security
JWT_SECRET=${JWT_SECRET}
API_RATE_LIMIT=10000
CORS_ORIGINS=https://app.riskguardian.com,https://api.riskguardian.com

# External Services
STELLAR_NETWORK=public
REFLECTOR_API_KEY=${REFLECTOR_API_KEY}
REFLECTOR_RATE_LIMIT=1000

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
LOG_LEVEL=info
METRICS_ENABLED=true
```

### 3. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/ssl/certs
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  frontend:
    image: risk-guardian/frontend:latest
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.riskguardian.com
    volumes:
      - ./logs/frontend:/app/logs
    restart: unless-stopped

  backend:
    image: risk-guardian/backend:latest
    environment:
      - API_ENV=production
    env_file:
      - ./config/.env.production
    volumes:
      - ./logs/backend:/app/logs
      - ./data/uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  ai-engine:
    image: risk-guardian/ai-engine:latest
    environment:
      - ML_ENV=production
    env_file:
      - ./config/.env.production
    volumes:
      - ./data/models:/app/models
      - ./logs/ai:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: risk_guardian_prod
      POSTGRES_USER: risk_guardian
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - ./config/postgres.conf:/etc/postgresql/postgresql.conf
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - ./data/redis:/data
      - ./config/redis.conf:/etc/redis/redis.conf
    ports:
      - "6379:6379"
    restart: unless-stopped

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./data/prometheus:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - ./data/grafana:/var/lib/grafana
      - ./config/grafana:/etc/grafana/provisioning
    restart: unless-stopped
```

## Kubernetes Deployment

### 1. Namespace and Security
```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: risk-guardian
  labels:
    name: risk-guardian
    environment: production

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: risk-guardian-sa
  namespace: risk-guardian
```

### 2. ConfigMaps and Secrets
```yaml
# k8s/configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: risk-guardian-config
  namespace: risk-guardian
data:
  NODE_ENV: "production"
  API_ENV: "production"
  LOG_LEVEL: "info"
  STELLAR_NETWORK: "public"
```

### 3. Frontend Deployment
```yaml
# k8s/frontend-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: risk-guardian-frontend
  namespace: risk-guardian
spec:
  replicas: 3
  selector:
    matchLabels:
      app: risk-guardian-frontend
  template:
    metadata:
      labels:
        app: risk-guardian-frontend
    spec:
      containers:
      - name: frontend
        image: risk-guardian/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.riskguardian.com"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Database Setup

### PostgreSQL Configuration
```sql
-- Production database initialization
-- /opt/risk-guardian/config/init.sql

CREATE DATABASE risk_guardian_prod;
CREATE USER risk_guardian WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE risk_guardian_prod TO risk_guardian;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Production optimizations
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET shared_buffers = '16GB';
ALTER SYSTEM SET effective_cache_size = '48GB';
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET maintenance_work_mem = '2GB';
```

### Backup Strategy
```bash
#!/bin/bash
# /opt/risk-guardian/scripts/backup.sh

BACKUP_DIR="/opt/risk-guardian/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="risk_guardian_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h localhost -U risk_guardian -d $DB_NAME | gzip > $BACKUP_DIR/full_backup_$DATE.sql.gz

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/full_backup_$DATE.sql.gz s3://risk-guardian-backups/database/
```

## Monitoring & Observability

### 1. Application Monitoring
```yaml
# config/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'risk-guardian-api'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'

  - job_name: 'risk-guardian-ai'
    static_configs:
      - targets: ['ai-engine:8001']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']
```

### 2. Logging Configuration
```json
// config/logging.json
{
  "version": 1,
  "formatters": {
    "json": {
      "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
      "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
    }
  },
  "handlers": {
    "file": {
      "class": "logging.handlers.RotatingFileHandler",
      "filename": "/app/logs/risk-guardian.log",
      "maxBytes": 52428800,
      "backupCount": 10,
      "formatter": "json"
    }
  },
  "root": {
    "level": "INFO",
    "handlers": ["file"]
  }
}
```

## Security Hardening

### 1. Network Security
```nginx
# config/nginx.conf
server {
    listen 443 ssl http2;
    server_name api.riskguardian.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/riskguardian.com.crt;
    ssl_certificate_key /etc/ssl/private/riskguardian.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

### 2. Application Security
```python
# Security middleware configuration
SECURITY_HEADERS = {
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
}

# Rate limiting configuration
RATE_LIMITS = {
    "api": "1000/hour",
    "auth": "100/hour",
    "websocket": "10/second"
}
```

## Performance Optimization

### 1. Caching Strategy
```python
# Redis caching configuration
CACHE_CONFIG = {
    "prices": {"ttl": 30, "prefix": "price:"},
    "risk_metrics": {"ttl": 300, "prefix": "risk:"},
    "portfolio_data": {"ttl": 60, "prefix": "portfolio:"},
    "ml_predictions": {"ttl": 600, "prefix": "ml:"}
}
```

### 2. Database Optimization
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_portfolio_user_id ON portfolios(user_id);
CREATE INDEX CONCURRENTLY idx_price_history_asset_timestamp ON price_history(asset_code, timestamp DESC);
CREATE INDEX CONCURRENTLY idx_risk_alerts_triggered ON risk_alerts(triggered_at DESC);

-- Partitioning strategy
CREATE TABLE price_history_2025_01 PARTITION OF price_history 
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations tested
- [ ] Security scanning completed
- [ ] Load testing performed
- [ ] Backup procedures tested

### Deployment
- [ ] Blue-green deployment strategy
- [ ] Health checks configured
- [ ] Monitoring alerts active
- [ ] Log aggregation working
- [ ] Performance metrics baseline

### Post-Deployment
- [ ] System integration tests passed
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Team training completed
- [ ] Incident response procedures active

---

*For enterprise deployment support, contact our professional services team at enterprise@riskguardian.io*
