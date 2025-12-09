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
        // TODO: Implementar llamada a API de X/Twitter
        console.log('🐦 Preparado para cargar posts de X');
        
        /*
        Ejemplo de estructura esperada:
        try {
            const response = await fetch('TU_ENDPOINT_DE_API');
            const data = await response.json();
            this.renderTwitterPosts(data);
        } catch (error) {
            console.error('Error al cargar posts de X:', error);
        }
        */
    },

    renderTwitterPosts(posts) {
        const container = document.querySelector('.twitter-feed .feed-content');
        if (!container) return;

        // TODO: Implementar renderizado de posts reales
        // container.innerHTML = posts.map(post => this.createPostCard(post)).join('');
    },

    createPostCard(post) {
        // TODO: Crear estructura HTML para cada post
        return `
            <article class="post-card">
                <!-- Contenido del post -->
            </article>
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