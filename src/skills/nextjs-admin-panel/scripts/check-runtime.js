#!/usr/bin/env node
/**
 * Runtime check script for Vercel deployment
 * 
 * Usage: node scripts/check-runtime.js
 * 
 * Verifies that the application will use Node.js runtime
 * and warns if Edge Runtime might be used.
 */

const fs = require('fs');
const path = require(path);

function check() {
  const issues = [];
  const warnings = [];
  
  // Check for vercel.json
  const vercelPath = path.resolve('./vercel.json');
  if (fs.existsSync(vercelPath)) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
      if (vercelConfig.functions) {
        const apiFunctions = Object.values(vercelConfig.functions).filter(f => 
          typeof f === 'object' && f.runtime
        );
        if (apiFunctions.some(f => f.runtime === 'node')) {
          console.log('✅ Runtime Node.js configurado en vercel.json');
        } else if (apiFunctions.length > 0) {
          warnings.push('⚠️ vercel.json tiene runtime definido pero no es "node"');
        } else {
          warnings.push('⚠️ vercel.json no tiene runtime configurado para API routes');
        }
      } else {
        warnings.push('⚠️ vercel.json sin configuración de functions');
      }
    } catch (e) {
      warnings.push('⚠️ Error parsing vercel.json: ' + e.message);
    }
  } else {
    warnings.push('ℹ️ No se encontró vercel.json - se usará la detección automática de Vercel');
  }
  
  // Check package.json engines
  const pkgPath = path.resolve('./package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.engines && pkg.engines.node) {
        console.log('✅ engines.node definido en package.json: ' + pkg.engines.node);
      } else {
        warnings.push('⚠️ No engines.node definido en package.json');
      }
    } catch (e) {
      warnings.push('⚠️ Error parsing package.json: ' + e.message);
    }
  }
  
  // Check for Edge Runtime warnings in code
  const srcDir = path.resolve('./src');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const file of files) {
      if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        const filePath = path.join(srcDir, file.name);
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('CompressionStream') || content.includes('DecompressionStream')) {
          warnings.push('⚠️ Archivo contiene Stream APIs de Node.js (pueden fallar en Edge Runtime)');
        }
      }
    }
  }
  
  printResults(warnings, issues);
}

function printResults(warnings, issues) {
  console.log('=== Verificación de Runtime ===');
  console.log('');
  
  if (issues.length > 0) {
    for (const issue of issues) {
      console.log('❌ ' + issue);
    }
  }
  
  if (warnings.length > 0) {
    for (const warning of warnings) {
      console.log('⚠️ ' + warning);
    }
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ No hay advertencias - runtime parecerá correcto');
  }
  
  console.log('');
  if (warnings.some(w => w.includes('No se encontró vercel.json'))) {
    console.log('💡 Recomendación: Crear vercel.json con runtime "node" para APIs');
  }
  
  console.log('');
  process.exit(0);
}

check();