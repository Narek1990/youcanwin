/*
 * YouCanWin - registration banner hover parallax
 *
 * Paste this file into the browser console while the registration modal is
 * open. Move the pointer across the banner to tilt and shift the artwork.
 * Remove it with:
 *   window.__youcanwinRegistrationBannerAnimation.destroy()
 */
(function youcanwinRegistrationBannerHover() {
  'use strict';

  var VERSION = '2026-11-13-v2-hover';
  var STYLE_ID = 'youcanwin-registration-banner-animation-style';
  var ROOT_SELECTOR = '[data-mj="auth-modal"] [data-mj="auth-banner"]';
  var IMAGE_SELECTOR = ROOT_SELECTOR + ' img[alt="banner"]';
  var MAX_TILT = 4;
  var MAX_SHIFT = 6;

  if (window.__youcanwinRegistrationBannerAnimation) {
    if (window.__youcanwinRegistrationBannerAnimation.version === VERSION) return;
    window.__youcanwinRegistrationBannerAnimation.destroy();
  }

  var state = {
    observer: null,
    retryTimer: null,
    frame: 0,
    mountedRoot: null,
    mountedImage: null,
    overlay: null,
    originalRootStyle: null,
    originalImageStyle: null,
    originalRootClass: null,
    originalImageClass: null,
    current: { x: 0, y: 0, rotateX: 0, rotateY: 0 },
    target: { x: 0, y: 0, rotateX: 0, rotateY: 0 }
  };

  window.__youcanwinRegistrationBannerAnimation = {
    version: VERSION,
    mount: mount,
    destroy: destroy
  };

  injectStyles();
  mount();

  state.observer = new MutationObserver(mount);
  state.observer.observe(document.documentElement, { childList: true, subtree: true });

  var attempts = 0;
  state.retryTimer = window.setInterval(function () {
    mount();
    attempts += 1;
    if (attempts >= 30) window.clearInterval(state.retryTimer);
  }, 500);

  function mount() {
    var image = document.querySelector(IMAGE_SELECTOR);
    var root = image && image.closest('[data-mj="auth-banner"]');
    if (!root || !image) return false;

    if (state.mountedRoot === root && state.mountedImage === image && state.overlay) {
      return true;
    }

    unmount();

    state.mountedRoot = root;
    state.mountedImage = image;
    state.originalRootStyle = root.getAttribute('style');
    state.originalImageStyle = image.getAttribute('style');
    state.originalRootClass = root.className;
    state.originalImageClass = image.className;
    state.current = { x: 0, y: 0, rotateX: 0, rotateY: 0 };
    state.target = { x: 0, y: 0, rotateX: 0, rotateY: 0 };

    root.classList.add('youcanwin-registration-banner-stage');
    image.classList.add('youcanwin-registration-banner-image');

    var overlay = document.createElement('div');
    overlay.className = 'youcanwin-registration-banner-wash';
    overlay.setAttribute('aria-hidden', 'true');
    root.appendChild(overlay);
    state.overlay = overlay;

    root.addEventListener('pointerenter', handlePointerEnter);
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerleave', handlePointerLeave);
    return true;
  }

  function handlePointerEnter() {
    state.mountedRoot.classList.add('youcanwin-registration-banner-hovering');
    startRenderLoop();
  }

  function handlePointerMove(event) {
    if (!state.mountedRoot) return;
    var rect = state.mountedRoot.getBoundingClientRect();
    var x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    var y = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    state.target.x = (x - 0.5) * MAX_SHIFT;
    state.target.y = (y - 0.5) * MAX_SHIFT;
    state.target.rotateY = (x - 0.5) * MAX_TILT;
    state.target.rotateX = (0.5 - y) * MAX_TILT;
    startRenderLoop();
  }

  function handlePointerLeave() {
    state.target.x = 0;
    state.target.y = 0;
    state.target.rotateX = 0;
    state.target.rotateY = 0;
    if (state.mountedRoot) state.mountedRoot.classList.remove('youcanwin-registration-banner-hovering');
    startRenderLoop();
  }

  function startRenderLoop() {
    if (!state.frame) state.frame = window.requestAnimationFrame(render);
  }

  function render() {
    state.frame = 0;
    if (!state.mountedImage || !state.mountedRoot) return;

    var ease = 0.16;
    state.current.x += (state.target.x - state.current.x) * ease;
    state.current.y += (state.target.y - state.current.y) * ease;
    state.current.rotateX += (state.target.rotateX - state.current.rotateX) * ease;
    state.current.rotateY += (state.target.rotateY - state.current.rotateY) * ease;

    state.mountedImage.style.transform =
      'translate3d(' + state.current.x.toFixed(2) + 'px, ' + state.current.y.toFixed(2) + 'px, 0) ' +
      'scale(1.06) rotateX(' + state.current.rotateX.toFixed(2) + 'deg) ' +
      'rotateY(' + state.current.rotateY.toFixed(2) + 'deg)';
    state.mountedRoot.style.setProperty('--youcanwin-pointer-x', (50 + state.current.rotateY * 3) + '%');
    state.mountedRoot.style.setProperty('--youcanwin-pointer-y', (50 - state.current.rotateX * 3) + '%');

    var settling = Math.abs(state.target.x - state.current.x) > 0.01 ||
      Math.abs(state.target.y - state.current.y) > 0.01 ||
      Math.abs(state.target.rotateX - state.current.rotateX) > 0.01 ||
      Math.abs(state.target.rotateY - state.current.rotateY) > 0.01;
    if (settling) state.frame = window.requestAnimationFrame(render);
  }

  function unmount() {
    if (state.frame) window.cancelAnimationFrame(state.frame);
    state.frame = 0;

    if (state.mountedRoot) {
      state.mountedRoot.removeEventListener('pointerenter', handlePointerEnter);
      state.mountedRoot.removeEventListener('pointermove', handlePointerMove);
      state.mountedRoot.removeEventListener('pointerleave', handlePointerLeave);
      if (state.originalRootStyle == null) state.mountedRoot.removeAttribute('style');
      else state.mountedRoot.setAttribute('style', state.originalRootStyle);
      state.mountedRoot.className = state.originalRootClass;
    }

    if (state.overlay) state.overlay.remove();

    if (state.mountedImage) {
      if (state.originalImageStyle == null) state.mountedImage.removeAttribute('style');
      else state.mountedImage.setAttribute('style', state.originalImageStyle);
      state.mountedImage.className = state.originalImageClass;
    }

    state.mountedRoot = null;
    state.mountedImage = null;
    state.overlay = null;
  }

  function injectStyles() {
    var existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '\
      [data-mj="auth-banner"].youcanwin-registration-banner-stage {\
        position: relative !important;\
        overflow: hidden !important;\
        isolation: isolate;\
        perspective: 1200px;\
        transform-style: preserve-3d;\
        background: #11151d;\
      }\
\
      [data-mj="auth-banner"].youcanwin-registration-banner-stage > img.youcanwin-registration-banner-image {\
        display: block;\
        position: relative;\
        z-index: 0;\
        transform-origin: 50% 50%;\
        transform-style: preserve-3d;\
        will-change: transform;\
        backface-visibility: hidden;\
        transition: filter 180ms ease-out;\
      }\
\
      [data-mj="auth-banner"].youcanwin-registration-banner-stage.youcanwin-registration-banner-hovering > img.youcanwin-registration-banner-image {\
        filter: saturate(1.04) brightness(1.02);\
      }\
\
      .youcanwin-registration-banner-wash {\
        position: absolute;\
        z-index: 1;\
        inset: -16%;\
        pointer-events: none;\
        opacity: 0;\
        background: radial-gradient(circle at var(--youcanwin-pointer-x, 50%) var(--youcanwin-pointer-y, 50%), rgba(255, 222, 122, .25), transparent 25%),\
          linear-gradient(112deg, transparent 34%, rgba(255, 230, 147, .1) 50%, transparent 66%);\
        filter: blur(18px);\
        transition: opacity 180ms ease-out;\
      }\
\
      [data-mj="auth-banner"].youcanwin-registration-banner-stage.youcanwin-registration-banner-hovering > .youcanwin-registration-banner-wash {\
        opacity: .34;\
      }\
\
      @media (prefers-reduced-motion: reduce) {\
        [data-mj="auth-banner"].youcanwin-registration-banner-stage > img.youcanwin-registration-banner-image {\
          transition: none !important;\
        }\
      }\
    ';
    document.head.appendChild(style);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function destroy() {
    if (state.observer) state.observer.disconnect();
    if (state.retryTimer) window.clearInterval(state.retryTimer);
    unmount();
    var style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    delete window.__youcanwinRegistrationBannerAnimation;
  }
})();
