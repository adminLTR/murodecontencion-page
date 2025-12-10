// ============================================
// Backend Proxy para API de X (Twitter)
// ============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
  
// ============================================
// Sistema de Caché Persistente
// ============================================
const CACHE_TTL_MINUTES = parseInt(process.env.CACHE_TTL_MINUTES) || 30;
const CACHE_FILE_PATH = path.join(__dirname, '.cache', 'tweets.json');

// Crear directorio de caché si no existe
const ensureCacheDir = () => {
    const cacheDir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
};

const cache = {
    data: null,
    timestamp: null,
    ttl: CACHE_TTL_MINUTES * 60 * 1000 // Convertir minutos a milisegundos
};

// Cargar caché desde archivo al iniciar
const loadCacheFromFile = () => {
    try {
        ensureCacheDir();
        if (fs.existsSync(CACHE_FILE_PATH)) {
            const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
            const savedCache = JSON.parse(fileContent);
            cache.data = savedCache.data;
            cache.timestamp = savedCache.timestamp;
            
            if (isCacheValid()) {
                const remaining = Math.floor((cache.ttl - (Date.now() - cache.timestamp)) / 1000);
                console.log(`📦 Caché cargado desde archivo (expira en ${remaining}s)`);
                return true;
            } else {
                console.log(`⏰ Caché en archivo expirado`);
            }
        }
    } catch (error) {
        console.warn('⚠️ No se pudo cargar caché desde archivo:', error.message);
    }
    return false;
};

const saveCacheToFile = () => {
    try {
        ensureCacheDir();
        const cacheData = {
            data: cache.data,
            timestamp: cache.timestamp
        };
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2));
        console.log(`💾 Caché guardado en archivo`);
    } catch (error) {
        console.warn('⚠️ No se pudo guardar caché en archivo:', error.message);
    }
};

const isCacheValid = () => {
    if (!cache.data || !cache.timestamp) return false;
    const now = Date.now();
    return (now - cache.timestamp) < cache.ttl;
};

const setCache = (data) => {
    cache.data = data;
    cache.timestamp = Date.now();
    const expiresIn = Math.floor(cache.ttl / 1000);
    console.log(`💾 Cache actualizado en memoria. Válido por ${expiresIn} segundos`);
    
    // Guardar en archivo para persistencia
    saveCacheToFile();
};

const getCache = () => {
    if (isCacheValid()) {
        const remaining = Math.floor((cache.ttl - (Date.now() - cache.timestamp)) / 1000);
        console.log(`✅ Usando datos en cache (expira en ${remaining}s)`);
        return cache.data;
    }
    return null;
};

// Configuración de CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// ============================================
// Validación de configuración
// ============================================
const validateConfig = () => {
    if (!process.env.TWITTER_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN === 'TU_BEARER_TOKEN_AQUI') {
        console.error('❌ Error: TWITTER_BEARER_TOKEN no está configurado en .env');
        console.log('📝 Configura tu Bearer Token en server/.env');
        return false;
    }
    
    if (!process.env.TWITTER_USER_ID || process.env.TWITTER_USER_ID === 'TU_USER_ID_AQUI') {
        console.error('❌ Error: TWITTER_USER_ID no está configurado en .env');
        console.log('📝 Configura tu User ID en server/.env');
        return false;
    }
    
    return true;
};

