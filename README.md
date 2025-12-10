# Muro de Contención - Blog

Un blog moderno y responsivo con integración de redes sociales.

## 🚀 Características

- ✅ Diseño responsivo y moderno
- ✅ Integración con API de X (Twitter) v2
- ✅ Sección de videos de Dailymotion (próximamente)
- ✅ Animaciones CSS suaves
- ✅ Paleta de colores personalizada
- ✅ Accesibilidad optimizada

## 📋 Configuración de la API de X (Twitter)

Para mostrar tus posts reales de X en el sitio, necesitas configurar las credenciales de la API.

### Paso 1: Obtener Bearer Token

1. Ve al [X Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Si no tienes una cuenta de desarrollador, créala (es gratis para uso básico)
3. Crea una nueva App o selecciona una existente
4. Ve a la sección **"Keys and tokens"**
5. Copia tu **Bearer Token** (o genera uno nuevo si no existe)

### Paso 2: Obtener tu User ID

Tienes varias opciones para obtener tu User ID:

#### Opción A: Usar una herramienta en línea
- Ve a [tweeterid.com](https://tweeterid.com/)
- Ingresa tu username de X (sin el @)
- Copia el ID numérico que aparece

#### Opción B: Usar la API de X
```bash
curl "https://api.x.com/2/users/by/username/TU_USERNAME" \
  -H "Authorization: Bearer TU_BEARER_TOKEN"
```

### Paso 3: Configurar las credenciales

1. Abre el archivo `js/config.js`
2. Reemplaza `TU_BEARER_TOKEN_AQUI` con tu Bearer Token
3. Reemplaza `TU_USER_ID_AQUI` con tu User ID
4. Guarda el archivo

```javascript
const X_API_CONFIG = {
    bearerToken: 'AAAAAAAAAAAAAAAAAAAAAA...',  // Tu Bearer Token real
    userId: '123456789',                        // Tu User ID real
    // ... resto de la configuración
};
```

### Paso 4: Probar la integración

1. Abre `index.html` en tu navegador
2. Los últimos 5 posts de tu cuenta de X deberían aparecer automáticamente
3. Si ves un mensaje de error, revisa la consola del navegador (F12) para más detalles

## 🔒 Seguridad

### ⚠️ IMPORTANTE: No subas tus credenciales a GitHub

Para proteger tus credenciales:

1. **Crea un archivo `.gitignore`** (si no existe):
```
# Credenciales sensibles
js/config.js

# Otros archivos
node_modules/
.DS_Store
```

2. **Opción recomendada para producción**: Usa un backend proxy
   - Crea un servidor backend (Node.js, Python, PHP, etc.)
   - El backend almacena el Bearer Token de forma segura
   - El frontend hace peticiones a tu backend
   - Tu backend hace peticiones a la API de X

### Ejemplo de backend proxy (Node.js)

```javascript
// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.get('/api/tweets', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.x.com/2/users/${process.env.USER_ID}/tweets`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
                },
                params: req.query
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

Crea un archivo `.env`:
```
BEARER_TOKEN=tu_bearer_token_aqui
USER_ID=tu_user_id_aqui
```

## 🎨 Personalización

### Colores

Los colores se definen en `css/styles.css`:

```css
:root {
    --dark-gray: #262626;
    --black: black;
    --light-grey: #f4f4f4;
    --white: white;
    --stabilitx: #ebebeb;
    --yellow: #ffdc61;
    --light-cream: #f7f6f4;
}
```

### Número de posts

Para cambiar cuántos posts se muestran, edita `js/config.js`:

```javascript
maxResults: 5, // Cambia este número (5-100)
```

## 📱 Estructura del Proyecto

```
murodecontencion/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   ├── config.js       # Configuración de APIs
│   └── script.js       # JavaScript principal
├── img/
│   └── dailymotion.svg # Logo de Dailymotion
└── README.md           # Este archivo
```

## 🐛 Solución de Problemas

### "Error al cargar posts"

**Causa**: Credenciales incorrectas o problema de CORS

**Solución**:
1. Verifica que tu Bearer Token sea correcto
2. Verifica que tu User ID sea correcto
3. Revisa la consola del navegador (F12) para errores específicos
4. Si usas localhost, puede haber problemas de CORS - usa un backend proxy

### "No se encontraron posts recientes"

**Causa**: La cuenta no tiene posts públicos recientes

**Solución**:
1. Verifica que tu cuenta de X tenga posts públicos
2. Asegúrate de que el User ID corresponda a la cuenta correcta

### Los posts no se actualizan

**Causa**: Caché del navegador

**Solución**:
1. Refresca la página con Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)
2. Limpia el caché del navegador

## 🔮 Próximas Funcionalidades

- [ ] Integración con API de Dailymotion
- [ ] Sistema de caché para reducir llamadas a la API
- [ ] Modo oscuro
- [ ] Filtros de posts por fecha
- [ ] Búsqueda de posts
- [ ] Compartir posts en redes sociales

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para dudas o sugerencias, contáctanos a través de:
- Telegram: [Enlace a configurar]
- WhatsApp: [Enlace a configurar]

---

Hecho con ❤️ por el equipo de Muro de Contención
