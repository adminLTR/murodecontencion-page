# 🧱 Muro de Contención - Blog de Opinión Política

Blog de opinión política nacional e internacional y agencia de noticias independiente con sede en Lima, Perú.

## 🚀 Stack Tecnológico

- **Backend**: PHP 8.2
- **Servidor Web**: Apache
- **Contenedores**: Docker & Docker Compose
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **APIs**: X/Twitter API v2, YouTube Data API v3
- **Cache**: Sistema de archivos JSON

## 📋 Requisitos Previos

- Docker Desktop instalado
- Credenciales de API de X/Twitter
- Credenciales de YouTube Data API v3

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd murodecontencion
```

### 2. Configurar variables de entorno

Edita `.env` y reemplaza con tus credenciales reales:

```env
# X/Twitter API
X_API_BEARER_TOKEN=tu_bearer_token_aqui
X_API_USER_ID=tu_user_id_aqui

# YouTube API
YOUTUBE_API_KEY=tu_api_key_aqui
YOUTUBE_CHANNEL_ID=tu_channel_id_aqui
```

#### Obtener credenciales de X/Twitter:
1. Ve a https://developer.x.com/en/portal/dashboard
2. Crea o selecciona tu App
3. En "Keys and tokens", copia el Bearer Token
4. Obtén tu User ID en https://tweeterid.com/

#### Obtener credenciales de YouTube:
1. Sigue las instrucciones en `YOUTUBE_API_SETUP.md`
2. Crea proyecto en Google Cloud Console
3. Habilita YouTube Data API v3
4. Genera API Key
5. Obtén el Channel ID de tu canal

### 3. Construir y ejecutar con Docker

```bash
# Construir la imagen
docker-compose build

# Iniciar el contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f
```

La aplicación estará disponible en: **http://localhost:8080**

### 4. Detener el contenedor

```bash
docker-compose down
```

## 📁 Estructura del Proyecto

```
murodecontencion/
├── api/                      # Endpoints PHP
│   ├── tweets.php           # API de X/Twitter
│   └── youtube.php          # API de YouTube
├── cache/                    # Cache de datos (creado automáticamente)
├── css/                      # Estilos
│   └── styles.css
├── js/                       # JavaScript
│   ├── config.js            # Configuración frontend
│   └── script.js            # Lógica principal
├── img/                      # Imágenes
│   └── logo.jpeg
├── config.php               # Configuración PHP y variables de entorno
├── Cache.php                # Sistema de cache
├── index.php                # Página principal
├── .htaccess                # Configuración Apache
├── .env                     # Variables de entorno (NO subir a Git)
├── Dockerfile               # Imagen Docker PHP 8.2
└── docker-compose.yml       # Orquestación Docker
```

## 🔧 Características

### ✅ Sistema de Cache Inteligente
- Cache persistente en archivos JSON
- TTL configurable (X: 15 min, YouTube: 30 min)
- Fallback automático a cache expirado si la API falla
- Manejo de quota exceeded de YouTube

### ✅ APIs Integradas
- **X/Twitter**: Últimos 3-5 posts del usuario
- **YouTube**: Últimos 3 videos del canal

### ✅ Frontend Reactivo
- Diseño responsive
- Carga dinámica de contenido
- LocalStorage como fallback
- Animaciones suaves

## 🌐 Despliegue en Hostinger

### 1. Preparar archivos

Sube todos los archivos del proyecto excepto:
- `.git/`
- `cache/` (se creará automáticamente)
- `*.log`

### 2. Subir a Hostinger

1. Accede al File Manager de Hostinger
2. Sube los archivos al directorio `public_html`
3. Configura el archivo `.env` con tus credenciales

### 3. Configurar permisos

```bash
chmod 755 api/
chmod 755 cache/
chmod 644 .htaccess
chmod 600 .env
```

### 4. Verificar requisitos

- PHP 8.2 o superior
- Extensiones: curl, json
- Apache con mod_rewrite habilitado

## 🐛 Solución de Problemas

### Error: "X_API_BEARER_TOKEN no configurado"
- Verifica que el archivo `.env` existe
- Asegúrate de que las credenciales están correctamente configuradas

### Error: "QUOTA_EXCEEDED" de YouTube
- Es normal si excedes el límite diario (10,000 unidades)
- El sistema usará automáticamente el cache
- La cuota se renueva diariamente a medianoche (hora del Pacífico)

### Los posts/videos no se actualizan
- Limpia el cache: `rm cache/*.json`
- Verifica las credenciales en `.env`

## 📊 Monitoreo

Los archivos de cache se guardan en:
- `cache/tweets_cache.json`
- `cache/youtube_cache.json`

Puedes inspeccionarlos para ver timestamp, TTL y datos guardados.

## 🔐 Seguridad

- ✅ `.env` está en `.gitignore`
- ✅ Archivos PHP sensibles protegidos por `.htaccess`
- ✅ Headers de seguridad configurados
- ⚠️ **NUNCA** subas credenciales a Git

---

**Desarrollado en Lima, Perú 🇵🇪**
