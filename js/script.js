(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transitionLayer = document.createElement('div');
  transitionLayer.className = 'page-transition';
  transitionLayer.setAttribute('aria-hidden', 'true');
  document.body.prepend(transitionLayer);

  requestAnimationFrame(() => {
    document.body.classList.add('transition-ready');
  });

  if (!reducedMotion) {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== '_self' || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.hash) return;
      if (destination.href === window.location.href) return;

      event.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(() => {
        window.location.assign(destination.href);
      }, 520);
    });
  }

  const scene = document.querySelector('.coffee-scene');
  const cup = document.querySelector('.cup');
  const pour = document.querySelector('.pour-trajectory');
  const droplets = document.querySelector('.droplets');
  const orbitOne = document.querySelector('.scene-orbit-one');
  const orbitTwo = document.querySelector('.scene-orbit-two');
  const particleField = document.querySelector('.particle-field');
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.classList.contains('open') || event.target.closest('.site-nav')) return;
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  const menuCategories = document.querySelectorAll('.menu-category');
  const selectionButtons = document.querySelectorAll('.selection-button');
  const selectionToast = document.querySelector('.selection-toast');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      menuCategories.forEach((category) => {
        const matches = filter === 'all' || category.dataset.categorySection === filter;
        category.classList.toggle('is-hidden', !matches);
      });
    });
  });

  selectionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.add('added');
      button.textContent = 'Added to selection';
      if (selectionToast) {
        selectionToast.textContent = 'Added to your selection';
        selectionToast.classList.add('visible');
        window.clearTimeout(selectionToast.hideTimer);
        selectionToast.hideTimer = window.setTimeout(() => {
          selectionToast.classList.remove('visible');
        }, 2200);
      }
      window.setTimeout(() => {
        button.classList.remove('added');
        button.textContent = 'Add to selection';
      }, 2200);
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15 });
      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  const parallaxItems = document.querySelectorAll('.story-parallax');
  if (parallaxItems.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    const updateParallax = () => {
      const viewportCenter = window.innerHeight / 2;
      parallaxItems.forEach((item) => {
        const distance = (item.getBoundingClientRect().top + item.offsetHeight / 2 - viewportCenter) * Number(item.dataset.speed || 0.1);
        item.style.transform = `translate3d(0, ${distance * -0.35}px, 0)`;
      });
      ticking = false;
    };
    const requestParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    requestParallax();
  }

  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightbox = document.querySelector('.gallery-lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxCategory = document.querySelector('.gallery-lightbox figcaption small');
  const lightboxTitle = document.querySelector('.gallery-lightbox figcaption strong');
  const closeLightbox = document.querySelector('.lightbox-close');
  const previousImage = document.querySelector('.lightbox-prev');
  const nextImage = document.querySelector('.lightbox-next');
  let galleryIndex = 0;
  let previouslyFocusedCard = null;

  if (galleryCards.length && lightbox && lightboxImage) {
    const updateLightbox = () => {
      const card = galleryCards[galleryIndex];
      lightboxImage.src = card.dataset.galleryImage;
      lightboxImage.alt = card.querySelector('img').alt;
      lightboxCategory.textContent = card.dataset.galleryCategory;
      lightboxTitle.textContent = card.dataset.galleryTitle;
    };
    const openLightbox = (index) => {
      galleryIndex = index;
      updateLightbox();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-active');
      previouslyFocusedCard = card;
      closeLightbox.focus();
    };
    const hideLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-active');
      if (previouslyFocusedCard) {
        previouslyFocusedCard.focus();
        previouslyFocusedCard = null;
      }
    };
    const stepLightbox = (direction) => {
      galleryIndex = (galleryIndex + direction + galleryCards.length) % galleryCards.length;
      updateLightbox();
    };

    galleryCards.forEach((card, index) => {
      card.addEventListener('click', () => openLightbox(index));
    });
    closeLightbox.addEventListener('click', hideLightbox);
    previousImage.addEventListener('click', () => stepLightbox(-1));
    nextImage.addEventListener('click', () => stepLightbox(1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) hideLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') hideLightbox();
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepLightbox(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepLightbox(1);
      }
    });
  }

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const formSuccess = contactForm.querySelector('.form-success');
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = [...contactForm.querySelectorAll('input, textarea')];
      let isValid = true;

      fields.forEach((field) => {
        const wrapper = field.closest('.form-field');
        const error = wrapper.querySelector('.field-error');
        let message = '';
        if (!field.value.trim()) message = 'Please add this detail.';
        else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) message = 'Please enter a valid email.';
        wrapper.classList.toggle('invalid', Boolean(message));
        error.textContent = message;
        if (message) isValid = false;
      });

      if (isValid) {
        formSuccess.classList.add('visible');
        contactForm.reset();
      } else {
        formSuccess.classList.remove('visible');
      }
    });
  }

  if (!scene || reducedMotion) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const sceneScale = () => window.innerWidth <= 520 ? 0.78 : window.innerWidth <= 850 ? 0.8 : 1;

  window.addEventListener('pointermove', (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 12;
    targetY = (event.clientY / window.innerHeight - 0.5) * 8;
  }, { passive: true });

  const animate = () => {
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;
    scene.style.transform = `translate3d(${currentX}px, calc(-47% + ${currentY}px), 0) scale(${sceneScale()})`;
    if (cup) {
      cup.style.transform = `translate3d(${currentX * 0.34}px, ${currentY * 0.34}px, 0) rotate(60deg) rotateX(10deg) rotateY(-10deg)`;
    }
    if (droplets) {
      droplets.style.transform = `translate3d(${currentX * 0.75}px, ${currentY * 0.75}px, 0)`;
    }
    if (pour) {
      pour.style.marginLeft = `${currentX * 0.42}px`;
      pour.style.marginTop = `${currentY * 0.3}px`;
    }
    if (orbitOne) {
      orbitOne.style.transform = `rotate(-22deg) translate3d(${currentX * -0.22}px, ${currentY * -0.22}px, -50px)`;
    }
    if (orbitTwo) {
      orbitTwo.style.transform = `rotate(-22deg) translate3d(${currentX * -0.42}px, ${currentY * -0.42}px, -50px)`;
    }
    if (particleField) {
      particleField.style.transform = `translate3d(${currentX * 0.18}px, ${currentY * 0.18}px, 0)`;
    }
    requestAnimationFrame(animate);
  };

  animate();
})();
