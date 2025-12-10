# Backend Proxy para API de X

Servidor Express que actúa como proxy entre el frontend y la API de X (Twitter), evitando problemas de CORS y manteniendo las credenciales seguras en el servidor.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```powershell
cd server
npm install
```

### 2. Configurar variables de entorno

Crea el archivo `.env` a partir del ejemplo:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y agrega tus credenciales:

```env
TWITTER_BEARER_TOKEN=tu_bearer_token_aqui
TWITTER_USER_ID=tu_user_id_aqui
PORT=3000
```

### 3. Iniciar el servidor

```powershell
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 Endpoints

### `GET /api/tweets`

Obtiene los últimos tweets del usuario configurado.

**Query Parameters:**
- `max_results` (opcional): Número de tweets a obtener (5-100, default: 5)

**Ejemplo:**
```
GET http://localhost:3000/api/tweets?max_results=10
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "123...",
      "text": "Contenido del tweet...",
      "created_at": "2024-12-09T...",
      "public_metrics": {
        "like_count": 42,
        "retweet_count": 15,
        "reply_count": 8
      },
      "author_id": "456..."
    }
  ],
  "includes": {
    "users": [
      {
        "id": "456...",
        "username": "usuario",
        "name": "Nombre Usuario",
        "profile_image_url": "https://..."
      }
    ]
  }
}
```

### `GET /api/health`

Verifica el estado del servidor.

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-09T...",
  "configured": true,
  "message": "Servidor configurado correctamente"
}
```

### `GET /`

Información del servidor y endpoints disponibles.

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `TWITTER_BEARER_TOKEN` | Bearer Token de la API de X | Sí |
| `TWITTER_USER_ID` | ID del usuario de X | Sí |
| `PORT` | Puerto del servidor | No (default: 3000) |
| `CORS_ORIGIN` | Orígenes permitidos para CORS | No (default: *) |

### Obtener Credenciales

#### Bearer Token:
1. Ve a https://developer.x.com/en/portal/dashboard
2. Crea o selecciona tu App
3. Ve a "Keys and tokens"
4. Copia el "Bearer Token"

#### User ID:
1. Ve a https://tweeterid.com/
2. Ingresa tu username (sin @)
3. Copia el ID numérico

## 🛡️ Seguridad

### Para Desarrollo:
- El archivo `.env` está en `.gitignore`
- Las credenciales nunca se exponen al frontend
- CORS está configurado para permitir cualquier origen (`*`)

### Para Producción:
1. **Configura CORS específico:**
   ```env
   CORS_ORIGIN=https://tudominio.com
   ```

2. **Usa HTTPS:**
   - Configura un certificado SSL
   - O usa un servicio como Heroku, Vercel, Railway, etc.

3. **Variables de entorno seguras:**
   - Usa el sistema de variables de entorno de tu plataforma
   - Nunca comitees el archivo `.env` real

4. **Rate limiting:**
   - Considera agregar rate limiting con `express-rate-limit`
   - La API de X tiene límites de requests

## 🚢 Despliegue

### Heroku

```powershell
# Crear app
heroku create murodecontencion-api

# Configurar variables
heroku config:set TWITTER_BEARER_TOKEN=tu_token
heroku config:set TWITTER_USER_ID=tu_id
heroku config:set CORS_ORIGIN=https://tudominio.com

# Deploy
git push heroku master
```

### Vercel

```powershell
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables en el dashboard de Vercel
```

### Railway

1. Ve a https://railway.app/
2. Conecta tu repositorio
3. Configura las variables de entorno
4. Deploy automático

## 💾 Sistema de Caché

El servidor incluye un sistema de caché para reducir las peticiones a la API de X y evitar errores 429 (Too Many Requests).

### Configuración del Caché

En `.env`:
```env
CACHE_TTL_MINUTES=5  # Tiempo en minutos (default: 5)
```

### Cómo Funciona

1. **Primera petición**: Solicita datos a la API de X y los guarda en cache
2. **Peticiones siguientes**: Devuelve datos del cache (válido por CACHE_TTL_MINUTES)
3. **Cache expirado**: Vuelve a solicitar a la API de X
4. **Error 429**: Devuelve datos del cache antiguo si están disponibles

### Respuesta con Cache

Cuando los datos vienen del cache, la respuesta incluye:
```json
{
  "data": [...],
  "_cached": true,
  "_cache_expires_in": 180  // segundos
}
```

## 🐛 Troubleshooting

### Error: "TWITTER_BEARER_TOKEN no está configurado"
- Verifica que el archivo `.env` existe
- Verifica que el archivo tiene la variable correcta
- Reinicia el servidor después de editar `.env`

### Error 401: Unauthorized
- Tu Bearer Token es inválido o expiró
- Genera un nuevo token en el Developer Portal

### Error 429: Too Many Requests
**Causa**: Has excedido el límite de peticiones de la API de X.

**Límites de la API (Free Tier)**:
- 1,500 tweets/mes
- 50 requests cada 15 minutos

**Soluciones**:
1. **Usar el cache** (ya implementado):
   - Aumenta `CACHE_TTL_MINUTES` en `.env` (ej: 15 o 30)
   - Reduce la frecuencia de recargas en el frontend
   
2. **Esperar 15 minutos** antes de intentar nuevamente

3. **Actualizar plan** en el Developer Portal si necesitas más requests

4. **Verificar logs**: El servidor mostrará cuándo usa cache vs API real

**Nota**: Si recibes error 429, el servidor automáticamente usará datos del cache antiguo si están disponibles.

### Error de CORS en el frontend
- Verifica que el servidor esté corriendo
- Verifica la URL en `js/config.js`
- Verifica la configuración de CORS en `.env`

## 📦 Dependencias

- **express**: Framework web
- **cors**: Middleware para CORS
- **dotenv**: Manejo de variables de entorno
- **node-fetch**: Cliente HTTP para peticiones a la API de X

## 📝 Scripts

- `npm start`: Inicia el servidor
- `npm run dev`: Inicia con auto-reload (Node 20+)

## 🔗 Enlaces Útiles

- [Documentación API de X v2](https://docs.x.com/x-api)
- [X Developer Portal](https://developer.x.com/en/portal/dashboard)
- [Express.js Docs](https://expressjs.com/)

---

¿Problemas? Abre un issue en el repositorio.
