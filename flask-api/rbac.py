from typing import Literal

Role = Literal["admin", "faculty", "staff", "student"]

ROLE_PERMISSIONS = {
    "admin": {"*": ["read", "write", "delete"]},
    "faculty": {
        "ou=Faculty,ou=People,dc=college,dc=local": ["read", "write"],
        "dc=college,dc=local": ["read"],
    },
    "staff": {"dc=college,dc=local": ["read"]},
    "student": {
        "ou=Students,ou=People,dc=college,dc=local": ["read"],
    },
}

def is_allowed(role: Role, dn: str, action: str) -> bool:
    perms = ROLE_PERMISSIONS.get(role, {})
    if "*" in perms and action in perms["*"]:
        return True
    # Find the most specific matching DN policy
    applicable = []
    for base, actions in perms.items():
        if dn.lower().endswith(base.lower()) and action in actions:
            applicable.append(base)
    if not applicable:
        return False
    # Prefer the longest (most specific) base
    applicable.sort(key=len, reverse=True)
    return True








