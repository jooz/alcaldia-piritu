# Consideraciones de Despliegue en Vercel

## Problemas Comunes y Soluciones

### 1. Edge Runtime vs Node.js

**Error**: `A Node.js API is used (CompressionStream at line: 10) which is not supported in the Edge Runtime.`

**Causa**: Next.js 15 usa Edge Runtime por defecto, pero librerías como `jose` y `@auth/core` requieren Node.js.

**Soluciones**:

#### Opción A: `vercel.json` (no compatible con CLI v59.3.0)
```json
{
  "framework": "nextjs",
  "functions": {
    "api/(.*)": {
      "runtime": "node"
    }
  }
}
```
⚠️ **Problema**: CLI v59.3.0 lanza `Error: Function Runtimes must have a valid version`

#### Opción B: Panel de Vercel (Recomendada)
1. Ir a Vercel Dashboard → Settings
2. Runtime family: cambiar de "Edge" a "Node.js"
3. Redeployar

#### Opción C: `package.json`
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Prisma Client Desactualizado

**Error**: `PrismaClientInitializationError: Prisma has detected that this project was built on Vercel, which caches dependencies.`

**Causa**: Vercel cachea las dependencias del build pero no ejecuta `prisma generate`.

**Soluciones**:

#### Opción A: Agregar a package.json
```json
{
  "scripts": {
    "build": "next build && prisma generate"
  }
}
```

#### Opción B: Variables de Entorno en Vercel
Agregar a Settings → Environment Variables:
- `PRISMA_QUERY_ENGINE_SKIP_GENERATE_API`: `1` (para saltar la verificación)

#### Opción C: CLI Flag
```bash
npx vercel build --prisma-generate
```

### 3. .gitignore para Next.js + Prisma

Archivos que **NUNCA** deben subirse al repositorio:
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

✅ **Sí commitear**:
- `prisma/schema.prisma` - Definición del esquema
- `prisma/seed.mjs` - Datos de prueba
- `prisma/migrations/` - Histórico de migraciones

### 4. Patrones de API Routes

**Estructura recomendada para recursos anidados**:

```
api/
  categories/                           - CRUD categorías
  categories/[id]/help-types/           - Tipos de ayuda por categoría
  categories/[id]/help-types/[id]/      - Individual tipo de ayuda
    requirements/                       - Relaciones N:M
  attention-areas/                      - CRUD áreas
  attention-areas/[id]/visitors/        - Visitadores por área
  requirements/                         - CRUD recaudos base
  requirements/[id]                     - Individual recaudo
```

### 5. Configuración Prisma en Vercel

**Verificar** que `DATABASE_URL` esté configurada en:
- Vercel Dashboard → Settings → Environment Variables

**Formato completo** (ejemplo Neon.tech):
```
postgresql://neondb_owner:npg_gXNLdK8epz9J@ep-dry-pine-auxq0bif-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

---

## 📋 Checklist de Despliegue Vercel

Antes de hacer deploy:

- [ ] `DATABASE_URL` configurada en variables de entorno
- [ ] `prisma/schema.prisma` actualizado (provider correcto)
- [ ] `.gitignore` incluye `/node_modules`, `/ .next/`, `.env`, `prisma/dev.db`
- [ ] Script de build incluye `prisma generate` (opcional, Opción A de arriba)
- [ ] Runtime configurado en panel de Vercel (Node.js vs Edge)
- [ ] API routes probadas localmente (`npm run dev`)
- [ ] `npm run build` completa exitosamente localmente

Después del deploy:

- [ ] Verificar que la aplicación cargue sin errores de runtime
- [ ] Probar APIs críticas (autenticación, CRUD básico)
- [ ] Verificar que la base de datos se conecte correctamente
- [ ] Revisar logs de Vercel en busca de warnings