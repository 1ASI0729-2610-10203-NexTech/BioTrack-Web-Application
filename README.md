# BioTrack TF Web App

Base frontend en Vue 3 + JavaScript + Vite para BioTrack, organizada con una arquitectura DDD por bounded context. La estructura toma la idea de separar dominio, aplicacion, infraestructura y presentacion dentro de cada capacidad del negocio.

## Stack

- Vue 3 con Composition API
- Vite
- Vue Router
- Pinia
- Axios
- vue-i18n

## Estructura

```text
src/
  shared/
    domain/
    infrastructure/
    presentation/
  identity-access/
  patient-profile/
  corporate-management/
  nutritional-planning/
  progress-tracking/
  subscriptions-billing/
  router/
  locales/
  assets/
```

Cada bounded context contiene:

- `domain/model`: entidades, value objects y reglas invariantes.
- `application`: stores de Pinia y orquestacion de casos de uso simples.
- `infrastructure`: servicios Axios y assemblers para traducir JSON de API a dominio.
- `presentation`: componentes y paginas Vue sin reglas de negocio embebidas.

## Reglas de negocio reflejadas

- `identity-access`: account type controlado, token de verificacion por 24 horas y sesiones con `jwt_jti`.
- `patient-profile`: calculo de IMC, validaciones de rangos y evento `PatientProfileCompleted`.
- `corporate-management`: validacion de RUC, anonimato minimo y exposicion agregada de metricas.
- `nutritional-planning`: evaluacion inicial obligatoria, macros al 100%, estados de plan y observacion de rechazo.
- `progress-tracking`: adherencia calculada, alertas bajo 60%, no repeticion por periodo y restriccion de reporte PDF.
- `subscriptions-billing`: B2C/B2B, ultimos 4 digitos de tarjeta, control de licencias y suspension/reactivacion.

## Rutas

- `/login`
- `/register`
- `/patient-profile`
- `/corporate-dashboard`
- `/nutritional-planning`
- `/progress-tracking`
- `/subscriptions-billing`

## Servicios HTTP

La entrada comun es `src/shared/infrastructure/api.service.js`. La configuracion de entorno se centraliza en `src/config/env.js`, usando variables `VITE_*` para resolver `baseURL`, timeout y modo de ejecucion sin hardcodear URLs en componentes.

## Environment Configuration

BioTrack usa archivos `.env` de Vite para separar desarrollo y produccion:

- `.env`: valores base seguros para desarrollo.
- `.env.development`: backend local con JSON Server.
- `.env.production`: backend publico o URL ngrok para GitHub Pages.
- `.env.example`: plantilla documentada para el equipo.

Desarrollo local:

```bash
npm run dev:full
```

Produccion:

```bash
npm run build
```

Antes de desplegar en GitHub Pages, actualiza `VITE_API_BASE_URL` en `.env.production` con el backend publico real.

La documentacion formal de Software Configuration Management esta en:

- `docs/software-configuration-management.md`

## Comandos

```bash
npm run dev
npm run build
```

## Convenciones

- Archivos en kebab-case.
- Clases en PascalCase.
- Funciones en camelCase.
- JavaScript puro, sin TypeScript.
- Componentes Vue delgados, sin HTTP directo ni reglas de dominio.
