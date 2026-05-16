# 01 · Empezar con Pulso

## Requisitos

- Bun ≥ 1.3 instalado en el servidor (`which bun` debe responder).
- Un navegador moderno con Web Audio (cualquier Chromium, Firefox o Safari de los últimos 5 años).

## Arranque

```bash
cd /home/felipe/pulso
cp .env.example .env   # opcional — sólo si vas a empujar a Gitea/GitHub
./manage.sh start
```

Verás un log:

```
pulso listening on http://0.0.0.0:4040 (dev=true)
```

## Acceso desde la red

| Desde | URL |
| --- | --- |
| Este mismo equipo | http://localhost:4040 |
| LAN (otros dispositivos en la red) | http://192.168.1.2:4040 |
| Tailscale | http://100.105.21.49:4040 |

Si tu firewall bloquea el puerto:

```bash
echo "$(cat ~/.sudo_pass)" | sudo -S ufw allow 4040/tcp
```

## Tu primer beat

Pega esto en el editor (ya viene cargado por defecto) y pulsa **Tocar** o `Ctrl+Enter`:

```ts
pulso()
  .bpm(120)
  .track('drums')
    .drum('kick').pattern('x...x...x...x...')
    .drum('snare').pattern('....x.......x...')
    .drum('hat').pattern('x.x.x.x.x.x.x.x.')
  .play();
```

Si no escuchas nada, la barra superior te dice *"Toca cualquier botón para activar el audio"* — así es como Web Audio te exige un gesto explícito antes de sonar (regla de iOS/Chrome).

## Lo que sigue

- [`02-dsl-reference.md`](./02-dsl-reference.md) — todas las funciones del DSL.
- [`03-examples.md`](./03-examples.md) — patches listos para tocar.
- [`06-notation-and-scales.md`](./06-notation-and-scales.md) — la notación bilingüe (DO/RE/MI o C/D/E).
- [`07-tracks-and-midi-export.md`](./07-tracks-and-midi-export.md) — multi-pistas y export MIDI/GBA.
