#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/orcamento-app"
PRODUCTS_COMPOSE="$ROOT_DIR/api-ingestion/docker-compose.yml"
BACKEND_COMPOSE="$APP_DIR/docker-compose.yml"

FRONTEND_MODE="${1:---web}"
if [[ "$FRONTEND_MODE" != "--web" && "$FRONTEND_MODE" != "--android" && "$FRONTEND_MODE" != "--ios" ]]; then
  echo "Uso: $0 [--web|--android|--ios]" >&2
  exit 2
fi

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Erro: comando obrigatório não encontrado: $1" >&2
    exit 1
  }
}

wait_for_health() {
  local name="$1"
  local url="$2"
  local attempts=30

  printf 'Aguardando %s (%s)' "$name" "$url"
  for ((i = 1; i <= attempts; i++)); do
    if curl --silent --fail --max-time 2 "$url" >/dev/null 2>&1; then
      echo " OK"
      return
    fi
    printf '.'
    sleep 2
  done
  echo " FALHOU"
  echo "Verifique os logs com: docker compose -f \"$BACKEND_COMPOSE\" logs" >&2
  exit 1
}

require_command docker
require_command curl
require_command node
require_command npm

start_frontend() {
  case "$FRONTEND_MODE" in
    --web)
      npm run web
      ;;
    --android)
      if command -v adb >/dev/null 2>&1; then
        npm run android
      else
        cat <<'EOF'

Aviso: Android SDK/adb não encontrado.
O Metro será iniciado sem abrir um emulador automaticamente.
Abra o Expo Go em um dispositivo Android e escaneie o QR code exibido.
Para habilitar `./prompt.sh --android` com abertura automática, instale o
Android SDK, defina ANDROID_HOME (ou ANDROID_SDK_ROOT) e adicione $ANDROID_HOME/platform-tools ao PATH.

EOF
        npm run start
      fi
      ;;
    --ios)
      npm run ios
      ;;
  esac
}

echo "==> Instalando dependências do frontend"
cd "$APP_DIR"
npm ci

echo "==> Validando TypeScript"
npx tsc --noEmit

echo "==> Executando lint"
npm run lint

echo "==> Gerando build web do frontend"
npx expo export --platform web

echo "==> Construindo e iniciando API de produtos"
docker compose -f "$PRODUCTS_COMPOSE" up -d --build

echo "==> Construindo e iniciando PostgreSQL e APIs do projeto"
docker compose -f "$BACKEND_COMPOSE" up -d --build

echo "==> Aplicando migrations e dados iniciais"
docker compose -f "$BACKEND_COMPOSE" --profile seed build seed
docker compose -f "$BACKEND_COMPOSE" --profile seed run --rm seed

echo "==> Validando serviços"
wait_for_health "Core API" "http://127.0.0.1:8000/health"
wait_for_health "Order API" "http://127.0.0.1:8001/health"
wait_for_health "Payment API" "http://127.0.0.1:8002/health"
wait_for_health "Product API" "http://127.0.0.1:8050/health"

cat <<EOF

Projeto iniciado com sucesso.

Portas:
  Frontend Expo:  http://localhost:8081
  Core API:      http://localhost:8000/docs
  Order API:     http://localhost:8001/docs
  Payment API:   http://localhost:8002/docs
  Product API:   http://localhost:8050/docs
  PostgreSQL:    localhost:5433

Modo do frontend: $FRONTEND_MODE
EOF

start_frontend
