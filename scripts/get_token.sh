#!/bin/bash
# Helper script to get access token from LDAP API

API_URL="${API_URL:-http://localhost:5000}"
USERNAME="${1:-admin}"
PASSWORD="${2:-admin}"

echo "Logging in as $USERNAME..."

RESPONSE=$(curl -s "$API_URL/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

# Check if login was successful
if echo "$RESPONSE" | grep -q "access_token"; then
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
    REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')
    
    echo "✓ Login successful!"
    echo ""
    echo "Access Token (expires in 15 minutes):"
    echo "$ACCESS_TOKEN"
    echo ""
    echo "Refresh Token (expires in 7 days):"
    echo "$REFRESH_TOKEN"
    echo ""
    echo "To use the token, run:"
    echo "export ACCESS_TOKEN=\"$ACCESS_TOKEN\""
    echo ""
    echo "Or copy this command:"
    echo "export ACCESS_TOKEN=\"$ACCESS_TOKEN\" && curl -s http://localhost:5000/search -H \"Authorization: Bearer \$ACCESS_TOKEN\" -H 'Content-Type: application/json' -d '{\"base\":\"dc=college,dc=local\",\"filter\":\"(objectClass=*)\"}' | jq"
else
    echo "✗ Login failed!"
    echo "Response: $RESPONSE"
    exit 1
fi

