# 🐳 Instrucciones Rápidas - Docker

## Iniciar el proyecto por primera vez

```bash
# 1. Configurar variables de entorno
# Edita el archivo .env con tus credenciales

# 2. Construir la imagen Docker
docker-compose build

# 3. Iniciar el contenedor
docker-compose up -d

# 4. Verificar que está corriendo
docker-compose ps

# 5. Ver logs
docker-compose logs -f
```

La aplicación estará disponible en: **http://localhost:8080**

## Comandos útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Detener el contenedor
docker-compose down

# Reiniciar el contenedor
docker-compose restart

# Reconstruir la imagen (después de cambios en Dockerfile)
docker-compose build --no-cache

# Entrar al contenedor (para debugging)
docker-compose exec web bash

# Ver estado del contenedor
docker-compose ps

# Ver uso de recursos
docker stats murodecontencion-php
```

## Limpiar cache

```bash
# Desde tu máquina local
rm cache/*.json

# O desde dentro del contenedor
docker-compose exec web rm -f /var/www/html/cache/*.json
```

## Verificar que funciona

1. Abre: http://localhost:8080
2. Deberías ver la página principal
3. Los posts de X y videos de YouTube deberían cargar automáticamente
4. Revisa la consola del navegador (F12) para ver logs

## Solución de problemas

### El contenedor no inicia
```bash
# Ver logs detallados
docker-compose logs web

# Verificar que el puerto 8080 no esté ocupado
netstat -ano | findstr :8080
```

### Cambios no se reflejan
```bash
# Los archivos están montados como volumen
# Los cambios deberían verse inmediatamente
# Si no, reinicia:
docker-compose restart
```

### Error de permisos en cache/
```bash
# Desde el contenedor
docker-compose exec web chown -R www-data:www-data /var/www/html/cache
docker-compose exec web chmod -R 755 /var/www/html/cache
```

## Para producción (Hostinger)

No uses Docker en Hostinger. En su lugar:
1. Sube los archivos directamente vía FTP o File Manager
2. Asegúrate de que PHP 8.2 esté habilitado
3. Configura el `.env` con tus credenciales
4. Configura permisos: `chmod 755 cache/`

---

Para más detalles, consulta `README.md`
