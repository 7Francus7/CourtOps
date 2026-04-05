const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
    console.log('🚀 Starting Data Backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    const data = {};

    // List of models to backup (order matters for restoration, but here we just export)
    const models = [
        'platformPlan',
        'club',
        'user',
        'court',
        'client',
        'product',
        'booking',
        'transaction',
        'cashRegister',
        'auditLog',
        'membershipPlan',
        'membership',
        'teacher'
    ];

    try {
        for (const model of models) {
            console.log(`- Exporting ${model}...`);
            data[model] = await prisma[model].findMany();
        }

        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        console.log(`\n✅ Backup completed successfully!`);
        console.log(`📂 File: ${backupFile}`);
        
        // Stats
        console.log('\nStats:');
        for (const model of models) {
            console.log(`- ${model}: ${data[model].length} records`);
        }

    } catch (error) {
        console.error('\n❌ Backup failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

backup();
