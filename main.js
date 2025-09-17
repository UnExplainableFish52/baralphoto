// Accessibility + menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

function toggleMenu() {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
}

hamburger.addEventListener('click', toggleMenu);

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) toggleMenu();
  });
});

// Sticky header
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 100);
});

// Reduced motion respect
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Intersection fade-in
if (!prefersReduced && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}

// Portfolio filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    portfolioItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.display = match ? 'block' : 'none';
    });
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      const target = document.querySelector(id);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    }
  });
});

// Form handling
const bookingForm = document.getElementById('bookingForm');
const formStatus = document.getElementById('formStatus');

const todayISO = new Date().toISOString().split('T')[0];
const dateInput = document.getElementById('date');
if (dateInput) dateInput.min = todayISO;

bookingForm.addEventListener('submit', e => {
  e.preventDefault();

  // Honeypot
  if (document.getElementById('company').value.trim() !== '') {
    formStatus.textContent = 'Spam detected.';
    return;
  }

  const data = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    date: dateInput.value,
    serviceType: document.getElementById('serviceType').value,
    message: document.getElementById('message').value.trim()
  };

  // Basic validation
  if (Object.values(data).some((v, i) => i !== 6 && v === '')) {
    formStatus.textContent = 'Please fill required fields.';
    formStatus.classList.add('error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    formStatus.textContent = 'Invalid email.';
    formStatus.classList.add('error');
    return;
  }

  const phoneDigits = data.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    formStatus.textContent = 'Invalid phone.';
    formStatus.classList.add('error');
    return;
  }

  formStatus.textContent = 'Sending...';
  formStatus.classList.remove('error');

  // Simulated submit (replace with fetch to backend)
  setTimeout(() => {
    formStatus.textContent = 'Thank you! Your request was sent.';
    bookingForm.reset();
    dateInput.min = todayISO;
  }, 600);
});

console.log('Baral Photo Studio enhanced version loaded.');