# 📊 Flujo de la Integración con la API de X

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO                                │
│                  (Abre index.html)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   NAVEGADOR                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Carga index.html                                 │  │
│  │  2. Carga js/config.js (credenciales)               │  │
│  │  3. Carga js/script.js (lógica)                     │  │
│  │  4. Ejecuta MuroDeContencion.init()                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            VALIDACIÓN DE CONFIGURACIÓN                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ¿config.bearerToken != "TU_BEARER_TOKEN_AQUI"?     │  │
│  │  ¿config.userId != "TU_USER_ID_AQUI"?               │  │
│  └─────────┬──────────────────────┬─────────────────────┘  │
│            │ SÍ                   │ NO                      │
└────────────┼──────────────────────┼─────────────────────────┘
             │                      │
             ▼                      ▼
   ┌─────────────────┐    ┌─────────────────────┐
   │ fetchTwitter    │    │ showTwitterConfig   │
   │ Posts()         │    │ Message()           │
   └────────┬────────┘    └─────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API DE X (TWITTER) v2                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Endpoint: GET /2/users/{userId}/tweets              │  │
│  │  Headers:                                            │  │
│  │    Authorization: Bearer {token}                     │  │
│  │  Query params:                                       │  │
│  │    max_results=5                                     │  │
│  │    tweet.fields=id,text,created_at,public_metrics   │  │
│  │    user.fields=id,username,profile_image_url        │  │
│  │    expansions=author_id                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESPUESTA DE LA API                        │
│  {                                                          │
│    "data": [                                                │
│      {                                                      │
│        "id": "1234...",                                     │
│        "text": "Contenido del tweet...",                   │
│        "created_at": "2024-12-09T...",                     │
│        "author_id": "9876...",                             │
│        "public_metrics": {                                 │
│          "like_count": 42,                                 │
│          "retweet_count": 15,                              │
│          "reply_count": 8                                  │
│        }                                                    │
│      }                                                      │
│    ],                                                       │
│    "includes": {                                            │
│      "users": [{                                            │
│        "id": "9876...",                                     │
│        "username": "murodecontencion",                     │
│        "profile_image_url": "https://..."                  │
│      }]                                                     │
│    }                                                        │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PROCESAMIENTO EN EL CLIENTE                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. renderTwitterPosts(apiData)                      │  │
│  │     - Mapea usuarios por ID                          │  │
│  │     - Genera HTML para cada post                     │  │
│  │                                                       │  │
│  │  2. createPostCard(post, author)                     │  │
│  │     - Formatea fecha (formatDate)                    │  │
│  │     - Formatea números (formatNumber)                │  │
│  │     - Formatea texto (formatTweetText)               │  │
│  │     - Agrega links, hashtags, menciones             │  │
│  │                                                       │  │
│  │  3. Inyecta HTML en el DOM                          │  │
│  │     - container.innerHTML = postsHTML                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESULTADO FINAL                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ [Avatar] @murodecontencion • Hace 2 horas   │   │  │
│  │  │                                              │   │  │
│  │  │ Texto del tweet con links y #hashtags...    │   │  │
│  │  │                                              │   │  │
│  │  │ ❤️ 42  💬 8  🔄 15                           │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ [Avatar] @murodecontencion • Hace 5 horas   │   │  │
│  │  │ ...                                          │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos Paso a Paso

### Paso 1: Inicialización
```javascript
// Al cargar la página
MuroDeContencion.init()
  → setupIntersectionObserver()
  → setupSmoothScroll()
  → setupHeaderScroll()
  → fetchTwitterPosts() ← AQUÍ COMIENZA LA MAGIA
```

### Paso 2: Construcción de la URL
```javascript
// En fetchTwitterPosts()
const params = {
  max_results: 5,
  tweet.fields: "id,text,created_at,public_metrics,author_id",
  user.fields: "id,name,username,profile_image_url",
  expansions: "author_id"
}

const url = "https://api.x.com/2/users/123456789/tweets?..."
```

### Paso 3: Petición HTTP
```javascript
fetch(url, {
  headers: {
    'Authorization': 'Bearer AAAAAxxxxx...'
  }
})
```

### Paso 4: Transformación de Datos
```javascript
// Los datos vienen así:
{
  data: [{ id, text, created_at, public_metrics, author_id }],
  includes: { users: [{ id, username, profile_image_url }] }
}

// Se transforman a:
<article class="post-card">
  <div class="post-avatar" style="background-image: url(...)">
  <p class="post-text">Texto con links y @menciones</p>
  <div class="post-actions">❤️ 42 💬 8 🔄 15</div>
</article>
```

## 🎯 Funciones Clave

### 1. `fetchTwitterPosts()`
**Propósito**: Obtener datos de la API
- Construye URL con parámetros
- Envía petición con Bearer Token
- Maneja errores y casos especiales

### 2. `renderTwitterPosts(data)`
**Propósito**: Procesar respuesta de la API
- Mapea usuarios por ID para acceso rápido
- Genera HTML para cada post
- Actualiza el DOM con transición suave

### 3. `createPostCard(post, author)`
**Propósito**: Generar HTML de un post individual
- Extrae métricas públicas
- Formatea fecha relativa ("Hace 2 horas")
- Formatea números (1200 → 1.2K)
- Procesa texto (links, @menciones, #hashtags)

### 4. `formatTweetText(text)`
**Propósito**: Enriquecer el texto del tweet
- Convierte URLs en links clicables
- Convierte @menciones en links a perfiles
- Convierte #hashtags en links de búsqueda
- Escapa HTML para seguridad

### 5. `formatDate(dateString)`
**Propósito**: Convertir fecha ISO a formato legible
- Calcula diferencia con fecha actual
- Muestra "Hace X segundos/minutos/horas/días"
- Fallback a fecha completa si >7 días

### 6. `formatNumber(num)`
**Propósito**: Formato compacto para números grandes
- 1000 → 1K
- 1500000 → 1.5M

## 🔐 Flujo de Autenticación

```
Usuario configura credenciales
         ↓
js/config.js almacena:
  - bearerToken
  - userId
         ↓
script.js lee config
         ↓
Valida que NO sean valores por defecto
         ↓
      ┌───┴────┐
    ✅ OK    ❌ ERROR
      │          │
      ↓          ↓
fetchTwitter  showConfig
  Posts()      Message()
      │
      ↓
API Request con
Authorization Header
```

## 🛡️ Manejo de Errores

### Error HTTP (401, 403, 429, etc.)
```
API responde con error
       ↓
catch en fetchTwitterPosts()
       ↓
showTwitterError(message)
       ↓
Usuario ve mensaje amigable
```

### Sin Configuración
```
Config tiene valores por defecto
       ↓
init() detecta esto
       ↓
showTwitterConfigMessage()
       ↓
Usuario ve instrucciones
```

### Sin Posts
```
API responde data: []
       ↓
Verificación en fetchTwitterPosts()
       ↓
showTwitterMessage("No se encontraron posts")
```

## 📦 Archivos Involucrados

| Archivo | Responsabilidad |
|---------|----------------|
| `index.html` | Estructura HTML, carga scripts |
| `js/config.js` | Almacena credenciales |
| `js/script.js` | Lógica de negocio completa |
| `css/styles.css` | Estilos visuales y animaciones |

## 🎨 Personalización

### Cambiar número de posts
```javascript
// js/config.js
maxResults: 10 // 5-100
```

### Agregar más campos
```javascript
// js/config.js
tweetFields: [
  'id', 'text', 'created_at', 
  'public_metrics', 'author_id',
  'possibly_sensitive', // ← NUEVO
  'lang' // ← NUEVO
]
```

### Modificar el card
```javascript
// js/script.js → createPostCard()
// Agrega más HTML o datos según necesites
```

---

**💡 Tip**: Para debugging, abre la consola del navegador (F12) y verás logs de cada paso del proceso.
