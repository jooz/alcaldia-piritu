import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solicitante, beneficiario, solicitud, datosEspecificos, recaudos } = body;

    // 1. Buscar o crear solicitante
    let solicitanteId: number;

    const existente = await prisma.$queryRawUnsafe(
      'SELECT id FROM solicitantes WHERE cedula = $1 LIMIT 1',
      solicitante.cedula
    ) as any[];

    if (existente.length > 0) {
      solicitanteId = existente[0].id;
      await prisma.$executeRawUnsafe(
        `UPDATE solicitantes SET
          nombre = $1, genero_id = $2, fecha_nacimiento = $3,
          telefono_habitacion = $4, telefono_movil = $5, email = $6,
          estado_civil_id = $7, condicion_especial_id = $8,
          municipio_id = $9, parroquia_id = $10, direccion = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12`,
        solicitante.nombre, solicitante.genero_id, solicitante.fecha_nacimiento,
        solicitante.telefono_habitacion || '', solicitante.telefono_movil || '', solicitante.email || '',
        solicitante.estado_civil_id || null, solicitante.condicion_especial_id,
        solicitante.municipio_id, solicitante.parroquia_id, solicitante.direccion,
        solicitanteId
      );
    } else {
      const nuevo = await prisma.$queryRawUnsafe(
        `INSERT INTO solicitantes (cedula, nombre, genero_id, fecha_nacimiento,
          telefono_habitacion, telefono_movil, email, estado_civil_id,
          condicion_especial_id, municipio_id, parroquia_id, direccion)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id`,
        solicitante.cedula, solicitante.nombre, solicitante.genero_id, solicitante.fecha_nacimiento,
        solicitante.telefono_habitacion || '', solicitante.telefono_movil || '', solicitante.email || '',
        solicitante.estado_civil_id || null, solicitante.condicion_especial_id,
        solicitante.municipio_id, solicitante.parroquia_id, solicitante.direccion
      ) as any[];
      solicitanteId = nuevo[0].id;
    }

    // 2. Crear solicitud
    const menor = beneficiario?.menor;
    const nuevaSolicitud = await prisma.$queryRawUnsafe(
      `INSERT INTO solicitudes (solicitante_id, solicitud_para, parentesco_id,
        menor_cedula, menor_nombre, menor_genero_id, menor_fecha_nacimiento,
        menor_condicion_especial_id, categoria_solicitud_id, tipo_ayuda_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id`,
      solicitanteId,
      beneficiario.tipo_solicitante,
      beneficiario.parentesco_id || null,
      menor?.cedula || '',
      menor?.nombre || '',
      menor?.genero_id || null,
      menor?.fecha_nacimiento || null,
      menor?.condicion_especial_id || null,
      solicitud.categoria_solicitud_id,
      solicitud.tipo_ayuda_id
    ) as any[];

    const solicitudId = nuevaSolicitud[0].id;

    // 3. Guardar datos específicos según categoría
    if (datosEspecificos?.tipo === 'educacion') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO solicitudes_educacion (solicitud_id, municipio_id, parroquia_id,
          tipo_institucion_id, institucion_id, uniformes)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        solicitudId,
        datosEspecificos.municipio_id,
        datosEspecificos.parroquia_id || null,
        datosEspecificos.tipo_institucion_id,
        datosEspecificos.institucion_id || null,
        JSON.stringify(datosEspecificos.uniformes || [])
      );
    } else if (datosEspecificos?.tipo === 'seguridad_alimentaria') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO solicitudes_seguridad_alimentaria
          (solicitud_id, nucleo_adultos, nucleo_menores_existe, nucleo_menores_cantidad,
           nucleo_discapacidad_existe, nucleo_discapacidad_cantidad)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        solicitudId,
        datosEspecificos.nucleo_adultos,
        datosEspecificos.nucleo_menores_existe,
        datosEspecificos.nucleo_menores_cantidad,
        datosEspecificos.nucleo_discapacidad_existe,
        datosEspecificos.nucleo_discapacidad_cantidad
      );
    } else if (datosEspecificos?.tipo === 'salud_tecnica') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO solicitudes_salud (solicitud_id, diagnostico, tipo_institucion_id, institucion_id, ayudas_tecnicas)
        VALUES ($1,$2,$3,$4,$5)`,
        solicitudId,
        datosEspecificos.diagnostico || '',
        datosEspecificos.tipo_institucion_id || null,
        datosEspecificos.institucion_id || null,
        JSON.stringify(datosEspecificos.ayudas_tecnicas || [])
      );
    } else if (datosEspecificos?.tipo === 'infraestructura') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO solicitudes_infraestructura (solicitud_id, tenencia_vivienda_id, tipo_afectacion_id, materiales)
        VALUES ($1,$2,$3,$4)`,
        solicitudId,
        datosEspecificos.tenencia_vivienda_id || null,
        datosEspecificos.tipo_afectacion_id || null,
        JSON.stringify(datosEspecificos.materiales || [])
      );
    }

    // 4. Guardar recaudos (con URLs de archivos)
    if (recaudos && recaudos.length > 0) {
      for (const rec of recaudos) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO solicitudes_recaudos (solicitud_id, requirement_id, file_name, file_path, checked)
          VALUES ($1,$2,$3,$4,$5)`,
          solicitudId,
          rec.requirementId,
          rec.fileName || '',
          rec.filePath || '',
          true
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitud registrada exitosamente',
      solicitudId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error guardando solicitud' },
      { status: 500 }
    );
  }
}
