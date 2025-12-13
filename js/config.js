// ============================================
// Configuración de API de X (Twitter)
// ============================================

/*
 * INSTRUCCIONES PARA CONFIGURAR:
 * 
 * 1. Obtén tu Bearer Token:
 *    - Ve a https://developer.x.com/en/portal/dashboard
 *    - Crea o selecciona tu App
 *    - Ve a "Keys and tokens"
 *    - Copia el "Bearer Token" (o genera uno nuevo)
 * 
 * 2. Obtén tu User ID:
 *    - Opción A: Usa la API GET /2/users/by/username/:username
 *    - Opción B: Usa herramientas como https://tweeterid.com/
 *    - Ingresa tu username de X (sin @) y copia el ID numérico
 * 
 * 3. Reemplaza los valores abajo con tus credenciales reales
 * 
 * IMPORTANTE: 
 * - NUNCA subas este archivo a GitHub con tus credenciales reales
 * - Agrega config.js a tu .gitignore
 * - Para producción, usa variables de entorno o un backend proxy
 */

const X_API_CONFIG = {
    // Configuración simplificada - las credenciales están en .env
    useProxy: true, // Usar endpoints PHP (recomendado)
    proxyBaseUrl: window.location.origin, // URL del mismo servidor (PHP monolito)
    
    // Configuración de requests
    maxResults: 5, // Número de posts a obtener (5-100, mínimo 5 requerido por la API de X)
};

// Configuración de YouTube API
const YOUTUBE_API_CONFIG = {
    useProxy: true, // Usar endpoints PHP (obligatorio para YouTube)
    proxyBaseUrl: window.location.origin, // URL del mismo servidor (PHP monolito)
    
    // Configuración de requests
    maxResults: 3, // Número de videos a obtener (máximo 50)
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = X_API_CONFIG;
}
