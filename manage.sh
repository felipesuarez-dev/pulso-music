#!/usr/bin/env bash
# manage.sh — entrypoint de scripts de Pulso
# Uso: ./manage.sh <subcomando>
#   start       arranca el servidor
#   dev         arranca el servidor con --hot reload
#   build       genera bundle del frontend a disco
#   push-gitea  crea repo en Gitea + push
#   push-github crea repo en GitHub + push
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
    repo_name="$(basename "$ROOT")"
    echo "Creando repo $GITEA_USER/$repo_name en Gitea..."
    curl -fsSL -X POST \
      -H "Authorization: token $GITEA_TOKEN" \
      -H "Content-Type: application/json" \
      "$GITEA_URL/api/v1/user/repos" \
      -d "{\"name\":\"$repo_name\",\"description\":\"Pulso — entorno de live coding musical en TypeScript\",\"private\":false,\"auto_init\":false}" \
      || echo "(quizás ya existe — continúo)"
    remote_url="${GITEA_URL%/}/$GITEA_USER/$repo_name.git"
    auth_url="${GITEA_URL%/}"
    auth_url="${auth_url/http:\/\//http://$GITEA_USER:$GITEA_TOKEN@}"
    auth_url="${auth_url/https:\/\//https://$GITEA_USER:$GITEA_TOKEN@}"
    auth_url="$auth_url/$GITEA_USER/$repo_name.git"
    git remote remove gitea 2>/dev/null || true
    git remote add gitea "$auth_url"
    git push -u gitea main
    git remote set-url gitea "$remote_url"
    echo "Listo: $remote_url"
    ;;

  push-github)
    : "${GITHUB_USER:?Falta GITHUB_USER en .env}"
    : "${GITHUB_TOKEN:?Falta GITHUB_TOKEN en .env}"
    repo_name="$(basename "$ROOT")"
    echo "Creando repo $GITHUB_USER/$repo_name en GitHub..."
    curl -fsSL -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      https://api.github.com/user/repos \
      -d "{\"name\":\"$repo_name\",\"description\":\"Pulso — entorno de live coding musical en TypeScript\",\"private\":false,\"auto_init\":false}" \
      || echo "(quizás ya existe — continúo)"
    auth_url="https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$repo_name.git"
    plain_url="https://github.com/$GITHUB_USER/$repo_name.git"
    git remote remove github 2>/dev/null || true
    git remote add github "$auth_url"
    git push -u github main
    git remote set-url github "$plain_url"
    echo "Listo: $plain_url"
    ;;

  push-all)
    "$0" push-gitea
    "$0" push-github
    ;;

  help|*)
    sed -n '2,10p' "$0"
    ;;
esac
