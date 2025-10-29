/**
 * CARTOONISH PORTFOLIO - INTERACTIVE JAVASCRIPT
 * 
 * DEVELOPER NOTES:
 * ================
 * 
 * 1. REPLACING MASCOT SVGs:
 *    - Find SVG elements with classes: .mascot-logo, .mascot-main, .footer-mascot
 *    - Replace the SVG content while keeping the same classes and structure
 *    - Maintain viewBox dimensions for proper scaling
 * 
 * 2. GSAP INTEGRATION (Optional):
 *    - This code uses vanilla JS animations for maximum compatibility
 *    - To use GSAP: Include GSAP script tag and replace requestAnimationFrame 
 *      animations with gsap.to() calls
 *    - Key functions to replace: animateSkillBars(), animateOnScroll()
 * 
 * 3. ANIMATED CURSOR:
 *    - Automatically disabled on touch devices
 *    - Respects prefers-reduced-motion setting
 *    - To disable: Set ENABLE_CUSTOM_CURSOR = false
 * 
 * 4. PERFORMANCE NOTES:
 *    - Uses Intersection Observer for scroll animations (GPU optimized)
 *    - Throttled scroll and resize events
 *    - RequestAnimationFrame for smooth animations
 * 
 * 5. ACCESSIBILITY:
 *    - All animations respect prefers-reduced-motion
 *    - Keyboard navigation supported for all interactive elements
 *    - Focus trapping in modals
 *    - ARIA labels and roles implemented
 */

// ===================================
// CONFIGURATION & CONSTANTS
// ===================================

const CONFIG = {
  ENABLE_CUSTOM_CURSOR: true,
  ENABLE_PARALLAX: true,
  ENABLE_SCROLL_ANIMATIONS: true,
  ANIMATION_DURATION: 300,
  SCROLL_THROTTLE: 16, // ~60fps
  INTERSECTION_THRESHOLD: 0.1,
  REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function to delay function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean}
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {string} targetId - ID of target element
 */
function smoothScrollTo(targetId) {
  const target = document.getElementById(targetId);
  if (target) {
    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

// ===================================
// CUSTOM CURSOR
// ===================================

class CustomCursor {
  constructor() {
    if (!CONFIG.ENABLE_CUSTOM_CURSOR || CONFIG.REDUCED_MOTION) return;
    
    this.cursor = document.querySelector('.custom-cursor');
    this.isTouch = 'ontouchstart' in window;
    
    if (this.isTouch || !this.cursor) return;
    
    this.init();
  }
  
  init() {
    this.cursor.classList.add('active');
    
    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
      requestAnimationFrame(() => {
        this.cursor.style.left = e.clientX + 'px';
        this.cursor.style.top = e.clientY + 'px';
      });
    });
    
    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, input, textarea');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.cursor.classList.add('hover');
      });
      
      element.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('hover');
      });
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      this.cursor.classList.remove('active');
    });
    
    document.addEventListener('mouseenter', () => {
      this.cursor.classList.add('active');
    });
  }
}

// ===================================
// NAVIGATION
// ===================================

class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    
    this.init();
  }
  
  init() {
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupScrollBehavior();
    this.setupActiveLinks();
  }
  
  setupMobileMenu() {
    if (!this.hamburger || !this.navMenu) return;
    
    this.hamburger.addEventListener('click', () => {
      this.toggleMobileMenu();
    });
    
    // Close menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }
  
  toggleMobileMenu() {
    const isActive = this.hamburger.classList.contains('active');
    
    if (isActive) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  openMobileMenu() {
    this.hamburger.classList.add('active');
    this.navMenu.classList.add('active');
    this.hamburger.setAttribute('aria-expanded', 'true');
    
    // Focus first menu item
    const firstLink = this.navMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }
  
  closeMobileMenu() {
    this.hamburger.classList.remove('active');
    this.navMenu.classList.remove('active');
    this.hamburger.setAttribute('aria-expanded', 'false');
  }
  
  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        smoothScrollTo(targetId);
      });
    });
  }
  
  setupScrollBehavior() {
    let lastScrollTop = 0;
    
    const handleScroll = throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Hide/show navbar on scroll
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        this.navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop;
    }, CONFIG.SCROLL_THROTTLE);
    
    window.addEventListener('scroll', handleScroll);
  }
  
  setupActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    
    const handleScroll = throttle(() => {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });
      
      this.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }, CONFIG.SCROLL_THROTTLE);
    
    window.addEventListener('scroll', handleScroll);
  }
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

