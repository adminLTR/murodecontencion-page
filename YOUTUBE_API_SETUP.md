# 📺 Configuración de YouTube Data API v3

## 🎯 Resumen de la API

La YouTube Data API v3 es **PERFECTA** para tu caso de uso:

### ✅ Ventajas del Plan GRATIS
- **10,000 unidades de quota por día** (generoso)
- **`search.list` cuesta 100 unidades** por petición
- **Puedes hacer ~100 búsquedas al día** sin pagar
- **Embedding de videos es GRATIS** (no cuenta en quota)
- **No requiere OAuth** para datos públicos (solo API Key)
- Los videos se pueden **reproducir directamente** en tu sitio con iframe

### 📊 Quota y Costos

| Operación | Costo | Frecuencia Recomendada |
|-----------|-------|------------------------|
| `search.list` | 100 units | Cada 30-60 minutos con caché |
| `videos.list` | 1 unit | Bajo (opcional) |
| Embedding videos | 0 units | Ilimitado |

**Con caché de 30 minutos:**
- Solo usarás **~4800 unidades al día** (48 búsquedas)
- **Bien dentro del límite** de 10,000 unidades
- Sobra quota para otras operaciones

## 📝 Pasos para Obtener tu API Key

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Select a project" → "New Project"
4. Nombre del proyecto: `murodecontencion-blog` (o el que prefieras)
5. Haz clic en **"Create"**

### Paso 2: Habilitar YouTube Data API v3

1. En tu proyecto nuevo, ve al menú de navegación (☰)
2. Selecciona **"APIs & Services"** → **"Library"**
3. Busca: `YouTube Data API v3`
4. Haz clic en **"YouTube Data API v3"**
5. Haz clic en **"Enable"** (Habilitar)

### Paso 3: Crear API Key

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Haz clic en **"+ CREATE CREDENTIALS"**
3. Selecciona **"API key"**
4. Se generará una API Key automáticamente
5. **¡COPIA LA API KEY INMEDIATAMENTE!**

### Paso 4: Restringir tu API Key (IMPORTANTE para seguridad)

1. En la ventana de la API Key creada, haz clic en **"RESTRICT KEY"**
2. **Application restrictions:**
   - Selecciona **"HTTP referrers (web sites)"**
   - Agrega estos referrers:
     - `http://localhost:*` (para desarrollo)
     - `http://127.0.0.1:*` (para desarrollo)
     - `https://tudominio.com/*` (para producción - cambia por tu dominio real)
3. **API restrictions:**
   - Selecciona **"Restrict key"**
   - Busca y marca solo **"YouTube Data API v3"**
4. Haz clic en **"Save"**

### Paso 5: Obtener el Channel ID de tu canal

Necesitas el ID del canal de YouTube del cual quieres obtener videos.

