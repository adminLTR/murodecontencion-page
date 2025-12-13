<?php
/**
 * Sistema de Cache para Muro de Contención
 * Manejo de cache en archivos JSON con TTL
 */

class Cache {
    /**
     * Guardar datos en cache
     * 
     * @param string $cacheFile Ruta del archivo de cache
     * @param array $data Datos a guardar
     * @param int $ttlMinutes Tiempo de vida en minutos
     * @return bool
     */
    public static function set($cacheFile, $data, $ttlMinutes) {
        try {
            $cacheData = [
                'timestamp' => time(),
                'ttl_minutes' => $ttlMinutes,
                'expires_at' => time() + ($ttlMinutes * 60),
                'data' => $data
            ];
            
            $json = json_encode($cacheData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            
            if ($json === false) {
                error_log("Error al codificar JSON para cache: " . json_last_error_msg());
                return false;
            }
            
            $result = file_put_contents($cacheFile, $json, LOCK_EX);
            
            if ($result === false) {
                error_log("Error al escribir archivo de cache: $cacheFile");
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error al guardar cache: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener datos del cache
     * 
     * @param string $cacheFile Ruta del archivo de cache
     * @return array|null Retorna los datos si son válidos, null si no existen o expiraron
     */
    public static function get($cacheFile) {
        try {
            if (!file_exists($cacheFile)) {
                return null;
            }
            
            $json = file_get_contents($cacheFile);
            
            if ($json === false) {
                error_log("Error al leer archivo de cache: $cacheFile");
                return null;
            }
            
            $cacheData = json_decode($json, true);
            
            if ($cacheData === null) {
                error_log("Error al decodificar JSON de cache: " . json_last_error_msg());
                return null;
            }
            
            // Verificar si el cache ha expirado
            if (isset($cacheData['expires_at']) && time() > $cacheData['expires_at']) {
                error_log("Cache expirado para: $cacheFile");
                return null;
            }
            
            return $cacheData['data'] ?? null;
        } catch (Exception $e) {
            error_log("Error al obtener cache: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Verificar si el cache es válido
     * 
     * @param string $cacheFile Ruta del archivo de cache
     * @return bool
     */
    public static function isValid($cacheFile) {
        return self::get($cacheFile) !== null;
    }
    
    /**
     * Limpiar cache
     * 
     * @param string $cacheFile Ruta del archivo de cache
     * @return bool
     */
    public static function clear($cacheFile) {
        try {
            if (file_exists($cacheFile)) {
                return unlink($cacheFile);
            }
            return true;
        } catch (Exception $e) {
            error_log("Error al limpiar cache: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener información del cache (timestamp, expires_at, etc.)
     * 
     * @param string $cacheFile Ruta del archivo de cache
     * @return array|null
     */
    public static function getInfo($cacheFile) {
        try {
            if (!file_exists($cacheFile)) {
                return null;
            }
            
            $json = file_get_contents($cacheFile);
            $cacheData = json_decode($json, true);
            
            if ($cacheData === null) {
                return null;
            }
            
            return [
                'timestamp' => $cacheData['timestamp'] ?? null,
                'ttl_minutes' => $cacheData['ttl_minutes'] ?? null,
                'expires_at' => $cacheData['expires_at'] ?? null,
                'is_expired' => isset($cacheData['expires_at']) && time() > $cacheData['expires_at'],
                'age_seconds' => isset($cacheData['timestamp']) ? time() - $cacheData['timestamp'] : null
            ];
        } catch (Exception $e) {
            error_log("Error al obtener info de cache: " . $e->getMessage());
            return null;
        }
    }
}
