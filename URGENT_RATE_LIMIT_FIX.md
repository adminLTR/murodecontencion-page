# 🚨 INSTRUCCIONES URGENTES - Error 429

## ❌ Problema Actual

Has alcanzado el límite de rate limit de X API (tier FREE: **1 request cada 15 minutos**).

**Lo que está pasando:**
- Cada vez que recargas la página, intentas hacer una nueva petición a la API
- Ya agotaste tu límite de 1 request/15min
- Por eso ves múltiples errores 429 seguidos

## ✅ SOLUCIÓN INMEDIATA

### Paso 1: DETÉN TODO
1. **NO RECARGUES LA PÁGINA** por los próximos 15 minutos
2. Cierra el navegador si es necesario
3. Deja el servidor corriendo (si quieres) o deténlo

### Paso 2: ESPERA 15 MINUTOS
El rate limit se resetea cada 15 minutos. Necesitas esperar.

**¿Cómo saber cuándo ha pasado el tiempo?**
- Anota la hora actual
- Espera 15 minutos completos
- Verifica con el script: `cd server && npm run verify`

### Paso 3: REINICIA CORRECTAMENTE

Después de 15 minutos:

```powershell
# 1. Detén el servidor actual (Ctrl+C en su terminal)

# 2. Reinicia el servidor
cd server
npm start

# 3. Abre el navegador EN UNA SOLA PESTAÑA
# Ve a: http://localhost:5500 (o donde tengas el index.html)

# 4. NO RECARGUES - espera a que cargue
```

### Paso 4: USA EL CACHÉ CORRECTAMENTE

Una vez que obtengas datos exitosos:
- **NO recargues la página frecuentemente**
- El caché dura 30 minutos
- Los datos se guardan en LocalStorage del navegador
- Si reinicias el servidor, el caché persiste en archivo

## 🔧 Verificar Estado del Rate Limit

Ejecuta este comando para ver cuándo se resetea el límite:

```powershell
cd server
npm run verify
```

Este script te mostrará:
- Si tus credenciales son válidas
- Cuántos requests te quedan
- Cuándo se resetea el límite

## ⚠️ IMPORTANTE: Tier FREE

El tier FREE de X API es EXTREMADAMENTE limitado:

### Límites del Tier FREE
- ✅ 1 request cada 15 minutos por app
- ❌ NO puedes hacer requests frecuentes
- ❌ NO puedes actualizar en tiempo real
- ❌ NO puedes recargar la página cada pocos segundos

### ¿Qué SÍ puedes hacer?
✅ Hacer 1 request cada 15-30 minutos
✅ Usar el caché persistente
✅ Mostrar datos guardados en LocalStorage
✅ Mantener la página abierta sin recargar

### ¿Qué NO debes hacer?
❌ Recargar la página frecuentemente
❌ Abrir múltiples pestañas del sitio
❌ Reiniciar el servidor constantemente
❌ Hacer F5 / Ctrl+R

## 🎯 Próximos Pasos Recomendados

### Opción 1: Obtener tu Propio Bearer Token (GRATIS)
El token que usas podría estar compartido. Obtén uno propio:

1. Ve a https://developer.x.com/en/portal/dashboard
2. Crea una cuenta de desarrollador (gratis)
3. Crea una nueva App
4. Genera tu Bearer Token
5. Actualiza `server/.env` con tu nuevo token

**Ventaja:** Tendrás tu propio límite de 1 req/15min que SOLO TÚ usarás.

### Opción 2: Actualizar a Tier Basic ($100/mes)
Si necesitas actualizar datos más frecuentemente:
- Basic: 10 requests cada 15 minutos
- Permite recargar cada 1-2 minutos
- https://developer.x.com/en/products/x-api

### Opción 3: Usar Datos Estáticos (GRATIS)
Si no necesitas datos en tiempo real:
- Copia manualmente tweets
- Agrégalos como HTML estático
- No uses la API en absoluto

## 📊 Monitoreo Actual

Tu configuración actual:
- **User ID:** 1930557730856505344
- **Caché TTL:** 30 minutos
- **Tier:** FREE (1 req/15min)
- **Caché persistente:** ✅ Activado

## 🐛 Debug: ¿Por Qué Múltiples Errores 429?

En los logs del servidor viste:

```
📡 Solicitando tweets a la API de X... (error 429)
📡 Solicitando tweets a la API de X... (error 429)
📡 Solicitando tweets a la API de X... (error 429)
...
```

**Esto significa:**
1. Cada línea = 1 recarga de página o 1 pestaña abierta
2. Cada recarga intenta llamar a la API
3. Como ya alcanzaste el límite, todas fallan con 429
4. El caché no ayuda porque nunca obtuviste datos exitosos primero

**Solución:**
- Espera 15 minutos SIN RECARGAR
- Haz 1 request exitoso
- Ese se guardará en caché
- A partir de ahí, el caché trabajará por ti

## 📝 Checklist

Antes de seguir:

- [ ] He dejado de recargar la página
- [ ] Han pasado al menos 15 minutos
- [ ] He ejecutado `npm run verify` para verificar el estado
- [ ] Tengo el rate limit disponible (remaining > 0)
- [ ] Voy a hacer UNA SOLA petición y dejar que el caché trabaje

## 🆘 Si Nada Funciona

Si después de 15 minutos sigues con error 429:

1. **El Bearer Token está compartido/bloqueado**
   - Solución: Obtén tu propio token (pasos arriba)

2. **El User ID es inválido**
   - Verifica con: `npm run verify`
   - Usa tu propio User ID

3. **Estás en una IP compartida**
   - Otros en tu red pueden estar usando la misma API
   - Cambia de red o usa VPN

---

**Siguiente acción:** Espera 15 minutos y ejecuta `cd server && npm run verify`
