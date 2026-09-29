#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$DIR"

echo "Executando seeds do banco de dados..."
PYTHONPATH=. ./backend/.venv/bin/python3 backend/database/seeds/seed.py
