try {
  console.log('@prisma/client:', require.resolve('@prisma/client'));
} catch (e) { console.log('@prisma/client: NOT RESOLVED'); }

try {
  console.log('.prisma/client:', require.resolve('.prisma/client'));
} catch (e) { console.log('.prisma/client: NOT RESOLVED'); }

try {
  // @ts-ignore
  const pkg = require('.prisma/client/package.json');
  console.log('.prisma/client version:', pkg.version);
} catch (e) {}

process.exit();
