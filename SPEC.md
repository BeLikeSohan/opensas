# SPEC

## What's this file is about
As I go through the provided requirement doc I will note my findings and constraints here.

## Backend
Backend Port: 8080
ORM: Entity Framework Core 10
DB Driver: Npgsql

Issues:
1. the count query isn't a seat lock. When holds are created later, the "seats must never be exceeded" rule needs its own transactional check there.

## Frontend
Frontend Port: 3000