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

La entrada comun es `src/shared/infrastructure/api.service.js`. Cada contexto posee su servicio especializado y sus assemblers. Los endpoints quedan preparados con Axios y rutas simuladas bajo `/api/...`, listos para conectar con backend real.

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