class ScrollAnimations {
  constructor() {
    if (!CONFIG.ENABLE_SCROLL_ANIMATIONS || CONFIG.REDUCED_MOTION) return;
    
    this.observer = null;
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.observeElements();
  }
  
  setupIntersectionObserver() {
    const options = {
      threshold: CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }
  
  observeElements() {
    // Elements to animate on scroll
    const elements = document.querySelectorAll(`
      .about-card,
      .timeline-item,
      .project-card,
      .skill-category,
      .contact-info,
      .contact-form
    `);
    
    elements.forEach(element => {
      element.classList.add('fade-in');
      this.observer.observe(element);
    });
  }
  
  animateElement(element) {
    element.classList.add('animate');
    
    // Special handling for timeline items
    if (element.classList.contains('timeline-item')) {
      element.classList.add('animate');
    }
    
    // Special handling for skill bars
    if (element.classList.contains('skill-category')) {
      this.animateSkillBars(element);
    }
  }
  
  animateSkillBars(skillCategory) {
    const skillItems = skillCategory.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('animate');
        const progressBar = item.querySelector('.skill-progress');
        const width = progressBar.getAttribute('data-width');
        
        if (progressBar && width) {
          progressBar.style.setProperty('--skill-width', width + '%');
        }
      }, index * 200);
    });
  }
}

// ===================================
// PARALLAX EFFECTS
// ===================================

class ParallaxEffects {
  constructor() {
    if (!CONFIG.ENABLE_PARALLAX || CONFIG.REDUCED_MOTION) return;
    
    this.shapes = document.querySelectorAll('.hero-bg-shapes .shape');
    this.mascot = document.querySelector('.mascot-main');
    
    this.init();
  }
  
  init() {
    this.setupScrollParallax();
    this.setupMouseParallax();
  }
  
  setupScrollParallax() {
    const handleScroll = throttle(() => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      this.shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.1;
        shape.style.transform = `translateY(${rate * speed}px)`;
      });
    }, CONFIG.SCROLL_THROTTLE);
    
    window.addEventListener('scroll', handleScroll);
  }
  
  setupMouseParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    hero.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth) - 0.5;
      const yPos = (clientY / innerHeight) - 0.5;
      
      this.shapes.forEach((shape, index) => {
        const speed = (index + 1) * 10;
        const x = xPos * speed;
        const y = yPos * speed;
        
        shape.style.transform += ` translate(${x}px, ${y}px)`;
      });
      
      // Mascot eye follow
      if (this.mascot) {
        const eyes = this.mascot.querySelectorAll('.mascot-eyes circle');
        eyes.forEach(eye => {
          const x = xPos * 2;
          const y = yPos * 2;
          eye.style.transform = `translate(${x}px, ${y}px)`;
        });
      }
    });
  }
}

// ===================================
// PROJECT MODAL
// ===================================

