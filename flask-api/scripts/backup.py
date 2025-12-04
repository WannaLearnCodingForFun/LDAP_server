#!/usr/bin/env python3
"""
LDAP Backup Script
Exports LDAP directory to LDIF and JSON formats
"""

import os
import sys
import json
import argparse
import datetime
import ldap3
from ldap3 import Server, Connection, ALL, SUBTREE

# LDAP Configuration
LDAP_URI = os.getenv('LDAP_MASTER_URI', 'ldap://localhost:389')
LDAP_BASE_DN = os.getenv('LDAP_BASE_DN', 'dc=college,dc=local')
LDAP_BIND_DN = os.getenv('LDAP_BIND_DN', 'cn=admin,dc=college,dc=local')
LDAP_BIND_PASSWORD = os.getenv('LDAP_BIND_PASSWORD', 'admin123')
BACKUP_DIR = os.getenv('BACKUP_DIR', '/app/data/backups')


def ensure_backup_dir():
    """Ensure backup directory exists"""
    os.makedirs(BACKUP_DIR, exist_ok=True)


def export_ldif(conn, output_file):
    """Export LDAP to LDIF format"""
    conn.search(LDAP_BASE_DN, '(objectClass=*)', attributes=['*'], search_scope=SUBTREE)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for entry in conn.entries:
            f.write(f"dn: {entry.entry_dn}\n")
            for attr in entry.entry_attributes:
                values = entry[attr].values if hasattr(entry[attr], 'values') else [str(entry[attr])]
                for value in values:
                    f.write(f"{attr}: {value}\n")
            f.write("\n")
    
    print(f"LDIF export saved to: {output_file}")


def export_json(conn, output_file):
    """Export LDAP to JSON format"""
    conn.search(LDAP_BASE_DN, '(objectClass=*)', attributes=['*'], search_scope=SUBTREE)
    
    results = []
    for entry in conn.entries:
        result = {}
        for attr in entry.entry_attributes:
            values = entry[attr].values if hasattr(entry[attr], 'values') else [str(entry[attr])]
            result[attr] = values if len(values) > 1 else values[0]
        result['dn'] = str(entry.entry_dn)
        results.append(result)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'export_date': datetime.datetime.now().isoformat(),
            'base_dn': LDAP_BASE_DN,
            'count': len(results),
            'entries': results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"JSON export saved to: {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Backup LDAP directory')
    parser.add_argument('--format', choices=['ldif', 'json', 'both'], default='both',
                       help='Export format')
    parser.add_argument('--output-dir', default=BACKUP_DIR,
                       help='Output directory for backups')
    
    args = parser.parse_args()
    
    ensure_backup_dir()
    
    # Connect to LDAP
    server = Server(LDAP_URI, get_info=ALL)
    conn = Connection(server, user=LDAP_BIND_DN, password=LDAP_BIND_PASSWORD, auto_bind=True)
    
    print(f"Connected to LDAP: {LDAP_URI}")
    print(f"Base DN: {LDAP_BASE_DN}")
    
    # Generate timestamp
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Export
    if args.format in ['ldif', 'both']:
        ldif_file = os.path.join(args.output_dir, f'ldap_backup_{timestamp}.ldif')
        export_ldif(conn, ldif_file)
    
    if args.format in ['json', 'both']:
        json_file = os.path.join(args.output_dir, f'ldap_backup_{timestamp}.json')
        export_json(conn, json_file)
    
    conn.unbind()
    print("Backup complete!")


if __name__ == '__main__':
    main()

