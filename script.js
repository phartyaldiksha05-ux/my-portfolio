/**
 * DIKSHA PHARTYAL - AI/ML & BACKEND DEVELOPER PORTFOLIO JAVASCRIPT
 * Handles theme toggling, responsive navigation, scroll-spy for all sections,
 * project category filtering, copy-to-clipboard interactions, ATS print triggers,
 * and accessible contact form validation.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Theme Management (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const THEME_STORAGE_KEY = 'diksha_portfolio_theme';

  // Determine initial theme: saved preference -> system preference -> default light
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  }

  // Apply theme to document root
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      const isDark = theme === 'dark';
      themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggleBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
  }

  // Initialize theme
  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);

  // Toggle theme on button click
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }

  // Listen for system theme changes if user hasn't explicitly overridden it
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });


  /* ==========================================================================
     2. Mobile Navigation Drawer
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const menuIcon = mobileMenuBtn ? mobileMenuBtn.querySelector('.menu-icon') : null;
  const closeIcon = mobileMenuBtn ? mobileMenuBtn.querySelector('.close-icon') : null;

  function toggleMobileMenu(forceClose = false) {
    if (!mainNav || !mobileMenuBtn) return;

    const isOpen = forceClose ? false : !mainNav.classList.contains('open');
    mainNav.classList.toggle('open', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (menuIcon && closeIcon) {
      menuIcon.classList.toggle('hidden', isOpen);
      closeIcon.classList.toggle('hidden', !isOpen);
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
  }

  // Close mobile nav when clicking a nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleMobileMenu(true);
      }
    });
  });

  // Close mobile nav on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('open')) {
      toggleMobileMenu(true);
      if (mobileMenuBtn) mobileMenuBtn.focus();
    }
  });

  // Close mobile nav on outside click
  document.addEventListener('click', (e) => {
    if (
      mainNav &&
      mainNav.classList.contains('open') &&
      !mainNav.contains(e.target) &&
      mobileMenuBtn &&
      !mobileMenuBtn.contains(e.target)
    ) {
      toggleMobileMenu(true);
    }
  });


  /* ==========================================================================
     3. Active Navigation Scroll-Spy (IntersectionObserver)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
  }


  /* ==========================================================================
     4. Projects Filtering (AI/ML, Analytics, Backend)
     ========================================================================== */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update tab active states
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filterValue = tab.getAttribute('data-filter');

      // Filter cards
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all') {
          card.classList.remove('hidden');
        } else if (filterValue === 'backend') {
          // Backend filter matches cards that contain backend tags or are AI/ML backend
          if (category === 'aiml' || category === 'backend') {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        } else if (category === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  /* ==========================================================================
     5. Print / Save Resume Action
     ========================================================================== */
  const printCVBtn = document.getElementById('print-cv-btn');
  const heroPrintBtn = document.getElementById('hero-print-btn');

  function triggerPrint() {
    window.print();
  }

  if (printCVBtn) printCVBtn.addEventListener('click', triggerPrint);
  if (heroPrintBtn) heroPrintBtn.addEventListener('click', triggerPrint);


  /* ==========================================================================
     6. Copy to Clipboard with Toast Notification
     ========================================================================== */
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toastElement = document.getElementById('toast');
  let toastTimeout;

  function showToast(message) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastElement.classList.remove('show');
    }, 2800);
  }

  copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const targetId = button.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const textToCopy = targetEl.textContent.trim();

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for older or non-secure contexts
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showToast(`Copied "${textToCopy}" to clipboard!`);
      } catch (err) {
        showToast('Failed to copy to clipboard.');
      }
    });
  });


  /* ==========================================================================
     7. Accessible Contact Form Validation & Submission
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    const fields = {
      name: {
        el: document.getElementById('contact-name'),
        errorEl: document.getElementById('name-error'),
        validate: (val) => val.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).'
      },
      email: {
        el: document.getElementById('contact-email'),
        errorEl: document.getElementById('email-error'),
        validate: (val) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!val.trim()) return 'Email address is required.';
          if (!emailRegex.test(val.trim())) return 'Please enter a valid email address.';
          return '';
        }
      },
      subject: {
        el: document.getElementById('contact-subject'),
        errorEl: document.getElementById('subject-error'),
        validate: (val) => val.trim().length >= 3 ? '' : 'Please enter a subject (at least 3 characters).'
      },
      message: {
        el: document.getElementById('contact-message'),
        errorEl: document.getElementById('message-error'),
        validate: (val) => val.trim().length >= 10 ? '' : 'Please enter a message of at least 10 characters.'
      }
    };

    // Real-time validation on input/blur
    Object.keys(fields).forEach(key => {
      const field = fields[key];
      if (!field.el) return;

      ['input', 'blur'].forEach(eventType => {
        field.el.addEventListener(eventType, () => {
          if (field.el.dataset.touched === 'true') {
            const errorMsg = field.validate(field.el.value);
            if (errorMsg) {
              field.el.classList.add('is-invalid');
              field.errorEl.textContent = errorMsg;
            } else {
              field.el.classList.remove('is-invalid');
              field.errorEl.textContent = '';
            }
          }
        });
      });

      field.el.addEventListener('blur', () => {
        field.el.dataset.touched = 'true';
      });
    });

    // Form submission handler
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;
      let firstInvalidEl = null;

      // Validate all fields
      Object.keys(fields).forEach(key => {
        const field = fields[key];
        if (!field.el) return;

        field.el.dataset.touched = 'true';
        const errorMsg = field.validate(field.el.value);

        if (errorMsg) {
          hasErrors = true;
          field.el.classList.add('is-invalid');
          field.errorEl.textContent = errorMsg;
          if (!firstInvalidEl) firstInvalidEl = field.el;
        } else {
          field.el.classList.remove('is-invalid');
          field.errorEl.textContent = '';
        }
      });

      if (hasErrors) {
        if (firstInvalidEl) firstInvalidEl.focus();
        return;
      }

      // Simulate sending state
      const submitBtn = document.getElementById('form-submit-btn');
      const originalBtnContent = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="btn-text-content">
          <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          Sending...
        </span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
        contactForm.reset();

        // Reset touched states
        Object.keys(fields).forEach(key => {
          if (fields[key].el) {
            delete fields[key].el.dataset.touched;
            fields[key].el.classList.remove('is-invalid');
          }
        });

        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = '✓ Thank you! Your message has been sent successfully. Diksha will get back to you shortly.';
          formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          setTimeout(() => {
            formStatus.className = 'form-status';
            formStatus.textContent = '';
          }, 6000);
        }

        showToast('Message sent to Diksha successfully!');
      }, 700);
    });
  }

});
