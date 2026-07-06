# Cotizador PROMESA — Frontend

App web (Next.js 16) para generar cotizaciones de PROMESA / PROASA:
**Tienda**, **Guatecompras** (Carta de Garantía y Cotización), **Empresas** y
**Construcción de piscina**. Incluye login, vista previa en vivo, guardado,
exportación a PDF e impresión.

Los datos se guardan en el **backend** (`cotizador-backend`, API + PostgreSQL).

## Requisitos para correr

1. Tener el **backend** corriendo (ver su README): contenedor de PostgreSQL +
   `npm run dev`, escuchando en `http://localhost:4000`.

2. Crear `.env.local` con:

   ```dotenv
   APP_PASSWORD=cotizador2026
   SESSION_SECRET=<secreto largo y aleatorio para firmar la cookie>
   BACKEND_URL=http://localhost:4000
   ```

   `APP_PASSWORD` debe coincidir con la del backend (el frontend la usa para
   autenticarse contra la API).

3. Instalar y arrancar:

   ```bash
   npm install
   npm run dev
   ```

   App en `http://localhost:3000`. Ingresa con `APP_PASSWORD`.

## Estructura

- `app/login`, `proxy.ts`, `app/lib/session.ts` — autenticación y protección de rutas.
- `app/lib/api.ts` — cliente del backend.
- `app/lib/store-*.ts` — capa de datos (llama a la API).
- `app/components/editor-*.tsx` y `*-doc.tsx` — editores y documentos por tipo.
- `app/lib/pdf.ts` — exportación a PDF (una página y multipágina).
