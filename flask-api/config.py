import os

LDAP_URI = os.getenv("LDAP_URI", "ldaps://ldap-master:636")
LDAP_BIND_DN = os.getenv("LDAP_BIND_DN", "cn=admin,dc=college,dc=local")
LDAP_BIND_PASSWORD = os.getenv("LDAP_BIND_PASSWORD", "admin")
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
POSTGRES_DSN = os.getenv("POSTGRES_DSN", "postgresql://ldap:ldap@postgres:5432/ldap_logs")
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
ENABLE_2FA = os.getenv("ENABLE_2FA", "false").lower() == "true"








