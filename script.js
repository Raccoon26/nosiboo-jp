'use strict';

// One place to change the contact address when handing over the site.
const CONTACT_EMAIL = 'sales@nosiboo.jp';
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
function closeMenu(restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'メニューを開く');
  navigation.classList.remove('open');
  navigation.style.top = '';
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'メニューを閉じる' : 'メニューを開く');
  navigation.classList.toggle('open', opening);
  navigation.style.top = opening ? header.getBoundingClientRect().bottom + 'px' : '';
  document.body.classList.toggle('menu-open', opening);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
  if (e.key === 'Tab' && navigation.classList.contains('open')) {
    const last = navigation.querySelector('a:last-child');
    if (e.shiftKey && document.activeElement === menuToggle) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menuToggle.focus(); }
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 15); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Progressive enhancement: the page stays readable if animation is unavailable.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('animate');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
}

const galleryImage = document.querySelector('#gallery-image');
const galleryButtons = [...document.querySelectorAll('.gallery-button')];
galleryButtons.forEach(button => button.addEventListener('click', () => {
  galleryButtons.forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  galleryImage.src = button.dataset.image;
  galleryImage.alt = button.dataset.alt;
}));

const guideTabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  guideTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
guideTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % guideTabs.length;
    if (event.key === 'ArrowLeft') next = (index + guideTabs.length - 1) % guideTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = guideTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(guideTabs[next], true); }
  });
});

const topic = document.querySelector('#contact-topic');
const emailLink = document.querySelector('#email-link');
function updateEmail() {
  const title = topic.options[topic.selectedIndex].text;
  const body = 'Nosiboo Japan ご担当者様\n\n【ご相談内容】' + title + '\n\n【お名前】\n\n【お問い合わせ内容】\n\n';
  emailLink.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Nosiboo Pro｜' + title) + '&body=' + encodeURIComponent(body);
}
topic.addEventListener('change', updateEmail);
document.querySelectorAll('[data-contact-topic]').forEach(link => link.addEventListener('click', () => { topic.value = link.dataset.contactTopic; updateEmail(); }));
updateEmail();
document.querySelector('.copy-email').addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(CONTACT_EMAIL);
    status.textContent = 'メールアドレスをコピーしました。';
  } catch {
    status.textContent = 'コピーできませんでした。sales@nosiboo.jp を選択してコピーしてください。';
  }
});

document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.openDialog).showModal()));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
document.querySelector('#year').textContent = new Date().getFullYear();


// Decorative conceptual motion; it is not a flow-rate simulation.
const flowToggle = document.querySelector('#flow-toggle');
const flowVisual = document.querySelector('.flow-visual');
if (flowToggle && flowVisual) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setFlow = playing => {
    flowVisual.classList.toggle('playing', playing);
    flowToggle.setAttribute('aria-pressed', String(playing));
    flowToggle.innerHTML = playing ? '動きを止める <span aria-hidden="true">Ⅱ</span>' : '動きを見る <span aria-hidden="true">▷</span>';
  };
  flowToggle.addEventListener('click', () => setFlow(!flowVisual.classList.contains('playing')));
  const applyMotionPreference = () => {
    setFlow(false);
    flowToggle.disabled = reducedMotion.matches;
    if (reducedMotion.matches) flowToggle.textContent = '静止表示';
  };
  reducedMotion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
}
