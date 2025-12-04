# Grafana & Prometheus - Quick Setup Guide

## ✅ Current Status

All services are running! Here's how to access them:

---

## 🌐 Access the Dashboards

### 1. Grafana (Main Dashboard)
**URL:** http://localhost:3001

**Login:**
- Username: `admin`
- Password: `admin`

**What to do:**
1. On first login, you'll be asked to change password (click "Skip" for now)
2. Go to **Dashboards** → **Browse** (left sidebar)
3. Look for **"LDAP Overview"** dashboard
4. Click to open it

### 2. Prometheus (Metrics Database)
**URL:** http://localhost:9090

**What to do:**
1. Click **Status** → **Targets** (top menu)
2. You should see:
   - ✅ `flask-api:5000` - Status: UP
   - ✅ `prometheus:9090` - Status: UP

3. Click **Graph** (top menu) to query metrics
4. Try these queries:
   ```
   up{job="flask-api"}
   api_requests_total
   rate(api_requests_total[5m])
   ```

---

## 📊 Viewing Metrics

### In Prometheus:

**Check if Flask API is up:**
```
up{job="flask-api"}
```
Should return `1` if up, `0` if down.

**View total API requests:**
```
sum(api_requests_total)
```

**View requests per endpoint:**
```
sum by (endpoint) (api_requests_total)
```

**Request rate (requests per second):**
```
rate(api_requests_total[5m])
```

### In Grafana:

1. **Pre-built Dashboard:**
   - Go to Dashboards → Browse
   - Open "LDAP Overview"
   - You'll see:
     - Flask API Status (UP/DOWN)
     - Total API Requests
     - Request Rate Graph
     - Requests by Endpoint

2. **Create Custom Panel:**
   - Click **"+"** → **"Create"** → **"Dashboard"**
   - Click **"Add visualization"**
   - Select **Prometheus** data source
   - Enter query: `api_requests_total`
   - Click **"Run query"**
   - Save panel

---

## 🎯 Quick Test

Generate some API requests to see metrics:

```bash
# Get a token
export ACCESS_TOKEN=$(docker exec flask-api python3 -c "import jwt; from datetime import datetime, timedelta; print(jwt.encode({'sub': 'cn=admin,dc=college,dc=local', 'role': 'admin', 'exp': datetime.utcnow() + timedelta(minutes=15)}, 'supersecretjwt', algorithm='HS256'))")

# Make some API calls
curl -s http://localhost:5001/health | jq
curl -s http://localhost:5001/search -H "Authorization: Bearer $ACCESS_TOKEN" -H 'Content-Type: application/json' -d '{"base":"dc=college,dc=local","filter":"(objectClass=*)"}' | jq | head -20
```

Then refresh Grafana to see the metrics update!

---

## 🔍 Useful Prometheus Queries

### System Health
```
# All services status
up

# Flask API specifically
up{job="flask-api"}
```

### API Metrics
```
# Total requests
sum(api_requests_total)

# Requests by endpoint
sum by (endpoint) (api_requests_total)

# Request rate (per second)
rate(api_requests_total[5m])

# Requests in last hour
increase(api_requests_total[1h])
```

### Error Rate
```
# If you add error metrics later
rate(api_errors_total[5m])
```

---

## 🛠️ Troubleshooting

### No Data in Grafana

1. **Check Prometheus is scraping:**
   - Go to http://localhost:9090/targets
   - Verify `flask-api` shows as UP

2. **Check metrics exist:**
   - Go to http://localhost:9090/graph
   - Search for: `api_requests_total`
   - Click "Execute"

3. **Verify Flask API metrics endpoint:**
   ```bash
   curl http://localhost:5001/metrics | grep api_requests
   ```

### Grafana Can't Connect to Prometheus

1. Go to Grafana → **Configuration** → **Data Sources**
2. Click **Prometheus**
3. Verify URL: `http://prometheus:9090`
4. Click **"Save & Test"**
5. Should show: "Data source is working"

### Dashboard Not Showing

1. **Check dashboard exists:**
   - Dashboards → Browse
   - Look for "LDAP Overview"

2. **Reload dashboard:**
   - Click refresh icon (top right)
   - Or press `Ctrl+R` / `Cmd+R`

3. **Check time range:**
   - Top right corner
   - Make sure it's not set to "Last 5 minutes" if no recent activity

---

## 📈 Next Steps

1. **Explore the Dashboard** - Check out the pre-built "LDAP Overview"
2. **Make API Calls** - Generate some traffic to see metrics
3. **Create Custom Panels** - Add metrics you care about
4. **Set Up Alerts** - Configure alerts for when services go down
5. **Export Dashboards** - Save your dashboards as JSON

---

## 💡 Pro Tips

- **Auto-refresh**: Set dashboard to auto-refresh every 10-30 seconds
- **Time Range**: Use time picker to view different periods
- **Variables**: Create variables for filtering (e.g., by endpoint)
- **Annotations**: Mark important events on graphs
- **Export**: Export dashboards as JSON to share

---

**You're all set! Start exploring Grafana at http://localhost:3001** 🎉


