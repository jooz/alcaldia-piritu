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