class ProjectModal {
  constructor() {
    this.modal = document.getElementById('projectModal');
    this.modalContent = this.modal?.querySelector('.modal-content');
    this.closeBtn = this.modal?.querySelector('.modal-close');
    this.carousel = new Carousel();
    
    this.projects = {
      1: {
        title: 'Animated E-Commerce Platform',
        description: 'A delightful shopping experience built with React and GSAP. Features smooth page transitions, micro-interactions, and a playful checkout flow that makes online shopping fun and engaging.',
        images: [
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23F0F8FF"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EE-Commerce Homepage%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23FFF6E9"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EProduct Details%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23E8F5E8"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3ECheckout Flow%3C/text%3E%3C/svg%3E'
        ],
        liveUrl: '#',
        codeUrl: '#'
      },
      2: {
        title: 'Interactive Data Dashboard',
        description: 'A beautiful data visualization platform built with D3.js and Vue.js. Real-time updates, interactive charts, and a clean interface that makes complex data easy to understand.',
        images: [
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23F0F8FF"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EDashboard Overview%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23FFF6E9"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EChart Details%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23E8F5E8"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EData Analytics%3C/text%3E%3C/svg%3E'
        ],
        liveUrl: '#',
        codeUrl: '#'
      },
      3: {
        title: 'Gamified Learning Platform',
        description: 'An educational platform that makes learning fun through gamification. Built with React and Firebase, featuring progress tracking, achievements, and interactive lessons.',
        images: [
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23F0F8FF"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3ELearning Dashboard%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23FFF6E9"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EInteractive Lessons%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23E8F5E8"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EProgress Tracking%3C/text%3E%3C/svg%3E'
        ],
        liveUrl: '#',
        codeUrl: '#'
      },
      4: {
        title: 'Animated Music Player',
        description: 'A beautiful music streaming application with fluid animations and audio visualizations. Built using Web Audio API and Canvas for real-time visual effects.',
        images: [
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23F0F8FF"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EMusic Player UI%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23FFF6E9"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EAudio Visualizer%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23E8F5E8"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%231E1E28" font-size="24"%3EPlaylist View%3C/text%3E%3C/svg%3E'
        ],
        liveUrl: '#',
        codeUrl: '#'
      }
    };
    
    this.init();
  }
  
  init() {
    if (!this.modal) return;
    
    this.setupProjectCards();
    this.setupModalControls();
    this.setupKeyboardNavigation();
  }
  
  setupProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project');
        this.openModal(projectId);
      });
      
      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const projectId = card.getAttribute('data-project');
          this.openModal(projectId);
        }
      });
    });
  }
  
  setupModalControls() {
    // Close button
    this.closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });
    
    // Click outside to close
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.modal?.classList.contains('active')) {
        if (e.key === 'Escape') {
          this.closeModal();
        }
        
        // Trap focus within modal
        if (e.key === 'Tab') {
          this.trapFocus(e);
        }
      }
    });
  }
  
  openModal(projectId) {
    const project = this.projects[projectId];
    if (!project) return;
    
    this.populateModal(project);
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    
    // Focus management
    const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  closeModal() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to trigger element
    const activeCard = document.querySelector('.project-card:focus');
    if (activeCard) {
      activeCard.focus();
    }
  }
  
  populateModal(project) {
    const title = this.modal.querySelector('#modal-title');
    const description = this.modal.querySelector('.modal-description p');
    const liveLink = this.modal.querySelector('.modal-links .btn-primary');
    const codeLink = this.modal.querySelector('.modal-links .btn-secondary');
    
    if (title) title.textContent = project.title;
    if (description) description.textContent = project.description;
    if (liveLink) liveLink.href = project.liveUrl;
    if (codeLink) codeLink.href = project.codeUrl;
    
    // Update carousel
    this.carousel.updateImages(project.images);
  }
  
  trapFocus(e) {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

// ===================================
// CAROUSEL
// ===================================

class Carousel {
  constructor() {
    this.container = document.querySelector('.carousel-container');
    this.slides = [];
    this.dots = [];
    this.currentSlide = 0;
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');
    this.dotsContainer = document.querySelector('.carousel-dots');
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.setupControls();
    this.setupTouchSupport();
  }
  
  setupControls() {
    this.prevBtn?.addEventListener('click', () => {
      this.previousSlide();
    });
    
    this.nextBtn?.addEventListener('click', () => {
      this.nextSlide();
    });
  }
  
  setupTouchSupport() {
    let startX = 0;
    let endX = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    this.container.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe();
    });
    
    const handleSwipe = () => {
      const threshold = 50;
      const diff = startX - endX;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.previousSlide();
        }
      }
    };
    
    this.handleSwipe = handleSwipe;
  }
  
  updateImages(images) {
    // Clear existing slides
    this.container.innerHTML = '';
    this.dotsContainer.innerHTML = '';
    
    // Create new slides
    images.forEach((src, index) => {
      const slide = document.createElement('div');
      slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Project screenshot ${index + 1}`;
      img.loading = 'lazy';
      
      slide.appendChild(img);
      this.container.appendChild(slide);
      
      // Create dot
      const dot = document.createElement('button');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Image ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      
      this.dotsContainer.appendChild(dot);
    });
    
    this.slides = this.container.querySelectorAll('.carousel-slide');
    this.dots = this.dotsContainer.querySelectorAll('.dot');
    this.currentSlide = 0;
  }
  
  goToSlide(index) {
    // Remove active class from current slide and dot
    this.slides[this.currentSlide]?.classList.remove('active');
    this.dots[this.currentSlide]?.classList.remove('active');
    
    // Add active class to new slide and dot
    this.currentSlide = index;
    this.slides[this.currentSlide]?.classList.add('active');
    this.dots[this.currentSlide]?.classList.add('active');
  }
  
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }
  
  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }
}

// ===================================
// CONTACT FORM
// ===================================

class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.submitBtn = this.form?.querySelector('.submit-btn');
    this.successMessage = document.getElementById('successMessage');
    
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.setupFormValidation();
    this.setupFormSubmission();
    this.setupInputAnimations();
  }
  
  setupFormValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        this.clearError(input);
      });
    });
  }
  
  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (!value) {
      isValid = false;
      errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }
    
    // Name validation
    if (fieldName === 'name' && value && value.length < 2) {
      isValid = false;
      errorMessage = 'Name must be at least 2 characters long.';
    }
    
    // Message validation
    if (fieldName === 'message' && value && value.length < 10) {
      isValid = false;
      errorMessage = 'Message must be at least 10 characters long.';
    }
    
    this.showError(field, errorMessage, !isValid);
    return isValid;
  }
  
  showError(field, message, show) {
    const errorElement = document.getElementById(`${field.name}-error`);
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.toggle('show', show);
    }
    
    field.classList.toggle('error', show);
  }
  
  clearError(field) {
    this.showError(field, '', false);
  }
  
  setupFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  async handleSubmit() {
    // Validate all fields
    const inputs = this.form.querySelectorAll('input, textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });
    
    if (!isFormValid) return;
    
    // Show loading state
    this.setLoadingState(true);
    
    // Submit to Web3Forms API
    try {
      const formData = new FormData(this.form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        this.showSuccessMessage();
        this.form.reset();
      } else {
        const message = data.message || 'Sorry, there was an error sending your message. Please try again.';
        alert(message);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Sorry, there was an error sending your message. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }
  
  simulateFormSubmission() {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000); // Simulate network delay
    });
  }
  
  setLoadingState(loading) {
    if (!this.submitBtn) return;
    
    this.submitBtn.disabled = loading;
    this.submitBtn.classList.toggle('sending', loading);
    
    const btnText = this.submitBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = loading ? 'Sending...' : 'Send Message';
    }
  }
  
  showSuccessMessage() {
    if (!this.successMessage) return;
    
    this.successMessage.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
      this.successMessage.classList.remove('show');
    }, 5000);
  }
  
  setupInputAnimations() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused');
        }
      });
    });
  }
}

// ===================================
// LOADING SKELETON
// ===================================

class LoadingSkeleton {
  constructor() {
    this.skeleton = document.getElementById('loadingSkeleton');
    this.init();
  }
  
  init() {
    if (!this.skeleton) return;
    
    // Hide skeleton after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.hide();
      }, 1000);
    });
  }
  
  hide() {
    if (this.skeleton) {
      this.skeleton.classList.add('hidden');
      
      // Remove from DOM after animation
      setTimeout(() => {
        this.skeleton.remove();
      }, 300);
    }
  }
}

// ===================================
// THEME MANAGER (Optional Enhancement)
// ===================================

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('portfolio-theme') || 'default';
    this.init();
  }
  
  init() {
    this.applyTheme(this.currentTheme);
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    this.currentTheme = theme;
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'default' ? 'dark' : 'default';
    this.applyTheme(newTheme);
  }
}

// ===================================
// PERFORMANCE MONITOR
// ===================================

class PerformanceMonitor {
  constructor() {
    this.init();
  }
  
  init() {
    // Monitor FPS
    this.monitorFPS();
    
    // Monitor memory usage (if available)
    if ('memory' in performance) {
      this.monitorMemory();
    }
  }
  
  monitorFPS() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = (currentTime) => {
      frameCount++;
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Log low FPS warnings
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}fps`);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  monitorMemory() {
    setInterval(() => {
      const memory = performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      
      // Log memory warnings
      if (usedMB > limitMB * 0.8) {
        console.warn(`High memory usage: ${usedMB}MB / ${limitMB}MB`);
      }
    }, 10000); // Check every 10 seconds
  }
}

// ===================================
// INITIALIZATION
// ===================================

class PortfolioApp {
  constructor() {
    this.components = {};
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeComponents();
      });
    } else {
      this.initializeComponents();
    }
  }
  
  initializeComponents() {
    try {
      // Initialize all components
      this.components.cursor = new CustomCursor();
      this.components.navigation = new Navigation();
      this.components.scrollAnimations = new ScrollAnimations();
      this.components.parallax = new ParallaxEffects();
      this.components.projectModal = new ProjectModal();
      this.components.contactForm = new ContactForm();
      this.components.loadingSkeleton = new LoadingSkeleton();
      this.components.themeManager = new ThemeManager();
      
      // Initialize new playful features
      this.components.easterEggs = new EasterEggs();
      this.components.particleSystem = new ParticleSystem();
      this.components.typewriter = new TypewriterEffect();
      
      // Initialize performance monitoring in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        this.components.performanceMonitor = new PerformanceMonitor();
      }
      
      console.log('🎨 Portfolio initialized successfully!');
      console.log('🎮 Try the secret commands in the console!');
      
    } catch (error) {
      console.error('Error initializing portfolio:', error);
    }
  }
  
  // Public API for external control
  getComponent(name) {
    return this.components[name];
  }
  
  // Cleanup method for SPA integration
  destroy() {
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
  }
}

