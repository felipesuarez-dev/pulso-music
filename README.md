# Pulso

Entorno de live coding musical en TypeScript. Sin npm, sin frameworks, sin samples.

## Quickstart

```bash
cp .env.example .env
./manage.sh start
```

Abre `http://192.168.1.2:4040` desde cualquier dispositivo en tu LAN.

## Características

- **API encadenable** para escribir música en TS
- **Notación bilingüe**: anglosajona (`C D E`) o latina/solfeo (`DO RE MI`), mezclables
- **Multi-pistas** con mixer (volumen, pan, mute, solo) por pista
- **Grid visual** de patrones sincronizada al editor
- **Helpers de escala** con grados (`.scale('Cm pent').notes("1 3 5")`)
- **Visualización** de waveform y espectro en tiempo real
- **Export MIDI** compatible con cualquier DAW y flujo GBA (vía OpenMPT → MOD/XM)
- **Sin dependencias externas**: solo Bun + Web APIs nativas

## Documentación

Toda la documentación del DSL y arquitectura está en [`docs/`](./docs/).

Empieza por [`docs/01-getting-started.md`](./docs/01-getting-started.md).
