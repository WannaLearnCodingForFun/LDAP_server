# Technical Monitoring Deep Dive

## 🔬 Advanced Prometheus Queries

### API Performance Metrics

**Request Rate by Endpoint (requests per second):**
```promql
sum(rate(api_requests_total[5m])) by (endpoint)
```

**95th Percentile Request Rate:**
```promql
histogram_quantile(0.95, rate(api_requests_total[5m]))
```

**Request Distribution:**
```promql
sum by (endpoint) (api_requests_total) / sum(api_requests_total) * 100
```

**Request Rate Trend (derivative):**
```promql
deriv(sum(api_requests_total[5m]))
```

### System Resource Metrics

**Memory Usage:**
```promql
process_resident_memory_bytes{job="flask-api"} / 1024 / 1024
```

**CPU Usage Percentage:**
```promql
rate(process_cpu_seconds_total{job="flask-api"}[5m]) * 100
```

**File Descriptor Usage:**
```promql
process_open_fds{job="flask-api"} / process_max_fds{job="flask-api"} * 100
```

**Python GC Activity:**
```promql
rate(python_gc_collections_total{job="flask-api"}[5m])
```

### Service Health Queries

**All Services Status:**
```promql
up
```

**Service Uptime:**
```promql
time() - process_start_time_seconds
```

**Service Availability (percentage):**
```promql
avg_over_time(up{job="flask-api"}[1h]) * 100
```

### Advanced Aggregations

**Request Rate Over Multiple Time Windows:**
```promql
sum(rate(api_requests_total[1m]))  # 1 minute window
sum(rate(api_requests_total[5m]))  # 5 minute window
sum(rate(api_requests_total[15m])) # 15 minute window
```

**Cumulative Requests:**
```promql
sum(increase(api_requests_total[1h]))
```

**Request Rate Acceleration:**
```promql
deriv(sum(rate(api_requests_total[5m])))
```

---

## 📊 Advanced Grafana Dashboard Features

### 1. Technical Dashboard

Access: **Dashboards → Browse → "LDAP Technical Deep Dive"**

**What you'll see:**
- Service health table with all instances
- Request rate graphs with multiple endpoints
- Memory and CPU usage over time
- File descriptor monitoring
- Python GC activity
- Request distribution pie charts
- Heatmaps for request patterns

### 2. Creating Custom Technical Panels

#### Panel 1: Request Rate with Percentiles

1. New Panel → Time Series
2. Query A:
   ```
   sum(rate(api_requests_total[5m])) by (endpoint)
   ```
3. Query B (95th percentile):
   ```
   histogram_quantile(0.95, sum(rate(api_requests_total[5m])) by (le, endpoint))
   ```
4. Visualization: Graph with dual Y-axis

#### Panel 2: Error Rate (when errors are tracked)

```
sum(rate(api_errors_total[5m])) by (endpoint, status)
```

#### Panel 3: Response Time Distribution

```
histogram_quantile(0.50, sum(rate(api_request_duration_seconds_bucket[5m])) by (le))
histogram_quantile(0.95, sum(rate(api_request_duration_seconds_bucket[5m])) by (le))
histogram_quantile(0.99, sum(rate(api_request_duration_seconds_bucket[5m])) by (le))
```

#### Panel 4: Service Dependency Graph

Create a graph showing:
- Flask API depends on LDAP Master
- Flask API depends on PostgreSQL
- Flask API depends on Redis

---

## 🔍 LDAP-Specific Technical Queries

### LDAP Connection Monitoring

**Active Connections (if tracked):**
```promql
ldap_connections_active{instance="ldap-master"}
```

**Connection Rate:**
```promql
rate(ldap_connections_total[5m])
```

### LDAP Operation Metrics

**Bind Operations:**
```promql
sum(rate(ldap_binds_total[5m])) by (result)
```

**Search Operations:**
```promql
sum(rate(ldap_searches_total[5m])) by (base, scope)
```

**Modify Operations:**
```promql
sum(rate(ldap_modifies_total[5m]))
```

**Add Operations:**
```promql
sum(rate(ldap_adds_total[5m]))
```

**Delete Operations:**
```promql
sum(rate(ldap_deletes_total[5m]))
```

### Replication Metrics

**Replication Lag (contextCSN difference):**
```promql
ldap_replication_lag_seconds{instance="ldap-replica"}
```

**Replication Sync Status:**
```promql
ldap_replication_synced{instance="ldap-replica"}
```

**Replication Errors:**
```promql
sum(rate(ldap_replication_errors_total[5m]))
```

---

## 🛠️ Technical Debugging Queries

### Find Slow Endpoints

```promql
topk(10, sum(rate(api_requests_total[5m])) by (endpoint))
```

### Identify Error Patterns

```promql
sum(rate(api_errors_total[5m])) by (endpoint, error_type)
```

### Memory Leak Detection

```promql
increase(process_resident_memory_bytes{job="flask-api"}[1h])
```

