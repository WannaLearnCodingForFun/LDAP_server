#!/usr/bin/env python3
"""
CSV Import Script for LDAP
Imports users from CSV file into LDAP directory
"""

import os
import sys
import csv
import argparse
import ldap3
from ldap3 import Server, Connection, ALL

# LDAP Configuration
LDAP_URI = os.getenv('LDAP_MASTER_URI', 'ldap://localhost:389')
LDAP_BASE_DN = os.getenv('LDAP_BASE_DN', 'dc=college,dc=local')
LDAP_BIND_DN = os.getenv('LDAP_BIND_DN', 'cn=admin,dc=college,dc=local')
LDAP_BIND_PASSWORD = os.getenv('LDAP_BIND_PASSWORD', 'admin123')


def hash_password(password):
    """Hash password using SSHA512"""
    import hashlib
    import base64
    import os
    
    salt = os.urandom(8)
    sha = hashlib.sha512()
    sha.update(password.encode('utf-8'))
    sha.update(salt)
    digest = sha.digest()
    b64 = base64.b64encode(digest + salt).decode('utf-8')
    return f'{{SSHA512}}{b64}'


def import_user(conn, row):
    """Import a single user from CSV row"""
    user_type = row.get('type', 'studentEntry').lower()
    cn = row.get('cn') or row.get('username')
    
    if not cn:
        print(f"Error: Missing CN/username for row: {row}")
        return False
    
    # Determine OU based on type
    if user_type == 'studententry':
        if row.get('degree_type', '').lower() == 'postgraduate':
            ou_path = f"ou=Postgraduate,ou=Students,ou=People,{LDAP_BASE_DN}"
        else:
            ou_path = f"ou=Undergraduate,ou=Students,ou=People,{LDAP_BASE_DN}"
    elif user_type == ' facultymember':
        ou_path = f"ou=Faculty,ou=People,{LDAP_BASE_DN}"
    elif user_type == 'staffentry':
        ou_path = f"ou=Staff,ou=People,{LDAP_BASE_DN}"
    else:
        ou_path = f"ou=People,{LDAP_BASE_DN}"
    
    dn = f"cn={cn},{ou_path}"
    
    # Build attributes
    attributes = {
        'objectClass': ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
        'cn': cn,
        'sn': row.get('sn') or cn,
    }
    
    if row.get('givenName'):
        attributes['givenName'] = row['givenName']
    if row.get('mail'):
        attributes['mail'] = row['mail']
    if row.get('password'):
        attributes['userPassword'] = hash_password(row['password'])
    
    # Add type-specific attributes
    if user_type == 'studententry':
        attributes['objectClass'].append('studentEntry')
        if row.get('rollNumber'):
            attributes['rollNumber'] = row['rollNumber']
        if row.get('departmentCode'):
            attributes['departmentCode'] = row['departmentCode']
        if row.get('yearOfStudy'):
            attributes['yearOfStudy'] = row['yearOfStudy']
        if row.get('CGPA'):
            attributes['CGPA'] = row['CGPA']
        if row.get('hostelBlock'):
            attributes['hostelBlock'] = row['hostelBlock']
    
    elif user_type == 'facultymember':
        attributes['objectClass'].append('facultyMember')
        if row.get('empID'):
            attributes['empID'] = row['empID']
        if row.get('specialization'):
            attributes['specialization'] = row['specialization']
        if row.get('researchProjects'):
            projects = row['researchProjects'].split(',') if isinstance(row['researchProjects'], str) else row['researchProjects']
            attributes['researchProjects'] = [p.strip() for p in projects]
        if row.get('publications'):
            pubs = row['publications'].split(',') if isinstance(row['publications'], str) else row['publications']
            attributes['publications'] = [p.strip() for p in pubs]
    
    elif user_type == 'staffentry':
        attributes['objectClass'].append('staffEntry')
        if row.get('empID'):
            attributes['empID'] = row['empID']
        if row.get('employeeLevel'):
            attributes['employeeLevel'] = row['employeeLevel']
    
    # Add entry
    try:
        result = conn.add(dn, attributes=attributes)
        if result:
            print(f"✓ Added: {dn}")
            return True
        else:
            print(f"✗ Failed: {dn} - {conn.result['description']}")
            return False
    except Exception as e:
        print(f"✗ Error adding {dn}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Import users from CSV to LDAP')
    parser.add_argument('csv_file', help='Path to CSV file')
    parser.add_argument('--dry-run', action='store_true', help='Dry run without making changes')
    
    args = parser.parse_args()
    
    # Connect to LDAP
    server = Server(LDAP_URI, get_info=ALL)
    conn = Connection(server, user=LDAP_BIND_DN, password=LDAP_BIND_PASSWORD, auto_bind=True)
    
    print(f"Connected to LDAP: {LDAP_URI}")
    
    if args.dry_run:
        print("DRY RUN MODE - No changes will be made")
    
    # Read CSV and import
    success_count = 0
    error_count = 0
    
    with open(args.csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if args.dry_run:
                print(f"[DRY RUN] Would import: {row.get('cn') or row.get('username')}")
            else:
                if import_user(conn, row):
                    success_count += 1
                else:
                    error_count += 1
    
    conn.unbind()
    
    print(f"\nImport complete: {success_count} successful, {error_count} errors")


if __name__ == '__main__':
    main()

