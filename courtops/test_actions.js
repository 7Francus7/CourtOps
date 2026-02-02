const { getTurneroData } = require('./src/actions/dashboard');
const { getDailyFinancials } = require('./src/actions/finance');

// Mock getCurrentClubId to return Fabricio's club
const tenant = require('./src/lib/tenant');
const original = tenant.getCurrentClubId;
tenant.getCurrentClubId = async () => '5fa570c7-a12e-46bc-ab4d-2a1375dc749d';

async function test() {
       console.log("Testing getTurneroData...");
       const t = await getTurneroData(new Date().toISOString());
       console.log("Turnero Success:", t.success);
       if (!t.success) console.log("Error:", t.error);
       console.log("Courts found:", t.courts.length);

       console.log("\nTesting getDailyFinancials...");
       const f = await getDailyFinancials(new Date());
       console.log("Financials Success:", f.success);
       if (!f.success) console.log("Error:", f.error);
}

test().catch(console.error).finally(() => {
       tenant.getCurrentClubId = original;
});
