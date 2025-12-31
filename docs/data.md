# Data

- objects
- sources
- migrations

## objects

Tracks all objects in all sources and maps to internal id

## sources

Can represent any source. Right now that's just s3.

### encryption (to do)

The secrets should be stored encrypted. That means I get an encryption key via env variable or "secrets", and use that to encrypt/decrypt with.

- generate key with `openssl rand -base64 32`
- use authenticated encryption (AES-GCM)
- store key version number on the row
