/**
 * ADWIZEN — Creative Marketing & Growth Agency
 * Interactive Logic, Smooth Editorial Animations & Auto-Selection Routers
 */

document.addEventListener('DOMContentLoaded', () => {
  initAgencyCursor();
  initHeaderAndProgress();
  initWorkNavigation();
  initServiceCardSelection();
  initWorkCardInteractions();
  initContactForm();
  checkUrlServiceParam();
});

/* -------------------------------------------------------------
 * 1. Minimal Editorial Cursor
 * ------------------------------------------------------------- */
function initAgencyCursor() {
  const dot = document.getElementById('agencyCursor');
  const follower = document.getElementById('agencyCursorFollower');
  if (!dot || !follower || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateFollower);
  }
  requestAnimationFrame(animateFollower);

  // Hover states on clickable elements
  const linksAndButtons = document.querySelectorAll('a, button, input, textarea, .service-editorial-card, .work-item-card');
  linksAndButtons.forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.style.width = '52px';
      follower.style.height = '52px';
      follower.style.borderColor = 'rgba(0, 102, 255, 0.7)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width = '32px';
      follower.style.height = '32px';
      follower.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    });
  });
}

/* -------------------------------------------------------------
 * 2. Sticky Header, Scroll Progress & Mobile Menu
 * ------------------------------------------------------------- */
function initHeaderAndProgress() {
  const header = document.getElementById('siteHeader');
  const progressLine = document.getElementById('scrollProgressLine');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item, .mobile-drawer-bottom a');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

    if (progressLine) {
      progressLine.style.width = `${pct}%`;
    }

    if (header) {
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // Mobile menu
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.classList.toggle('open');
      mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
}

/* -------------------------------------------------------------
 * 3. Work Carousel Arrows
 * ------------------------------------------------------------- */
function initWorkNavigation() {
  const prevBtn = document.getElementById('prevWorkBtn');
  const nextBtn = document.getElementById('nextWorkBtn');
  const grid = document.getElementById('workGrid');
  if (!prevBtn || !nextBtn || !grid) return;

  nextBtn.addEventListener('click', () => {
    grid.scrollBy({ left: 340, behavior: 'smooth' });
  });

  prevBtn.addEventListener('click', () => {
    grid.scrollBy({ left: -340, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------
 * 4. Helper: Auto-Select Service Pill in Contact Form & Smooth Scroll
 * ------------------------------------------------------------- */
function selectServiceInForm(serviceName, shouldScroll = true) {
  const form = document.getElementById('contactForm');
  if (!form || !serviceName) return;

  const targetName = serviceName.trim().toLowerCase();
  const pillLabels = form.querySelectorAll('.service-pill-chk');

  // Reset other pills and activate the clicked service
  pillLabels.forEach(label => {
    const chk = label.querySelector('input[type="checkbox"]');
    const pillVal = (label.getAttribute('data-service-pill') || (chk ? chk.value : '')).trim().toLowerCase();
    
    if (pillVal === targetName) {
      if (chk) {
        chk.checked = true;
        chk.dispatchEvent(new Event('change', { bubbles: true }));
      }
      label.classList.add('active');
      label.classList.remove('pill-highlight');
      // Force DOM reflow to re-trigger pulse animation
      void label.offsetWidth;
      label.classList.add('pill-highlight');
      setTimeout(() => label.classList.remove('pill-highlight'), 2600);
    } else {
      if (chk) {
        chk.checked = false;
        chk.dispatchEvent(new Event('change', { bubbles: true }));
      }
      label.classList.remove('active');
      label.classList.remove('pill-highlight');
    }
  });

  if (shouldScroll) {
    const contactCard = document.querySelector('.contact-form-card') || document.getElementById('contact');
    if (contactCard) {
      contactCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameField = document.getElementById('formName');
      if (nameField) {
        setTimeout(() => nameField.focus(), 700);
      }
    }
  }
}


/* -------------------------------------------------------------
 * 5. Service Cards Click -> Auto-Select in Form
 * ------------------------------------------------------------- */
function initServiceCardSelection() {
  const serviceCards = document.querySelectorAll('.service-editorial-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = card.getAttribute('data-service');
      if (serviceName) {
        selectServiceInForm(serviceName, true);
      }
    });
  });
}

/* -------------------------------------------------------------
 * 6. Work / Case Study Cards Click -> Auto-Select in Form
 * ------------------------------------------------------------- */
function initWorkCardInteractions() {
  const projectMapping = {
    'd2c-launch': 'Social Media',
    'hospitality': 'Branding & Strategy',
    'culinary': 'Content & Production',
    'wellness': 'Social Media'
  };

  const workCards = document.querySelectorAll('.work-item-card');
  workCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = card.getAttribute('data-project');
      const mappedService = projectMapping[proj] || 'Full Marketing Strategy';
      selectServiceInForm(mappedService, true);
    });
  });
}

/* -------------------------------------------------------------
 * 7. URL Query Param Check (e.g., ?service=Social+Media or ?service=website)
 * ------------------------------------------------------------- */
function checkUrlServiceParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    const mapping = {
      'social': 'Social Media',
      'social-media': 'Social Media',
      'content': 'Content & Production',
      'production': 'Content & Production',
      'performance': 'Performance Marketing',
      'performance-marketing': 'Performance Marketing',
      'website': 'Website Development',
      'web': 'Website Development',
      'branding': 'Branding & Strategy',
      'brand': 'Branding & Strategy',
      'ai': 'AI Solutions',
      'ai-solutions': 'AI Solutions'
    };

    const resolvedService = mapping[serviceParam.toLowerCase()] || serviceParam;
    selectServiceInForm(resolvedService, window.location.hash === '#contact');
  }
}

/* -------------------------------------------------------------
 * 8. Contact Form Validation, Pill Toggles & Submission
 * ------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('contactSuccess');
  const resetBtn = document.getElementById('resetContactBtn');
  const submitBtn = document.getElementById('submitBtn');

  if (!form || !successBox) return;

  const nameInput = document.getElementById('formName');
  const companyInput = document.getElementById('formCompany');
  const emailInput = document.getElementById('formEmail');
  const phoneInput = document.getElementById('formPhone');
  const detailsInput = document.getElementById('formDetails');

  // Clear validation errors on real-time typing
  [nameInput, companyInput, emailInput, phoneInput, detailsInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      const parent = inp.closest('.input-field-group');
      if (parent) parent.classList.remove('has-error');
    });
  });

  // Service pill checkboxes manual click toggle
  const pillLabels = form.querySelectorAll('.service-pill-chk');
  const serviceGroup = document.getElementById('servicesFieldGroup');

  pillLabels.forEach(label => {
    const chk = label.querySelector('input[type="checkbox"]');
    if (!chk) return;
    chk.addEventListener('change', () => {
      if (chk.checked) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }

      if (serviceGroup) {
        const anyChecked = form.querySelectorAll('input[name="interest"]:checked').length > 0;
        if (anyChecked) {
          serviceGroup.classList.remove('has-error');
        }
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    function check(input, condition) {
      if (!input) return;
      const parent = input.closest('.input-field-group');
      if (!condition) {
        if (parent) parent.classList.add('has-error');
        valid = false;
      } else {
        if (parent) parent.classList.remove('has-error');
      }
    }

    check(nameInput, nameInput && nameInput.value.trim().length >= 2);
    check(companyInput, companyInput && companyInput.value.trim().length >= 2);
    check(emailInput, emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()));
    check(phoneInput, phoneInput && phoneInput.value.trim().length >= 7);

    // Required Service Selection check
    const checkedServices = form.querySelectorAll('input[name="interest"]:checked');
    if (checkedServices.length === 0) {
      if (serviceGroup) serviceGroup.classList.add('has-error');
      valid = false;
    } else {
      if (serviceGroup) serviceGroup.classList.remove('has-error');
    }

    if (!valid) return;

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>DISPATCHING BRIEF...</span>`;

    const clientName = nameInput ? nameInput.value.trim() : 'Partner';
    const clientCompany = companyInput ? companyInput.value.trim() : '';
    const clientEmail = emailInput ? emailInput.value.trim() : '';
    const clientPhone = phoneInput ? phoneInput.value.trim() : '';
    const selectedServicesList = Array.from(checkedServices).map(cb => cb.value).join(', ');
    const projectDetails = (detailsInput && detailsInput.value.trim()) ? detailsInput.value.trim() : 'None provided';

    const formDataPayload = {
      "Name": clientName,
      "Company": clientCompany,
      "Email": clientEmail,
      "Phone": clientPhone,
      "Selected Services": selectedServicesList,
      "Project Details": projectDetails,
      "_subject": `🚀 New Project Brief: ${clientName} (${clientCompany}) — Adwizen`,
      "_replyto": clientEmail,
      "_template": "table",
      "_captcha": "false"
    };


    try {
      // Direct Email Dispatch to adwizen01@gmail.com
      const res = await fetch('https://formsubmit.co/ajax/adwizen01@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formDataPayload)
      });

      if (!res.ok) {
        await fetch('contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formDataPayload)
        }).catch(() => {});
      }
    } catch (err) {
      try {
        await fetch('contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formDataPayload)
        });
      } catch (localErr) {
        console.log('Submission captured locally:', formDataPayload);
      }
    }

    const nameTarget = document.getElementById('sentClientName');
    if (nameTarget) nameTarget.textContent = clientName;

    form.style.display = 'none';
    successBox.style.display = 'block';

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>SUBMIT PROJECT BRIEF</span><span>→</span>`;
  });


  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      pillLabels.forEach(label => {
        label.classList.remove('active');
        label.classList.remove('pill-highlight');
      });
      const errorGroups = form.querySelectorAll('.input-field-group.has-error');
      errorGroups.forEach(g => g.classList.remove('has-error'));

      successBox.style.display = 'none';
      form.style.display = 'block';
    });
  }
}
