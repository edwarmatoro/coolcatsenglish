# Configuración de Cloudflare para Netlify

## Pasos para configurar Cloudflare

### 1. Crear cuenta en Cloudflare
1. Ve a https://cloudflare.com
2. Crea una cuenta gratuita
3. Añade tu dominio: `coolcatsenglish.com`

### 2. Cambiar nameservers en Porkbun
Cloudflare te dará 2 nameservers, cámbialos en Porkbun:
- Ve a tu panel de Porkbun
- Nameservers → Custom nameservers
- Añade los nameservers de Cloudflare

### 3. Configurar registros DNS en Cloudflare
Añade estos registros en Cloudflare:

```
Tipo: A
Nombre: @
Contenido: 75.2.60.5
Proxy: Activado (nube naranja)

Tipo: A
Nombre: www
Contenido: 75.2.60.5
Proxy: Activado (nube naranja)
```

### 4. Configurar SSL/TLS
1. Ve a "SSL/TLS" en Cloudflare
2. Modo: **Full (strict)**
3. Siempre usar HTTPS: **Activado**
4. HSTS: **Activado**

### 5. Configurar caché y optimizaciones

#### Caché:
- Ve a "Caching" → "Configuration"
- Browser Cache TTL: **4 hours**
- Always Online: **Activado**

#### Optimizaciones:
- Ve a "Speed" → "Optimization"
- Auto Minify: **CSS, JavaScript, HTML**
- Brotli: **Activado**
- Rocket Loader: **Activado**

#### Reglas de página:
- Ve a "Rules" → "Page Rules"
- Crea regla: `coolcatsenglish.com/*`
- Configuración: "Cache Level: Cache Everything"

### 6. Configurar seguridad
- Ve a "Security"
- Security Level: **Medium**
- Bot Fight Mode: **Activado**
- Browser Integrity Check: **Activado**

### 7. Configurar Workers (opcional)
Para mejor rendimiento, puedes crear un Worker:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)
  
  // Añadir headers de caché
  newResponse.headers.set('Cache-Control', 'public, max-age=3600')
  newResponse.headers.set('CDN-Cache-Control', 'public, max-age=86400')
  
  return newResponse
}
```

## Beneficios de Cloudflare

### Velocidad:
- ✅ CDN global (200+ ubicaciones)
- ✅ Caché inteligente
- ✅ Compresión automática
- ✅ Optimización de imágenes

### Seguridad:
- ✅ SSL gratuito
- ✅ Protección DDoS
- ✅ Firewall web
- ✅ Bot protection

### SEO:
- ✅ HTTPS automático
- ✅ Headers optimizados
- ✅ Mejor Core Web Vitals
- ✅ Redirecciones automáticas

## Verificar configuración

### Comandos útiles:
```bash
# Verificar DNS
dig coolcatsenglish.com

# Verificar SSL
curl -I https://coolcatsenglish.com

# Verificar caché
curl -I https://coolcatsenglish.com -H "CF-Cache-Status: HIT"
```

### Headers esperados:
- `CF-Cache-Status: HIT`
- `CF-RAY: [ray-id]`
- `Server: cloudflare` 