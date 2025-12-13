<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Muro de Contención - Blog</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="js/config.js"></script>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container header-content">
            <h1 class="site-title">Muro de Contención</h1>
        </div>
    </header>

    <!-- Main Content -->
    <main>
        <!-- Social Links Section -->
        <section id="redes" class="social-links-section">
            <div class="container">
                <div class="social-icons-row">
                    <a href="#" class="social-circle-icon facebook" aria-label="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    
                    <a href="#" class="social-circle-icon instagram" aria-label="Instagram">
                        <i class="fab fa-instagram"></i>
                    </a>
                    
                    <a href="#" class="social-circle-icon twitter" aria-label="X (Twitter)">
                        <i class="fab fa-x-twitter"></i>
                    </a>
                    
                    <a href="#" class="social-circle-icon youtube" aria-label="YouTube">
                        <i class="fab fa-youtube"></i>
                    </a>
                    
                    <a href="#" class="social-circle-icon tiktok" aria-label="TikTok">
                        <i class="fab fa-tiktok"></i>
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
                            <!-- Placeholder posts -->
                            <article class="post-card">
                                <div class="post-header">
                                    <div class="post-avatar"></div>
                                    <div class="post-meta">
                                        <h3>@murodecontencion</h3>
                                        <span class="post-time">Hace 2 horas</span>
                                    </div>
                                </div>
                                <p class="post-text">Este es un ejemplo de un post de X. El contenido real se cargará mediante la API.</p>
                                <div class="post-actions">
                                    <span><i class="far fa-heart"></i> 24</span>
                                    <span><i class="far fa-comment"></i> 5</span>
                                    <span><i class="fas fa-retweet"></i> 8</span>
                                </div>
                            </article>

                            <article class="post-card">
                                <div class="post-header">
                                    <div class="post-avatar"></div>
                                    <div class="post-meta">
                                        <h3>@murodecontencion</h3>
                                        <span class="post-time">Hace 5 horas</span>
                                    </div>
                                </div>
                                <p class="post-text">Otro ejemplo de post. Pronto aquí verás contenido real de nuestra cuenta de X.</p>
                                <div class="post-actions">
                                    <span><i class="far fa-heart"></i> 42</span>
                                    <span><i class="far fa-comment"></i> 12</span>
                                    <span><i class="fas fa-retweet"></i> 15</span>
                                </div>
                            </article>

                            <article class="post-card">
                                <div class="post-header">
                                    <div class="post-avatar"></div>
                                    <div class="post-meta">
                                        <h3>@murodecontencion</h3>
                                        <span class="post-time">Hace 1 día</span>
                                    </div>
                                </div>
                                <p class="post-text">Tercer post de ejemplo con contenido placeholder.</p>
                                <div class="post-actions">
                                    <span><i class="far fa-heart"></i> 38</span>
                                    <span><i class="far fa-comment"></i> 7</span>
                                    <span><i class="fas fa-retweet"></i> 10</span>
                                </div>
                            </article>
                        </div>
                    </div>

                    <!-- Dailymotion Feed Column -->
                    <div class="feed-column video-feed">
                        <div class="feed-header">
                            <i class="fas fa-video"></i>
                            <h2>Últimos Videos</h2>
                        </div>
                        <div class="feed-content">
                            <!-- Placeholder videos -->
                            <article class="video-card">
                                <div class="video-thumbnail">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                                <div class="video-info">
                                    <h3>Título del Video 1</h3>
                                    <p class="video-meta">
                                        <span><i class="far fa-eye"></i> 1.2K vistas</span>
                                        <span>Hace 3 días</span>
                                    </p>
                                </div>
                            </article>

                            <article class="video-card">
                                <div class="video-thumbnail">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                                <div class="video-info">
                                    <h3>Título del Video 2</h3>
                                    <p class="video-meta">
                                        <span><i class="far fa-eye"></i> 850 vistas</span>
                                        <span>Hace 5 días</span>
                                    </p>
                                </div>
                            </article>

                            <article class="video-card">
                                <div class="video-thumbnail">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                                <div class="video-info">
                                    <h3>Título del Video 3</h3>
                                    <p class="video-meta">
                                        <span><i class="far fa-eye"></i> 2.1K vistas</span>
                                        <span>Hace 1 semana</span>
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
        </section>

        <!-- About Section -->
        <section id="nosotros" class="about-section">
            <div class="container">
                <div class="about-content">
                    <h2 class="section-title">Quiénes Somos</h2>
                    <div class="about-text">
                        <p>
                            <strong>Muro de Contención</strong> es un blog de opinión política nacional e internacional, y una agencia de noticias independiente con sede en Lima, Perú. Analizamos la coyuntura política, social y económica del Perú y el mundo, ofreciendo perspectivas críticas y pluralidad de voces.
                        </p>
                        <p>
                            Nuestro equipo está conformado por periodistas, analistas y colaboradores comprometidos con la verdad, la democracia y la libertad de expresión. Publicamos reportajes, columnas de opinión, entrevistas y análisis en profundidad sobre los temas más relevantes de la agenda pública.
                        </p>
                        <p>
                            Desde Lima, conectamos a nuestra audiencia con la actualidad nacional e internacional, promoviendo el debate informado y el pensamiento crítico. Somos un espacio abierto para la reflexión, la denuncia y la construcción de ciudadanía.
                        </p>
                        <p>
                            Únete a nuestra comunidad y sé parte de la conversación política que mueve al Perú y al mundo.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contacto" class="contact-section">
            <div class="container">
                <h2 class="section-title">Contáctanos</h2>
                <div class="contact-buttons">
                    <a href="#" class="contact-icon telegram-btn" aria-label="Telegram">
                        <i class="fab fa-telegram"></i>
                    </a>
                    <a href="#" class="contact-icon whatsapp-btn" aria-label="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
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