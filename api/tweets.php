<?php
/**
 * API Endpoint para Twitter/X
 * Obtiene los últimos posts de una cuenta de X
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../Cache.php';

// Función para hacer request a la API de X
function fetchTweetsFromAPI($userId, $maxResults, $bearerToken) {
    $url = "https://api.x.com/2/users/{$userId}/tweets?" . http_build_query([
        'max_results' => $maxResults,
        'tweet.fields' => 'id,text,created_at,public_metrics,author_id',
        'user.fields' => 'id,name,username,profile_image_url',
        'expansions' => 'author_id'
    ]);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$bearerToken}",
            "Content-Type: application/json"
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
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $errorMsg = $errorData['detail'] ?? $errorData['title'] ?? "HTTP Error {$httpCode}";
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
    if (empty(X_API_BEARER_TOKEN)) {
        throw new Exception('X_API_BEARER_TOKEN no configurado en .env');
    }
    
    if (empty(X_API_USER_ID)) {
        throw new Exception('X_API_USER_ID no configurado en .env');
    }
    
    // Parámetros de request
    $maxResults = isset($_GET['max_results']) ? (int)$_GET['max_results'] : X_API_MAX_RESULTS;
    $maxResults = min($maxResults, 100); // Límite de API de X
    
    // Intentar obtener del cache primero
    $cachedData = Cache::get(X_CACHE_FILE);
    
    if ($cachedData !== null) {
        // Cache válido
        $cacheInfo = Cache::getInfo(X_CACHE_FILE);
        error_log("✅ Sirviendo tweets desde cache (edad: {$cacheInfo['age_seconds']}s)");
        
        // Agregar header indicando que viene del cache
        header('X-Cache: HIT');
        header('X-Cache-Age: ' . $cacheInfo['age_seconds']);
        
        echo json_encode($cachedData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    // Cache no válido, hacer petición a API
    error_log("📡 Cache no válido, consultando API de X...");
    header('X-Cache: MISS');
    
    try {
        $data = fetchTweetsFromAPI(X_API_USER_ID, $maxResults, X_API_BEARER_TOKEN);
        
        // Verificar que hay datos
        if (empty($data['data'])) {
            // Si no hay datos de la API, intentar cache expirado como fallback
            $expiredCache = Cache::get(X_CACHE_FILE);
            if ($expiredCache !== null) {
                error_log("⚠️ API sin datos, usando cache expirado");
                header('X-Cache: STALE');
                echo json_encode($expiredCache, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }
            
            throw new Exception('No se encontraron posts en la API');
        }
        
        // Guardar en cache
        if (Cache::set(X_CACHE_FILE, $data, X_CACHE_TTL_MINUTES)) {
            error_log("💾 Tweets guardados en cache (TTL: " . X_CACHE_TTL_MINUTES . " min)");
        }
        
        // Retornar datos
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
    } catch (Exception $apiError) {
        // Error en API, intentar usar cache expirado
        error_log("❌ Error en API de X: " . $apiError->getMessage());
        
        // Leer archivo de cache directamente (sin validar TTL)
        if (file_exists(X_CACHE_FILE)) {
            $cacheContent = file_get_contents(X_CACHE_FILE);
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
    error_log("❌ Error en /api/tweets: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'message' => 'Error al obtener posts de X'
    ], JSON_UNESCAPED_UNICODE);
}
