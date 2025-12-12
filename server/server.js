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
// Sistema de Caché Persistente para X/Twitter
// ============================================
const CACHE_TTL_MINUTES = parseInt(process.env.CACHE_TTL_MINUTES) || 30;
const CACHE_FILE_PATH = path.join(__dirname, '.cache', 'tweets.json');

// Sistema de Caché Persistente para YouTube
const YOUTUBE_CACHE_TTL_MINUTES = parseInt(process.env.YOUTUBE_CACHE_TTL_MINUTES) || 30;
const YOUTUBE_CACHE_FILE_PATH = path.join(__dirname, '.cache', 'youtube.json');

// Crear directorio de caché si no existe
const ensureCacheDir = () => {
    const cacheDir = path.join(__dirname, '.cache');
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

// ============================================
// Sistema de Caché para YouTube
// ============================================
const youtubeCache = {
    data: null,
    timestamp: null,
    ttl: YOUTUBE_CACHE_TTL_MINUTES * 60 * 1000
};

const loadYoutubeCacheFromFile = () => {
    try {
        ensureCacheDir();
        if (fs.existsSync(YOUTUBE_CACHE_FILE_PATH)) {
            const fileContent = fs.readFileSync(YOUTUBE_CACHE_FILE_PATH, 'utf-8');
            const savedCache = JSON.parse(fileContent);
            youtubeCache.data = savedCache.data;
            youtubeCache.timestamp = savedCache.timestamp;
            
            if (isYoutubeCacheValid()) {
                const remaining = Math.floor((youtubeCache.ttl - (Date.now() - youtubeCache.timestamp)) / 1000);
                console.log(`📦 Caché de YouTube cargado desde archivo (expira en ${remaining}s)`);
                return true;
            } else {
                console.log(`⏰ Caché de YouTube en archivo expirado`);
            }
        }
    } catch (error) {
        console.warn('⚠️ No se pudo cargar caché de YouTube desde archivo:', error.message);
    }
    return false;
};

const saveYoutubeCacheToFile = () => {
    try {
        ensureCacheDir();
        const cacheData = {
            data: youtubeCache.data,
            timestamp: youtubeCache.timestamp
        };
        fs.writeFileSync(YOUTUBE_CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2));
        console.log(`💾 Caché de YouTube guardado en archivo`);
    } catch (error) {
        console.warn('⚠️ No se pudo guardar caché de YouTube en archivo:', error.message);
    }
};

const isYoutubeCacheValid = () => {
    if (!youtubeCache.data || !youtubeCache.timestamp) return false;
    const now = Date.now();
    return (now - youtubeCache.timestamp) < youtubeCache.ttl;
};

const setYoutubeCache = (data) => {
    youtubeCache.data = data;
    youtubeCache.timestamp = Date.now();
    const expiresIn = Math.floor(youtubeCache.ttl / 1000);
    console.log(`💾 Caché de YouTube actualizado. Válido por ${expiresIn} segundos`);
    saveYoutubeCacheToFile();
};

