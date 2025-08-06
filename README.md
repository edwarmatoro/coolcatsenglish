# 🐱 CoolCats English - Sitio Web

Un sitio web moderno y responsivo para la escuela de inglés CoolCats English, diseñado para mostrar servicios de enseñanza de inglés de forma divertida y efectiva.

## 🚀 Características

- ✅ **Diseño Responsivo**: Se adapta perfectamente a todos los dispositivos
- ✅ **Animaciones Suaves**: Efectos visuales modernos y atractivos
- ✅ **SEO Optimizado**: Meta tags y estructura para mejor posicionamiento
- ✅ **Formulario de Contacto**: Funcional con validaciones
- ✅ **Navegación Móvil**: Menú hamburguesa para dispositivos móviles
- ✅ **Accesibilidad**: Cumple estándares de accesibilidad web
- ✅ **Rendimiento Optimizado**: Carga rápida y eficiente

## 📁 Estructura del Proyecto

```
mi-sitio-web/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Funcionalidad JavaScript
├── images/             # Imágenes y recursos
│   ├── logo.svg        # Logo principal
│   ├── favicon.svg     # Favicon
│   └── hero-illustration.svg # Ilustración principal
├── DOMINIO-SETUP.md    # Guía de configuración del dominio
└── README.md           # Este archivo
```

## 🎨 Secciones del Sitio

### 1. **Header/Navegación**
- Logo de CoolCats English
- Menú de navegación responsivo
- Efectos de scroll

### 2. **Hero Section**
- Mensaje principal atractivo
- Call-to-action prominente
- Ilustración animada

### 3. **Servicios**
- Clases particulares
- Grupos pequeños
- Clases online

### 4. **Acerca de**
- Información de la escuela
- Estadísticas de éxito
- Metodología

### 5. **Contacto**
- Información de contacto
- Formulario funcional
- Validaciones en tiempo real

### 6. **Footer**
- Enlaces rápidos
- Redes sociales
- Información legal

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS
- **JavaScript ES6+**: Funcionalidad interactiva
- **SVG**: Gráficos vectoriales escalables
- **Google Fonts**: Tipografía Inter

## 🚀 Cómo Publicar tu Sitio

### Opción 1: Netlify (Gratuito y Fácil)

1. **Crear cuenta en Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Regístrate con tu email

2. **Subir el sitio**
   - Arrastra la carpeta `mi-sitio-web` al área de drop
   - Netlify detectará automáticamente que es un sitio estático

3. **Configurar dominio personalizado**
   - Ve a Site settings > Domain management
   - Agrega tu dominio: `coolcatsenglish.com`

### Opción 2: GitHub Pages

1. **Crear repositorio en GitHub**
```bash
   git init
   git add .
   git commit -m "Primer commit"
   git remote add origin https://github.com/tu-usuario/coolcatsenglish.git
   git push -u origin main
   ```

2. **Activar GitHub Pages**
   - Ve a Settings > Pages
   - Source: Deploy from a branch
   - Branch: main

### Opción 3: Hostinger (Recomendado para producción)

1. **Comprar hosting y dominio**
   - Ve a [hostinger.com](https://hostinger.com)
   - Selecciona un plan con dominio incluido

2. **Subir archivos**
   - Accede al panel cPanel
   - Sube todos los archivos a la carpeta `public_html`

## 🔧 Personalizaciones

### Cambiar Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary-color: #f59e0b;    /* Color principal */
    --secondary-color: #d97706;   /* Color secundario */
    --accent-color: #fbbf24;      /* Color de acento */
}
```

### Agregar Contenido
- **Imágenes**: Colócalas en la carpeta `images/`
- **Texto**: Edita directamente en `index.html`
- **Funcionalidad**: Modifica `script.js`

### SEO y Marketing
- **Google Analytics**: Agrega el código en el `<head>`
- **Meta tags**: Ya están optimizados en `index.html`
- **Redes sociales**: Actualiza los enlaces en el footer

## 📱 Responsive Design

El sitio está optimizado para:
- 📱 **Móviles**: 320px - 768px
- 📱 **Tablets**: 768px - 1024px
- 💻 **Desktop**: 1024px+

## 🎯 Próximas Mejoras

### Contenido
- [ ] Galería de fotos de clases
- [ ] Testimonios de estudiantes
- [ ] Blog con tips de inglés
- [ ] Página de precios

### Funcionalidades
- [ ] Calendario de clases
- [ ] Sistema de reservas
- [ ] Chat en vivo
- [ ] Integración con WhatsApp

### Marketing
- [ ] Google My Business
- [ ] Email marketing
- [ ] SEO local
- [ ] Campañas en redes sociales

## 🐛 Solución de Problemas

### El sitio no carga
- Verifica que todos los archivos estén subidos
- Comprueba la configuración DNS (24-48 horas)
- Revisa los logs del servidor

### Las imágenes no aparecen
- Verifica las rutas en `index.html`
- Asegúrate de que los archivos existan
- Comprueba los permisos de archivos

### El formulario no funciona
- El formulario actual es de demostración
- Para funcionalidad real, considera:
  - Netlify Forms
  - Formspree
  - Backend personalizado

## 📞 Soporte

Si tienes problemas o preguntas:
- 📧 Email: info@coolcatsenglish.com
- 📱 WhatsApp: +1 (555) 123-4567
- 🌐 Sitio web: coolcatsenglish.com

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usar, modificar y distribuir libremente.

---

**¡Tu sitio web está listo para recibir estudiantes! 🎉**

*Desarrollado con ❤️ para CoolCats English* 