const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restore() {
    const backupFile = process.argv[2];
    if (!backupFile) {
        console.log('❌ Usage: node scripts/restore_db.js <path-to-json-backup>');
        process.exit(1);
    }

    if (!fs.existsSync(backupFile)) {
        console.log(`❌ Backup file not found: ${backupFile}`);
        process.exit(1);
    }

    console.log('🚀 Starting Data Restoration...');
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    // Order matters for FKs
    const models = [
        { name: 'platformPlan', lookup: 'id' },
        { name: 'club', lookup: 'id' },
        { name: 'user', lookup: 'id' },
        { name: 'court', lookup: 'id' },
        { name: 'client', lookup: 'id' },
        { name: 'product', lookup: 'id' },
        { name: 'teacher', lookup: 'id' },
        { name: 'booking', lookup: 'id' },
        { name: 'transaction', lookup: 'id' },
        { name: 'cashRegister', lookup: 'id' },
        { name: 'auditLog', lookup: 'id' },
        { name: 'membershipPlan', lookup: 'id' },
        { name: 'membership', lookup: 'id' }
    ];

    try {
        for (const modelDef of models) {
            const records = data[modelDef.name];
            if (!records || records.length === 0) {
                console.log(`→ Skipping ${modelDef.name} (no records)`);
                continue;
            }

            console.log(`📡 Restoring ${records.length} records for ${modelDef.name}...`);
            for (const record of records) {
                // Remove redundant fields that might cause issues if not in schema
                // (e.g. if we are restoring to a slightly different schema version)
                
                await prisma[modelDef.name].upsert({
                    where: { id: record.id },
                    update: record,
                    create: record
                });
            }
        }
        console.log('\n✅ Restoration complete!');
    } catch (error) {
        console.error('\n❌ Restoration failed:', error.message);
        if (error.code === 'P2002') console.log('   (Unique constraint violation error)');
    } finally {
        await prisma.$disconnect();
    }
}

restore();
