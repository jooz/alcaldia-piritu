# Patrones de Migración Prisma (SQLite → PostgreSQL)

## Migración Local (Desarrollo)

```bash
# 1. Crear y aplicar migración
npx prisma migrate dev --name "fase1_modelos_nuevos"

# 2. Para producción, usar migrate deploy
npx prisma migrate deploy
```

## Migración SQLite → PostgreSQL

### Paso 1: Actualizar schema.prisma
Cambiar el provider en `prisma/schema.prisma`:
```diff
- provider = "sqlite"
+ provider = "postgresql"
url = env("DATABASE_URL")
```

### Paso 2: Actualizar DATABASE_URL
En `.env` (nunca en el repositorio):
```
DATABASE_URL=postgresql://user:password@host:port/database?channel_binding=require&sslmode=require
```

### Paso 3: Ejecutar migración en producción
```bash
# En el entorno de producción (Vercel, etc.)
npx prisma migrate deploy
```

### Paso 4: Generar Prisma Client actualizado
```bash
npx prisma generate
```

### Advertencias Importantes

⚠️ **Nunca commitear `.env`** - Contiene credenciales de base de datos sensibles.

⚠️ **Nunca commitear `prisma/dev.db`** - Base de datos local de desarrollo.

⚠️ **Ejecutar `prisma generate`** después de cualquier cambio en el schema para actualizar el cliente.

⚠️ **En Vercel**: Agregar `prisma generate` al script de build en `package.json`:
```json
"scripts": {
  "build": "next build && prisma generate"
}
```

### Checklist de Migración

- [ ] Actualizar `prisma/schema.prisma` provider
- [ ] Actualizar `DATABASE_URL` en variables de entorno
- [ ] Ejecutar `npx prisma migrate dev` en desarrollo
- [ ] Ejecutar `npx prisma migrate deploy` en producción
- [ ] Ejecutar `npx prisma generate` después de cambios
- [ ] Verificar que `node_modules` y `.next/` estén en `.gitignore`
- [ ] Probar conexiones después de migrar