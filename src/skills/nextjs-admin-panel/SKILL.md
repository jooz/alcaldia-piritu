---
name: nextjs-admin-panel
description: Skills for Next.js admin panels with Prisma ORM and Vercel deployment patterns
category: devops
trigger: "Use when building a Next.js administrative panel with Prisma ORM and deploying to Vercel. Provides patterns for schema design, API routes, UI, and deployment configuration."
---

# 📋 Plan de Desarrollo - Sistema Alcaldía de Piritú

Este documento sirve para llevar el control del progreso del desarrollo del módulo administrativo.

## 🛠️ Fase 1: Modelado de Datos (Prisma)
- [x] **Tarea 1.1: Modelar `HelpType` (Tipo de Ayuda)**
  - Crear modelo vinculado a `Category` (Relación 1:N).
  - Campos: `id`, `categoryId`, `name`, `active`, `creado`.
- [x] **Tarea 1.2: Modelar `AttentionArea` (Áreas de Atención)**
  - Crear modelo para Direcciones/Departamentos.
  - Campos: `id`, `name`, `description`, `active`, `creado`.
- [x] **Tarea 1.3: Modelar `Visitor` (Visitadores)**
  - Crear modelo vinculado a `AttentionArea` (Relación 1:N).
  - Campos: `id`, `areaId`, `name`, `phone`, `active`, `creado`.
- [x] **Tarea 1.4: Modelar `HelpRequirement` (Configuración Recaudos)**
  - Crear tabla intermedia para vincular `HelpType` con `Requirement` (Relación N:M).
- [x] **Tarea 1.5: Migración y Seed**
  - Ejecutar `npx prisma migrate dev` y actualizar base de datos.
  - **Nota**: Migración SQLite→PostgreSQL requiere `prisma migrate deploy` en producción.

## 🎨 Fase 2: Gestión de Categorías y Ayudas
- [x] **Tarea 2.1: Modal "Tipo de Ayuda"**
  - Crear componente Modal para agregar/editar subcategorías.
  - Implementar trigger desde la columna "Acción" de la tabla de Categorías.
- [x] **Tarea 2.2: API de Tipos de Ayuda**
  - Endpoints: `GET /api/categories/[id]/help-types`, `POST`, `PATCH`, `DELETE`.
- [x] **Tarea 2.3: Interfaz de Tipos de Ayuda**
  - Implementar la lista de ayudas dentro del modal o en pantalla dedicada.

## 🏢 Fase 3: Gestión de Áreas y Visitadores
- [x] **Tarea 3.1: Pantalla "Gestionar Áreas de Atención"**
  - Crear página con CRUD para Direcciones/Departamentos.
- [x] **Tarea 3.2: Modal "Visitadores"**
  - Crear componente Modal vinculado a cada Área de Atención.
  - Implementar trigger desde la columna "Acción" de Áreas de Atención.
- [x] **Tarea 3.3: API de Áreas y Visitadores**
  - Endpoints para CRUD de `AttentionArea` y `Visitor`.

## 📋 Fase 4: Configuración de Recaudos por Ayuda
- [x] **Tarea 4.1: Interfaz de Asignación de Recaudos**
  - Crear vista donde se seleccione un "Tipo de Ayuda" y se marquen los "Recaudos" obligatorios de la lista general.
- [x] **Tarea 4.2: API de Vinculación**
  - Endpoints para guardar la relación `HelpType` <-> `Requirement`.

## ✅ Fase 5: Verificación y QA
- [ ] **Tarea 5.1: Pruebas de Flujo Administrativo**
  - Validar: Categoría → Tipo de Ayuda → Recaudos.
  - Validar: Área → Visitador.
- [ ] **Tarea 5.2: Revisión de UI contra Diseños**
  - Comparar implementaciones con las imágenes en la carpeta `/diseño`.

---

## 📦 Soporte de Habilidades (Support Files)

### Referencias (`references/`)
- `references/prisma-migration.md` - Patrones de migración Prisma (SQLite→PostgreSQL)
- `references/vercel-deployment.md` - Consideraciones de despliegue en Vercel
- `references/.gitignore-nextjs.md` - Patrones de .gitignore para Next.js + Prisma

### Scripts (`scripts/`)
- `scripts/verify-prisma-schema.js` - Validación del schema Prisma antes de deploy
- `scripts/check-runtime.js` - Verificación del runtime (Node vs Edge) en producción

### Plantillas (`templates/`)
- `templates/vercel.json.node-runtime` - Plantilla `vercel.json` forzando Node.js runtime
- `templates/api-route-patterns.md` - Patrones comunes de API routes anidadas

---

## 🚀 Patrones Clave Emergentes

### 1. Problema Edge Runtime en Vercel
**Síntoma**: Error `CompressionStream`/`DecompressionStream` no soportado en Edge Runtime.
**Causa**: Next.js 15 usa Edge por defecto, pero `jose` y `@auth/core` requieren Node.js.
**Solución**: 
- Crear `vercel.json` con `"runtime": "node"` en API routes
- O configurar runtime manualmente en panel de Vercel
- O agregar `engines.node` en `package.json`

### 2. Prisma Client desactualizado en Vercel
**Síntoma**: `PrismaClientInitializationError: Prisma has detected that this project was built on Vercel, which caches dependencies.`
**Causa**: Vercel cachea dependencias pero no ejecuta `prisma generate`.
**Solución**:
- Agregar `prisma generate` al script de build en `package.json`
- O usar `vercel-build` hook para generar client durante el build
- Ejecutar `prisma generate` localmente antes de deploy

### 3. Configuración `.gitignore` para Next.js + Prisma
Archivos que **NUNCA** deben subirse:
```
/node_modules
/.next/
.env
.env*.local
prisma/dev.db
prisma/dev.db-journal
*.tsbuildinfo
next-env.d.ts
```

### 3. Patrones de API Routes Anidadas
Estructura recomendada:
```
api/
  categories/          - CRUD categorías
  categories/[id]/help-types/  - Nested: tipos de ayuda por categoría
  categories/[id]/help-types/[id]/requirements  - N:M relationship
  attention-areas/     - CRUD áreas
  attention-areas/[id]/visitors/  - Nested: visitadores por área
  requirements/        - CRUD recaudos base
  requirements/[id]    - Individual
```

### 4. Patrones de UI Anidadas
- Modal principal contiene tabla + formulario integrado (no "modal sobre modal")
- Separador visual (`borderTop`) entre lista y formulario
- `autoFocus` en campos de texto para agilizar entrada
- Botones de Cancelar/Guardar en `Stack direction="row" justifyContent="flex-end"`

---

## 📦 Estructura de Archivos Sugerida

```
src/
  skills/
    nextjs-admin-panel/
      SKILL.md              ← Este archivo
      references/
        prisma-migration.md
        vercel-deployment.md
        .gitignore-nextjs.md
      scripts/
        verify-prisma-schema.js
        check-runtime.js
      templates/
        vercel.json.node-runtime
        api-route-patterns.md
```

---

## 📝 Historial de Versiones

### v0.1.0 (2026-08-22)
- Release inicial con patrones extraídos de la sesión de desarrollo "Alcaldía de Piritú"
- Incluye patrones de Edge Runtime, Prisma desactualizado, .gitignore, API routes anidadas
---