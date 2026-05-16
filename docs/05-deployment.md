# 05 · Despliegue y credenciales

## Variables de entorno

Copia `.env.example` a `.env` y rellena lo que necesites:

```bash
cp .env.example .env
nano .env
```

| Variable | Default | Para qué sirve |
| --- | --- | --- |
| `PORT` | `4000` | Puerto del servidor HTTP. |
| `HOST` | `0.0.0.0` | Interfaz de escucha. **Deja `0.0.0.0`** para que sea accesible desde tu LAN. |
| `DATA_DIR` | `./data` | Dónde se guardan los patches. |
| `GITEA_URL` | `http://192.168.1.2:3020` | Tu servidor Gitea local. |
| `GITEA_USER` | — | Tu usuario en Gitea. |
| `GITEA_TOKEN` | — | Token de aplicación de Gitea. |
| `GITHUB_USER` | `felipesuarez-dev` | Tu usuario en GitHub. |
| `GITHUB_TOKEN` | — | Personal Access Token de GitHub. |

## Generar token de Gitea

1. Abre http://192.168.1.2:3020 desde tu navegador.
2. Inicia sesión con tu usuario.
3. Avatar (arriba a la derecha) → **Settings** → **Applications**.
4. **Generate New Token**:
   - Nombre: `pulso-deploy`
   - Scopes: marca `write:repository` y `write:user`.
5. Copia el token (sólo se muestra una vez) y pégalo en `GITEA_TOKEN=` en tu `.env`.

## Generar token de GitHub

1. Ve a https://github.com/settings/tokens/new
2. Note: `pulso-deploy`
3. Scope: marca **`repo`** (todo el bloque).
4. Genera el token, cópialo y pégalo en `GITHUB_TOKEN=`.

## Subir el repo

```bash
./manage.sh push-gitea     # crea repo en Gitea + push
./manage.sh push-github    # crea repo en GitHub + push
./manage.sh push-all       # ambos
```

Los scripts crean el repo vía API si no existe, registran el remote con auth embebida, hacen `push`, y luego limpian el remote a la URL pública sin credenciales.

## Acceso desde otros dispositivos

Una vez corriendo:

```bash
./manage.sh start
```

Abre desde cualquier equipo en tu LAN:

- **LAN**: http://192.168.1.2:4000
- **Tailscale**: http://100.105.21.49:4000

## Firewall

Si `ufw` bloquea el puerto:

```bash
echo "$(cat ~/.sudo_pass)" | sudo -S ufw allow 4000/tcp
```

## Modo dev

```bash
./manage.sh dev
```

Equivalente a `bun --hot run backend/src/server.ts`. Reinicia el server al guardar cualquier `.ts` del backend. El bundle del frontend se recalcula al pedir `/bundle.js`.

## Build de producción

```bash
./manage.sh build
```

Genera `dist/bundle.js`, `dist/index.html` y `dist/styles.css`. Listos para servir como estáticos por nginx o el propio Bun.
