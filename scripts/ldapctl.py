#!/usr/bin/env python3
"""
LDAP Control CLI Tool
Command-line interface for LDAP operations
"""

import os
import sys
import argparse
import json
import requests
from getpass import getpass

API_URL = os.getenv('LDAP_API_URL', 'http://localhost:5000')


class LDAPClient:
    def __init__(self, api_url=API_URL):
        self.api_url = api_url
        self.token = None
    
    def login(self, username, password):
        """Login and get JWT token"""
        response = requests.post(f'{self.api_url}/login', json={
            'username': username,
            'password': password
        })
        
        if response.status_code == 200:
            data = response.json()
            self.token = data['access_token']
            print(f"✓ Logged in as {data['user_dn']}")
            return True
        else:
            print(f"✗ Login failed: {response.json().get('error', 'Unknown error')}")
            return False
    
    def _headers(self):
        """Get request headers with auth token"""
        if not self.token:
            raise Exception("Not logged in. Use 'login' command first.")
        return {'Authorization': f'Bearer {self.token}'}
    
    def add_user(self, args):
        """Add a new user"""
        data = {
            'cn': args.name,
            'sn': args.name.split()[0] if args.name else '',
            'ou': args.ou,
            'user_type': args.type,
        }
        
        if args.dept:
            data['departmentCode'] = args.dept
        if args.roll:
            data['rollNumber'] = args.roll
        if args.year:
            data['yearOfStudy'] = args.year
        if args.emp_id:
            data['empID'] = args.emp_id
        if args.specialization:
            data['specialization'] = args.specialization
        
        password = args.password or getpass("Password: ")
        data['userPassword'] = password
        
        response = requests.post(
            f'{self.api_url}/add_user',
            json=data,
            headers=self._headers()
        )
        
        if response.status_code == 201:
            print(f"✓ User added successfully: {response.json().get('dn')}")
        else:
            print(f"✗ Error: {response.json().get('error', 'Unknown error')}")
    
    def search(self, args):
        """Search LDAP directory"""
        search_data = {
            'filter': args.filter,
            'attributes': args.attributes.split(',') if args.attributes else ['*']
        }
        
        if args.base_dn:
            search_data['base_dn'] = args.base_dn
        
        response = requests.post(
            f'{self.api_url}/search',
            json=search_data,
            headers=self._headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data['count']} entries:")
            print(json.dumps(data['results'], indent=2))
        else:
            print(f"✗ Error: {response.json().get('error', 'Unknown error')}")
    
    def delete_user(self, dn):
        """Delete a user"""
        response = requests.delete(
            f'{self.api_url}/delete_user',
            json={'dn': dn},
            headers=self._headers()
        )
        
        if response.status_code == 200:
            print(f"✓ User deleted successfully")
        else:
            print(f"✗ Error: {response.json().get('error', 'Unknown error')}")
    
    def modify_user(self, dn, modifications):
        """Modify user attributes"""
        response = requests.put(
            f'{self.api_url}/modify_user',
            json={'dn': dn, 'modifications': modifications},
            headers=self._headers()
        )
        
        if response.status_code == 200:
            print(f"✓ User modified successfully")
        else:
            print(f"✗ Error: {response.json().get('error', 'Unknown error')}")
    
    def replica_status(self):
        """Check replica status"""
        response = requests.get(
            f'{self.api_url}/replica_status',
            headers=self._headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            print("Replication Status:")
            print(f"  Master entries: {data['master_entries']}")
            print(f"  Replica entries: {data['replica_entries']}")
            print(f"  Sync status: {data['sync_status']}")
            print(f"  Lag: {data['lag']}")
        else:
            print(f"✗ Error: {response.json().get('error', 'Unknown error')}")


def main():
    parser = argparse.ArgumentParser(description='LDAP Control CLI')
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Login command
    login_parser = subparsers.add_parser('login', help='Login to LDAP API')
    login_parser.add_argument('username', help='Username')
    login_parser.add_argument('--password', help='Password (will prompt if not provided)')
    
    # Add user command
    add_parser = subparsers.add_parser('add-user', help='Add a new user')
    add_parser.add_argument('--name', required=True, help='User name (CN)')
    add_parser.add_argument('--ou', default='Students', help='Organizational Unit')
    add_parser.add_argument('--type', default='studentEntry', 
                          choices=['studentEntry', 'facultyMember', 'staffEntry'],
                          help='User type')
    add_parser.add_argument('--dept', help='Department code')
    add_parser.add_argument('--roll', help='Roll number (for students)')
    add_parser.add_argument('--year', help='Year of study')
    add_parser.add_argument('--emp-id', help='Employee ID')
    add_parser.add_argument('--specialization', help='Specialization (for faculty)')
    add_parser.add_argument('--password', help='Password')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search LDAP directory')
    search_parser.add_argument('--filter', default='(objectClass=*)', help='LDAP filter')
    search_parser.add_argument('--base-dn', help='Base DN for search')
    search_parser.add_argument('--attributes', help='Comma-separated attributes to return')
    
    # Delete command
    delete_parser = subparsers.add_parser('delete-user', help='Delete a user')
    delete_parser.add_argument('dn', help='Distinguished Name of user to delete')
    
    # Modify command
    modify_parser = subparsers.add_parser('modify-user', help='Modify user attributes')
    modify_parser.add_argument('dn', help='Distinguished Name of user')
    modify_parser.add_argument('--attr', action='append', nargs=2, metavar=('NAME', 'VALUE'),
                              help='Attribute to modify (can be used multiple times)')
    
    # Replica status command
    subparsers.add_parser('replica-status', help='Check replica synchronization status')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    client = LDAPClient()
    
    # Handle login
    if args.command == 'login':
        password = args.password or getpass("Password: ")
        if not client.login(args.username, password):
            sys.exit(1)
    else:
        # For other commands, try to load token from environment or file
        token_file = os.path.expanduser('~/.ldapctl_token')
        if os.path.exists(token_file):
            with open(token_file, 'r') as f:
                client.token = f.read().strip()
        elif not client.token:
            print("Not logged in. Please login first:")
            username = input("Username: ")
            password = getpass("Password: ")
            if not client.login(username, password):
                sys.exit(1)
            # Save token
            with open(token_file, 'w') as f:
                f.write(client.token)
    
    # Execute command
    try:
        if args.command == 'add-user':
            client.add_user(args)
        elif args.command == 'search':
            client.search(args)
        elif args.command == 'delete-user':
            client.delete_user(args.dn)
        elif args.command == 'modify-user':
            modifications = {attr[0]: attr[1] for attr in args.attr} if args.attr else {}
            client.modify_user(args.dn, modifications)
        elif args.command == 'replica-status':
            client.replica_status()
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

