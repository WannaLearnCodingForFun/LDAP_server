#!/bin/sh
set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CERTS_DIR="$BASE_DIR/certs"
mkdir -p "$CERTS_DIR/master" "$CERTS_DIR/replica" "$CERTS_DIR/audit"

# CA
if [ ! -f "$CERTS_DIR/ca.key" ]; then
  openssl genrsa -out "$CERTS_DIR/ca.key" 4096
  openssl req -x509 -new -nodes -key "$CERTS_DIR/ca.key" -sha256 -days 3650 -subj "/CN=LDAP Test CA" -out "$CERTS_DIR/ca.crt"
fi

gen_cert() {
  name="$1"
  outdir="$CERTS_DIR/$name"
  openssl genrsa -out "$outdir/$name.key" 2048
  openssl req -new -key "$outdir/$name.key" -subj "/CN=$name" -out "$outdir/$name.csr"
  openssl x509 -req -in "$outdir/$name.csr" -CA "$CERTS_DIR/ca.crt" -CAkey "$CERTS_DIR/ca.key" -CAcreateserial -out "$outdir/$name.crt" -days 365 -sha256
  cp "$CERTS_DIR/ca.crt" "$outdir/ca.crt"
}

gen_cert master
gen_cert replica
gen_cert audit
echo "Certificates generated under $CERTS_DIR"








