/**
 * ==========================================================================
 * BARAL PHOTO STUDIO - Main JavaScript
 * Version: 2.0.0
 * Last Updated: December 2024
 * 
 * TABLE OF CONTENTS:
 * 1. DOM Elements & Constants
 * 2. Utility Functions
 * 3. Navigation & Mobile Menu
 * 4. Scroll Effects
 * 5. Intersection Observer Animations
 * 6. Portfolio Filtering
 * 7. Form Handling & Validation
 * 8. Accessibility Enhancements
 * 9. Performance Optimizations
 * 10. Initialization
 * ==========================================================================
 */

'use strict';

/* ==========================================================================
   1. DOM ELEMENTS & CONSTANTS
   ========================================================================== */

const DOM = {
  // Header & Navigation
  header: document.getElementById('header'),
  hamburger: document.getElementById('hamburger'),
  navMenu: document.getElementById('nav-menu'),
  navOverlay: document.getElementById('nav-overlay'),
  navLinks: document.querySelectorAll('.nav-link'),
  
  // Portfolio
  filterBtns: document.querySelectorAll('.filter-btn'),
  portfolioItems: document.querySelectorAll('.portfolio-item'),
  portfolioGrid: document.getElementById('portfolio-grid'),
  
  // Form
  bookingForm: document.getElementById('bookingForm'),
  formStatus: document.getElementById('formStatus'),
  dateInput: document.getElementById('date'),
  honeypot: document.getElementById('company'),
  
  // Footer
  currentYear: document.getElementById('currentYear'),
  
  // Animations
  fadeElements: document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in')
};

const CONFIG = {
  headerScrollThreshold: 50,
  animationThreshold: 0.12,
  debounceDelay: 100,
  formSubmitDelay: 600
};

/* ==========================================================================
   2. UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = CONFIG.debounceDelay) {
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
 * Throttle function to ensure function is called at most once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum interval in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get today's date in ISO format for date input min attribute
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (minimum 10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/* ==========================================================================
   3. NAVIGATION & MOBILE MENU
   ========================================================================== */

/**
 * Toggle mobile menu open/closed
 */
function toggleMobileMenu() {
  const isExpanded = DOM.hamburger.getAttribute('aria-expanded') === 'true';
  const newState = !isExpanded;
  
  DOM.hamburger.setAttribute('aria-expanded', String(newState));
  DOM.hamburger.classList.toggle('active', newState);
  DOM.navMenu.classList.toggle('active', newState);
  DOM.navOverlay.classList.toggle('active', newState);
  DOM.navOverlay.setAttribute('aria-hidden', String(!newState));
  document.body.classList.toggle('menu-open', newState);
  
  // Focus management
  if (newState) {
    // Focus first nav link when menu opens
    DOM.navLinks[0]?.focus();
  } else {
    // Return focus to hamburger when menu closes
    DOM.hamburger.focus();
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  DOM.hamburger.setAttribute('aria-expanded', 'false');
  DOM.hamburger.classList.remove('active');
  DOM.navMenu.classList.remove('active');
  DOM.navOverlay.classList.remove('active');
  DOM.navOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}

/**
 * Update active nav link based on scroll position
 */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 150;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  });
}

/**
 * Initialize navigation event listeners
 */
function initNavigation() {
  // Mobile menu toggle
  DOM.hamburger?.addEventListener('click', toggleMobileMenu);
  
  // Close menu on overlay click
  DOM.navOverlay?.addEventListener('click', closeMobileMenu);
  
  // Close menu on nav link click
  DOM.navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (DOM.navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  });
  
  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
  
  // Update active link on scroll (throttled)
  window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
}

/* ==========================================================================
   4. SCROLL EFFECTS
   ========================================================================== */

/**
 * Handle header scroll effects
 */
function handleHeaderScroll() {
  const scrolled = window.scrollY > CONFIG.headerScrollThreshold;
  DOM.header?.classList.toggle('scrolled', scrolled);
}

/**
 * Smooth scroll to anchor links
 * @param {Event} e - Click event
 */
