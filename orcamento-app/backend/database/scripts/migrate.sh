#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$DIR"

echo "Aplicando migrations do business_db..."
./backend/.venv/bin/alembic -c backend/database/business/alembic.ini upgrade head

echo "Aplicando migrations do commerce_db..."
./backend/.venv/bin/alembic -c backend/database/commerce/alembic.ini upgrade head

echo "Migrations concluídas com sucesso!"
