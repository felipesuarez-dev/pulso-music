# Imagen Docker de Pulso — entorno de live coding musical
# Patrón GRUPO A: corre como felipe (uid 1000), expone 4040 interno
# (publicado en 4050 desde docker-compose). El bundle del frontend se
# genera on-the-fly por backend/src/lib/bundle.ts (cache por mtime).

FROM oven/bun:1.3.10-alpine

# Zona horaria coherente con el resto del servidor (resúmenes en docs-sv).
ENV TZ=America/Santiago \
    NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4040 \
    DATA_DIR=/app/data

WORKDIR /app

# Copiamos sólo lo que necesita el runtime. Los excluidos viven en .dockerignore.
COPY backend ./backend
COPY frontend ./frontend
COPY tsconfig.base.json ./
COPY CLAUDE.md README.md ./

# /app/data se monta como volumen desde el host (./data del compose). Lo creamos
# vacío en la imagen por si alguien arranca sin volumen, y aseguramos permisos
# para el usuario bun (uid 1000) que provee la imagen oficial.
RUN mkdir -p /app/data/patches && chown -R bun:bun /app

USER bun

EXPOSE 4040

# Healthcheck simple: cualquier 2xx/3xx en / cuenta como sano.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- --spider http://127.0.0.1:4040/ || exit 1

CMD ["bun", "run", "backend/src/server.ts"]
