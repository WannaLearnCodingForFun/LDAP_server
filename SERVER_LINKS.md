# 🌐 Server Links & Access Points

## 📊 Monitoring & Dashboards

### Grafana
- **URL:** http://localhost:3001
- **Username:** `admin`
- **Password:** `admin`
- **Purpose:** Visual dashboards, metrics visualization, technical monitoring
- **Dashboards:**
  - LDAP Overview
  - LDAP Technical Deep Dive

### Prometheus
- **URL:** http://localhost:9090
- **Login:** Not required (for now)
- **Purpose:** Metrics database, query interface
- **Useful Pages:**
  - `/graph` - Query interface
  - `/targets` - Service health status
  - `/alerts` - Alert rules

---

## 🔐 LDAP Management

### phpLDAPadmin (Web GUI)
- **URL:** http://localhost:8080
- **Login DN:** `cn=admin,dc=college,dc=local`
- **Password:** `admin`
- **Purpose:** Visual LDAP directory browser and editor

### LDAP Master Server
- **LDAP:** `ldap://localhost:389`
- **LDAPS:** `ldaps://localhost:636`
- **Base DN:** `dc=college,dc=local`
- **Admin DN:** `cn=admin,dc=college,dc=local`
- **Password:** `admin`

### LDAP Replica Server
- **LDAP:** `ldap://localhost:3890` (if running)
- **Purpose:** Read-only replica for load balancing

### LDAP Audit Server
- **LDAP:** `ldap://localhost:3891` (if running)
- **Purpose:** Audit logging server

---

## 🔌 API & Services

### Flask API Gateway
- **Base URL:** http://localhost:5001
- **Health Check:** http://localhost:5001/health
- **Metrics:** http://localhost:5001/metrics
- **API Docs:** http://localhost:5001 (if Swagger is enabled)

### API Endpoints
- **Login:** `POST http://localhost:5001/login`
- **Search:** `POST http://localhost:5001/search`
- **Add User:** `POST http://localhost:5001/add_user`
- **Modify User:** `POST http://localhost:5001/modify_user`
- **Delete User:** `POST http://localhost:5001/delete_user`
- **Replica Status:** `GET http://localhost:5001/replica_status`
- **Audit Logs:** `GET http://localhost:5001/audit_logs`
- **Validate Token:** `POST http://localhost:5001/validate_token`
- **Refresh Token:** `POST http://localhost:5001/refresh`

---

## 💾 Databases

### PostgreSQL
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `ldap_logs`
- **Username:** `ldap`
- **Password:** `ldap`
- **Connection String:** `postgresql://ldap:ldap@localhost:5432/ldap_logs`

### Redis
- **Host:** `localhost`
- **Port:** `6379`
- **Password:** None (localhost only)
- **Connection String:** `redis://localhost:6379/0`
- **Purpose:** Rate limiting, session storage

---

## 🖥️ React Dashboard (if running)

- **URL:** http://localhost:3000
- **Purpose:** Modern web interface for LDAP management

---

## 📋 Quick Access Commands

### Check Service Status
```bash
docker ps
```

### View All Links
```bash
cat SERVER_LINKS.md
```

### Get API Token
```bash
export ACCESS_TOKEN=$(docker exec flask-api python3 -c "import jwt; from datetime import datetime, timedelta; print(jwt.encode({'sub': 'cn=admin,dc=college,dc=local', 'role': 'admin', 'exp': datetime.utcnow() + timedelta(minutes=15)}, 'supersecretjwt', algorithm='HS256'))")
echo $ACCESS_TOKEN
```

### Test API Health
```bash
curl http://localhost:5001/health | jq
```

### Test LDAP Connection
```bash
docker exec ldap-master ldapwhoami -x -D "cn=admin,dc=college,dc=local" -w admin
```

---

## 🔑 Default Credentials Summary

| Service | Username/Login | Password |
|---------|---------------|----------|
| Grafana | `admin` | `admin` |
| phpLDAPadmin | `cn=admin,dc=college,dc=local` | `admin` |
| PostgreSQL | `ldap` | `ldap` |
| LDAP Admin | `cn=admin,dc=college,dc=local` | `admin` |

**⚠️ Important:** Change these passwords in production!

---

## 🚀 Quick Start Links

1. **Start Monitoring:** http://localhost:3001 (Grafana)
2. **Browse LDAP:** http://localhost:8080 (phpLDAPadmin)
3. **Query Metrics:** http://localhost:9090 (Prometheus)
4. **API Health:** http://localhost:5001/health

---

**All services run on localhost. Make sure Docker containers are running!**


