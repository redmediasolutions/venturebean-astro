// Header behaviour: active menu item, dropdowns, mobile toggle menu,
// off-canvas panel and Elementor popups (search).
import { $$, settingsOf, parseAction } from './utils.js';

const norm = (p) => (p.endsWith('/') ? p : `${p}/`);

export function initNavigation() {
  markActive();
  initDropdowns();
  initMenuToggle();
  initActions();
  initSearch();
}

/** Search widget: reveal it and wire the clear (×) icon. */
function initSearch(root = document) {
  $$('.e-search', root).forEach((search) => {
    search.classList.remove('hidden');
    const input = search.querySelector('.e-search-input');
    const clear = search.querySelector('.e-search-input-wrapper > i, .e-search-input-wrapper > svg');
    if (!input || !clear) return;
    const sync = () => (clear.style.visibility = input.value ? 'visible' : 'hidden');
    input.addEventListener('input', sync);
    clear.addEventListener('click', () => {
      input.value = '';
      sync();
      input.focus();
    });
    sync();
  });
}

/** Mark the menu item for the page we're on. */
function markActive() {
  const here = norm(location.pathname);
  $$('.elementor-nav-menu a').forEach((a) => {
    let url;
    try {
      url = new URL(a.href, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin || norm(url.pathname) !== here) return;
    // The link itself is active; a parent item only gets current-menu-ancestor
    // (its link is not highlighted).
    a.classList.add('elementor-item-active');
    a.setAttribute('aria-current', 'page');
    const li = a.closest('li');
    li?.classList.add('current-menu-item', 'current_page_item');
    const parentLi = li?.parentElement?.closest('li.menu-item-has-children');
    parentLi?.classList.add('current-menu-ancestor', 'current-menu-parent');
  });
}

/** Desktop dropdowns open on hover via CSS; this adds keyboard + touch support. */
function initDropdowns() {
  $$('.elementor-nav-menu--main li.menu-item-has-children').forEach((li) => {
    const a = li.querySelector(':scope > a');
    const open = (state) => {
      li.classList.toggle('vb-open', state);
      a.setAttribute('aria-expanded', String(state));
    };
    li.addEventListener('mouseenter', () => open(true));
    li.addEventListener('mouseleave', () => open(false));
    li.addEventListener('focusin', () => open(true));
    li.addEventListener('focusout', (e) => !li.contains(e.relatedTarget) && open(false));
    // touch: first tap opens the submenu, second tap follows the link
    a.addEventListener('click', (e) => {
      if (matchMedia('(hover: none)').matches && !li.classList.contains('vb-open')) {
        e.preventDefault();
        open(true);
      }
    });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        open(false);
        a.focus();
      }
    });
  });
}

/** Elementor's burger → dropdown menu (used on tablet / mobile). */
function initMenuToggle() {
  $$('.elementor-widget-nav-menu').forEach((widget) => {
    const toggle = widget.querySelector('.elementor-menu-toggle');
    const container = widget.querySelector('.elementor-nav-menu--dropdown.elementor-nav-menu__container');
    if (!toggle || !container) return;
    const set = (state) => {
      toggle.classList.toggle('elementor-active', state);
      toggle.setAttribute('aria-expanded', String(state));
      container.setAttribute('aria-hidden', String(!state));
      container.style.setProperty('--menu-height', `${container.scrollHeight}px`);
    };
    toggle.addEventListener('click', () => set(!toggle.classList.contains('elementor-active')));
    toggle.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle.click()));

    // sub-menus inside the dropdown open on tap
    container.querySelectorAll('li.menu-item-has-children > a').forEach((a) => {
      a.addEventListener('click', (e) => {
        const ul = a.nextElementSibling;
        if (!ul) return;
        const isOpen = ul.style.display === 'block';
        if (!isOpen) {
          e.preventDefault();
          ul.style.display = 'block';
          a.classList.add('highlighted');
          a.setAttribute('aria-expanded', 'true');
          container.style.setProperty('--menu-height', `${container.scrollHeight}px`);
        }
      });
    });
  });
}

/* ---------------- off-canvas + popups ---------------- */

let lastFocus = null;

function initActions() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#elementor-action"]');
    if (!a) return;
    const act = parseAction(a.getAttribute('href'));
    if (!act) return;
    e.preventDefault();
    lastFocus = a;
    const [type, verb] = act.action.split(':');
    if (type === 'off_canvas') offCanvas(act.settings.id, verb, act.settings.displayMode);
    if (type === 'popup') popup(act.settings.id, verb, act.settings.toggle);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('.e-off-canvas[aria-hidden="false"]').forEach((el) => closeOffCanvas(el));
    $$('.elementor-popup-modal.vb-shown').forEach((m) => closePopup(m));
  });

  // Overlay click closes the off-canvas
  $$('.e-off-canvas').forEach((el) => {
    el.querySelector('.e-off-canvas__overlay')?.addEventListener('click', () => closeOffCanvas(el));
  });
}

