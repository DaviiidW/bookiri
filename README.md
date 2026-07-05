# Bookiri

Bookiri es una aplicación de gestión de alquileres vacacionales (mini channel manager): permite a un anfitrión administrar varias viviendas, sus reservas, temporadas de precios y periodos de disponibilidad, y compartir calendarios públicos de solo lectura (por token) con visibilidad de precio opcional.

## Funcionalidades

- **Gestión de viviendas** (`Property`): alta de varias propiedades con nombre, color identificativo y capacidad máxima de huéspedes.
- **Calendario de reservas** (`Booking`): registro de reservas con fechas de entrada/salida, huéspedes (adultos/niños), precio total, depósito y estado de pago.
- **Temporadas de precio** (`Season`): rangos de fechas con precio por noche y estancia mínima, usados para calcular automáticamente el precio de una reserva por segmentos (`BookingPriceSegment`).
- **Periodos de disponibilidad** (`PropertyAvailabilityPeriod`): bloqueo o apertura de fechas por vivienda.
- **Enlaces públicos** (`SharedCalendar`): calendarios compartidos por token, sin autenticación, configurables por vista (mes/semana/lista/disponibilidad), con expiración opcional y visibilidad de precio (general o por temporada) mediante reglas propias (`SharedCalendarPriceRule`).
- **Autenticación**: login con email/contraseña (NextAuth v5, sesión JWT), rutas del dashboard protegidas por middleware.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) + TypeScript 5 (modo `strict`)
- [NextAuth v5 (beta)](https://authjs.dev) con proveedor `Credentials`, sesión JWT
- [Prisma 7](https://www.prisma.io) con `@prisma/adapter-pg` sobre PostgreSQL
- [Tailwind CSS v4](https://tailwindcss.com)
- `lucide-react` (iconos), `bcryptjs` (hashing de contraseñas)
- ESLint 9 (flat config)

## Requisitos previos

- Node.js 20 o superior
- PostgreSQL en ejecución (local o remoto)

## Configuración del entorno

1. Instala las dependencias (esto también genera el cliente de Prisma vía `postinstall`):

   ```bash
   npm install
   ```

2. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```bash
   DATABASE_URL=postgresql://usuario:password@localhost:5432/bookiri
   AUTH_SECRET=una_cadena_aleatoria_larga_y_secreta
   ```

   - `DATABASE_URL`: cadena de conexión a tu base de datos PostgreSQL.
   - `AUTH_SECRET`: clave usada por NextAuth para firmar los JWT de sesión. Puedes generar una con `npx auth secret` o con `openssl rand -hex 32`.

3. Aplica las migraciones de la base de datos (esto también ejecuta el seed automáticamente):

   ```bash
   npx prisma migrate dev
   ```

## Desarrollo

Arranca el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (requiere `build` previo) |
| `npm run lint` | Ejecuta ESLint |
| `npx prisma migrate dev` | Crea/aplica migraciones tras editar `prisma/schema.prisma` |
| `npx prisma studio` | Explorador visual de la base de datos |
| `npx tsx prisma/seed.ts` | Ejecuta el seed manualmente (también corre tras `migrate dev`) |

## Estructura del proyecto

```
app/
  dashboard/            Páginas privadas (calendario, viviendas, temporadas, cuenta, enlaces-públicos)
  api/                  Endpoints de API (route.ts) en inglés
  c/[token]/            Vista pública del calendario compartido (sin autenticación)
  generated/prisma/     Cliente de Prisma generado (no editar, ignorado por git)
components/             Componentes compartidos globales (header, sidebar)
lib/                    Lógica de dominio y utilidades de servidor (db, crypto, cálculo de precios, validadores)
prisma/
  schema.prisma         Modelo de datos (fuente de verdad)
  migrations/           Migraciones aplicadas (no editar manualmente)
  seed.ts               Datos de ejemplo
auth.ts / auth.config.ts / proxy.ts   Configuración de NextAuth y middleware de rutas protegidas
```

## Notas sobre el modelo de datos

- Los modelos `User`, `Property`, `Season` y `Booking` usan **soft delete** (campo `deletedAt`): nunca se eliminan filas, se marcan como borradas.
- El precio de una reserva se descompone en segmentos (`BookingPriceSegment`) según las temporadas (`Season`) que solapan sus fechas.
- Los calendarios públicos (`SharedCalendar`) se acceden por `token` único y pueden agrupar varias viviendas (`SharedCalendarProperty`), con reglas de precio propias e independientes de las temporadas privadas del anfitrión.