### High CPU Usage

```promql
topk(5, rate(process_cpu_seconds_total[5m]))
```

### Connection Pool Exhaustion

```promql
process_open_fds{job="flask-api"} / process_max_fds{job="flask-api"}
```

---

## 📈 Advanced Visualization Techniques

### 1. Multi-Panel Dashboard Layout

```
Row 1: Service Health (24 columns)
Row 2: Request Metrics (12 cols) | Error Metrics (12 cols)
Row 3: System Resources (8 cols) | LDAP Metrics (8 cols) | Database Metrics (8 cols)
Row 4: Replication Status (24 cols)
```

### 2. Using Grafana Variables

Create variables for dynamic filtering:

**Variable: `endpoint`**
- Type: Query
- Query: `label_values(api_requests_total, endpoint)`
- Multi-value: Yes
- Include All: Yes

Then use in queries:
```promql
sum(rate(api_requests_total{endpoint=~"$endpoint"}[5m]))
```

**Variable: `time_range`**
- Type: Interval
- Options: 1m, 5m, 15m, 1h, 6h, 24h

Use in queries:
```promql
sum(rate(api_requests_total[$time_range]))
```

### 3. Alert Rules

Create alert rules in Prometheus:

```yaml
groups:
  - name: ldap_alerts
    rules:
      - alert: FlaskAPIDown
        expr: up{job="flask-api"} == 0
        for: 1m
        annotations:
          summary: "Flask API is down"
      
      - alert: HighRequestRate
        expr: sum(rate(api_requests_total[5m])) > 100
        for: 5m
        annotations:
          summary: "High request rate detected"
      
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes{job="flask-api"} > 500000000
        for: 5m
        annotations:
          summary: "High memory usage"
```

---

## 🔬 Technical Analysis Queries

### Request Pattern Analysis

**Peak Request Times:**
```promql
topk(10, sum(rate(api_requests_total[5m])) by (endpoint))
```

**Request Distribution:**
```promql
sum by (endpoint) (api_requests_total) / sum(api_requests_total) * 100
```

### Performance Bottleneck Detection

**Slowest Endpoints:**
```promql
topk(5, sum(rate(api_request_duration_seconds_sum[5m])) / sum(rate(api_requests_total[5m])))
```

**High Error Rate Endpoints:**
```promql
topk(5, sum(rate(api_errors_total[5m])) by (endpoint))
```

### Capacity Planning

**Request Rate Growth:**
```promql
predict_linear(sum(rate(api_requests_total[1h]))[1h:], 3600)
```

**Resource Projection:**
```promql
predict_linear(process_resident_memory_bytes{job="flask-api"}[1h:], 3600)
```

---

## 🎯 Real-Time Technical Monitoring

### Live Metrics Stream

**Watch metrics in real-time:**
```bash
watch -n 1 'curl -s http://localhost:5001/metrics | grep api_requests_total'
```

### Generate Test Traffic

```bash
# Run the metrics generator script
bash /Users/atharvabandekar/Desktop/LDAP/scripts/generate_metrics.sh
```

### Continuous Monitoring

```bash
# Monitor API health
watch -n 5 'curl -s http://localhost:5001/health | jq'

# Monitor Prometheus targets
watch -n 10 'curl -s http://localhost:9090/api/v1/targets | jq ".data.activeTargets[] | {job: .labels.job, health: .health}"'
```

---

## 📊 Export and Share Dashboards

### Export Dashboard JSON

1. In Grafana: Dashboard → Settings → JSON Model
2. Copy the JSON
3. Save to file for version control

### Import Dashboard

1. Dashboards → Import
2. Upload JSON file or paste JSON
3. Select data source
4. Import

---

## 🔧 Advanced Configuration

### Prometheus Recording Rules

Create `/prometheus/rules/ldap_rules.yml`:

```yaml
groups:
  - name: ldap_recording_rules
    interval: 30s
    rules:
      - record: api:requests:rate5m
        expr: sum(rate(api_requests_total[5m])) by (endpoint)
      
      - record: api:requests:total
        expr: sum(api_requests_total) by (endpoint)
```

### Grafana Alerting

1. Go to Alerting → Alert Rules
2. Create new rule
3. Set condition: `up{job="flask-api"} == 0`
4. Set evaluation interval
5. Configure notification channels

---

## 🚀 Next Level: Custom Metrics

### Add Custom Metrics to Flask API

Example in `app.py`:
```python
from prometheus_client import Histogram, Gauge

REQUEST_DURATION = Histogram('api_request_duration_seconds', 'Request duration', ['endpoint'])
ACTIVE_CONNECTIONS = Gauge('ldap_active_connections', 'Active LDAP connections')
REPLICATION_LAG = Gauge('ldap_replication_lag_seconds', 'Replication lag in seconds')
```

---

**Explore the Technical Dashboard in Grafana to see all these metrics visualized!** 🔬


