#!/usr/bin/env python3
"""Direct token generator - bypasses API for testing"""
import jwt
from datetime import datetime, timedelta
import sys

JWT_SECRET = "supersecretjwt"

def generate_token(username="admin", role="admin"):
    now = datetime.utcnow()
    user_dn = f"cn={username},dc=college,dc=local" if username == "admin" else f"uid={username},ou=People,dc=college,dc=local"
    
    access = jwt.encode({
        "sub": user_dn,
        "role": role,
        "exp": now + timedelta(minutes=15)
    }, JWT_SECRET, algorithm="HS256")
    
    refresh = jwt.encode({
        "sub": user_dn,
        "type": "refresh",
        "exp": now + timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")
    
    return access, refresh

if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else "admin"
    role = sys.argv[2] if len(sys.argv) > 2 else "admin"
    
    access, refresh = generate_token(username, role)
    
    print("Access Token (expires in 15 minutes):")
    print(access)
    print("\nRefresh Token (expires in 7 days):")
    print(refresh)
    print("\nTo use:")
    print(f"export ACCESS_TOKEN=\"{access}\"")

