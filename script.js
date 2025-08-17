// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del DOM
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const contactForm = document.querySelector('.contact-form');
    const ctaButton = document.querySelector('.cta-button');
    
    // Menú móvil
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            const isOpen = navMenu.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }
    
    // Cerrar menú móvil al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Scroll suave para enlaces internos
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animación del header al hacer scroll
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Animación de elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    const animatedElements = document.querySelectorAll('.service-card, .stat, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Manejo del formulario de contacto
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const mensaje = document.getElementById('mensaje').value;
            
            // Validación básica
            if (!nombre || !email || !mensaje) {
                showNotification('Por favor, completa todos los campos.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Por favor, ingresa un email válido.', 'error');
                return;
            }
            
            // Mostrar estado de envío
            const submitButton = this.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;
            
            // Enviar formulario directamente
            const formData = new FormData(this);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                this.reset();
            })
            .catch((error) => {
                showNotification('Error al enviar el mensaje. Por favor, intenta nuevamente.', 'error');
                console.error('Error:', error);
            })
            .finally(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Función para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Sistema de notificaciones
    function showNotification(message, type = 'info') {
        // Remover notificaciones existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Estilos de la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Botón de cerrar
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Botón CTA
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            const servicesSection = document.querySelector('#servicios');
            if (servicesSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = servicesSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Contador animado para estadísticas (comentado)
    // function animateCounter(element, target, duration = 2000) {
    //     let start = 15; // Empezar desde 15
    //     const increment = (target - 15) / (duration / 16);
    //     
    //     function updateCounter() {
    //         start += increment;
    //         if (start < target) {
    //             element.textContent = Math.floor(start) + '+';
    //             requestAnimationFrame(updateCounter);
    //         } else {
    //             element.textContent = target + '+';
    //         }
    //     }
    //     
    //     updateCounter();
    // }
    
    // Estadísticas estáticas (sin animación)
    // const statsObserver = new IntersectionObserver(function(entries) {
    //     entries.forEach(entry => {
    //         if (entry.isIntersecting) {
    //             const statNumber = entry.target.querySelector('h3');
    //             const text = statNumber.textContent;
    //             const number = parseInt(text.replace(/\D/g, ''));
    //             
    //             if (number > 0) {
    //                     statNumber.textContent = '0';
    //                     animateCounter(statNumber, number);
    //                 }
    //                 
    //                 statsObserver.unobserve(entry.target);
    //             }
    //         }, { threshold: 0.5 });
    //         
    //         // Observar elementos de estadísticas
    //         const statElements = document.querySelectorAll('.stat');
    //         statElements.forEach(stat => {
    //             statsObserver.observe(stat);
    //         });
    
    // Efecto parallax suave para el hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Lazy loading para imágenes (cuando las agregues)
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Mejoras de accesibilidad
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Prevenir zoom en inputs en iOS
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                this.style.fontSize = '16px';
            }
        });
    });
    
    // Track clicks on WhatsApp and phone links
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
        a.addEventListener('click', () => {
            if (window.gtag) {
                gtag('event', 'click_whatsapp', {
                    event_category: 'engagement',
                    event_label: a.href,
                    transport_type: 'beacon'
                });
            }
        });
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.addEventListener('click', () => {
            if (window.gtag) {
                gtag('event', 'click_phone', {
                    event_category: 'engagement',
                    event_label: a.href,
                    transport_type: 'beacon'
                });
            }
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', function() {
            if (window.gtag) {
                gtag('event', 'submit_contact_form', {
                    event_category: 'lead',
                    event_label: 'netlify_form_contact',
                    transport_type: 'beacon'
                });
            }
        });
    }
    
    // Console log para desarrollo
    console.log('🚀 Sitio web cargado correctamente');
    console.log('📱 Responsive design activado');
    console.log('⚡ JavaScript interactivo funcionando');
    
});

// Pop-up de Inscripciones
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('enrollmentPopup');
    const closeBtn = popup.querySelector('.popup-close');
    
    // Mostrar el popup después de 3 segundos
    setTimeout(() => {
        // Solo mostrar si no se ha visto antes en esta sesión
        if (!sessionStorage.getItem('enrollmentPopupShown')) {
            popup.classList.add('show');
            sessionStorage.setItem('enrollmentPopupShown', 'true');
        }
    }, 8000);
    
    // Cerrar popup con el botón X
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show');
    });
    
    // Cerrar popup haciendo clic fuera del contenido
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    });
    
    // Cerrar popup con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('show')) {
            popup.classList.remove('show');
        }
    });
    
    // Tracking de GA4 para el popup
    const whatsappBtn = popup.querySelector('.popup-btn.primary');
    const contactBtn = popup.querySelector('.popup-btn.secondary');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (window.gtag) {
                gtag('event', 'click_enrollment_whatsapp', {
                    event_category: 'enrollment',
                    event_label: 'popup_whatsapp_2025',
                    transport_type: 'beacon'
                });
            }
        });
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            if (window.gtag) {
                gtag('event', 'click_enrollment_contact', {
                    event_category: 'enrollment',
                    event_label: 'popup_contact_2025',
                    transport_type: 'beacon'
                });
            }
        });
    }
});

// Función para mostrar el popup manualmente (opcional)
function showEnrollmentPopup() {
    document.getElementById('enrollmentPopup').classList.add('show');
}

// Función para detectar si el dispositivo es móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Función para obtener la posición del scroll
function getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
}

// Función para verificar si un elemento está en el viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
} 