# 🚀 Inicio Rápido - Muro de Contención

## ⚡ Configuración en 5 minutos

### 1️⃣ Clona y abre el proyecto
```bash
cd murodecontencion
```

### 2️⃣ Crea tu archivo de configuración
```bash
# En Windows PowerShell
Copy-Item js\config.example.js js\config.js

# En macOS/Linux
cp js/config.example.js js/config.js
```

### 3️⃣ Obtén tus credenciales de X

#### Bearer Token:
1. 🔗 Abre: https://developer.x.com/en/portal/dashboard
2. ➕ Crea o selecciona tu App
3. 🔑 Ve a "Keys and tokens"
4. 📋 Copia el "Bearer Token"

#### User ID:
1. 🔗 Abre: https://tweeterid.com/
2. ✍️ Ingresa tu username (sin @)
3. 📋 Copia el ID numérico

### 4️⃣ Configura tus credenciales

Abre `js/config.js` y reemplaza:

```javascript
bearerToken: 'AAAAAAAAAAAAAAAAAAAAAxxxx...',  // ← Pega tu Bearer Token aquí
userId: '123456789',                          // ← Pega tu User ID aquí
```

### 5️⃣ ¡Listo! Abre el sitio

Abre `index.html` en tu navegador y deberías ver tus últimos 5 posts de X.

---

## 🆘 ¿Problemas?

### ❌ "Error al cargar posts"
- ✅ Verifica que tu Bearer Token sea correcto
- ✅ Verifica que tu User ID sea correcto
- ✅ Abre la consola del navegador (F12) para más detalles

### ❌ "Configuración necesaria"
- ✅ Asegúrate de haber creado el archivo `js/config.js`
- ✅ Verifica que no diga `TU_BEARER_TOKEN_AQUI` en el archivo

### ❌ Problemas de CORS
Si estás en `localhost` y ves errores de CORS:
1. Usa un servidor local (Live Server en VS Code)
2. O considera crear un backend proxy (ver README.md completo)

---

## 🎨 Personalización Rápida

### Cambiar número de posts
`js/config.js` → `maxResults: 10` (5-100)

### Cambiar colores
`css/styles.css` → `:root { --yellow: #tu-color; }`

---

## 📚 Documentación Completa
Lee `README.md` para instrucciones detalladas, seguridad y producción.

---

## 🔒 IMPORTANTE
⚠️ **NUNCA** subas `js/config.js` a GitHub con tus credenciales reales.
El archivo ya está en `.gitignore` para protegerte.

---

¿Todo funcionando? ¡Genial! 🎉
¿Necesitas ayuda? Lee el README.md completo.
