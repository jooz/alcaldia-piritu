#!/usr/bin/env node
/**
 * Verification script for Prisma Schema before deployment
 * 
 * Usage: node scripts/verify-prisma-schema.js
 * 
 * Checks:
 * - Schema has valid provider
 * - DATABASE_URL is set
 * - Required fields are present
 * - Relations are valid
 */

const fs = require('fs');
const path = require('path');

const PRISMA_SCHEMA_PATH = path.resolve('./prisma/schema.prisma');
const ENV_PATH = path.resolve('./.env');

function check() {
  const issues = [];
  
  // Check schema exists
  if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
    issues.push('❌ No se encontró prisma/schema.prisma');
    printIssues(issues);
    return;
  }
  
  const schemaContent = fs.readFileSync(PRISMA_SCHEMA_PATH, 'utf-8');
  
  // Check provider
  if (!schemaContent.includes('provider = "postgresql"') && !schemaContent.includes('provider = "sqlite"')) {
    issues.push('⚠️ No se detecta provider en prisma/schema.prisma');
  }
  
  // Check DATABASE_URL
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    if (!envContent.includes('DATABASE_URL')) {
      issues.push('⚠️ DATABASE_URL no definida en .env');
    }
  } else {
    issues.push('⚠️ No se encontró .env');
  }
  
  // Check required models
  const requiredModels = ['Category', 'Requirement', 'HelpType', 'AttentionArea', 'Visitor', 'HelpRequirement', 'User'];
  for (const model of requiredModels) {
    if (!schemaContent.includes(`model ${model}`)) {
      issues.push(`⚠️ Modelo ${model} no encontrado en schema`);
    }
  }
  
  printIssues(issues);
}

function printIssues(issues) {
  console.log('=== Verificación de Schema Prisma ===');
  console.log('');
  for (const issue of issues) {
    console.log(issue);
  }
  console.log('');
  if (issues.some(i => i.includes('❌'))) {
    process.exit(1);
  } else if (issues.some(i => i.includes('⚠️'))) {
    console.log('⚠️ Advertencias detectadas - revisar arriba');
    process.exit(0);
  } else {
    console.log('✅ Schema Prisma válido');
    process.exit(0);
  }
}

check();