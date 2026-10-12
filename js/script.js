// Mobile nav toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const closeBtn = document.querySelector('.mobile-nav .close-btn');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => mobileNav.classList.add('open'));
  closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
  mobileNav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileNav.classList.remove('open'))
  );
}

// Scroll reveal — staggers siblings that reveal together (grid/card rows)
const revealEls = document.querySelectorAll('.reveal');
const siblingIndex = new Map();
revealEls.forEach(el => {
  const parent = el.parentElement;
  const i = siblingIndex.get(parent) || 0;
  el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 70}ms`);
  siblingIndex.set(parent, i + 1);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// Header gains a shadow once the page scrolls past the top
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const updateHeader = () => siteHeader.classList.toggle('scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

// ---------- Animated stat counters ----------
const counters = document.querySelectorAll('[data-count-to]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.4 });

counters.forEach(el => counterObserver.observe(el));

// ---------- Interactive process timeline ----------
const timelineSteps = document.querySelectorAll('.timeline-step');

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.4 });

timelineSteps.forEach(step => {
  timelineObserver.observe(step);
  const toggle = step.querySelector('.timeline-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = step.classList.contains('open');
      step.classList.toggle('open', !isOpen);
      toggle.querySelector('.toggle-label').textContent = !isOpen ? 'Hide details' : 'Show details';
    });
  }
});

// ---------- FAQ accordion ----------
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');
    faqItems.forEach(i => i.classList.remove('open'));
    if (willOpen) item.classList.add('open');
  });
});

// ---------- Project estimator (Capabilities page) ----------
const estimator = document.querySelector('.estimator');
if (estimator) {
  const qtySlider = estimator.querySelector('#est-qty');
  const qtyReadout = estimator.querySelector('.qty-readout');
  const methodPills = estimator.querySelectorAll('[data-method]');
  const garmentPills = estimator.querySelectorAll('[data-garment]');
  const outTier = estimator.querySelector('.out-tier');
  const outTurnaround = estimator.querySelector('.out-turnaround');
  const outSample = estimator.querySelector('.out-sample');
  const outMethod = estimator.querySelector('.out-method');
  const quoteBtn = estimator.querySelector('.estimator-cta');

  let state = { qty: 50, method: 'Screen Print', garment: 'Tee' };

  function tierFor(qty) {
    if (qty < 25) return { name: 'Sample Run', turnaround: '1–2 weeks', note: 'Perfect for testing a design before you commit to a full batch.' };
    if (qty < 100) return { name: 'Small Batch', turnaround: '3–4 weeks', note: 'Our most common starting point for a first order.' };
    if (qty < 500) return { name: 'Standard Run', turnaround: '3–4 weeks', note: 'Enough to outfit a whole team or stock a launch.' };
    return { name: 'Bulk Run', turnaround: '4–5 weeks', note: 'Production scales up — worth a direct call to plan logistics.' };
  }

  function render() {
    qtyReadout.textContent = state.qty.toLocaleString();
    const tier = tierFor(state.qty);
    outTier.textContent = tier.name;
    outTurnaround.textContent = tier.turnaround;
    outSample.textContent = 'Free, before you commit';
    outMethod.textContent = `${state.method} on a ${state.garment.toLowerCase()}`;
    quoteBtn.href = `contact.html?qty=${state.qty}&method=${encodeURIComponent(state.method)}&garment=${encodeURIComponent(state.garment)}`;
  }

  qtySlider.addEventListener('input', () => {
    state.qty = parseInt(qtySlider.value, 10);
    render();
  });

  methodPills.forEach(pill => {
    pill.addEventListener('click', () => {
      methodPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.method = pill.dataset.method;
      render();
    });
  });

  garmentPills.forEach(pill => {
    pill.addEventListener('click', () => {
      garmentPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.garment = pill.dataset.garment;
      render();
    });
  });

  render();
}

// ---------- Contact form: prefill from estimator handoff + fake submit ----------
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const params = new URLSearchParams(window.location.search);
  const qty = params.get('qty');
  const method = params.get('method');
  const garment = params.get('garment');

  if (qty || method || garment) {
    const banner = document.querySelector('#estimate-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerHTML = `<strong>Pre-filled from your estimate:</strong> ${qty ? qty + ' pieces' : ''}${method ? ', ' + method : ''}${garment ? ' on a ' + garment.toLowerCase() : ''}. Adjust anything below before sending.`;
    }
    if (qty) {
      const qtyField = document.querySelector('#quantity');
      if (qtyField) { qtyField.value = qty + ' pieces'; qtyField.closest('.form-field').classList.add('prefilled'); }
    }
    if (method) {
      const methodField = document.querySelector('#method');
      if (methodField) {
        [...methodField.options].forEach(opt => { if (opt.value === method) opt.selected = true; });
        methodField.closest('.form-field').classList.add('prefilled');
      }
    }
    if (garment) {
      const garmentField = document.querySelector('#garment');
      if (garmentField) {
        [...garmentField.options].forEach(opt => { if (opt.value === garment) opt.selected = true; });
        garmentField.closest('.form-field').classList.add('prefilled');
      }
    }
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent';
    btn.disabled = true;
    contactForm.reset();
  });
}