function smoothScrollToAnchor(e) {
  const href = e.currentTarget.getAttribute('href');
  
  if (href && href.startsWith('#') && href.length > 1) {
    e.preventDefault();
    
    const target = document.querySelector(href);
    if (target) {
      const headerHeight = DOM.header?.offsetHeight || 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    }
  }
}

/**
 * Initialize scroll effects
 */
function initScrollEffects() {
  // Header scroll effect (throttled)
  window.addEventListener('scroll', throttle(handleHeaderScroll, 50));
  
  // Initial check
  handleHeaderScroll();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', smoothScrollToAnchor);
  });
}

/* ==========================================================================
   5. INTERSECTION OBSERVER ANIMATIONS
   ========================================================================== */

/**
 * Initialize scroll-triggered animations using Intersection Observer
 */
function initScrollAnimations() {
  if (prefersReducedMotion()) {
    // Show all elements immediately if reduced motion is preferred
    DOM.fadeElements.forEach(el => el.classList.add('visible'));
    return;
  }
  
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without Intersection Observer
    DOM.fadeElements.forEach(el => el.classList.add('visible'));
    return;
  }
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: CONFIG.animationThreshold
  };
  
  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  DOM.fadeElements.forEach(el => animationObserver.observe(el));
}

/* ==========================================================================
   6. PORTFOLIO FILTERING
   ========================================================================== */

/**
 * Filter portfolio items by category
 * @param {string} category - Category to filter by
 */
function filterPortfolio(category) {
  DOM.portfolioItems.forEach(item => {
    const itemCategory = item.dataset.category;
    const shouldShow = category === 'all' || itemCategory === category;
    
    // Use CSS for smooth transitions
    item.style.display = shouldShow ? 'block' : 'none';
    
    // Optional: Add/remove classes for animation
    if (shouldShow) {
      item.classList.add('visible');
    }
  });
}

/**
 * Update filter button states
 * @param {HTMLElement} activeBtn - Currently active button
 */
function updateFilterButtons(activeBtn) {
  DOM.filterBtns.forEach(btn => {
    const isActive = btn === activeBtn;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });
}

/**
 * Initialize portfolio filtering
 */
function initPortfolioFilter() {
  DOM.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;
      
      updateFilterButtons(btn);
      filterPortfolio(category);
    });
    
    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

/* ==========================================================================
   7. FORM HANDLING & VALIDATION
   ========================================================================== */

/**
 * Show form status message
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showFormStatus(message, isError = false) {
  if (!DOM.formStatus) return;
  
  DOM.formStatus.textContent = message;
  DOM.formStatus.classList.remove('success', 'error');
  DOM.formStatus.classList.add(isError ? 'error' : 'success');
}

/**
 * Clear form status message
 */
function clearFormStatus() {
  if (!DOM.formStatus) return;
  
  DOM.formStatus.textContent = '';
  DOM.formStatus.classList.remove('success', 'error');
}

/**
 * Validate form data
 * @param {Object} data - Form data object
 * @returns {Object} Validation result {isValid, message}
 */
function validateFormData(data) {
  // Check honeypot (spam protection)
  if (DOM.honeypot && DOM.honeypot.value.trim() !== '') {
    return { isValid: false, message: 'Spam detected.' };
  }
  
  // Check required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'date', 'serviceType'];
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      return { isValid: false, message: `Please fill in all required fields.` };
    }
  }
  
  // Validate email
  if (!isValidEmail(data.email)) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }
  
  // Validate phone
  if (!isValidPhone(data.phone)) {
    return { isValid: false, message: 'Please enter a valid phone number (minimum 10 digits).' };
  }
  
  // Validate date (not in the past)
  const selectedDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return { isValid: false, message: 'Please select a date in the future.' };
  }
  
  return { isValid: true, message: '' };
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Collect form data
  const formData = {
    firstName: document.getElementById('firstName')?.value || '',
    lastName: document.getElementById('lastName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    date: document.getElementById('date')?.value || '',
    serviceType: document.getElementById('serviceType')?.value || '',
    message: document.getElementById('message')?.value || ''
  };
  
  // Validate
  const validation = validateFormData(formData);
  
  if (!validation.isValid) {
    showFormStatus(validation.message, true);
    return;
  }
  
  // Show sending status
  showFormStatus('Sending your request...', false);
  
  // Simulate form submission (replace with actual API call)
  try {
    await new Promise(resolve => setTimeout(resolve, CONFIG.formSubmitDelay));
    
    // Success
    showFormStatus('Thank you! Your booking request has been sent. We will contact you shortly.', false);
    DOM.bookingForm?.reset();
    
    // Reset date minimum
    if (DOM.dateInput) {
      DOM.dateInput.min = getTodayISO();
    }
    
    // Clear status after delay
    setTimeout(clearFormStatus, 5000);
    
  } catch (error) {
    console.error('Form submission error:', error);
    showFormStatus('An error occurred. Please try again or contact us directly.', true);
  }
}