// ===================================
// EASTER EGGS & SECRET INTERACTIONS
// ===================================

class EasterEggs {
  constructor() {
    this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    this.userInput = [];
    this.secretUnlocked = false;
    this.clickCount = 0;
    
    this.init();
  }
  
  init() {
    this.setupKonamiCode();
    this.setupMascotInteractions();
    this.setupSecretMessages();
    this.setupDoubleClickEggs();
  }
  
  setupKonamiCode() {
    document.addEventListener('keydown', (e) => {
      this.userInput.push(e.code);
      
      if (this.userInput.length > this.konamiCode.length) {
        this.userInput.shift();
      }
      
      if (this.userInput.join(',') === this.konamiCode.join(',')) {
        this.activateSecretMode();
      }
    });
  }
  
  activateSecretMode() {
    if (this.secretUnlocked) return;
    
    this.secretUnlocked = true;
    
    // Add rainbow animation to everything
    document.body.classList.add('rainbow-mode');
    
    // Show secret message
    this.showSecretMessage('🎉 KONAMI CODE ACTIVATED! You found the secret rainbow mode!');
    
    // Make mascot dance
    const mascot = document.querySelector('.mascot-main');
    if (mascot) {
      mascot.style.animation = 'mascotDance 0.5s ease-in-out infinite';
    }
    
    // Add CSS for rainbow mode
    if (!document.getElementById('rainbow-styles')) {
      const style = document.createElement('style');
      style.id = 'rainbow-styles';
      style.textContent = `
        .rainbow-mode * {
          animation: rainbow 3s linear infinite !important;
        }
        
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        @keyframes mascotDance {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) scale(1.1); }
          75% { transform: rotate(5deg) scale(0.9); }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  setupMascotInteractions() {
    const mascot = document.querySelector('.mascot-main');
    if (!mascot) return;
    
    let clickCount = 0;
    
    mascot.addEventListener('click', () => {
      clickCount++;
      
      if (clickCount === 5) {
        this.showSecretMessage('🤖 "Hey! Stop poking me!" - Mascot');
        mascot.style.animation = 'mascotShake 0.5s ease-in-out';
      } else if (clickCount === 10) {
        this.showSecretMessage('😴 "I\'m getting sleepy..." - Mascot');
        mascot.style.filter = 'blur(2px)';
      } else if (clickCount === 15) {
        this.showSecretMessage('😡 "THAT\'S IT! I\'m hiding!" - Mascot');
        mascot.style.transform = 'scale(0)';
        
        setTimeout(() => {
          mascot.style.transform = 'scale(1)';
          mascot.style.filter = 'none';
          this.showSecretMessage('😊 "Just kidding! I\'m back!" - Mascot');
          clickCount = 0;
        }, 3000);
      }
    });
  }
  
  setupSecretMessages() {
    // Console easter egg
    console.log(`
    🎨 Welcome to the Portfolio Console!
    
    Try these secret commands:
    - Type "help" for more commands
    - Use arrow keys: ↑↑↓↓←→←→BA for a surprise
    - Click the mascot 15 times
    - Try typing "dance" in the console
    `);
    
    // Add console commands
    window.help = () => {
      console.log(`
      🎮 Secret Console Commands:
      - dance() - Make everything dance
      - party() - Start a party mode
      - reset() - Reset all effects
      - weather("sunny"|"rainy"|"snowy") - Change mood
      `);
    };
    
    window.dance = () => {
      document.body.style.animation = 'shake 0.5s ease-in-out infinite';
      this.showSecretMessage('🕺 DANCE PARTY ACTIVATED!');
    };
    
    window.party = () => {
      this.startPartyMode();
    };
    
    window.reset = () => {
      document.body.className = '';
      document.body.style.animation = '';
      this.secretUnlocked = false;
    };
  }
  
  setupDoubleClickEggs() {
    // Double-click section titles for surprises
    const sectionTitles = document.querySelectorAll('.section-title');
    
    sectionTitles.forEach(title => {
      title.addEventListener('dblclick', () => {
        this.triggerSectionEasterEgg(title);
      });
    });
  }
  
  triggerSectionEasterEgg(title) {
    const messages = [
      '🎯 "You found a secret!" - Section Title',
      '✨ "Double-click master!" - Title',
      '🎪 "Welcome to the secret club!" - Header',
      '🎭 "You\'re quite the explorer!" - Title'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.showSecretMessage(randomMessage);
    
    // Add sparkle effect
    this.addSparkleEffect(title);
  }
  
  addSparkleEffect(element) {
    for (let i = 0; i < 5; i++) {
      const sparkle = document.createElement('div');
      sparkle.innerHTML = '✨';
      sparkle.style.position = 'absolute';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.fontSize = '20px';
      sparkle.style.zIndex = '9999';
      
      const rect = element.getBoundingClientRect();
      sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
      sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
      
      document.body.appendChild(sparkle);
      
      // Animate sparkle
      sparkle.animate([
        { transform: 'translateY(0) scale(0)', opacity: 1 },
        { transform: 'translateY(-50px) scale(1)', opacity: 0 }
      ], {
        duration: 1000,
        easing: 'ease-out'
      }).onfinish = () => sparkle.remove();
    }
  }
  
  startPartyMode() {
    document.body.classList.add('party-mode');
    this.showSecretMessage('🎉 PARTY MODE ACTIVATED! 🎊');
    
    // Add party styles
    if (!document.getElementById('party-styles')) {
      const style = document.createElement('style');
      style.id = 'party-styles';
      style.textContent = `
        .party-mode {
          animation: partyColors 0.5s ease-in-out infinite alternate !important;
        }
        
        .party-mode * {
          animation: partyBounce 0.3s ease-in-out infinite alternate !important;
        }
        
        @keyframes partyColors {
          0% { filter: hue-rotate(0deg) saturate(1.5); }
          100% { filter: hue-rotate(180deg) saturate(2); }
        }
        
        @keyframes partyBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-5px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Auto-disable after 10 seconds
    setTimeout(() => {
      document.body.classList.remove('party-mode');
      this.showSecretMessage('😴 Party\'s over! Back to normal.');
    }, 10000);
  }
  
  showSecretMessage(message) {
    // Create floating message
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: var(--ink);
      padding: 1rem 1.5rem;
      border-radius: 25px;
      border: 3px solid var(--ink);
      font-family: var(--font-display);
      font-weight: 600;
      z-index: 10000;
      box-shadow: 5px 5px 0 var(--ink);
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
    `;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => messageEl.remove(), 300);
    }, 3000);
  }
}

// ===================================
// ENHANCED PARTICLE SYSTEM
// ===================================

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupMouseTrail();
    this.setupClickBurst();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
    `;
    
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  setupMouseTrail() {
    let lastX = 0;
    let lastY = 0;
    
    document.addEventListener('mousemove', (e) => {
      if (Math.random() < 0.1) { // Only create particles occasionally
        this.createParticle(e.clientX, e.clientY, 'trail');
      }
      lastX = e.clientX;
      lastY = e.clientY;
    });
  }
  
  setupClickBurst() {
    document.addEventListener('click', (e) => {
      // Create burst of particles on click
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          this.createParticle(e.clientX, e.clientY, 'burst');
        }, i * 50);
      }
    });
  }
  
  createParticle(x, y, type) {
    const colors = ['#FFB86B', '#7EE7C7', '#7A5CFF'];
    const particle = {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: type
    };
    
    if (type === 'burst') {
      particle.vx *= 3;
      particle.vy *= 3;
      particle.size *= 1.5;
    }
    
    this.particles.push(particle);
    
    if (!this.animationId) {
      this.animate();
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.vy += 0.1; // Gravity
      
      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }
}

