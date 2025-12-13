// ============================================
// Muro de Contención - Main JavaScript
// ============================================

// Estructura preparada para futuras integraciones de API
const MuroDeContencion = {
    // Configuración
    config: {
        twitterAPI: null,
        dailymotionAPI: null,
        animationSpeed: 300
    },

    // Inicialización
    init() {
        console.log('🚀 Muro de Contención cargado');
        this.setupIntersectionObserver();
        this.setupSmoothScroll();
        this.setupHeaderScroll();
        this.setupLazyLoading();
        
        // Cargar posts de X
        if (typeof X_API_CONFIG !== 'undefined') {
            if (X_API_CONFIG.useProxy) {
                console.log('✅ Usando backend proxy para obtener posts de X');
                this.fetchTwitterPosts();
            } else {
                console.warn('⚠️ Backend proxy desactivado - pueden ocurrir errores de CORS');
                this.showTwitterConfigMessage();
            }
        } else {
            console.error('❌ X_API_CONFIG no está definido');
            this.showTwitterConfigMessage();
        }
        
        // Cargar videos de YouTube
        if (typeof YOUTUBE_API_CONFIG !== 'undefined') {
            if (YOUTUBE_API_CONFIG.useProxy) {
                console.log('✅ Usando backend proxy para obtener videos de YouTube');
                this.fetchYouTubeVideos();
            } else {
                console.warn('⚠️ Backend proxy desactivado para YouTube');
            }
        } else {
            console.log('ℹ️ YOUTUBE_API_CONFIG no está definido (opcional)');
        }
    },

    // Observador de intersección para animaciones al hacer scroll
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }; 

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observar elementos que se animarán
        const elementsToObserve = document.querySelectorAll(
            '.post-card, .video-card, .about-content, .contact-btn'
        );
        
        elementsToObserve.forEach(el => observer.observe(el));
    },

    // Scroll suave para navegación
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    // Header con efecto al hacer scroll
    setupHeaderScroll() {
        // Header mantiene su tamaño fijo, sin cambios al hacer scroll
        // Solo se mantiene el efecto sticky del CSS
    },

    // Lazy loading para imágenes (cuando se agreguen)
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    // ============================================
    // Funciones para API de Twitter/X
    // ============================================
    
    // LocalStorage keys
    STORAGE_KEY: 'murodecontencion_tweets',
    STORAGE_TIMESTAMP_KEY: 'murodecontencion_tweets_timestamp',
    
    // LocalStorage keys para YouTube
    YOUTUBE_STORAGE_KEY: 'murodecontencion_youtube',
    YOUTUBE_STORAGE_TIMESTAMP_KEY: 'murodecontencion_youtube_timestamp',

    // Guardar tweets en LocalStorage
    saveTweetsToStorage(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            localStorage.setItem(this.STORAGE_TIMESTAMP_KEY, Date.now().toString());
            console.log('💾 Tweets guardados en LocalStorage');
        } catch (error) {
            console.warn('⚠️ No se pudo guardar en LocalStorage:', error);
        }
    },

    // Obtener tweets de LocalStorage
    getTweetsFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const timestamp = localStorage.getItem(this.STORAGE_TIMESTAMP_KEY);
            
            if (data && timestamp) {
                const savedTime = new Date(parseInt(timestamp));
                console.log(`📦 Tweets encontrados en LocalStorage (guardados: ${savedTime.toLocaleString()})`);
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.warn('⚠️ Error al leer LocalStorage:', error);
            return null;
        }
    },

    // Limpiar tweets de LocalStorage
    clearTweetsFromStorage() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.STORAGE_TIMESTAMP_KEY);
            console.log('🗑️ LocalStorage limpiado');
        } catch (error) {
            console.warn('⚠️ Error al limpiar LocalStorage:', error);
        }
    },

    async fetchTwitterPosts() {
        console.log('🐦 Cargando posts de X...');
        
        try {
            // Usar backend proxy si está configurado
            let url, fetchOptions;
            
            if (X_API_CONFIG.useProxy) {
                // Petición al backend proxy (sin credenciales en el frontend)
                const params = new URLSearchParams({
                    'max_results': X_API_CONFIG.maxResults
                });
                
                url = `${X_API_CONFIG.proxyBaseUrl}/api/tweets?${params}`;
                fetchOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                console.log('📡 Usando backend proxy:', url);
            } else {
                // Petición directa a la API de X (solo para desarrollo, causa CORS)
                console.warn('⚠️ Petición directa a API de X - puede causar errores de CORS');
                const params = new URLSearchParams({
                    'max_results': X_API_CONFIG.maxResults,
                    'tweet.fields': 'id,text,created_at,public_metrics,author_id',
                    'user.fields': 'id,name,username,profile_image_url',
                    'expansions': 'author_id'
                });
                
                url = `https://api.x.com/2/users/${X_API_CONFIG.userId}/tweets?${params}`;
                fetchOptions = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${X_API_CONFIG.bearerToken}`,
                        'Content-Type': 'application/json'
                    }
                };
            }

            // Realizar petición
            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            // Verificar si hay datos
            if (!data.data || data.data.length === 0) {
                console.warn('⚠️ No se encontraron posts en la API');
                
                // Intentar cargar desde LocalStorage
                const cachedData = this.getTweetsFromStorage();
                if (cachedData) {
                    console.log('📦 Mostrando tweets desde LocalStorage');
                    this.renderTwitterPosts(cachedData, true);
                    return;
                }
                
                // Si no hay nada en LocalStorage, mostrar mensaje
                this.showNoTweetsMessage();
                return;
            }

            // Guardar en LocalStorage
            this.saveTweetsToStorage(data);

            // Renderizar posts
            this.renderTwitterPosts(data, false);
            console.log('✅ Posts de X cargados exitosamente desde la API');

        } catch (error) {
            console.error('❌ Error al cargar posts de X:', error);
            
            // Intentar cargar desde LocalStorage como fallback
            const cachedData = this.getTweetsFromStorage();
            if (cachedData) {
                console.log('📦 API falló. Mostrando tweets desde LocalStorage');
                this.renderTwitterPosts(cachedData, true);
            } else {
                // No hay datos en LocalStorage, mostrar mensaje
                console.log('❌ No hay tweets en LocalStorage');
                this.showNoTweetsMessage();
            }
        }
    },

    renderTwitterPosts(apiData, fromStorage = false) {
        const container = document.querySelector('.twitter-feed .feed-content');
        if (!container) return;

        // Obtener información del usuario desde includes
        const users = apiData.includes?.users || [];
        const userMap = new Map(users.map(user => [user.id, user]));

        // Generar HTML para cada post
        const postsHTML = apiData.data.map(post => {
            const author = userMap.get(post.author_id);
            return this.createPostCard(post, author);
        }).join('');

        // Actualizar contenedor con animación
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = postsHTML;
            container.style.opacity = '1';
        }, 200);
    },

    createPostCard(post, author) {
        const metrics = post.public_metrics || { 
            like_count: 0, 
            reply_count: 0, 
            retweet_count: 0 
        };

        const profileImage = author?.profile_image_url || '';
        const username = author?.username || 'usuario';
        const name = author?.name || username;
        const timeAgo = this.formatDate(post.created_at);
        const postUrl = `https://x.com/${username}/status/${post.id}`;

        return `
            <article class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar" style="background-image: url('${profileImage}')"></div>
                    <div class="post-meta">
                        <h3><a href="https://x.com/${username}" target="_blank" rel="noopener">@${username}</a></h3>
                        <span class="post-time">${timeAgo}</span>
                    </div>
                </div>
                <p class="post-text">${this.formatTweetText(post.text)}</p>
                <div class="post-actions">
                    <span title="Me gusta"><i class="far fa-heart"></i> ${this.formatNumber(metrics.like_count)}</span>
                    <span title="Respuestas"><i class="far fa-comment"></i> ${this.formatNumber(metrics.reply_count)}</span>
                    <span title="Retweets"><i class="fas fa-retweet"></i> ${this.formatNumber(metrics.retweet_count)}</span>
                </div>
                <a href="${postUrl}" target="_blank" rel="noopener" class="post-link-overlay" aria-label="Ver post en X"></a>
            </article>
        `;
    },

    formatTweetText(text) {
        // Escapar HTML
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        let formattedText = escapeHtml(text);

        // Convertir URLs en links (simple)
        formattedText = formattedText.replace(
            /https?:\/\/[^\s]+/g,
            match => `<a href="${match}" target="_blank" rel="noopener">${match}</a>`
        );

        // Convertir mentions en links
        formattedText = formattedText.replace(
            /@(\w+)/g,
            '<a href="https://x.com/$1" target="_blank" rel="noopener">@$1</a>'
        );

        // Convertir hashtags en links
        formattedText = formattedText.replace(
            /#(\w+)/g,
            '<a href="https://x.com/hashtag/$1" target="_blank" rel="noopener">#$1</a>'
        );

        return formattedText;
    },

    showNoTweetsMessage() {
        const container = document.querySelector('.twitter-feed .feed-content');
        if (!container) return;

        container.innerHTML = `
            <div class="api-message no-content">
                <i class="fas fa-inbox"></i>
                <h3>No hay tweets para mostrar</h3>
            </div>
        `;
    },



    showTwitterMessage(message) {
        const container = document.querySelector('.twitter-feed .feed-content');
        if (!container) return;

        container.innerHTML = `
            <div class="api-message info">
                <i class="fas fa-info-circle"></i>
                <p>${message}</p>
            </div>
        `;
    },

    showTwitterConfigMessage() {
        const container = document.querySelector('.twitter-feed .feed-content');
        if (!container) return;

        container.innerHTML = `
            <div class="api-message config">
                <i class="fas fa-server"></i>
                <h3>Servidor Backend Requerido</h3>
                <p>Para ver los posts de X, necesitas iniciar el servidor backend:</p>
                <ol>
                    <li>Abre una terminal en la carpeta <code>server/</code></li>
                    <li>Ejecuta: <code>npm install</code></li>
                    <li>Configura el archivo <code>server/.env</code> con tus credenciales</li>
                    <li>Ejecuta: <code>npm start</code></li>
                    <li>Recarga esta página</li>
                </ol>
                <p class="small">El servidor proxy evita problemas de CORS y mantiene tus credenciales seguras.</p>
            </div>
        `;
    },

    // ============================================
    // Funciones para API de Dailymotion
    // ============================================
    async fetchDailymotionVideos() {
        // TODO: Implementar llamada a API de Dailymotion
        console.log('🎥 Preparado para cargar videos de Dailymotion');
        
        /*
        Ejemplo de estructura esperada:
        try {
            const response = await fetch('TU_ENDPOINT_DE_API');
            const data = await response.json();
            this.renderDailymotionVideos(data);
        } catch (error) {
            console.error('Error al cargar videos:', error);
        }
        */
    },

    renderDailymotionVideos(videos) {
        const container = document.querySelector('.video-feed .feed-content');
        if (!container) return;

        // TODO: Implementar renderizado de videos reales
        // container.innerHTML = videos.map(video => this.createVideoCard(video)).join('');
    },

    createVideoCard(video) {
        // TODO: Crear estructura HTML para cada video
        return `
            <article class="video-card">
                <!-- Contenido del video -->
            </article>
        `;
    },

    // ============================================
    // Funciones para API de YouTube
    // ============================================
    
    // Guardar videos de YouTube en LocalStorage
    saveYouTubeToStorage(data) {
        try {
            localStorage.setItem(this.YOUTUBE_STORAGE_KEY, JSON.stringify(data));
            localStorage.setItem(this.YOUTUBE_STORAGE_TIMESTAMP_KEY, Date.now().toString());
            console.log('💾 Videos de YouTube guardados en LocalStorage');
        } catch (error) {
            console.warn('⚠️ No se pudo guardar YouTube en LocalStorage:', error);
        }
    },

    // Obtener videos de YouTube desde LocalStorage
    getYouTubeFromStorage() {
        try {
            const data = localStorage.getItem(this.YOUTUBE_STORAGE_KEY);
            const timestamp = localStorage.getItem(this.YOUTUBE_STORAGE_TIMESTAMP_KEY);
            
            if (data && timestamp) {
                const savedTime = new Date(parseInt(timestamp));
                console.log(`📦 Videos de YouTube encontrados en LocalStorage (guardados: ${savedTime.toLocaleString()})`);
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.warn('⚠️ Error al leer YouTube desde LocalStorage:', error);
            return null;
        }
    },

    // Limpiar videos de YouTube de LocalStorage
    clearYouTubeFromStorage() {
        try {
            localStorage.removeItem(this.YOUTUBE_STORAGE_KEY);
            localStorage.removeItem(this.YOUTUBE_STORAGE_TIMESTAMP_KEY);
            console.log('🗑️ LocalStorage de YouTube limpiado');
        } catch (error) {
            console.warn('⚠️ Error al limpiar YouTube de LocalStorage:', error);
        }
    },

    async fetchYouTubeVideos() {
        console.log('📺 Cargando videos de YouTube...');
        
        try {
            const params = new URLSearchParams({
                'max_results': YOUTUBE_API_CONFIG.maxResults
            });
            
            const url = `${YOUTUBE_API_CONFIG.proxyBaseUrl}/api/youtube/videos?${params}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Verificar si hay datos
            if (!data.items || data.items.length === 0) {
                console.warn('⚠️ No se encontraron videos en la API');
                
                // Intentar cargar desde LocalStorage
                const cachedData = this.getYouTubeFromStorage();
                if (cachedData) {
                    console.log('📦 Mostrando videos desde LocalStorage');
                    this.renderYouTubeVideos(cachedData, true);
                    return;
                }
                
                // Si no hay nada en LocalStorage, mostrar mensaje
                this.showNoYouTubeMessage();
                return;
            }

            // Guardar en LocalStorage
            this.saveYouTubeToStorage(data);

            // Renderizar videos
            this.renderYouTubeVideos(data, false);
            console.log('✅ Videos de YouTube cargados exitosamente desde la API');

        } catch (error) {
            console.error('❌ Error al cargar videos de YouTube:', error);
            
            // Intentar cargar desde LocalStorage como fallback
            const cachedData = this.getYouTubeFromStorage();
            if (cachedData) {
                console.log('📦 API falló. Mostrando videos desde LocalStorage');
                this.renderYouTubeVideos(cachedData, true);
            } else {
                // No hay datos en LocalStorage, mostrar mensaje
                console.log('❌ No hay videos en LocalStorage');
                this.showNoYouTubeMessage();
            }
        }
    },

    renderYouTubeVideos(apiData, fromStorage = false) {
        const container = document.querySelector('.video-feed .feed-content');
        if (!container) return;

        // Generar HTML para cada video
        const videosHTML = apiData.items.map(video => {
            return this.createYouTubeVideoCard(video);
        }).join('');

        // Actualizar contenedor con animación
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = videosHTML;
            container.style.opacity = '1';
        }, 200);
    },

    createYouTubeVideoCard(video) {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.medium.url;
        const channelTitle = video.snippet.channelTitle;
        const publishedAt = this.formatDate(video.snippet.publishedAt);
        
        return `
            <article class="video-card youtube-video" data-video-id="${videoId}">
                <div class="video-thumbnail-wrapper">
                    <img src="${thumbnail}" alt="${title}" class="video-thumbnail-img" loading="lazy">
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="play-overlay">
                        <i class="fas fa-play-circle"></i>
                    </a>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${title}</h3>
                    <p class="video-meta">
                        <span><i class="far fa-clock"></i> ${publishedAt}</span>
                    </p>
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="video-link">
                        <i class="fab fa-youtube"></i> Ver en YouTube
                    </a>
                </div>
            </article>
        `;
    },

    showNoYouTubeMessage() {
        const container = document.querySelector('.video-feed .feed-content');
        if (!container) return;

        container.innerHTML = `
            <div class="api-message no-content">
                <i class="fas fa-video-slash"></i>
                <h3>No hay videos para mostrar</h3>
            </div>
        `;
    },

    // ============================================
    // Utilidades
    // ============================================
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // diferencia en segundos

        if (diff < 60) return 'Hace unos segundos';
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
        if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
};

// ============================================
// Inicialización cuando el DOM esté listo
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MuroDeContencion.init());
} else {
    MuroDeContencion.init();
}

// Exponer objeto global para debugging
window.MuroDeContencion = MuroDeContencion;