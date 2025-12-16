<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Muro de Contención - Blog</title>
    <link rel="stylesheet" href="css/styles.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="js/config.js"></script>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container header-content">
            <h1 class="site-title">Muro de Contención</h1>
            <a href="mailto:email@murodecontencion.es" class="header-email" aria-label="Enviar correo">
                <i class="fas fa-envelope"></i>
            </a>
        </div>
    </header>

    <!-- Main Content -->
    <main>
        <!-- Social Links Section -->
        <section id="redes" class="social-links-section">
            <div class="container">
                <div class="social-icons-row">
                    <a target="_blank" href="https://www.instagram.com/murodces?igsh=c3o0cGZlMHBjYmx5&utm_source=qr" class="social-circle-icon instagram" aria-label="Instagram">
                        <i class="fab fa-instagram"></i>
                    </a>
                    
                    <a target="_blank" href="https://www.facebook.com/share/1DHBhKjKaR/?mibextid=wwXIfr" class="social-circle-icon facebook" aria-label="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    
                    <a target="_blank" href="https://x.com/murodces?s=11" class="social-circle-icon twitter" aria-label="X (Twitter)">
                        <i class="fab fa-x-twitter"></i>
                    </a>
                    
                    <a target="_blank" href="#" class="social-circle-icon tiktok" aria-label="TikTok">
                        <i class="fab fa-tiktok"></i>
                    </a>
                    
                    <a target="_blank" href="https://www.youtube.com/channel/UCj7joHDcCGXC9EQssq0ntEQ" class="social-circle-icon youtube" aria-label="YouTube">
                        <i class="fab fa-youtube"></i>
                    </a>
                </div>
            </div>
        </section>

        <!-- Social Feed Section -->
        <section id="contenido" class="social-feed-section">
            <div class="feed-grid">
                    <!-- Twitter Feed Column -->
                    <div class="feed-column twitter-feed">
                        <div class="feed-header">
                            <i class="fab fa-x-twitter"></i>
                            <h2>Últimos Posts de X</h2>
                        </div>
                        <div class="feed-content" id="twitter-feed-content">
                            <!-- Los últimos tweets aparecerán aquí automáticamente -->
                            <article class="post-card">
                                <div class="post-header">
                                    <div class="post-avatar"></div>
                                    <div class="post-meta">
                                        <h3>@murodecontencion</h3>
                                        <span class="post-time">Hace unos momentos</span>
                                    </div>
                                </div>
                                <p class="post-text">🔄 Cargando los últimos posts de nuestra cuenta de X... Mantente conectado para las últimas noticias y análisis político.</p>
                                <div class="post-actions">
                                    <span><i class="far fa-heart"></i> --</span>
                                    <span><i class="far fa-comment"></i> --</span>
                                    <span><i class="fas fa-retweet"></i> --</span>
                                </div>
                            </article>

                            <article class="post-card">
                                <div class="post-header">
                                    <div class="post-avatar"></div>
                                    <div class="post-meta">
                                        <h3>@murodecontencion</h3>
                                        <span class="post-time">Actualizando...</span>
                                    </div>
                                </div>
                                <p class="post-text">💭 Aquí podrás leer nuestras opiniones sobre la coyuntura política nacional e internacional en tiempo real.</p>
                                <div class="post-actions">
                                    <span><i class="far fa-heart"></i> --</span>
                                    <span><i class="far fa-comment"></i> --</span>
                                    <span><i class="fas fa-retweet"></i> --</span>
                                </div>
                            </article>

                            <article class="post-card">
                                <div class="post-header">
                                    <div class="post-avatar"></div>
                                    <div class="post-meta">
                                        <h3>@murodecontencion</h3>
                                        <span class="post-time">Próximamente</span>
                                    </div>
                                </div>
                                <p class="post-text">📰 Síguenos en X para estar al día con nuestros reportajes, columnas de opinión y análisis en profundidad.</p>
                                <div class="post-actions">
                                    <span><i class="far fa-heart"></i> --</span>
                                    <span><i class="far fa-comment"></i> --</span>
                                    <span><i class="fas fa-retweet"></i> --</span>
                                </div>
                            </article>
                        </div>
                        <div class="feed-view-more">
                            <a href="https://x.com/murodces" target="_blank" rel="noopener">
                                <span>Ver más en X</span>
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Dailymotion Feed Column -->
                    <div class="feed-column video-feed">
                        <div class="feed-header">
                            <i class="fas fa-video"></i>
                            <h2>Últimos Videos</h2>
                        </div>
                        <div class="feed-content">
                            <!-- Los últimos videos aparecerán aquí automáticamente -->
                            <article class="video-card">
                                <div class="video-thumbnail">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                                <div class="video-info">
                                    <h3>🎥 Cargando últimos videos...</h3>
                                    <p class="video-meta">
                                        <span>Próximamente aquí</span>
                                    </p>
                                </div>
                            </article>

                            <article class="video-card">
                                <div class="video-thumbnail">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                                <div class="video-info">
                                    <h3>📺 Reportajes y entrevistas exclusivas</h3>
                                    <p class="video-meta">
                                        <span>Actualizando contenido...</span>
                                    </p>
                                </div>
                            </article>

                            <article class="video-card">
                                <div class="video-thumbnail">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                                <div class="video-info">
                                    <h3>🎬 Análisis político en video</h3>
                                    <p class="video-meta">
                                        <span>Próximamente disponible</span>
                                    </p>
                                </div>
                            </article>
                        </div>
                        <div class="feed-view-more">
                            <a href="https://www.youtube.com/channel/UCj7joHDcCGXC9EQssq0ntEQ" target="_blank" rel="noopener">
                                <span>Ver más en YouTube</span>
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
        </section>

        <!-- About Section -->
        <section id="nosotros" class="about-section">
            <div class="container">
                <div class="about-content">
                    <h2 class="section-title">SOBRE NOSOTROS</h2>
                    <div class="about-text">
                        <p>
                            <strong>Muro de Contención</strong> es un blog de opinión política nacional e internacional, y una agencia de noticias independiente con sede en Lima, Perú. Analizamos la coyuntura política, social y económica del Perú y de ámbito internacional, ofreciendo perspectivas críticas y pluralidad de voces.
                        </p>
                        <p>
                            Nuestra misión es promover y estar comprometidos con la verdad, la democracia y la libertad de expresión.
                        </p>
                        <p>
                            Desde Lima, conectamos a nuestra audiencia con la actualidad nacional e internacional, promoviendo el debate informado y el pensamiento crítico. Somos un espacio abierto para la reflexión, la denuncia y la construcción de ciudadanía.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Separador -->
        <div class="container">
            <div class="section-divider"></div>
        </div>

        <!-- Contact Section -->
        <section id="contacto" class="contact-section">
            <div class="container">
                <h2 class="section-title">Contáctanos</h2>
                <div class="contact-buttons">
                    <div class="contact-item">
                        <a href="#" class="contact-icon telegram-btn" aria-label="Telegram">
                            <i class="fab fa-telegram"></i>
                        </a>
                        <span class="contact-label">Canal de telegram</span>
                    </div>
                    <div class="contact-item">
                        <a href="#" class="contact-icon whatsapp-btn" aria-label="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                        <span class="contact-label">Canal de whatsapp</span>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <p>Muro de contención - 2025</p>
                <p>Lima - Perú</p>
            </div>
        </div>
    </footer>

    <script src="js/script.js"></script>
</body>
</html>
