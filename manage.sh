#!/usr/bin/env bash
# manage.sh — entrypoint de scripts de Pulso
# Uso: ./manage.sh <subcomando>
#   start       arranca el servidor (foreground; Ctrl+C para parar)
#   bg          arranca en background (logs en pulso.log, PID en pulso.pid)
#   stop        para el servidor en background
#   status      muestra si está corriendo y en qué puerto
#   dev         arranca el servidor con --hot reload (foreground)
#   build       genera bundle del frontend a disco
#   push-gitea  crea repo en Gitea + push
#   push-github push a GitHub vía SSH (token sólo si quieres CREAR el repo)
#   push-all    ambos remotes

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# Carga .env si existe (key=value, sin comillas)
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

cmd="${1:-help}"

case "$cmd" in
  start)
    bun run backend/src/server.ts
    ;;

  bg)
    if [[ -f pulso.pid ]] && kill -0 "$(cat pulso.pid)" 2>/dev/null; then
      echo "ya corriendo (PID $(cat pulso.pid)). usa './manage.sh stop' primero o './manage.sh status'."
      exit 1
    fi
    nohup bun run backend/src/server.ts >pulso.log 2>&1 &
    echo $! >pulso.pid
    sleep 0.6
    if kill -0 "$(cat pulso.pid)" 2>/dev/null; then
      echo "✓ pulso corriendo en background (PID $(cat pulso.pid)). logs: tail -f pulso.log"
      grep -m1 listening pulso.log 2>/dev/null || true
    else
      echo "✗ falló al arrancar. revisa pulso.log:"
      tail -10 pulso.log
      rm -f pulso.pid
      exit 1
    fi
    ;;

  stop)
    if [[ -f pulso.pid ]] && kill -0 "$(cat pulso.pid)" 2>/dev/null; then
      kill "$(cat pulso.pid)" && echo "✓ stopped PID $(cat pulso.pid)"
      rm -f pulso.pid
    else
      echo "no estaba corriendo"
      rm -f pulso.pid
    fi
    ;;

  status)
    if [[ -f pulso.pid ]] && kill -0 "$(cat pulso.pid)" 2>/dev/null; then
      pid="$(cat pulso.pid)"
      port="$(ss -tlnp 2>/dev/null | awk -v p="$pid" '$0 ~ "pid="p {print $4}' | head -1 | sed 's/.*://')"
      echo "✓ corriendo: PID $pid, puerto ${port:-?}"
    else
      echo "✗ no está corriendo"
    fi
    ;;

  dev)
    bun --hot run backend/src/server.ts
    ;;

  build)
    mkdir -p dist
    bun build frontend/src/main.ts \
      --outfile dist/bundle.js \
      --target browser \
      --format esm \
      --minify
    cp frontend/index.html dist/
    cp frontend/styles.css dist/
    echo "Bundle listo en dist/"
    ;;

  push-gitea)
    : "${GITEA_URL:?Falta GITEA_URL en .env}"
    : "${GITEA_USER:?Falta GITEA_USER en .env}"
    : "${GITEA_TOKEN:?Falta GITEA_TOKEN en .env}"
    # GITEA_OWNER: organización o usuario bajo el que vive el repo en Gitea.
    # Si está vacío, se usa GITEA_USER (repo personal del usuario autenticado).
    owner="${GITEA_OWNER:-$GITEA_USER}"
    repo_name="${GITEA_REPO:-$(basename "$ROOT")}"
    echo "→ Verificando/creando repo $owner/$repo_name en Gitea..."
    # Si owner != user autenticado, asumimos que es una organización.
    if [[ "$owner" != "$GITEA_USER" ]]; then
      create_endpoint="$GITEA_URL/api/v1/orgs/$owner/repos"
    else
      create_endpoint="$GITEA_URL/api/v1/user/repos"
    fi
    curl -fsSL -X POST \
      -H "Authorization: token $GITEA_TOKEN" \
      -H "Content-Type: application/json" \
      "$create_endpoint" \
      -d "{\"name\":\"$repo_name\",\"description\":\"Pulso — entorno de live coding musical en TypeScript\",\"private\":false,\"auto_init\":false}" \
      >/dev/null 2>&1 || echo "  (ya existía o falló creación — continúo con push)"
    remote_url="${GITEA_URL%/}/$owner/$repo_name.git"
    auth_url="${GITEA_URL%/}"
    auth_url="${auth_url/http:\/\//http://$GITEA_USER:$GITEA_TOKEN@}"
    auth_url="${auth_url/https:\/\//https://$GITEA_USER:$GITEA_TOKEN@}"
    auth_url="$auth_url/$owner/$repo_name.git"
    git remote remove gitea 2>/dev/null || true
    git remote add gitea "$auth_url"
    git push -u gitea main
    git push gitea --tags
    git remote set-url gitea "$remote_url"
    echo "✓ Gitea: $remote_url"
    ;;

  push-github)
    # Push por SSH (no requiere token si tu SSH key ya está autorizada en GitHub).
    # Asume que el repo ya existe en github.com/$GITHUB_USER/$GITHUB_REPO.
    # Para crear via API si no existe, define GITHUB_TOKEN en .env.
    : "${GITHUB_USER:?Falta GITHUB_USER en .env}"
    repo_name="${GITHUB_REPO:-$(basename "$ROOT")}"
    if [[ -n "${GITHUB_TOKEN:-}" ]]; then
      echo "→ Verificando/creando repo $GITHUB_USER/$repo_name en GitHub (vía API)..."
      curl -fsSL -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"$repo_name\",\"description\":\"Pulso — entorno de live coding musical en TypeScript\",\"private\":false,\"auto_init\":false}" \
        >/dev/null 2>&1 || echo "  (ya existía o falló creación — continúo con push)"
    fi
    ssh_url="git@github.com:$GITHUB_USER/$repo_name.git"
    git remote remove github 2>/dev/null || true
    git remote remove origin 2>/dev/null || true
    git remote add origin "$ssh_url"
    git push -u origin main
    echo "✓ GitHub: https://github.com/$GITHUB_USER/$repo_name"
    ;;

  push-all)
    "$0" push-gitea
    "$0" push-github
    ;;

  help|*)
    sed -n '2,10p' "$0"
    ;;
esac
