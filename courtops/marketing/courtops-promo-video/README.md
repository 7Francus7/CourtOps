# CourtOps Promo Video

Vertical 9:16 promotional video source for CourtOps.

## Output

- Duration: 42 seconds
- Size: 1080 x 1920
- Format target: MP4
- Source preview: `index.html`
- Render script: `scripts/render-video.mjs`

## Render

From this directory:

```powershell
npm install
npm run audio
npm run render
```

The final file is written to:

```text
renders/courtops-promo.mp4
```

If `ffmpeg` is not installed globally, the script uses the local `ffmpeg-static` package.

## Social Caption

¿Todavía manejás tu club con cuaderno o WhatsApp?
Estás perdiendo tiempo y plata sin darte cuenta.

Con CourtOps tenés:
- Agenda automática
- Gestión de clientes
- Reportes claros
- Todo en un solo lugar

Empezá a ordenar tu club hoy.
Escribime y te muestro cómo funciona.