const getYoutubeCache = () => {
    if (isYoutubeCacheValid()) {
        const remaining = Math.floor((youtubeCache.ttl - (Date.now() - youtubeCache.timestamp)) / 1000);
        console.log(`✅ Usando datos de YouTube en caché (expira en ${remaining}s)`);
        return youtubeCache.data;
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
// Endpoint: Obtener videos de YouTube
// ============================================
app.get('/api/youtube/videos', async (req, res) => {
    try {
        // Validar configuración de YouTube
        if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'TU_API_KEY_AQUI' || !process.env.YOUTUBE_API_KEY.trim()) {
            return res.status(500).json({
                error: 'Configuración incompleta',
                message: 'YouTube API Key no configurada. Sigue las instrucciones en YOUTUBE_API_SETUP.md'
            });
        }

        if (!process.env.YOUTUBE_CHANNEL_ID || process.env.YOUTUBE_CHANNEL_ID === 'TU_CHANNEL_ID_AQUI' || !process.env.YOUTUBE_CHANNEL_ID.trim()) {
            return res.status(500).json({
                error: 'Configuración incompleta',
                message: 'YouTube Channel ID no configurado. Sigue las instrucciones en YOUTUBE_API_SETUP.md'
            });
        }

        // Verificar caché válido
        const cachedData = getYoutubeCache();
        if (cachedData) {
            return res.json({
                ...cachedData,
                _cached: true,
                _cache_expires_in: Math.floor((youtubeCache.ttl - (Date.now() - youtubeCache.timestamp)) / 1000)
            });
        }

        // Parámetros de la petición
        const maxResults = req.query.max_results || 3;
        
        // Construir URL de la API de YouTube
        const params = new URLSearchParams({
            'part': 'snippet',
            'channelId': process.env.YOUTUBE_CHANNEL_ID,
            'order': 'date',
            'type': 'video',
            'maxResults': maxResults,
            'key': process.env.YOUTUBE_API_KEY
        });

        const url = `https://www.googleapis.com/youtube/v3/search?${params}`;

        console.log('📺 Solicitando videos de YouTube...');
        console.log(`🔍 Channel ID: ${process.env.YOUTUBE_CHANNEL_ID}`);

        // Realizar petición a la API de YouTube
        const response = await fetch(url, {
            method: 'GET'
        });

        // Manejar respuesta
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Error de la API de YouTube:', response.status, errorData);
            
            // Si hay error 403 (quota exceeded) y tenemos caché antiguo, usarlo
            if (response.status === 403) {
                if (!youtubeCache.data) {
                    loadYoutubeCacheFromFile();
                }
                
                if (youtubeCache.data) {
                    console.log('⚠️ Quota de YouTube excedida. Usando caché antiguo...');
                    const cacheAge = Math.floor((Date.now() - youtubeCache.timestamp) / 1000 / 60);
                    console.log(`   Caché de hace ${cacheAge} minutos`);
                    return res.json({
                        ...youtubeCache.data,
                        _cached: true,
                        _cache_expired: !isYoutubeCacheValid(),
                        _cache_age_minutes: cacheAge,
                        _warning: 'Quota excedida. Mostrando datos anteriores.'
                    });
                }
            }
            
            return res.status(response.status).json({
                error: 'Error al obtener videos de YouTube',
                status: response.status,
                message: errorData.error?.message || response.statusText,
                details: errorData,
                hint: response.status === 403 
                    ? 'Has excedido la quota de YouTube API (10,000 units/día). La quota se resetea a medianoche PST.'
                    : null
            });
        }

        const data = await response.json();
        
        // Verificar si hay datos
        if (!data.items || data.items.length === 0) {
            console.log('⚠️ No se encontraron videos');
            return res.json({
                items: [],
                message: 'No se encontraron videos recientes en el canal'
            });
        }

        console.log(`✅ ${data.items.length} videos obtenidos exitosamente`);
        console.log(`📊 Quota usada: 100 units (búsqueda)`);
        
        // Guardar en caché
        setYoutubeCache(data);
        
        // Devolver datos al frontend
        res.json({
            ...data,
            _cached: false
        });

    } catch (error) {
        console.error('❌ Error en el servidor (YouTube):', error);
        
        // Si hay error de red y tenemos caché, usarlo
        if (youtubeCache.data) {
            console.log('⚠️ Error de red. Usando caché de YouTube antiguo...');
            return res.json({
                ...youtubeCache.data,
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
            youtube: '/api/youtube/videos',
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
    console.log('🚀 Servidor Proxy de APIs iniciado');
    console.log('🚀 ========================================');
    console.log('');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📡 Endpoint tweets: http://localhost:${PORT}/api/tweets`);
    console.log(`📺 Endpoint YouTube: http://localhost:${PORT}/api/youtube/videos`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log('');
    
    // Verificar configuración de X/Twitter
    if (validateConfig()) {
        console.log('✅ X/Twitter configurado');
        console.log(`   📊 User ID: ${process.env.TWITTER_USER_ID}`);
        console.log(`   💾 Cache TTL: ${CACHE_TTL_MINUTES} minutos`);
    } else {
        console.log('⚠️  X/Twitter no configurado');
    }
    
    // Verificar configuración de YouTube
    const youtubeConfigured = process.env.YOUTUBE_API_KEY && 
                              process.env.YOUTUBE_API_KEY !== 'TU_API_KEY_AQUI' && 
                              process.env.YOUTUBE_CHANNEL_ID && 
                              process.env.YOUTUBE_CHANNEL_ID !== 'TU_CHANNEL_ID_AQUI';
    
    if (youtubeConfigured) {
        console.log('✅ YouTube configurado');
        console.log(`   📺 Channel ID: ${process.env.YOUTUBE_CHANNEL_ID}`);
        console.log(`   💾 Cache TTL: ${YOUTUBE_CACHE_TTL_MINUTES} minutos`);
    } else {
        console.log('⚠️  YouTube no configurado (opcional)');
        console.log('   📝 Sigue las instrucciones en YOUTUBE_API_SETUP.md');
    }
    
    console.log('');
    console.log(`📁 Caché persistente en: ${path.join(__dirname, '.cache')}`);
    
    // Intentar cargar cachés persistentes
    console.log('');
    console.log('🔍 Verificando cachés persistentes...');
    
    const twitterCacheLoaded = loadCacheFromFile();
    if (twitterCacheLoaded) {
        console.log('✅ Caché de X/Twitter cargado exitosamente');
    } else {
        console.log('ℹ️  No hay caché previo de X/Twitter');
    }
    
    const youtubeCacheLoaded = loadYoutubeCacheFromFile();
    if (youtubeCacheLoaded) {
        console.log('✅ Caché de YouTube cargado exitosamente');
    } else {
        console.log('ℹ️  No hay caché previo de YouTube');
    }
    
    console.log('');
    console.log('💡 El servidor usa caché persistente para reducir peticiones a las APIs');
    console.log('💡 Si recibes errores de rate limit, el servidor usará datos en caché');
    console.log('');
    console.log('📊 Límites de APIs:');
    console.log('   X/Twitter: 1 request / 15 minutos (tier FREE)');
    console.log('   YouTube: 100 unidades por búsqueda, 10,000/día');
    console.log('');
    console.log('Presiona Ctrl+C para detener el servidor');
    console.log('========================================');
    console.log('');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
});
