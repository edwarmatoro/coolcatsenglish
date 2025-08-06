# Monitoreo del Certificado SSL

## Estado Actual
- **Dominio**: coolcatsenglish.com
- **Estado**: Esperando propagación DNS
- **Proveedor**: Let's Encrypt (automático en Netlify)

## Verificar el progreso

### 1. Verificar DNS (cada 2-4 horas):
```bash
dig coolcatsenglish.com
```

### 2. Verificar SSL (cada 4-6 horas):
```bash
curl -I https://coolcatsenglish.com
```

### 3. Verificar en Netlify:
- Ve a tu dashboard de Netlify
- Domain settings → coolcatsenglish.com
- El estado debería cambiar de "Waiting on DNS propagation" a "Active"

## Tiempo estimado
- **Propagación DNS**: 2-24 horas
- **Certificado SSL**: 1-24 horas después de la propagación DNS
- **Total**: 24-48 horas máximo

## Mientras esperas

### Usar dominio temporal:
- URL: https://playful-hotteok-3b82e2.netlify.app
- Sitemap temporal: https://playful-hotteok-3b82e2.netlify.app/sitemap.xml

### Configurar SEO temporal:
1. Google Search Console: Añadir sitemap temporal
2. Google Analytics: Verificar que funciona
3. Google My Business: Actualizar sitio web

## Una vez que SSL esté activo

### Actualizar configuraciones:
1. Cambiar sitemap de vuelta a coolcatsenglish.com
2. Actualizar Google Search Console
3. Verificar que todo funciona con HTTPS

## Comandos útiles

### Verificar certificado:
```bash
openssl s_client -connect coolcatsenglish.com:443 -servername coolcatsenglish.com
```

### Verificar redirección:
```bash
curl -I http://coolcatsenglish.com
```

### Verificar www:
```bash
curl -I https://www.coolcatsenglish.com
``` 