**Opción A: Desde la URL del canal**
- Si tu URL es: `https://www.youtube.com/@NombreDelCanal`
- Ve a [YouTube Channel ID Finder](https://www.streamweasels.com/tools/youtube-channel-id-and-user-id-convertor/)
- Pega la URL y obtendrás el Channel ID (formato: `UC...`)

**Opción B: Desde YouTube Studio**
- Ve a [YouTube Studio](https://studio.youtube.com/)
- En el menú lateral, selecciona **"Customization"** → **"Basic info"**
- Al final de la página verás tu **Channel ID**

**Opción C: Usando la API** (una vez que tengas tu API Key)
```bash
# Reemplaza TU_USUARIO por el @usuario del canal
curl "https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@TU_USUARIO&key=TU_API_KEY"
```

### Paso 6: Configurar el Servidor

1. Abre `server/.env`
2. Agrega estas líneas:

```env
# API de YouTube
YOUTUBE_API_KEY=TU_API_KEY_AQUI
YOUTUBE_CHANNEL_ID=UC...tu_channel_id_aqui

# Configuración de caché para YouTube (en minutos)
YOUTUBE_CACHE_TTL_MINUTES=30
```

**Ejemplo completo:**
```env
# Configuración de la API de X (Twitter)
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAFHL5wEAAAAA...
TWITTER_USER_ID=1930557730856505344

# API de YouTube
YOUTUBE_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrs
YOUTUBE_CHANNEL_ID=UCabcdef123456789

# Puerto del servidor
PORT=3000

# CORS
CORS_ORIGIN=*

# Configuración de caché (en minutos)
CACHE_TTL_MINUTES=30
YOUTUBE_CACHE_TTL_MINUTES=30
```

### Paso 7: Actualizar `.env.example`

Abre `server/.env.example` y agrégale las nuevas variables como referencia:

```env
# API de YouTube
YOUTUBE_API_KEY=TU_API_KEY_AQUI
YOUTUBE_CHANNEL_ID=TU_CHANNEL_ID_AQUI

# Configuración de caché para YouTube (en minutos)
YOUTUBE_CACHE_TTL_MINUTES=30
```

## 🔧 Cómo Funciona la Integración

### 1. **Búsqueda de Videos**
```
GET https://www.googleapis.com/youtube/v3/search
```

**Parámetros:**
- `part=snippet` - Información básica del video
- `channelId=UC...` - ID de tu canal
- `order=date` - Ordenar por fecha (más recientes primero)
- `type=video` - Solo videos (no playlists ni canales)
- `maxResults=3` - Los 3 últimos videos
- `key=tu_api_key` - Tu API Key

### 2. **Embedding de Videos**

Los videos se incrustan usando iframe de YouTube:

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>
```

**Ventajas:**
- ✅ **Reproducción directa** en tu sitio
- ✅ **No consume quota** de la API
- ✅ **Responsive** con CSS
- ✅ **Player completo** de YouTube

### 3. **Sistema de Caché**

Similar al de X/Twitter:
- **Caché en memoria** (30 minutos)
- **Caché en archivo** (`server/.cache/youtube.json`)
- **LocalStorage en navegador**
- **Fallback en cascada:** API → Server Cache → LocalStorage

## 📊 Monitoreo de Quota

Para ver tu uso de quota:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **"APIs & Services"** → **"Quotas"**
4. Busca: `YouTube Data API v3`
5. Verás:
   - **Queries per day:** 10,000 (límite diario)
   - **Usado hoy:** X units

## ⚠️ Límites y Mejores Prácticas

### Límites del Plan Gratuito
- ✅ 10,000 unidades/día
- ✅ Quota se resetea a **medianoche PST** (Pacific Time)
- ⚠️ Si excedes el límite, API devuelve error **403 Forbidden**

### Mejores Prácticas
1. **Usa caché agresivamente** (30-60 minutos)
2. **No hagas búsquedas en cada visita** de página
3. **Guarda en LocalStorage** para offline
4. **Monitorea tu quota** regularmente
5. **Embedding es gratis** - úsalo sin miedo

### Cálculo de Quota

Con configuración actual:
- **Caché de 30 minutos**
- **24 horas = 48 intervalos de 30 min**
- **48 búsquedas × 100 units = 4,800 units/día**
- **Sobran 5,200 units** para otros usos

## 🚀 Solicitar Más Quota (Si Necesitas)

Si 10,000 units/día no son suficientes:

1. Ve a [Quota Extension Form](https://support.google.com/youtube/contact/yt_api_form)
2. Llena el formulario explicando:
   - **Uso previsto** de la API
   - **Quota solicitada** (ejemplo: 1,000,000 units/día)
   - **Por qué necesitas más** quota
3. Google revisará tu solicitud (puede tardar días)
4. **Es GRATIS** - no necesitas pagar

## 🔐 Seguridad

### ✅ HACER:
- ✅ Restringir API Key a HTTP referrers
- ✅ Restringir API Key solo a YouTube Data API v3
- ✅ Usar backend proxy (ya lo tienes)
- ✅ Nunca exponer API Key en GitHub
- ✅ Agregar `server/.env` a `.gitignore`

### ❌ NO HACER:
- ❌ Usar API Key directamente en frontend
- ❌ Subir API Key a repositorios públicos
- ❌ Compartir API Key con otros
- ❌ Usar la misma API Key en múltiples proyectos

## 📚 Recursos Útiles

- [YouTube Data API Docs](https://developers.google.com/youtube/v3/docs)
- [Search API Reference](https://developers.google.com/youtube/v3/docs/search/list)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Explorer](https://developers.google.com/apis-explorer/#p/youtube/v3/)

## 🆘 Troubleshooting

### Error: "API key not valid"
- ✅ Verifica que copiaste la API Key completa
- ✅ Verifica que habilitaste YouTube Data API v3
- ✅ Revisa las restricciones de HTTP referrers

### Error: 403 Forbidden (quotaExceeded)
- ⏰ Espera hasta medianoche PST para que se resetee
- 📦 Usa datos en caché mientras tanto
- 📊 Solicita más quota si es frecuente

### Error: "The channel id ... was not found"
- ✅ Verifica que el Channel ID sea correcto (formato `UC...`)
- ✅ Verifica que el canal sea público
- ✅ Prueba con otro Channel ID conocido

### Videos no se reproducen
- ✅ Verifica que el video permita embedding
- ✅ Algunos videos restringen reproducción externa
- ✅ Provee fallback a enlace directo

## ✨ Próximos Pasos

Una vez que tengas tu API Key:

1. ✅ Agrega las variables a `server/.env`
2. 🔧 Ejecuta el servidor: `cd server && npm start`
3. 🌐 Abre tu blog en el navegador
4. 📺 Los 3 últimos videos del canal aparecerán automáticamente
5. ▶️ Podrás reproducirlos directamente en tu sitio

---

**¿Listo para empezar?** Obtén tu API Key siguiendo los pasos arriba y continuaremos con la implementación del código.
