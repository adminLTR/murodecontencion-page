# 🚨 Problema de Rate Limit - Error 429

## ❌ Problema Identificado

Estás recibiendo error **429 "Too Many Requests"** porque el **tier FREE de X API tiene límites extremadamente restrictivos**.

### Límites del Tier FREE (sin pagar)

Para el endpoint `GET /2/users/:id/tweets` con Bearer Token:

| Tier | Límite por App | Límite por Usuario |
|------|---------------|-------------------|
| **FREE** | **1 request / 15 minutos** | 1 request / 15 minutos |
| Basic ($100/mes) | 10 requests / 15 minutos | 5 requests / 15 minutos |
| Pro | 1500 requests / 15 minutos | 900 requests / 15 minutos |

**Esto significa que en el tier FREE:**
- Solo puedes hacer **1 petición cada 15 minutos**
- Si recargas la página antes de que pasen 15 minutos, obtendrás error 429
- No importa si tienes caché: si la API se llama, cuenta como request

## 🔍 Por qué pasa esto

1. **Haces una petición** → La API responde correctamente
2. **La segunda petición en menos de 15 minutos** → Error 429
3. **El caché actual es de 30 minutos**, pero si reinicias el servidor, el caché se pierde
4. **El Bearer Token que usas** parece ser compartido/público, lo que agota el límite más rápido

## ✅ Soluciones

### Solución 1: Aumentar el Caché y Persistirlo (GRATIS)

Ya implementé caché de 30 minutos, pero se pierde al reiniciar el servidor. Voy a:

1. **Hacer caché persistente** guardando en archivo
2. **Aumentar TTL a 24 horas** para reducir drásticamente las peticiones
3. **Solo llamar a la API si el caché ha expirado**

### Solución 2: Usar LocalStorage en el Frontend (GRATIS)

Ya está implementado. Los tweets se guardan en el navegador y se muestran cuando la API falla.

### Solución 3: Obtener tu Propio Bearer Token (GRATIS)

El Bearer Token que estás usando (`AAAAAAAAAAAAAAAAAAAAAFHL5wEAAAAA...`) puede estar siendo usado por otras personas.

**Cómo obtener tu propio token:**
1. Ve a https://developer.x.com/en/portal/dashboard
2. Regístrate como desarrollador (es gratis)
3. Crea una nueva App
4. Ve a "Keys and tokens" → "Bearer Token"
5. Genera un nuevo Bearer Token
6. Reemplázalo en `server/.env`

**Ventaja:** Tendrás tu propio límite de 1 request/15min que SOLO TÚ usarás.

### Solución 4: Actualizar a Basic Tier ($100/mes)

Si necesitas actualizar datos más frecuentemente:
- Basic: 10 requests cada 15 minutos
- Suficiente para actualizar cada 2-3 minutos
- https://developer.x.com/en/products/x-api

### Solución 5: Cambiar a OAuth 1.0a User Context (Más complejo)

En lugar de usar Bearer Token (app-only), usar OAuth 1.0a:
- Requiere autenticación de usuario
- Límites más altos en algunos endpoints
- Más complejo de implementar

## 🎯 Recomendación INMEDIATA

1. **Obtén tu propio Bearer Token** (pasos arriba)
2. **No recargues la página frecuentemente** - espera al menos 15 minutos
3. **Usa LocalStorage** - los tweets se guardan automáticamente en el navegador
4. **El caché del servidor** ya está a 30 minutos

## 📊 Cómo Monitorear el Rate Limit

Agregué logs en el servidor que muestran:
- `x-rate-limit-limit`: Total de requests permitidos
- `x-rate-limit-remaining`: Requests restantes en esta ventana
- `x-rate-limit-reset`: Cuándo se resetea el límite

Verás esto en la consola del servidor cada vez que se hace una petición.

## 🔧 Próximos Pasos

Voy a implementar **caché persistente en archivo** para que no se pierda al reiniciar el servidor. Esto será completamente transparente y gratuito.
