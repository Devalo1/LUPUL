// Test REAL pe platforma live - verific ce se întâmplă în production
console.log('=== TEST REAL PLATFORMA LIVE lupulsicorbul.com ===\n');

async function testRealProductionBehavior() {
    try {
        console.log('🌐 Testez comportamentul real pe lupulsicorbul.com...');
        
        // Test cu payload minimal - las frontend-ul să decidă live/sandbox
        const realPayload = {
            orderId: 'PRODUCTION_TEST_' + Date.now(),
            amount: 1.00,
            currency: 'RON',
            orderDescription: 'Test production real',
            customerInfo: {
                email: 'test@production.com',
                firstName: 'Production',
                lastName: 'Test'
            }
        };

        console.log('📤 Trimit request către platforma LIVE...');
        console.log('Payload:', JSON.stringify(realPayload, null, 2));

        const response = await fetch('https://lupulsicorbul.com/.netlify/functions/netopia-v2-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://lupulsicorbul.com',
                'Referer': 'https://lupulsicorbul.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify(realPayload)
        });

        console.log('📥 Răspuns primit:');
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ EROARE:', errorText);
            return;
        }

        const result = await response.json();
        console.log('\n📋 Răspuns complet:');
        console.log(JSON.stringify(result, null, 2));

        console.log('\n=== ANALIZA REZULTAT ===');
        console.log(`Environment detectat de backend: ${result.environment}`);
        console.log(`URL generat: ${result.paymentUrl}`);
        
        if (result.paymentUrl) {
            if (result.paymentUrl.includes('secure.netopia-payments.com')) {
                console.log('\n🎉 SUCCESS! LIVE MODE CONFIRMAT!');
                console.log('✅ Backend folosește endpoint-ul LIVE');
                console.log('✅ Plățile vor fi procesate REAL');
                console.log('✅ URL: LIVE production');
            } else if (result.paymentUrl.includes('secure-sandbox.netopia-payments.com')) {
                console.log('\n⚠️ SANDBOX MODE ACTIV');
                console.log('❓ Backend folosește endpoint-ul sandbox');
                console.log('❓ Plățile sunt în modul de testare');
                console.log('❓ Posibilă problemă cu detecția environment-ului');
            }

            console.log('\n🔍 Analiza detaliată URL:');
            const url = new URL(result.paymentUrl);
            console.log(`Host: ${url.hostname}`);
            console.log(`Path: ${url.pathname}`);
            console.log(`Params: ${url.search}`);
        }

        console.log('\n📊 Status final:');
        console.log(`- API Version: ${result.apiVersion}`);
        console.log(`- Order ID: ${result.orderId}`);
        console.log(`- Amount: ${result.amount} ${result.currency}`);
        console.log(`- Status: ${result.status}`);
        console.log(`- NTP ID: ${result.ntpID}`);
        
        if (result.errorCode) {
            console.log(`- Error Code: ${result.errorCode} (${result.errorMessage})`);
            if (result.errorCode === "101") {
                console.log('  ℹ️ Code 101 = Normal redirect (OK)');
            }
        }

    } catch (error) {
        console.log('❌ EROARE în test:', error.message);
        console.log('Stack:', error.stack);
    }
}

console.log('Acest test verifică comportamentul REAL al platformei în producție.');
console.log('Spre deosebire de testele locale, acesta testează serverul live.\n');

testRealProductionBehavior();