// ============================================
// Endpoint: Obtener posts de X
// ============================================
app.get('/api/tweets', async (req, res) => {
    try {
        // Validar configuración
        if (!validateConfig()) {
            return res.status(500).json({
                error: 'Configuración del servidor incompleta',
                message: 'Revisa el archivo .env del servidor'
            });
        }

        // Verificar si hay datos en cache válidos
        const cachedData = getCache();
        if (cachedData) {
            return res.json({
                ...cachedData,
                _cached: true,
                _cache_expires_in: Math.floor((cache.ttl - (Date.now() - cache.timestamp)) / 1000)
            });
        }

        // Parámetros de la petición
        const maxResults = req.query.max_results || 5;
        const tweetFields = 'id,text,created_at,public_metrics,author_id';
        const userFields = 'id,name,username,profile_image_url';
        const expansions = 'author_id';

        // Construir URL de la API de X
        const params = new URLSearchParams({
            'max_results': maxResults,
            'tweet.fields': tweetFields,
            'user.fields': userFields,
            'expansions': expansions
        });

        const url = `https://api.x.com/2/users/${process.env.TWITTER_USER_ID}/tweets?${params}`;

        console.log('📡 Solicitando tweets a la API de X...');
        console.log(`🔍 User ID: ${process.env.TWITTER_USER_ID}`);
        console.log(`🔍 URL: ${url}`);

        // Realizar petición a la API de X
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Logs de rate limit headers
        const rateLimitLimit = response.headers.get('x-rate-limit-limit');
        const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
        const rateLimitReset = response.headers.get('x-rate-limit-reset');
        
        console.log('📊 Rate Limit Info:');
        console.log(`   - Límite total: ${rateLimitLimit || 'N/A'}`);
        console.log(`   - Requests restantes: ${rateLimitRemaining || 'N/A'}`);
        if (rateLimitReset) {
            const resetDate = new Date(parseInt(rateLimitReset) * 1000);
            console.log(`   - Se resetea a las: ${resetDate.toLocaleString('es-ES')}`);
        }

        // Manejar respuesta
        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ Error de la API de X:', response.status, errorData);
            
            // Si hay error 429 (Too Many Requests) y tenemos cache antiguo, usarlo
            if (response.status === 429) {
                // Intentar cargar desde archivo si no está en memoria
                if (!cache.data) {
                    loadCacheFromFile();
                }
                
                if (cache.data) {
                    console.log('⚠️ Rate limit excedido. Usando cache antiguo...');
                    const cacheAge = Math.floor((Date.now() - cache.timestamp) / 1000 / 60);
                    console.log(`   Caché de hace ${cacheAge} minutos`);
                    return res.json({
                        ...cache.data,
                        _cached: true,
                        _cache_expired: !isCacheValid(),
                        _cache_age_minutes: cacheAge,
                        _warning: 'Rate limit excedido. Mostrando datos anteriores.'
                    });
                }
            }
            
            return res.status(response.status).json({
                error: 'Error al obtener tweets',
                status: response.status,
                message: response.statusText,
                details: errorData,
                hint: response.status === 429 
                    ? 'Has excedido el límite de peticiones. Espera 15 minutos e intenta de nuevo.'
                    : null
            });
        }

        const data = await response.json();
        
        // Verificar si hay datos
        if (!data.data || data.data.length === 0) {
            console.log('⚠️ No se encontraron tweets');
            return res.json({
                data: [],
                message: 'No se encontraron tweets recientes'
            });
        }

        console.log(`✅ ${data.data.length} tweets obtenidos exitosamente`);
        
        // Guardar en cache
        setCache(data);
        
        // Devolver datos al frontend
        res.json({
            ...data,
            _cached: false
        });

    } catch (error) {
        console.error('❌ Error en el servidor:', error);
        
        // Si hay error de red y tenemos cache, usarlo
        if (cache.data) {
            console.log('⚠️ Error de red. Usando cache antiguo...');
            return res.json({
                ...cache.data,
                _cached: true,
                _cache_expired: true,
                _warning: 'Error de red. Mostrando datos anteriores.'
            });
        }
        
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// ============================================
// Endpoint: Health check
// ============================================
app.get('/api/health', (req, res) => {
    const isConfigured = validateConfig();
    const cacheValid = isCacheValid();
    
    let cacheInfo = {
        hasCache: !!cache.data,
        isValid: cacheValid
    };
    
    if (cache.timestamp) {
        const remaining = Math.floor((cache.ttl - (Date.now() - cache.timestamp)) / 1000);
        cacheInfo.expiresIn = cacheValid ? `${remaining} segundos` : 'expirado';
        cacheInfo.lastUpdate = new Date(cache.timestamp).toISOString();
    }
    
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        configured: isConfigured,
        cache: cacheInfo,
        message: isConfigured 
            ? 'Servidor configurado correctamente' 
            : 'Falta configuración (revisa .env)'
    });
});

// ============================================
// Endpoint: Root
// ============================================
app.get('/', (req, res) => {
    res.json({
        name: 'Muro de Contención API Proxy',
        version: '1.0.0',
        endpoints: {
            tweets: '/api/tweets',
            health: '/api/health'
        }
    });
});

// ============================================
// Iniciar servidor
// ============================================
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ========================================');
    console.log('🚀 Servidor Proxy de API de X iniciado');
    console.log('🚀 ========================================');
    console.log('');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📡 Endpoint tweets: http://localhost:${PORT}/api/tweets`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log('');
    
    if (validateConfig()) {
        console.log('✅ Configuración válida');
        console.log(`📊 User ID: ${process.env.TWITTER_USER_ID}`);
        console.log(`💾 Cache TTL: ${CACHE_TTL_MINUTES} minutos`);
        console.log(`📁 Cache persistente en: ${CACHE_FILE_PATH}`);
    } else {
        console.log('⚠️  ADVERTENCIA: Configuración incompleta');
        console.log('📝 Configura server/.env antes de usar el servidor');
    }
    
    // Intentar cargar caché persistente
    console.log('');
    console.log('🔍 Verificando caché persistente...');
    if (loadCacheFromFile()) {
        console.log('✅ Caché cargado exitosamente desde archivo');
    } else {
        console.log('ℹ️  No hay caché previo o está expirado');
    }
    
    console.log('');
    console.log('💡 El servidor usa cache persistente para reducir peticiones a la API');
    console.log('💡 Si recibes error 429, el servidor usará datos en cache');
    console.log('⚠️  TIER FREE: Solo 1 request cada 15 minutos - usa caché sabiamente');
    console.log('');
    console.log('Presiona Ctrl+C para detener el servidor');
    console.log('========================================');
    console.log('');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
});
