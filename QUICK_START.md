# Quick Start Guide - Enterprise LDAP System

## 🚀 Starting the System

### Step 1: Generate TLS Certificates
```bash
cd /Users/atharvabandekar/Desktop/LDAP
bash scripts/generate-certs.sh
```

### Step 2: Start All Services
```bash
docker-compose up -d --build
```

This will start:
- ✅ LDAP Master (port 389, 636)
- ✅ LDAP Replica (read-only)
- ✅ LDAP Audit (logging)
- ✅ Flask API (port 5001)
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ phpLDAPadmin (port 8080)
- ✅ Prometheus (port 9090)
- ✅ Grafana (port 3001)

### Step 3: Check Status
```bash
docker-compose ps
```

Wait 30-60 seconds for all services to fully start.

---

## 📋 What You Can Do

### 1. Access Web Interfaces

**phpLDAPadmin (LDAP GUI):**
- URL: http://localhost:8080
- Login DN: `cn=admin,dc=college,dc=local`
- Password: `admin`
- Use this to browse and manage the LDAP directory visually

**Grafana (Monitoring):**
- URL: http://localhost:3001
- Username: `admin`
- Password: `admin`
- View metrics and dashboards

**Prometheus:**
- URL: http://localhost:9090
- View raw metrics

### 2. Use the REST API

**Get Access Token:**
```bash
# Method 1: Direct token generation (works even if login endpoint has issues)
export ACCESS_TOKEN=$(docker exec flask-api python3 -c "import jwt; from datetime import datetime, timedelta; print(jwt.encode({'sub': 'cn=admin,dc=college,dc=local', 'role': 'admin', 'exp': datetime.utcnow() + timedelta(minutes=15)}, 'supersecretjwt', algorithm='HS256'))")

# Method 2: Try API login (if working)
curl -s http://localhost:5001/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin","role":"admin"}' | jq -r '.access_token'
```

**Search Directory:**
```bash
curl -s http://localhost:5001/search \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"base":"dc=college,dc=local","filter":"(objectClass=*)"}' | jq
```

**Add a User:**
```bash
curl -s http://localhost:5001/add_user \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "dn": "uid=jdoe,ou=Students,ou=People,dc=college,dc=local",
    "objectClass": ["inetOrgPerson", "studentEntry"],
    "attributes": {
      "cn": "John Doe",
      "sn": "Doe",
      "uid": "jdoe",
      "rollNumber": "UG2025-CS-001",
      "departmentCode": "CS",
      "yearOfStudy": "2"
    }
  }' | jq
```

**Modify User:**
```bash
curl -s http://localhost:5001/modify_user \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "dn": "uid=jdoe,ou=Students,ou=People,dc=college,dc=local",
    "changes": {
      "CGPA": [["replace", ["3.8"]]]
    }
  }' | jq
```

**Delete User:**
```bash
curl -s http://localhost:5001/delete_user \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"dn": "uid=jdoe,ou=Students,ou=People,dc=college,dc=local"}' | jq
```

### 3. Use Command-Line Tools

**ldapctl (Python CLI):**
```bash
# Add user
python3 tools/ldapctl.py add-user \
  --ou Students \
  --name "Jane Smith" \
  --dept CS \
  --roll UG2025-CS-002

# Search
python3 tools/ldapctl.py search \
  --filter "(departmentCode=CS)" \
  --base-dn "ou=Students,ou=People,dc=college,dc=local"
```

**Direct LDAP Commands:**
```bash
# Search using ldapsearch
docker exec ldap-master ldapsearch -x \
  -D "cn=admin,dc=college,dc=local" \
  -w admin \
  -b "dc=college,dc=local" \
  "(objectClass=*)"
```

### 4. Check Replication Status
```bash
# Check if replica is synced
curl -s http://localhost:5001/replica_status \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
```

### 5. View Logs

**API Logs:**
```bash
docker logs flask-api --tail 50 -f
```

**LDAP Master Logs:**
```bash
docker logs ldap-master --tail 50 -f
```

**PostgreSQL Audit Logs:**
```bash
docker exec ldap-postgres psql -U ldap -d ldap_logs \
  -c "SELECT ts, event, payload FROM api_logs ORDER BY ts DESC LIMIT 10;"
```

---

## 🛠️ Common Operations

### Stop Everything
```bash
docker-compose down
```

### Restart a Service
```bash
docker-compose restart flask-api
```

### View All Running Containers
```bash
docker ps
```

### Clean Start (Remove All Data)
```bash
docker-compose down -v
docker-compose up -d --build
```

### Check Service Health
```bash
curl http://localhost:5001/health | jq
```

---

## 📁 Directory Structure

Your LDAP directory is organized as:
```
dc=college,dc=local
├── ou=People
│   ├── ou=Students
│   │   ├── ou=Undergraduate
│   │   └── ou=Postgraduate
│   ├── ou=Faculty
│   ├── ou=Staff
│   └── ou=Alumni
├── ou=Departments
│   ├── ou=ComputerScience
│   ├── ou=Mechanical
│   ├── ou=Electrical
│   └── ou=Civil
├── ou=IT
├── ou=Security
└── ou=Research
```

---

## 🔑 Default Credentials

- **LDAP Admin:** `cn=admin,dc=college,dc=local` / `admin`
- **Grafana:** `admin` / `admin`
- **PostgreSQL:** `ldap` / `ldap`
- **Redis:** No password (localhost only)

**⚠️ IMPORTANT:** Change these passwords in production!

---

## 🐛 Troubleshooting

### Port 5001 Not Working
```bash
# Check if Flask API is running
docker ps | grep flask-api

# Check logs
docker logs flask-api --tail 20
```

### LDAP Master Restarting
```bash
# Check logs
docker logs ldap-master --tail 50

# Restart it
docker-compose restart ldap-master
```

### Can't Get Token
Use the direct token generation method shown above - it works even if the login endpoint has issues.

### Services Won't Start
```bash
# Check what's failing
docker-compose ps

# View all logs
docker-compose logs

# Rebuild everything
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Next Steps

1. **Explore phpLDAPadmin** - Browse the directory structure
2. **Add Sample Data** - Create some test users
3. **Test API Endpoints** - Try the search, add, modify operations
4. **Check Monitoring** - View Grafana dashboards
5. **Read the Full Report** - See `PROJECT_USE_CASES_REPORT.md` for detailed use cases

---

## 💡 Quick Reference

```bash
# Start everything
docker-compose up -d

# Get token
export ACCESS_TOKEN=$(docker exec flask-api python3 -c "import jwt; from datetime import datetime, timedelta; print(jwt.encode({'sub': 'cn=admin,dc=college,dc=local', 'role': 'admin', 'exp': datetime.utcnow() + timedelta(minutes=15)}, 'supersecretjwt', algorithm='HS256'))")

# Search
curl -s http://localhost:5001/search \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"base":"dc=college,dc=local","filter":"(objectClass=*)"}' | jq

# Stop everything
docker-compose down
```

---

**That's it! You're ready to use your enterprise LDAP system!** 🎉

