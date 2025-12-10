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
        
        // Cargar posts de X si la configuración está disponible
        if (typeof X_API_CONFIG !== 'undefined' && 
            X_API_CONFIG.bearerToken !== 'TU_BEARER_TOKEN_AQUI' &&
            X_API_CONFIG.userId !== 'TU_USER_ID_AQUI') {
            this.fetchTwitterPosts();
        } else {
            console.warn('⚠️ Configura tu Bearer Token y User ID en js/config.js para ver posts reales de X');
            this.showTwitterConfigMessage();
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
        let lastScroll = 0;
        const header = document.querySelector('.header');

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.style.padding = '1rem 0';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
            } else {
                header.style.padding = '2rem 0';
                header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
            }

            lastScroll = currentScroll;
        });
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
    async fetchTwitterPosts() {
        console.log('🐦 Cargando posts de X...');
        
        try {
            // Construir URL con parámetros
            const params = new URLSearchParams({
                'max_results': X_API_CONFIG.maxResults,
                'tweet.fields': X_API_CONFIG.tweetFields.join(','),
                'user.fields': X_API_CONFIG.userFields.join(','),
                'expansions': X_API_CONFIG.expansions.join(',')
            });

            const url = `${X_API_CONFIG.apiBaseUrl}/users/${X_API_CONFIG.userId}/tweets?${params}`;

            // Realizar petición a la API de X
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${X_API_CONFIG.bearerToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            // Verificar si hay datos
            if (!data.data || data.data.length === 0) {
                console.warn('⚠️ No se encontraron posts');
                this.showTwitterMessage('No se encontraron posts recientes');
                return;
            }

            // Renderizar posts
            this.renderTwitterPosts(data);
            console.log('✅ Posts de X cargados exitosamente');

        } catch (error) {
            console.error('❌ Error al cargar posts de X:', error);
            this.showTwitterError(error.message);
        }
    },

    renderTwitterPosts(apiData) {
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

    showTwitterError(errorMessage) {
        const container = document.querySelector('.twitter-feed .feed-content');
        if (!container) return;

        container.innerHTML = `
            <div class="api-message error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar posts</h3>
                <p>${errorMessage}</p>
                <p class="small">Revisa la consola para más detalles.</p>
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
                <i class="fas fa-cog"></i>
                <h3>Configuración necesaria</h3>
                <p>Para ver tus posts reales de X, configura tu Bearer Token y User ID en <code>js/config.js</code></p>
                <ol>
                    <li>Ve a <a href="https://developer.x.com/en/portal/dashboard" target="_blank">X Developer Portal</a></li>
                    <li>Obtén tu Bearer Token</li>
                    <li>Obtén tu User ID</li>
                    <li>Actualiza <code>js/config.js</code></li>
                </ol>
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