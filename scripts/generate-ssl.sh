#!/bin/bash
# Generate SSL certificates for LDAP servers

set -e

SSL_DIR="./ldap-master/ssl"
mkdir -p "$SSL_DIR"

# Generate CA private key
openssl genrsa -out "$SSL_DIR/ca.key" 4096

# Generate CA certificate
openssl req -new -x509 -days 3650 -key "$SSL_DIR/ca.key" -out "$SSL_DIR/ca.crt" \
    -subj "/CN=LDAP-CA/O=College Local/C=US"

# Generate server private key
openssl genrsa -out "$SSL_DIR/ldap.key" 4096

# Generate server certificate signing request
openssl req -new -key "$SSL_DIR/ldap.key" -out "$SSL_DIR/ldap.csr" \
    -subj "/CN=ldap-master/O=College Local/C=US"

# Generate server certificate signed by CA
openssl x509 -req -days 365 -in "$SSL_DIR/ldap.csr" -CA "$SSL_DIR/ca.crt" \
    -CAkey "$SSL_DIR/ca.key" -CAcreateserial -out "$SSL_DIR/ldap.crt" \
    -extensions v3_req -extfile <(
        cat <<EOF
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = ldap-master
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF
    )

# Generate DH parameters
openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048

# Copy certificates to replica and audit directories
cp "$SSL_DIR/ldap.crt" "./ldap-replica/ssl/"
cp "$SSL_DIR/ldap.key" "./ldap-replica/ssl/"
cp "$SSL_DIR/ca.crt" "./ldap-replica/ssl/"
cp "$SSL_DIR/dhparam.pem" "./ldap-replica/ssl/"

cp "$SSL_DIR/ldap.crt" "./ldap-audit/ssl/"
cp "$SSL_DIR/ldap.key" "./ldap-audit/ssl/"
cp "$SSL_DIR/ca.crt" "./ldap-audit/ssl/"
cp "$SSL_DIR/dhparam.pem" "./ldap-audit/ssl/"

echo "SSL certificates generated successfully!"
echo "Certificates are in: $SSL_DIR"

