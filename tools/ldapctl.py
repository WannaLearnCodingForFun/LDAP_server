#!/usr/bin/env python3
import argparse
from ldap3 import Server, Connection, Tls, ALL, ALL_ATTRIBUTES, SUBTREE

def get_conn(uri, bind_dn, password):
    tls = Tls(validate=0)
    server = Server(uri, use_ssl=True, get_info=ALL, tls=tls)
    return Connection(server, user=bind_dn, password=password, auto_bind=True)

def cmd_add_user(args):
    conn = get_conn(args.uri, args.bind_dn, args.bind_password)
    ou = args.ou or "Students"
    cn = args.name
    uid = args.uid or cn.lower().replace(" ", ".")
    dn = f"uid={uid},ou={ou},ou=People,dc=college,dc=local"
    attrs = {
        "cn": cn,
        "sn": cn.split(" ")[-1],
        "uid": uid,
        "departmentCode": args.dept or "CS",
        "objectClass": ["inetOrgPerson", "organizationalPerson", "person", "top", "studentEntry"],
    }
    ok = conn.add(dn, attributes=attrs)
    print({"dn": dn, "ok": ok, "result": conn.result})
    conn.unbind()

def cmd_search(args):
    conn = get_conn(args.uri, args.bind_dn, args.bind_password)
    base = args.base or "dc=college,dc=local"
    flt = args.filter or "(objectClass=*)"
    conn.search(base, flt, SUBTREE, attributes=ALL_ATTRIBUTES)
    for e in conn.entries:
        print(e.entry_to_ldif())
    conn.unbind()

def main():
    p = argparse.ArgumentParser(prog="ldapctl")
    p.add_argument("command", choices=["add-user", "search"]) 
    p.add_argument("--uri", default="ldaps://localhost:636")
    p.add_argument("--bind-dn", default="cn=admin,dc=college,dc=local")
    p.add_argument("--bind-password", default="admin")
    p.add_argument("--ou")
    p.add_argument("--name")
    p.add_argument("--uid")
    p.add_argument("--dept")
    p.add_argument("--base")
    p.add_argument("--filter")
    args = p.parse_args()
    if args.command == "add-user":
        if not args.name:
            p.error("--name is required for add-user")
        cmd_add_user(args)
    elif args.command == "search":
        cmd_search(args)

if __name__ == "__main__":
    main()








