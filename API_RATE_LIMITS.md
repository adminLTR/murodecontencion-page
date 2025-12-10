# Límites de la API de X y Mejores Prácticas

## 📊 Límites de Rate por Plan

### Free Tier (Básico)
- **Tweets por mes**: 1,500 tweets
- **Requests**: 50 cada 15 minutos
- **Tweet caps**: 50 tweets por request
- **User lookup**: 300 requests/15 min

### Basic Plan ($100/mes)
- **Tweets por mes**: 10,000 tweets
- **Requests**: Más generosos
- **Features adicionales**: Webhooks, más endpoints

### Pro/Enterprise
- Límites personalizados
- Soporte prioritario
- Acceso a features avanzados

## ⚠️ Error 429: Too Many Requests

### ¿Qué significa?
Has alcanzado el límite de requests permitidos en la ventana de tiempo actual (15 minutos).

### ¿Cuánto debo esperar?
- **15 minutos** desde tu última petición exitosa
- Los límites se resetean cada 15 minutos

### Soluciones Implementadas

#### 1. Sistema de Caché (✅ Ya implementado)
```javascript
// En server/.env
CACHE_TTL_MINUTES=5  // Ajusta según necesidad
```

**Beneficios**:
- Reduce peticiones a la API de X
- Respuesta más rápida (sin latencia de red)
- Funciona incluso con error 429

**Recomendación**:
- Desarrollo: `CACHE_TTL_MINUTES=5`
- Producción: `CACHE_TTL_MINUTES=15` o `30`

#### 2. Fallback a Cache Antiguo
Si recibes error 429 y tienes datos en cache (aunque estén expirados), el servidor los devuelve automáticamente con un warning.

### Monitoreo de Uso

#### Ver headers de rate limit
Agrega esto al servidor para ver límites restantes:

```javascript
// En server.js después de la petición a la API
if (response.headers.get('x-rate-limit-remaining')) {
    console.log(`📉 Requests restantes: ${response.headers.get('x-rate-limit-remaining')}`);
    console.log(`⏰ Reset en: ${new Date(response.headers.get('x-rate-limit-reset') * 1000)}`);
}
```

## 🎯 Mejores Prácticas

### 1. Optimizar Cache
```env
# Para blog de noticias
CACHE_TTL_MINUTES=5

# Para contenido estático
CACHE_TTL_MINUTES=30

# Para portfolio/sitio personal
CACHE_TTL_MINUTES=60
```

### 2. No Refrescar Automáticamente
❌ **Evita esto en el frontend:**
```javascript
// MAL - refresca cada minuto
setInterval(() => fetchTweets(), 60000);
```

✅ **Mejor:**
```javascript
// Solo cargar al abrir la página
// Usuario puede refrescar manualmente si quiere
```

### 3. Implementar Rate Limiting en el Frontend
```javascript
let lastFetchTime = 0;
const MIN_INTERVAL = 60000; // 1 minuto

async function fetchTweets() {
    const now = Date.now();
    if (now - lastFetchTime < MIN_INTERVAL) {
        console.log('⏱️ Esperando antes de recargar...');
        return;
    }
    
    lastFetchTime = now;
    // hacer fetch...
}
```

### 4. Usar Webhooks (Planes pagados)
En lugar de polling, usa webhooks para recibir notificaciones cuando hay nuevos tweets.

### 5. Almacenamiento Persistente (Avanzado)
Para producción, considera usar una base de datos en lugar de cache en memoria:

```javascript
// Opciones:
// - Redis (cache rápido)
// - MongoDB (almacenamiento persistente)
// - PostgreSQL (relacional)
```

## 📈 Estrategias por Tipo de Sitio

### Blog de Noticias (Actualizaciones frecuentes)
```env
CACHE_TTL_MINUTES=5
```
- Cache corto para contenido fresco
- Considera plan Basic si superas límites

### Portfolio Personal (Actualizaciones ocasionales)
```env
CACHE_TTL_MINUTES=60
```
- Cache largo, tuiteas poco
- Free tier suficiente

### Dashboard Corporativo (Múltiples usuarios)
```env
CACHE_TTL_MINUTES=10
```
- Cache moderado
- Considera Redis para cache compartido
- Plan Enterprise recomendado

## 🔍 Debugging Rate Limits

### Ver cuántas requests has hecho
El servidor ahora muestra en consola:
```
📡 Solicitando tweets a la API de X...
✅ 5 tweets obtenidos exitosamente
💾 Cache actualizado. Válido por 300 segundos
```

O si usa cache:
```
✅ Usando datos en cache (expira en 180s)
```

### Calcular uso mensual
```
Requests por día = (24 * 60) / CACHE_TTL_MINUTES
Requests por mes ≈ Requests por día * 30

Ejemplo con CACHE_TTL_MINUTES=5:
- Por día: 288 requests
- Por mes: 8,640 requests (¡excede Free tier!)

Con CACHE_TTL_MINUTES=30:
- Por día: 48 requests  
- Por mes: 1,440 requests (dentro de Free tier)
```

## 🚀 Actualizar Plan

Si necesitas más requests:

1. Ve a https://developer.x.com/en/portal/products
2. Selecciona el plan que necesitas
3. Completa el pago
4. No necesitas cambiar código, funciona automáticamente

## 💡 Tips Adicionales

### Mostrar Timestamp en el Frontend
Informa al usuario cuándo se cargaron los tweets:

```javascript
// En el frontend
if (data._cached) {
    const expiresIn = data._cache_expires_in;
    console.log(`Datos en cache. Se actualizarán en ${expiresIn}s`);
    // Mostrar en UI: "Última actualización: hace 2 minutos"
}
```

### Botón de Recarga Manual
```html
<button onclick="location.reload()">🔄 Actualizar tweets</button>
```

Pero limita frecuencia:
```javascript
let lastReload = 0;
button.onclick = () => {
    if (Date.now() - lastReload < 60000) {
        alert('⏱️ Espera 1 minuto entre actualizaciones');
        return;
    }
    location.reload();
    lastReload = Date.now();
};
```

### Notificar al Usuario
```javascript
// Si el servidor devuelve warning de rate limit
if (data._warning) {
    showNotification(data._warning, 'warning');
}
```

## 📚 Recursos

- [Rate Limits Oficiales](https://developer.x.com/en/docs/twitter-api/rate-limits)
- [Planes y Precios](https://developer.x.com/en/portal/products)
- [Best Practices](https://developer.x.com/en/docs/twitter-api/migrate/twitter-api-endpoint-map)

---

## ✅ Checklist de Optimización

- [x] Sistema de cache implementado
- [x] Fallback a cache antiguo en error 429
- [x] TTL configurable
- [ ] Rate limiting en frontend (recomendado)
- [ ] Mostrar timestamp de última actualización
- [ ] Notificaciones de rate limit al usuario
- [ ] Logging de uso para monitoreo
- [ ] Cache persistente (Redis/DB) para producción

---

¿Sigues teniendo problemas de rate limit? Considera aumentar `CACHE_TTL_MINUTES` a 15 o 30 minutos.
