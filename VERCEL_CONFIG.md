# Configuracion para Vercel

## Middleware desplegado

El front consume el middleware desplegado en:

`https://middlewarebusapi-b4dxgnfkfvbwa9ge.brazilsouth-01.azurewebsites.net`

La URL `/swagger/index.html` es solo la interfaz de documentacion, no la base para las llamadas del front.

## Proxy del front

No configures `VITE_MIDDLEWARE_BASE_URL` ni `VITE_API_URL` salvo que el middleware tenga CORS habilitado para el dominio del front.

El archivo `vercel.json` ya proxya:

`/api/*` -> `https://middlewarebusapi-b4dxgnfkfvbwa9ge.brazilsouth-01.azurewebsites.net/api/*`

Asi el navegador llama al mismo origen del front y Vercel reenvia al middleware.

## Redeploy

Luego de guardar:

1. Ve a **Deployments**.
2. Selecciona el ultimo deployment.
3. Haz clic en los tres puntos (...) y elige **Redeploy**.

## Desarrollo local

No necesitas `.env.local`. `vite.config.js` ya proxya `/api` al middleware desplegado.

```bash
npm run dev
```

## Si usas URL directa y aparece CORS

Si defines `VITE_MIDDLEWARE_BASE_URL` o `VITE_API_URL`, el navegador llamara directo a Azure y puede fallar por CORS. En ese caso, habilita CORS en el middleware desplegado o vuelve al proxy `/api`.
