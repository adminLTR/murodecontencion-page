// ============================================
// Configuración de API de X (Twitter)
// ARCHIVO DE EJEMPLO - Copia este archivo como config.js
// ============================================

/*
 * INSTRUCCIONES PARA CONFIGURAR:
 * 
 * 1. Copia este archivo y renómbralo a "config.js" (sin .example)
 * 
 * 2. Obtén tu Bearer Token:
 *    - Ve a https://developer.x.com/en/portal/dashboard
 *    - Crea o selecciona tu App
 *    - Ve a "Keys and tokens"
 *    - Copia el "Bearer Token" (o genera uno nuevo)
 * 
 * 3. Obtén tu User ID:
 *    - Opción A: Usa la API GET /2/users/by/username/:username
 *    - Opción B: Usa herramientas como https://tweeterid.com/
 *    - Ingresa tu username de X (sin @) y copia el ID numérico
 * 
 * 4. Reemplaza los valores abajo con tus credenciales reales
 * 
 * IMPORTANTE: 
 * - NUNCA subas el archivo config.js a GitHub con tus credenciales reales
 * - El archivo config.js está en .gitignore para protegerte
 * - Para producción, usa variables de entorno o un backend proxy
 */

const X_API_CONFIG = {
    // Reemplaza con tu Bearer Token del Developer Portal
    bearerToken: 'TU_BEARER_TOKEN_AQUI',
    
    // Reemplaza con tu User ID (número)
    userId: 'TU_USER_ID_AQUI',
    
    // Endpoint de la API de X v2
    apiBaseUrl: 'https://api.x.com/2',
    
    // Configuración de requests
    maxResults: 5, // Número de posts a obtener (5-100)
    
    // Campos que queremos obtener de los tweets
    tweetFields: [
        'id',
        'text',
        'created_at',
        'public_metrics',
        'author_id'
    ],
    
    // Campos adicionales del usuario
    userFields: [
        'id',
        'name',
        'username',
        'profile_image_url'
    ],
    
    // Expansiones para obtener información del autor
    expansions: [
        'author_id'
    ]
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = X_API_CONFIG;
}
