# Grafana & Prometheus Monitoring Guide

## 🚀 Quick Access

**Grafana Dashboard:**
- URL: http://localhost:3001
- Username: `admin`
- Password: `admin` (change on first login)

**Prometheus:**
- URL: http://localhost:9090
- No login required (for now)

---

## 📊 What You Can Monitor

### 1. Flask API Metrics
- Request counts per endpoint
- Response times
- Error rates
- Rate limiting stats

### 2. LDAP Metrics (when configured)
- Bind operations
- Search operations
- Connection counts
- Replication lag

### 3. System Metrics
- Container health
- Resource usage
- Network traffic

---

## 🔧 Setting Up Grafana

### Step 1: First Login
1. Go to http://localhost:3001
2. Login with `admin` / `admin`
3. You'll be prompted to change the password (optional for localhost)

### Step 2: Verify Prometheus Data Source
1. Go to **Configuration** → **Data Sources**
2. You should see "Prometheus" already configured
3. Click on it and click **"Test"** - should show "Data source is working"

### Step 3: View Pre-configured Dashboard
1. Go to **Dashboards** → **Browse**
2. Look for "LDAP Overview" dashboard
3. Click to open it

---

## 📈 Creating Custom Dashboards

### Example: Flask API Request Rate

1. Go to **Dashboards** → **New Dashboard**
2. Click **"Add visualization"**
3. Select **Prometheus** as data source
4. In the query field, enter:
   ```
   rate(api_requests_total[5m])
   ```
5. Click **"Run query"**
6. Save the panel

### Example: Total API Requests by Endpoint

1. Add another panel
2. Use query:
   ```
   sum by (endpoint) (api_requests_total)
   ```
3. Visualization type: **Bar chart**

---

## 🔍 Useful Prometheus Queries

### Check if Flask API is Up
```
up{job="flask-api"}
```

### Total API Requests
```
sum(api_requests_total)
```

### Requests per Endpoint
```
sum by (endpoint) (api_requests_total)
```

### Request Rate (requests per second)
```
rate(api_requests_total[5m])
```

### Check All Targets
```
up
```

---

## 🛠️ Troubleshooting

### Prometheus Not Scraping Flask API

**Check if Flask API is exposing metrics:**
```bash
curl http://localhost:5001/metrics
```

**Check Prometheus targets:**
1. Go to http://localhost:9090
2. Click **Status** → **Targets**
3. Check if `flask-api` shows as "UP"

**If it's DOWN:**
- Make sure Flask API container is running: `docker ps | grep flask-api`
- Check if Flask API is accessible: `curl http://localhost:5001/health`

### Grafana Can't Connect to Prometheus

1. Go to Grafana → **Configuration** → **Data Sources**
2. Click **Prometheus**
3. Verify URL is: `http://prometheus:9090`
4. Click **"Test"** button
5. If it fails, check if Prometheus is running: `docker ps | grep prometheus`

### No Data in Dashboards

1. Make sure Prometheus is scraping: http://localhost:9090/targets
2. Check if metrics exist: http://localhost:9090/graph (search for `api_requests_total`)
3. Verify time range in Grafana (top right corner)

---

## 📝 Quick Commands

### View Prometheus Targets
```bash
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

### Check Flask API Metrics
```bash
curl http://localhost:5001/metrics | grep api_requests
```

### View Grafana Logs
```bash
docker logs grafana --tail 20
```

### Restart Monitoring Services
```bash
docker-compose restart prometheus grafana
```

---

## 🎯 Next Steps

1. **Explore Pre-built Dashboard** - Check the "LDAP Overview" dashboard
2. **Create Custom Panels** - Add metrics you care about
3. **Set Up Alerts** - Configure alerts for critical metrics
4. **Export Dashboards** - Save your dashboards as JSON files

---

## 💡 Pro Tips

- **Time Range**: Use the time picker (top right) to view different time periods
- **Refresh**: Set auto-refresh to see real-time updates
- **Variables**: Create dashboard variables for filtering
- **Annotations**: Add annotations to mark important events
- **Export**: Export dashboards as JSON to share or backup

---

**Happy Monitoring!** 📊