// ===================================
// TYPEWRITER EFFECT
// ===================================

class TypewriterEffect {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupHeroTypewriter();
  }
  
  setupHeroTypewriter() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    // Preserve existing markup; type only plain-text lines.
    const lineEls = heroTitle.querySelectorAll('.title-line');
    lineEls.forEach((lineEl, index) => {
      const hasNestedMarkup = lineEl.children.length > 0;
      const original = lineEl.textContent || '';
      
      if (hasNestedMarkup || !original.trim()) {
        // If the line contains nested elements (e.g., <span class="highlight">),
        // do not type to avoid printing raw HTML. Just reveal it after a delay.
        lineEl.style.visibility = 'hidden';
        setTimeout(() => {
          lineEl.style.visibility = '';
        }, index * 800);
        return;
      }
      
      // Type text content safely
      setTimeout(() => {
        lineEl.textContent = '';
        this.typeText(lineEl, original, 50);
      }, index * 800);
    });
  }
  
  typeText(element, text, speed) {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
        // Add cursor blink effect
        element.innerHTML += '<span class="cursor">|</span>';
        
        // Remove cursor after 2 seconds
        setTimeout(() => {
          const cursor = element.querySelector('.cursor');
          if (cursor) cursor.remove();
        }, 2000);
      }
    }, speed);
  }
}

// ===================================
// GLOBAL INITIALIZATION
// ===================================

// Initialize the portfolio app
const portfolioApp = new PortfolioApp();

// Make it globally accessible for debugging
window.portfolioApp = portfolioApp;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioApp;
}