function offCanvas(id, verb) {
  const el = document.getElementById(`off-canvas-${id}`);
  if (!el) return;
  const isOpen = el.getAttribute('aria-hidden') === 'false';
  if (verb === 'close' || (verb === 'toggle' && isOpen)) return closeOffCanvas(el);
  const widget = el.closest('.elementor-widget-off-canvas');
  const anim = settingsOf(widget).entrance_animation || 'fadeIn';
  const main = el.querySelector('.e-off-canvas__main');
  el.removeAttribute('inert');
  el.setAttribute('aria-hidden', 'false');
  main.classList.remove('vb-leaving');
  main.classList.add('animated', anim);
  document.body.classList.add('e-off-canvas__no-scroll');
  el.querySelector('a, button, [tabindex]')?.focus({ preventScroll: true });
}

function closeOffCanvas(el) {
  const main = el.querySelector('.e-off-canvas__main');
  main.classList.add('vb-leaving');
  setTimeout(() => {
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('inert', '');
    main.className = 'e-off-canvas__main';
    document.body.classList.remove('e-off-canvas__no-scroll');
    lastFocus?.focus({ preventScroll: true });
  }, 280);
}

const modals = {};

function popup(id, verb, toggle) {
  const existing = modals[id];
  if (verb === 'close') {
    const m = existing || document.querySelector('.elementor-popup-modal.vb-shown');
    return m && closePopup(m);
  }
  if (existing?.classList.contains('vb-shown')) {
    if (toggle || verb === 'toggle') closePopup(existing);
    return;
  }
  const modal = existing || buildPopup(id);
  if (!modal) return;
  modal.style.display = 'flex';
  modal.classList.add('vb-shown');
  document.body.classList.add('dialog-body', 'dialog-lightbox-body', 'dialog-container', 'dialog-lightbox-container');
  const content = modal.querySelector('.dialog-widget-content');
  const anim = modal.dataset.anim;
  if (anim) {
    content.classList.remove(anim);
    void content.offsetWidth;
    content.classList.add('animated', anim);
  }
  modal.querySelector('input, a, button')?.focus({ preventScroll: true });
}

function buildPopup(id) {
  const tpl = document.getElementById('vb-popups');
  const src = tpl?.content.querySelector(`[data-elementor-id="${id}"]`);
  if (!src) return null;
  let settings = {};
  try {
    settings = JSON.parse(src.getAttribute('data-elementor-settings') || '{}');
  } catch {}
  const modal = document.createElement('div');
  modal.className = 'dialog-widget dialog-lightbox-widget dialog-type-buttons dialog-type-lightbox elementor-popup-modal';
  modal.id = `elementor-popup-modal-${id}`;
  modal.setAttribute('role', 'document');
  modal.setAttribute('aria-modal', 'true');
  modal.tabIndex = 0;
  modal.dataset.anim = settings.entrance_animation || '';
  modal.innerHTML =
    '<div class="dialog-widget-content dialog-lightbox-widget-content"><a role="button" tabindex="0" aria-label="Close" href="#" class="dialog-close-button dialog-lightbox-close-button"><i class="eicon-close"></i></a><div class="dialog-header dialog-lightbox-header"></div><div class="dialog-message dialog-lightbox-message"></div><div class="dialog-buttons-wrapper dialog-lightbox-buttons-wrapper"></div></div>';
  const content = modal.querySelector('.dialog-widget-content');
  if (settings.entrance_animation_duration?.size) {
    content.style.animationDuration = `${settings.entrance_animation_duration.size}s`;
  }
  const node = document.importNode(src, true);
  node.style.display = 'block'; // Elementor's popup JS sets this inline
  node.querySelectorAll('.elementor-invisible').forEach((el) => el.classList.remove('elementor-invisible'));
  node.querySelectorAll('.e-con').forEach((el) => el.classList.add('e-lazyloaded'));
  initSearch(node);
  modal.querySelector('.dialog-message').appendChild(node);
  modal.querySelector('.dialog-close-button').addEventListener('click', (e) => {
    e.preventDefault();
    closePopup(modal);
  });
  modal.addEventListener('click', (e) => e.target === modal && closePopup(modal));
  document.body.appendChild(modal);
  modals[id] = modal;
  return modal;
}

function closePopup(modal) {
  modal.classList.remove('vb-shown');
  modal.style.display = 'none';
  document.body.classList.remove('dialog-body', 'dialog-lightbox-body', 'dialog-container', 'dialog-lightbox-container');
  lastFocus?.focus({ preventScroll: true });
}
