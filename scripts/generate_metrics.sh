#!/bin/bash
# Script to generate API traffic for monitoring

API_URL="http://localhost:5001"
TOKEN=$(docker exec flask-api python3 -c "import jwt; from datetime import datetime, timedelta; print(jwt.encode({'sub': 'cn=admin,dc=college,dc=local', 'role': 'admin', 'exp': datetime.utcnow() + timedelta(minutes=15)}, 'supersecretjwt', algorithm='HS256'))")

echo "Generating API traffic for monitoring..."
echo "Token: ${TOKEN:0:50}..."

# Generate various API calls
for i in {1..20}; do
  # Health check
  curl -s "$API_URL/health" > /dev/null
  
  # Search
  curl -s "$API_URL/search" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"base":"dc=college,dc=local","filter":"(objectClass=*)"}' > /dev/null
  
  # Validate token
  curl -s "$API_URL/validate_token" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  
  sleep 0.5
done

echo "✅ Generated 60+ API requests. Check Grafana now!"


