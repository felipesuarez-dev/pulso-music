# 05 · Despliegue y credenciales

## Variables de entorno

Copia `.env.example` a `.env` y rellena lo que necesites:

```bash
cp .env.example .env
nano .env
```

| Variable | Default | Para qué sirve |
| --- | --- | --- |
| `PORT` | `4040` | Puerto del servidor HTTP. (4000 ya lo usa code-server.) |
| `HOST` | `0.0.0.0` | Interfaz de escucha. **Deja `0.0.0.0`** para que sea accesible desde tu LAN. |
| `DATA_DIR` | `./data` | Dónde se guardan los patches. |
| `GITEA_URL` | `http://192.168.1.2:3020` | Tu servidor Gitea local. |
| `GITEA_USER` | — | Tu usuario en Gitea. |
| `GITEA_TOKEN` | — | Token de aplicación de Gitea. |
| `GITHUB_USER` | `felipesuarez-dev` | Tu usuario en GitHub. |
| `GITHUB_REPO` | `pulso-music` | Nombre del repo en GitHub. |
| `GITHUB_TOKEN` | (opcional) | PAT — sólo si quieres CREAR el repo via API. Si ya existe, push va por SSH y NO se necesita. |
| `GITEA_REPO` | `pulso` | Nombre del repo en Gitea. |

## Generar token de Gitea

1. Abre http://192.168.1.2:3020 desde tu navegador.
2. Inicia sesión con tu usuario.
3. Avatar (arriba a la derecha) → **Settings** → **Applications**.
4. **Generate New Token**:
   - Nombre: `pulso-deploy`
   - Scopes: marca `write:repository` y `write:user`.
5. Copia el token (sólo se muestra una vez) y pégalo en `GITEA_TOKEN=` en tu `.env`.

## GitHub vía SSH (recomendado)

Si tu clave SSH (`~/.ssh/id_ed25519.pub`) ya está añadida a GitHub (Settings → SSH and GPG keys), `./manage.sh push-github` empuja por SSH sin necesidad de token. Verifica con:

```bash
ssh -T git@github.com
# Hi <tu-usuario>! You've successfully authenticated...
```

## (Opcional) Generar token de GitHub

Sólo si quieres que `manage.sh` **cree** el repo automáticamente cuando no existe:

1. Ve a https://github.com/settings/tokens/new
2. Note: `pulso-deploy`
3. Scope: marca **`repo`**.
4. Genera el token, cópialo, pégalo en `GITHUB_TOKEN=`.

Si dejas `GITHUB_TOKEN` vacío, debes crear el repo a mano en https://github.com/new antes de hacer `push-github`.

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

- **LAN**: http://192.168.1.2:4040
- **Tailscale**: http://100.105.21.49:4040

## Firewall

Si `ufw` bloquea el puerto:

```bash
echo "$(cat ~/.sudo_pass)" | sudo -S ufw allow 4040/tcp
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