/**
 * Initialize form handling
 */
function initFormHandling() {
  // Set minimum date to today
  if (DOM.dateInput) {
    DOM.dateInput.min = getTodayISO();
  }
  
  // Form submission
  DOM.bookingForm?.addEventListener('submit', handleFormSubmit);
  
  // Clear status on input
  DOM.bookingForm?.addEventListener('input', debounce(() => {
    if (DOM.formStatus?.classList.contains('error')) {
      clearFormStatus();
    }
  }, 300));
}

/* ==========================================================================
   8. ACCESSIBILITY ENHANCEMENTS
   ========================================================================== */

/**
 * Handle keyboard navigation within portfolio items
 */
function initPortfolioKeyboardNav() {
  DOM.portfolioItems.forEach(item => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Trigger click or open lightbox
        item.click();
      }
    });
  });
}

/**
 * Trap focus within mobile menu when open
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleMenuFocusTrap(e) {
  if (!DOM.navMenu.classList.contains('active')) return;
  if (e.key !== 'Tab') return;
  
  const focusableElements = DOM.navMenu.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey) {
    if (document.activeElement === firstFocusable) {
      e.preventDefault();
      DOM.hamburger.focus();
    }
  } else {
    if (document.activeElement === lastFocusable || document.activeElement === DOM.hamburger) {
      e.preventDefault();
      firstFocusable.focus();
    }
  }
}

/**
 * Initialize accessibility features
 */
function initAccessibility() {
  // Portfolio keyboard navigation
  initPortfolioKeyboardNav();
  
  // Focus trap for mobile menu
  document.addEventListener('keydown', handleMenuFocusTrap);
  
  // Announce page section changes to screen readers
  window.addEventListener('hashchange', () => {
    const targetId = window.location.hash.slice(1);
    const target = document.getElementById(targetId);
    
    if (target) {
      const heading = target.querySelector('h1, h2, h3');
      if (heading) {
        // Briefly focus the heading for screen readers
        heading.setAttribute('tabindex', '-1');
        heading.focus();
        heading.removeAttribute('tabindex');
      }
    }
  });
}

/* ==========================================================================
   9. PERFORMANCE OPTIMIZATIONS
   ========================================================================== */

/**
 * Lazy load images using Intersection Observer
 */
function initLazyLoading() {
  // Native lazy loading is used via loading="lazy" attribute
  // This is a fallback for older browsers
  
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    return;
  }
  
  // Fallback using Intersection Observer
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if (!('IntersectionObserver' in window)) {
    // Load all images if Intersection Observer not supported
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return;
  }
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '100px 0px'
  });
  
  lazyImages.forEach(img => imageObserver.observe(img));
}

/**
 * Update footer year dynamically
 */
function updateFooterYear() {
  if (DOM.currentYear) {
    DOM.currentYear.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   10. INITIALIZATION
   ========================================================================== */

/**
 * Initialize all functionality when DOM is ready
 */
function init() {
  try {
    // Core functionality
    initNavigation();
    initScrollEffects();
    initScrollAnimations();
    initPortfolioFilter();
    initFormHandling();
    
    // Accessibility
    initAccessibility();
    
    // Performance
    initLazyLoading();
    updateFooterYear();
    
    // Log successful initialization
    console.log('%c✓ Baral Photo Studio v2.0.0 loaded successfully', 'color: #c9a962; font-weight: bold;');
    
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ==========================================================================
   EXPORTS (for testing or module usage)
   ========================================================================== */

// Uncomment if using modules
// export { init, toggleMobileMenu, filterPortfolio, validateFormData };
