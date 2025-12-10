# 💻 Ejemplos y Casos de Uso

## 📌 Ejemplos de Respuesta de la API

### Respuesta Exitosa
```json
{
  "data": [
    {
      "id": "1234567890123456789",
      "text": "¡Hola desde @murodecontencion! Visita nuestro sitio https://t.co/abc123 #murodecontencion",
      "created_at": "2024-12-09T15:30:00.000Z",
      "author_id": "9876543210",
      "public_metrics": {
        "retweet_count": 15,
        "reply_count": 8,
        "like_count": 42,
        "quote_count": 3,
        "bookmark_count": 5,
        "impression_count": 1250
      }
    }
  ],
  "includes": {
    "users": [
      {
        "id": "9876543210",
        "name": "Muro de Contención",
        "username": "murodecontencion",
        "profile_image_url": "https://pbs.twimg.com/profile_images/..."
      }
    ]
  },
  "meta": {
    "result_count": 5,
    "newest_id": "1234567890123456789",
    "oldest_id": "1234567890123456780"
  }
}
```

### Respuesta con Error (401 - No Autorizado)
```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "type": "https://api.twitter.com/2/problems/unauthorized"
    }
  ],
  "title": "Unauthorized",
  "detail": "Unauthorized",
  "type": "about:blank",
  "status": 401
}
```

## 🎯 Casos de Uso Comunes

### 1. Obtener más posts (10 en lugar de 5)

**js/config.js**
```javascript
maxResults: 10, // Cambiar de 5 a 10
```

### 2. Filtrar retweets (solo tweets originales)

**Método 1: En la URL**
```javascript
// En fetchTwitterPosts(), agregar al params:
const params = new URLSearchParams({
    'max_results': X_API_CONFIG.maxResults,
    'exclude': 'retweets', // ← NUEVO
    'tweet.fields': X_API_CONFIG.tweetFields.join(','),
    // ... resto
});
```

**Método 2: En el renderizado**
```javascript
// En renderTwitterPosts(), filtrar los datos:
const originalTweets = apiData.data.filter(post => 
    !post.referenced_tweets?.some(ref => ref.type === 'retweeted')
);

const postsHTML = originalTweets.map(post => {
    const author = userMap.get(post.author_id);
    return this.createPostCard(post, author);
}).join('');
```

### 3. Mostrar imágenes en los posts

**Paso 1: Agregar campos a la configuración**
```javascript
// js/config.js
tweetFields: [
    'id', 'text', 'created_at', 'public_metrics', 'author_id',
    'attachments' // ← NUEVO
],
expansions: [
    'author_id',
    'attachments.media_keys' // ← NUEVO
],
// Agregar nueva propiedad:
mediaFields: [
    'media_key', 'type', 'url', 'preview_image_url'
]
```

**Paso 2: Incluir en la URL**
```javascript
// En fetchTwitterPosts()
const params = new URLSearchParams({
    'max_results': X_API_CONFIG.maxResults,
    'tweet.fields': X_API_CONFIG.tweetFields.join(','),
    'user.fields': X_API_CONFIG.userFields.join(','),
    'media.fields': X_API_CONFIG.mediaFields.join(','), // ← NUEVO
    'expansions': X_API_CONFIG.expansions.join(',')
});
```

**Paso 3: Renderizar las imágenes**
```javascript
// En createPostCard(), antes del return:
const media = apiData.includes?.media || [];
const postMedia = media.filter(m => 
    post.attachments?.media_keys?.includes(m.media_key)
);

// Agregar al HTML:
return `
    <article class="post-card" data-post-id="${post.id}">
        <!-- ... código existente ... -->
        <p class="post-text">${this.formatTweetText(post.text)}</p>
        
        ${postMedia.length > 0 ? `
            <div class="post-media">
                ${postMedia.map(m => `
                    <img src="${m.url || m.preview_image_url}" 
                         alt="Media del post" 
                         class="post-image">
                `).join('')}
            </div>
        ` : ''}
        
        <div class="post-actions">
        <!-- ... código existente ... -->
`;
```

**Paso 4: Agregar estilos CSS**
```css
/* css/styles.css */
.post-media {
    margin: var(--spacing-sm) 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.post-image {
    width: 100%;
    height: auto;
    display: block;
    transition: transform var(--transition-normal);
}

.post-card:hover .post-image {
    transform: scale(1.02);
}
```

### 4. Agregar botón de "Cargar más"

**HTML: Agregar botón**
```html
<!-- En index.html, después del feed-content -->
<div class="feed-content" id="twitter-feed-content">
    <!-- posts aquí -->
</div>
<button id="load-more-tweets" class="load-more-btn" style="display: none;">
    Cargar más posts
</button>
```

**JavaScript: Implementar paginación**
```javascript
// En el objeto MuroDeContencion, agregar:
nextToken: null,

async fetchTwitterPosts(loadMore = false) {
    console.log('🐦 Cargando posts de X...');
    
    try {
        const params = new URLSearchParams({
            'max_results': X_API_CONFIG.maxResults,
            'tweet.fields': X_API_CONFIG.tweetFields.join(','),
            'user.fields': X_API_CONFIG.userFields.join(','),
            'expansions': X_API_CONFIG.expansions.join(',')
        });

        // Si loadMore es true y hay nextToken, agregarlo
        if (loadMore && this.nextToken) {
            params.append('pagination_token', this.nextToken);
        }

        const url = `${X_API_CONFIG.apiBaseUrl}/users/${X_API_CONFIG.userId}/tweets?${params}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${X_API_CONFIG.bearerToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.warn('⚠️ No se encontraron más posts');
            return;
        }

        // Guardar el next_token si existe
        this.nextToken = data.meta?.next_token || null;
        
        // Mostrar/ocultar botón según si hay más posts
        const loadMoreBtn = document.getElementById('load-more-tweets');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = this.nextToken ? 'block' : 'none';
        }

        // Renderizar (append si es loadMore, replace si es inicial)
        this.renderTwitterPosts(data, loadMore);
        console.log('✅ Posts de X cargados exitosamente');

    } catch (error) {
        console.error('❌ Error al cargar posts de X:', error);
        this.showTwitterError(error.message);
    }
},

