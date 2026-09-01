import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Use PDF, JPG, PNG, WEBP o DOC/DOCX' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo de 5MB' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobName = `recaudos/${timestamp}_${safeName}`;

    const blob = await put(blobName, file, {
      access: 'public',
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      fileName: file.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error subiendo archivo' },
      { status: 500 }
    );
  }
}
