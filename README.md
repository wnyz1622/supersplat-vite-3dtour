# SuperSplat Vite Project

This project was exported from SuperSplat with the splat files included in `public/splat`.

The included splat asset files are licensed separately. See `SPLAT-LICENSE.txt` for attribution, source, and license terms.

## Camera

The initial camera pose lives in `src/splat-config.ts` (`CAMERA_POSE`) and is taken from the scene settings authored in SuperSplat. When it is `null`, the app auto-frames the splat from its bounding box instead. Edit or remove it to change the starting view.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
