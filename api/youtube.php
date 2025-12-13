<?php
/**
 * API Endpoint para YouTube
 * Obtiene los últimos videos de un canal de YouTube
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../Cache.php';

// Función para hacer request a la API de YouTube
function fetchYouTubeVideosFromAPI($channelId, $maxResults, $apiKey) {
    $url = "https://www.googleapis.com/youtube/v3/search?" . http_build_query([
        'key' => $apiKey,
        'channelId' => $channelId,
        'part' => 'snippet,id',
        'order' => 'date',
        'maxResults' => $maxResults,
        'type' => 'video'
    ]);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Accept: application/json"
        ],
        CURLOPT_TIMEOUT => 10
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("cURL Error: {$error}");
    }
    
    // Manejar error 403 (quota exceeded)
    if ($httpCode === 403) {
        $errorData = json_decode($response, true);
        $reason = $errorData['error']['errors'][0]['reason'] ?? 'unknown';
        
        if ($reason === 'quotaExceeded') {
            throw new Exception('QUOTA_EXCEEDED');
        }
        
        throw new Exception("Forbidden: {$reason}");
    }
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $errorMsg = $errorData['error']['message'] ?? "HTTP Error {$httpCode}";
        throw new Exception($errorMsg);
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Error al decodificar respuesta JSON: " . json_last_error_msg());
    }
    
    return $data;
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido. Use GET.']);
    exit;
}

try {
    // Validar configuración
    if (empty(YOUTUBE_API_KEY)) {
        throw new Exception('YOUTUBE_API_KEY no configurado en .env');
    }
    
    if (empty(YOUTUBE_CHANNEL_ID)) {
        throw new Exception('YOUTUBE_CHANNEL_ID no configurado en .env');
    }
    
    // Parámetros de request
    $maxResults = isset($_GET['max_results']) ? (int)$_GET['max_results'] : YOUTUBE_MAX_RESULTS;
    $maxResults = min($maxResults, 50); // Límite razonable
    
    // Intentar obtener del cache primero
    $cachedData = Cache::get(YOUTUBE_CACHE_FILE);
    
    if ($cachedData !== null) {
        // Cache válido
        $cacheInfo = Cache::getInfo(YOUTUBE_CACHE_FILE);
        error_log("✅ Sirviendo videos de YouTube desde cache (edad: {$cacheInfo['age_seconds']}s)");
        
        // Agregar header indicando que viene del cache
        header('X-Cache: HIT');
        header('X-Cache-Age: ' . $cacheInfo['age_seconds']);
        
        echo json_encode($cachedData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Cache no válido, hacer petición a API
    error_log("📡 Cache no válido, consultando API de YouTube...");
    header('X-Cache: MISS');
    
    try {
        $data = fetchYouTubeVideosFromAPI(YOUTUBE_CHANNEL_ID, $maxResults, YOUTUBE_API_KEY);
        
        // Verificar que hay datos
        if (empty($data['items'])) {
            // Si no hay datos de la API, intentar cache expirado como fallback
            if (file_exists(YOUTUBE_CACHE_FILE)) {
                $cacheContent = file_get_contents(YOUTUBE_CACHE_FILE);
                $cacheData = json_decode($cacheContent, true);
                
                if ($cacheData && isset($cacheData['data'])) {
                    error_log("⚠️ API sin datos, usando cache expirado");
                    header('X-Cache: STALE');
                    echo json_encode($cacheData['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    exit;
                }
            }
            
            throw new Exception('No se encontraron videos en la API');
        }
        
        // Guardar en cache
        if (Cache::set(YOUTUBE_CACHE_FILE, $data, YOUTUBE_CACHE_TTL_MINUTES)) {
            error_log("💾 Videos de YouTube guardados en cache (TTL: " . YOUTUBE_CACHE_TTL_MINUTES . " min)");
        }
        
        // Retornar datos
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
    } catch (Exception $apiError) {
        // Error en API
        error_log("❌ Error en API de YouTube: " . $apiError->getMessage());
        
        // Si es error de quota, usar cache expirado
        if ($apiError->getMessage() === 'QUOTA_EXCEEDED') {
            error_log("⚠️ Cuota de YouTube excedida, usando cache");
            
            // Leer archivo de cache directamente (sin validar TTL)
            if (file_exists(YOUTUBE_CACHE_FILE)) {
                $cacheContent = file_get_contents(YOUTUBE_CACHE_FILE);
                $cacheData = json_decode($cacheContent, true);
                
                if ($cacheData && isset($cacheData['data'])) {
                    error_log("📦 Usando cache expirado por quota excedida");
                    header('X-Cache: STALE-QUOTA');
                    
                    echo json_encode($cacheData['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    exit;
                }
            }
            
            http_response_code(403);
            echo json_encode([
                'error' => 'QUOTA_EXCEEDED',
                'message' => 'Cuota de API de YouTube excedida. Los videos se actualizarán cuando se renueve la cuota.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Para otros errores, intentar cache expirado
        if (file_exists(YOUTUBE_CACHE_FILE)) {
            $cacheContent = file_get_contents(YOUTUBE_CACHE_FILE);
            $cacheData = json_decode($cacheContent, true);
            
            if ($cacheData && isset($cacheData['data'])) {
                error_log("📦 Usando cache expirado como fallback");
                header('X-Cache: STALE-ERROR');
                header('X-API-Error: ' . $apiError->getMessage());
                
                echo json_encode($cacheData['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }
        }
        
        // No hay cache disponible
        throw $apiError;
    }
    
} catch (Exception $e) {
    error_log("❌ Error en /api/youtube: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'message' => 'Error al obtener videos de YouTube'
    ], JSON_UNESCAPED_UNICODE);
}
