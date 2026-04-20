import prisma from '../src/lib/db';
console.log('--- User Model Metadata ---');
// @ts-ignore
console.log(JSON.stringify(prisma._dmmf.modelMap.User.fields.map(f => f.name), null, 2));
console.log('--- Database Connection Check ---');
prisma.$connect().then(() => console.log('Connected')).catch(err => console.error('Connection Failed', err)).finally(() => process.exit());
