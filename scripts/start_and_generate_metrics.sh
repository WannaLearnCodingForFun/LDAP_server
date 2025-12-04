#!/bin/bash
# Script to start services and generate metrics

echo "🚀 Starting Docker services..."
cd /Users/atharvabandekar/Desktop/LDAP

# Wait for Docker to be ready
echo "⏳ Waiting for Docker to be ready..."
for i in {1..30}; do
  if docker ps > /dev/null 2>&1; then
    echo "✅ Docker is ready!"
    break
  fi
  echo "   Attempt $i/30..."
  sleep 2
done

# Start services
echo "📦 Starting services..."
docker-compose up -d flask-api prometheus grafana 2>&1 | grep -v "WARNING"

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check service status
echo ""
echo "📊 Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "NAME|flask-api|prometheus|grafana"

# Generate metrics
echo ""
echo "🔬 Generating API traffic for monitoring..."
bash /Users/atharvabandekar/Desktop/LDAP/scripts/generate_metrics.sh

# Show metrics summary
echo ""
echo "📈 Metrics Summary:"
sleep 3
TOTAL=$(curl -s "http://localhost:9090/api/v1/query?query=sum(api_requests_total)" 2>/dev/null | jq -r '.data.result[0].value[1] // "0"')
RATE=$(curl -s "http://localhost:9090/api/v1/query?query=sum(rate(api_requests_total[5m]))" 2>/dev/null | jq -r '.data.result[0].value[1] // "0"')

echo "  Total Requests: $TOTAL"
printf "  Request Rate: %.2f req/sec\n" "$RATE"

echo ""
echo "✅ Done! Access dashboards:"
echo "  • Grafana: http://localhost:3001 (admin/admin)"
echo "  • Prometheus: http://localhost:9090"
echo "  • Technical Dashboard: Grafana → Dashboards → Browse → 'LDAP Technical Deep Dive'"


