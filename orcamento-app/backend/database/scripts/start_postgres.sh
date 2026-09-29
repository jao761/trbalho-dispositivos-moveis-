#!/usr/bin/env bash
set -e

PG_DATA="/tmp/postgres_orcamento_data"

if [ ! -d "$PG_DATA" ]; then
    echo "Inicializando cluster PostgreSQL em $PG_DATA..."
    /usr/lib/postgresql/18/bin/initdb -D "$PG_DATA" -U postgres -A trust
fi

rm -f "$PG_DATA/postmaster.pid"
echo "Iniciando PostgreSQL na porta 5433..."
/usr/lib/postgresql/18/bin/postgres -D "$PG_DATA" -k /tmp -p 5433