// Actualizar renderTwitterPosts para soportar append
renderTwitterPosts(apiData, append = false) {
    const container = document.querySelector('.twitter-feed .feed-content');
    if (!container) return;

    const users = apiData.includes?.users || [];
    const userMap = new Map(users.map(user => [user.id, user]));

    const postsHTML = apiData.data.map(post => {
        const author = userMap.get(post.author_id);
        return this.createPostCard(post, author);
    }).join('');

    if (append) {
        // Agregar al final
        container.insertAdjacentHTML('beforeend', postsHTML);
    } else {
        // Reemplazar todo
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = postsHTML;
            container.style.opacity = '1';
        }, 200);
    }
},

// En init(), agregar listener para el botón
init() {
    // ... código existente ...
    
    // Setup load more button
    const loadMoreBtn = document.getElementById('load-more-tweets');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            this.fetchTwitterPosts(true);
        });
    }
}
```

**CSS para el botón**
```css
.load-more-btn {
    display: block;
    margin: var(--spacing-md) auto;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--yellow);
    color: var(--dark-gray);
    border: none;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
}

.load-more-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}
```

### 5. Actualizar automáticamente cada X minutos

```javascript
// En el objeto MuroDeContencion:
autoRefreshInterval: null,

init() {
    // ... código existente ...
    
    // Auto-refresh cada 5 minutos (300000 ms)
    this.setupAutoRefresh(300000);
},

setupAutoRefresh(intervalMs) {
    // Limpiar intervalo anterior si existe
    if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
    }
    
    // Establecer nuevo intervalo
    this.autoRefreshInterval = setInterval(() => {
        console.log('🔄 Auto-actualizando posts...');
        this.fetchTwitterPosts();
    }, intervalMs);
    
    console.log(`⏰ Auto-refresh configurado cada ${intervalMs / 60000} minutos`);
},

// Opcional: pausar/reanudar cuando la pestaña no está visible
setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('⏸️ Pausando auto-refresh (pestaña oculta)');
            if (this.autoRefreshInterval) {
                clearInterval(this.autoRefreshInterval);
            }
        } else {
            console.log('▶️ Reanudando auto-refresh (pestaña visible)');
            this.setupAutoRefresh(300000);
            this.fetchTwitterPosts(); // Actualizar inmediatamente
        }
    });
}
```

### 6. Agregar indicador de carga

**HTML**
```html
<div class="feed-content" id="twitter-feed-content">
    <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando posts...</p>
    </div>
</div>
```

**JavaScript**
```javascript
showLoading() {
    const container = document.querySelector('.twitter-feed .feed-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando posts...</p>
        </div>
    `;
},

async fetchTwitterPosts() {
    this.showLoading(); // ← Agregar al inicio
    
    try {
        // ... resto del código ...
    } catch (error) {
        // ... manejo de errores ...
    }
}
```

**CSS**
```css
.loading-spinner {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--medium-gray);
}

.loading-spinner i {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
    display: block;
    color: var(--yellow);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

## 🔧 Debugging y Testing

### Ver los datos crudos de la API
```javascript
// En fetchTwitterPosts(), después de recibir data:
console.log('📊 Datos de la API:', JSON.stringify(data, null, 2));
```

### Simular datos sin llamar a la API (testing)
```javascript
// Crear datos de prueba
const mockData = {
    data: [
        {
            id: "123",
            text: "Tweet de prueba #testing",
            created_at: new Date().toISOString(),
            author_id: "456",
            public_metrics: {
                like_count: 10,
                retweet_count: 5,
                reply_count: 2
            }
        }
    ],
    includes: {
        users: [
            {
                id: "456",
                username: "testuser",
                name: "Test User",
                profile_image_url: "https://via.placeholder.com/40"
            }
        ]
    }
};

// Usar en lugar de fetch:
// this.renderTwitterPosts(mockData);
```

## 🚨 Errores Comunes y Soluciones

### Error 401 - Unauthorized
**Causa**: Bearer Token inválido o expirado
**Solución**: Regenera tu Bearer Token en el Developer Portal

### Error 403 - Forbidden
**Causa**: No tienes permisos para acceder a ese endpoint
**Solución**: Verifica que tu App tenga los permisos correctos

### Error 429 - Too Many Requests
**Causa**: Has excedido el límite de peticiones
**Solución**: 
- Reduce la frecuencia de peticiones
- Implementa caché
- Upgrade tu plan de API

### CORS Error
**Causa**: Navegador bloquea peticiones cross-origin desde file://
**Solución**: 
- Usa un servidor local (Live Server en VS Code)
- O implementa un backend proxy

---

Para más ejemplos, consulta:
- **README.md** - Documentación completa
- **ARCHITECTURE.md** - Flujo de datos detallado
- **QUICKSTART.md** - Inicio rápido
