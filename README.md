# Enterprise-Grade LDAP System (Localhost)

This project provides a multi-server OpenLDAP stack with replication, auditing, a Flask API gateway (JWT/RBAC), a simple web dashboard, Prometheus/Grafana monitoring, and Postgres logging. All components run via docker-compose.

## Services
- ldap-master: Read/Write OpenLDAP with ppolicy, TLS, sync provider
- ldap-replica: Read-only consumer
- ldap-audit: Consumer with auditlog overlay
- phpldapadmin: Web UI at http://localhost:8080
- flask-api: REST API at http://localhost:5000
- react-dashboard: Admin dashboard at http://localhost:3000
- prometheus: http://localhost:9090
- grafana: http://localhost:3001 (admin/admin by default)
- postgres: Logging database

## Quick Start
```bash
# 1) Generate self-signed certificates
bash ./scripts/generate-certs.sh

# 2) Start the stack
docker-compose up -d --build

# 3) Access UIs
open http://localhost:8080  # phpLDAPadmin
open http://localhost:3000  # Dashboard
open http://localhost:3001  # Grafana
```

Default LDAP admin: `cn=admin,dc=college,dc=local` with password `admin` (change for real use).

## Directory Structure
- ldap/schema/college_schema.ldif: Custom attributes/objectClasses
- ldap/master/init: Base DIT, ACLs, ppolicy, sync provider
- ldap/replica/init: syncrepl consumer
- ldap/audit/init: syncrepl + auditlog overlay
- flask-api/: JWT API that wraps LDAP
- react-dashboard/: simple static admin UI (proxy to API)
- prometheus/: scrape config
- grafana/: provisioning
- scripts/generate-certs.sh: self-signed CA and node certs

## API Examples
```bash
# Login
curl -s localhost:5000/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}'

# Search
curl -s localhost:5000/search -H 'Authorization: Bearer <ACCESS>' -H 'Content-Type: application/json' \
  -d '{"base":"dc=college,dc=local","filter":"(objectClass=*)"}'
```

## Replication
- Master configured with syncprov overlay
- Replica and Audit consume via syncrepl refreshAndPersist

## Security
- TLS enabled for LDAP (self-signed)
- ppolicy overlay enforces lockouts and complexity
- JWT tokens for API (set JWT_SECRET)

## Monitoring
- Prometheus scrapes Flask API /metrics (to be extended)
- Grafana pre-provisioned with a basic dashboard

## Automation
- Added cron/Celery workers later for CSV sync, backups, integrity checks

## Notes
- This is a local reference architecture; change passwords, add production TLS, and extend policies for real deployments.


# botanical-traceability-of-Ayurvedic-herbs
