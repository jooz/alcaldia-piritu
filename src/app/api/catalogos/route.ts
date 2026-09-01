import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function safeQuery(label: string, queryFn: () => Promise<any>): Promise<any[]> {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`Error in query "${label}":`, error);
    return [];
  }
}

export async function GET() {
  try {
    const [
      generos,
      estadosCiviles,
      condicionesEspeciales,
      parentescos,
      tiposSolicitante,
      uniformes,
      tiposInstitucion,
      municipios,
      parroquias,
      categorias,
      instituciones,
      centrosMedicos,
      materialesConstruccion,
      tiposAyudaTecnica,
      clasificacionesEtarias,
      condicionesMovilidad,
      unidadesMedida,
    ] = await Promise.all([
      safeQuery('generos', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM generos ORDER BY id')),
      safeQuery('estadosCiviles', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM estados_civiles ORDER BY id')),
      safeQuery('condicionesEspeciales', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM condiciones_especiales ORDER BY id')),
      safeQuery('parentescos', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM parentescos ORDER BY id')),
      safeQuery('tiposSolicitante', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM tipos_solicitante ORDER BY id')),
      safeQuery('uniformes', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM uniformes ORDER BY id')),
      safeQuery('tiposInstitucion', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM tipos_institucion ORDER BY id')),
      safeQuery('municipios', () => prisma.$queryRawUnsafe('SELECT id, nombre, activo FROM municipios ORDER BY id')),
      safeQuery('parroquias', () => prisma.$queryRawUnsafe('SELECT id, nombre, municipio_id FROM parroquias ORDER BY id')),
      safeQuery('categorias', () => prisma.category.findMany({ orderBy: { id: 'asc' }, select: { id: true, name: true } })),
      safeQuery('instituciones', () => prisma.$queryRawUnsafe('SELECT id, nombre, tipo_institucion_id FROM instituciones ORDER BY id')),
      safeQuery('centrosMedicos', () => prisma.$queryRawUnsafe('SELECT id, nombre, tipo_institucion_id FROM centros_medicos ORDER BY id')),
      safeQuery('materialesConstruccion', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM materiales_construccion ORDER BY id')),
      safeQuery('tiposAyudaTecnica', () => prisma.$queryRawUnsafe(
        `SELECT id, nombre FROM tipos_ayuda WHERE categoria_solicitud_id = (SELECT id FROM "Category" WHERE name = 'Salud y Bienestar Médico' LIMIT 1) ORDER BY id`
      )),
      safeQuery('clasificacionesEtarias', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM clasificaciones_etarias ORDER BY id')),
      safeQuery('condicionesMovilidad', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM condiciones_movilidad ORDER BY id')),
      safeQuery('unidadesMedida', () => prisma.$queryRawUnsafe('SELECT id, nombre FROM unidades_medida ORDER BY id')),
    ]);

    return NextResponse.json({
      generos,
      estadosCiviles,
      condicionesEspeciales,
      parentescos,
      tiposSolicitante,
      uniformes,
      tiposInstitucion,
      municipios,
      parroquias,
      categorias,
      instituciones,
      centrosMedicos,
      materialesConstruccion,
      tiposAyudaTecnica,
      clasificacionesEtarias,
      condicionesMovilidad,
      unidadesMedida,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching catalogos' }, { status: 500 });
  }
}
