// ============================================
// Script para verificar credenciales de X API
// ============================================

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Cargar variables de entorno
dotenv.config();

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const USER_ID = process.env.TWITTER_USER_ID;

console.log('🔍 Verificando credenciales de X API...\n');

// Verificar que existan las credenciales
if (!BEARER_TOKEN || BEARER_TOKEN === 'TU_BEARER_TOKEN_AQUI') {
    console.error('❌ Bearer Token no configurado en .env');
    process.exit(1);
}

if (!USER_ID || USER_ID === 'TU_USER_ID_AQUI') {
    console.error('❌ User ID no configurado en .env');
    process.exit(1);
}

console.log(`✅ Bearer Token encontrado (${BEARER_TOKEN.substring(0, 20)}...)`);
console.log(`✅ User ID: ${USER_ID}\n`);

// Verificar el Bearer Token con la API
async function verifyToken() {
    try {
        console.log('📡 Verificando Bearer Token con la API...');
        
        const response = await fetch('https://api.x.com/2/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const rateLimitLimit = response.headers.get('x-rate-limit-limit');
        const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
        const rateLimitReset = response.headers.get('x-rate-limit-reset');

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Bearer Token VÁLIDO\n');
            console.log('👤 Tu cuenta de X:');
            console.log(`   - ID: ${data.data.id}`);
            console.log(`   - Username: @${data.data.username}`);
            console.log(`   - Nombre: ${data.data.name}\n`);
        } else {
            const error = await response.text();
            console.error('❌ Bearer Token INVÁLIDO o error:');
            console.error(`   Status: ${response.status}`);
            console.error(`   Error: ${error}\n`);
        }

        console.log('📊 Rate Limits para /users/me:');
        console.log(`   - Límite total: ${rateLimitLimit || 'N/A'}`);
        console.log(`   - Requests restantes: ${rateLimitRemaining || 'N/A'}`);
        if (rateLimitReset) {
            const resetDate = new Date(parseInt(rateLimitReset) * 1000);
            console.log(`   - Se resetea: ${resetDate.toLocaleString('es-ES')}\n`);
        }

    } catch (error) {
        console.error('❌ Error al verificar token:', error.message);
    }
}

// Verificar el User ID
async function verifyUserId() {
    try {
        console.log(`📡 Verificando User ID ${USER_ID}...`);
        
        const url = `https://api.x.com/2/users/${USER_ID}?user.fields=id,name,username,public_metrics`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const rateLimitLimit = response.headers.get('x-rate-limit-limit');
        const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
        const rateLimitReset = response.headers.get('x-rate-limit-reset');

        if (response.ok) {
            const data = await response.json();
            console.log('✅ User ID VÁLIDO\n');
            console.log('👤 Información del usuario:');
            console.log(`   - ID: ${data.data.id}`);
            console.log(`   - Username: @${data.data.username}`);
            console.log(`   - Nombre: ${data.data.name}`);
            if (data.data.public_metrics) {
                console.log(`   - Seguidores: ${data.data.public_metrics.followers_count}`);
                console.log(`   - Siguiendo: ${data.data.public_metrics.following_count}`);
                console.log(`   - Tweets: ${data.data.public_metrics.tweet_count}\n`);
            }
        } else {
            const error = await response.text();
            console.error('❌ User ID INVÁLIDO o error:');
            console.error(`   Status: ${response.status}`);
            console.error(`   Error: ${error}\n`);
        }

        console.log('📊 Rate Limits para /users/:id:');
        console.log(`   - Límite total: ${rateLimitLimit || 'N/A'}`);
        console.log(`   - Requests restantes: ${rateLimitRemaining || 'N/A'}`);
        if (rateLimitReset) {
            const resetDate = new Date(parseInt(rateLimitReset) * 1000);
            console.log(`   - Se resetea: ${resetDate.toLocaleString('es-ES')}\n`);
        }

    } catch (error) {
        console.error('❌ Error al verificar User ID:', error.message);
    }
}

// Verificar rate limits del endpoint de tweets
async function checkTweetsEndpoint() {
    try {
        console.log(`📡 Verificando endpoint de tweets para User ID ${USER_ID}...`);
        
        const params = new URLSearchParams({
            'max_results': '5',
            'tweet.fields': 'id',
            'user.fields': 'id'
        });
        
        const url = `https://api.x.com/2/users/${USER_ID}/tweets?${params}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const rateLimitLimit = response.headers.get('x-rate-limit-limit');
        const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
        const rateLimitReset = response.headers.get('x-rate-limit-reset');

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Endpoint funciona correctamente`);
            console.log(`   - Tweets encontrados: ${data.data?.length || 0}\n`);
        } else {
            const error = await response.text();
            console.error('❌ Error en endpoint de tweets:');
            console.error(`   Status: ${response.status}`);
            console.error(`   Error: ${error}\n`);
            
            if (response.status === 429) {
                console.error('⚠️  ERROR 429: Too Many Requests');
                console.error('   Has excedido el límite de peticiones.');
                console.error('   En tier FREE: solo 1 request cada 15 minutos\n');
            }
        }

        console.log('📊 Rate Limits para /users/:id/tweets (ENDPOINT PRINCIPAL):');
        console.log(`   - Límite total: ${rateLimitLimit || 'N/A'} requests / 15 minutos`);
        console.log(`   - Requests restantes: ${rateLimitRemaining || 'N/A'}`);
        if (rateLimitReset) {
            const resetDate = new Date(parseInt(rateLimitReset) * 1000);
            const minutesUntilReset = Math.ceil((resetDate - new Date()) / 1000 / 60);
            console.log(`   - Se resetea: ${resetDate.toLocaleString('es-ES')} (en ${minutesUntilReset} minutos)\n`);
        }

        // Análisis del tier
        if (rateLimitLimit) {
            const limit = parseInt(rateLimitLimit);
            if (limit === 1) {
                console.log('⚠️  TIER DETECTADO: FREE');
                console.log('   - Solo 1 request cada 15 minutos');
                console.log('   - Usa caché agresivamente');
                console.log('   - Considera actualizar a Basic ($100/mes) para 10 req/15min\n');
            } else if (limit === 10) {
                console.log('✅ TIER DETECTADO: Basic');
                console.log('   - 10 requests cada 15 minutos\n');
            } else if (limit >= 1500) {
                console.log('✅ TIER DETECTADO: Pro o superior');
                console.log('   - 1500+ requests cada 15 minutos\n');
            }
        }

    } catch (error) {
        console.error('❌ Error al verificar endpoint:', error.message);
    }
}

// Ejecutar verificaciones
(async () => {
    await verifyToken();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await verifyUserId();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await checkTweetsEndpoint();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('✅ Verificación completada');
})();
