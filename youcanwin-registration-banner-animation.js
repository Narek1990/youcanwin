/*
 * YouCanWin - registration banner animation
 *
 * Paste this file into the browser console while the registration modal is
 * open. It is safe to run more than once and can be removed with:
 *   window.__youcanwinRegistrationBannerAnimation.destroy()
 *
 * The effect keeps the current banner artwork and adds the subtle movement
 * seen in the reference recording: a slow Ken Burns pan/zoom plus a soft,
 * drifting highlight over the artwork.
 */
(function youcanwinRegistrationBannerAnimation() {
  'use strict';

  var VERSION = '2026-11-13-v1';
  var STYLE_ID = 'youcanwin-registration-banner-animation-style';
  var ROOT_SELECTOR = '[data-mj="auth-modal"] [data-mj="auth-banner"]';
  var IMAGE_SELECTOR = ROOT_SELECTOR + ' img[alt="banner"]';

  if (window.__youcanwinRegistrationBannerAnimation) {
    if (window.__youcanwinRegistrationBannerAnimation.version === VERSION) return;
    window.__youcanwinRegistrationBannerAnimation.destroy();
  }

  var state = {
    observer: null,
    retryTimer: null,
    mountedRoot: null,
    mountedImage: null,
    overlay: null,
    originalRootStyle: null,
    originalImageStyle: null,
    originalRootClass: null,
    originalImageClass: null
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

    root.classList.add('youcanwin-registration-banner-stage');
    image.classList.add('youcanwin-registration-banner-image');

    var overlay = document.createElement('div');
    overlay.className = 'youcanwin-registration-banner-wash';
    overlay.setAttribute('aria-hidden', 'true');
    root.appendChild(overlay);
    state.overlay = overlay;
    return true;
  }

  function unmount() {
    if (state.overlay) state.overlay.remove();

    if (state.mountedRoot) {
      if (state.originalRootStyle == null) state.mountedRoot.removeAttribute('style');
      else state.mountedRoot.setAttribute('style', state.originalRootStyle);
      state.mountedRoot.className = state.originalRootClass;
    }

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
        background: #11151d;\
      }\
\
      [data-mj="auth-banner"].youcanwin-registration-banner-stage > img.youcanwin-registration-banner-image {\
        display: block;\
        position: relative;\
        z-index: 0;\
        transform-origin: 52% 48%;\
        will-change: transform, filter;\
        backface-visibility: hidden;\
        animation: youcanwin-registration-banner-ken-burns 12s cubic-bezier(.42, 0, .2, 1) infinite alternate;\
      }\
\
      .youcanwin-registration-banner-wash {\
        position: absolute;\
        z-index: 1;\
        inset: -18%;\
        pointer-events: none;\
        opacity: .34;\
        mix-blend-mode: screen;\
        background: radial-gradient(circle at 18% 74%, rgba(255, 204, 64, .32), transparent 26%),\
          radial-gradient(circle at 82% 24%, rgba(255, 171, 40, .22), transparent 23%),\
          linear-gradient(112deg, transparent 32%, rgba(255, 229, 140, .13) 49%, transparent 66%);\
        filter: blur(18px);\
        will-change: transform, opacity;\
        animation: youcanwin-registration-banner-light-sweep 8s ease-in-out infinite alternate;\
      }\
\
      @keyframes youcanwin-registration-banner-ken-burns {\
        0% { transform: scale(1.015) translate3d(-.6%, .4%, 0); filter: saturate(1.02) brightness(.98); }\
        48% { transform: scale(1.065) translate3d(.7%, -.8%, 0); filter: saturate(1.08) brightness(1.02); }\
        100% { transform: scale(1.035) translate3d(-.35%, -.15%, 0); filter: saturate(1.04) brightness(1); }\
      }\
\
      @keyframes youcanwin-registration-banner-light-sweep {\
        0% { transform: translate3d(-7%, 5%, 0) rotate(-2deg) scale(.98); opacity: .2; }\
        50% { transform: translate3d(3%, -2%, 0) rotate(1deg) scale(1.04); opacity: .42; }\
        100% { transform: translate3d(8%, 4%, 0) rotate(3deg) scale(1); opacity: .28; }\
      }\
\
      @media (prefers-reduced-motion: reduce) {\
        [data-mj="auth-banner"].youcanwin-registration-banner-stage > img.youcanwin-registration-banner-image,\
        .youcanwin-registration-banner-wash {\
          animation: none !important;\
        }\
      }\
    ';
    document.head.appendChild(style);
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
