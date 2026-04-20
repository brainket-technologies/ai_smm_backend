import { PrismaClient } from '../src/lib/db';
console.log('--- Prisma Integration Diagnostic ---');
try {
  const prisma = new (require('../src/lib/db').default.constructor)();
  // @ts-ignore
  const clientPath = require.resolve('@prisma/client');
  console.log('Standard @prisma/client path:', clientPath);
  
  // @ts-ignore
  const internalPath = require.resolve('.prisma/client');
  console.log('Internal .prisma/client path:', internalPath);
  
  // Try to find the file from the constructor
  console.log('Prisma instance fields:', Object.keys(prisma.user));
} catch (e) {
  console.log('Diagnostic error:', e.message);
}
process.exit();
