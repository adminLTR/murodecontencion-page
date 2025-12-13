<?php
/**
 * Configuración de Muro de Contención
 * Variables de entorno y configuración general
 */

// Cargar variables de entorno desde .env
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignorar comentarios
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parsear línea
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remover comillas si existen
            $value = trim($value, '"\'');
            
            // Establecer variable de entorno
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

// Cargar archivo .env
loadEnv(__DIR__ . '/.env');

// Configuración de X (Twitter)
define('X_API_BEARER_TOKEN', $_ENV['X_API_BEARER_TOKEN'] ?? '');
define('X_API_USER_ID', $_ENV['X_API_USER_ID'] ?? '');
define('X_API_MAX_RESULTS', (int)($_ENV['X_API_MAX_RESULTS'] ?? 3));
define('X_CACHE_TTL_MINUTES', (int)($_ENV['X_CACHE_TTL_MINUTES'] ?? 15));

// Configuración de YouTube
define('YOUTUBE_API_KEY', $_ENV['YOUTUBE_API_KEY'] ?? '');
define('YOUTUBE_CHANNEL_ID', $_ENV['YOUTUBE_CHANNEL_ID'] ?? '');
define('YOUTUBE_CACHE_TTL_MINUTES', (int)($_ENV['YOUTUBE_CACHE_TTL_MINUTES'] ?? 30));
define('YOUTUBE_MAX_RESULTS', 3);

// Configuración de Cache
define('CACHE_DIR', __DIR__ . '/cache');
define('X_CACHE_FILE', CACHE_DIR . '/tweets_cache.json');
define('YOUTUBE_CACHE_FILE', CACHE_DIR . '/youtube_cache.json');

// Crear directorio de cache si no existe
if (!is_dir(CACHE_DIR)) {
    mkdir(CACHE_DIR, 0755, true);
}

// Configuración general
define('TIMEZONE', 'America/Lima');
date_default_timezone_set(TIMEZONE);

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejo de preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
