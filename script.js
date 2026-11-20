'use strict';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const placeholder = 'assets/icons/photo-frame.svg';

// Update captions, dates, or filenames here. Leave unknown dates blank.
const memories = [
  ['with Rohit.jpeg', 'Beautiful moments With Rohit💖'],
  ['swati with elephant.webp', 'Abu Dhabi Memories '],
  ['profile.jpg', '😁💖'],
  ['With Rosho 2.jpg', 'With Rosho 😁'],
  ['swati di in dubai.jpg', 'Abu Dhabi Moments❤️'],
  ['with rosho 1.jpg', 'With Rosho ❤️'],
  ['All sister in pinks.jpg', 'All Sisters in Pinks 😊'],
  ['swati di 2.webp', 'Abu Dhabi Best place'],
  ['in dubai beautiful view.jpg', 'Beautiful View ❤️'],
  ['with jyoti didi in dubai.webp', 'Abu Dhabi With Jyoti Di ❤️'],
  ['swati di and jyoti di.webp', 'Abu Dhabi With Jyoti Di ❤️'],
  ['with sarah.jpg', ' With Sarah😁 Di ❤️'],
  ['with sunny dada.jpg', ' With Sunny Dada ❤️'],
  ['With sisters.jpg', ' With Sisters❤️']
];
const ratios = ['4 / 5','5/5', '1 / 1', '5 / 4', '3 / 4','3/7','16/9'];
const photos = [];

// Each image tries the supplied file first, then the portrait fallback if set.
function loadPhoto(img, filename, fallback) {
  const originalAlt = img.alt;
  img.addEventListener('error', () => {
    if (fallback) {
      img.src = 'assets/images/' + fallback;
      fallback = '';
      return;
    }
    if (img.getAttribute('src') !== placeholder) {
      img.alt = '';
      img.src = placeholder;
    }
  });
  img.alt = originalAlt;
  img.src = 'assets/images/' + filename;
}

$$('[data-photo]').forEach(img => loadPhoto(img, img.dataset.photo, img.dataset.fallback));
memories.forEach(([filename, caption, date], index) => {
  const card = document.createElement('button');
  card.className = 'polaroid reveal';
  card.setAttribute('aria-label', 'Open photo: ' + caption);
  card.style.setProperty('--ratio', ratios[index % ratios.length]);
  card.innerHTML = '<span class="photo-clip"><img loading="lazy" alt=""></span><span class="photo-label"><i class="album-heart" aria-hidden="true">♡</i></span><small class="photo-date"></small>';
  card.querySelector('.photo-label').prepend(document.createTextNode(caption));
  const dateLabel = card.querySelector('.photo-date');
  dateLabel.hidden = !date;
  dateLabel.textContent = date || '';
  const img = card.querySelector('img');
  loadPhoto(img, filename);
  photos.push(card);
  card.addEventListener('click', () => {
    setPhoto(index);
    lightbox.showModal();
  });
  $('#gallery').append(card);
});

const lightbox = $('#lightbox');
let currentPhoto = 0;
function setPhoto(index) {
  currentPhoto = (index + memories.length) % memories.length;
  const [, caption, date] = memories[currentPhoto];
  const thumbnail = photos[currentPhoto].querySelector('img');
  const image = $('#lightbox-img');
  image.onerror = () => {
    image.alt = '';
    if (image.getAttribute('src') !== placeholder) image.src = placeholder;
  };
  image.src = thumbnail.getAttribute('src');
  image.alt = thumbnail.getAttribute('src') === placeholder ? '' : caption;
  $('#photo-count').textContent = (currentPhoto + 1) + ' / ' + memories.length;
  $('#photo-caption').textContent = caption;
  $('#photo-date').textContent = date || '';
  $('#photo-date').hidden = !date;
}
$('#previous').addEventListener('click', () => setPhoto(currentPhoto - 1));
$('#next').addEventListener('click', () => setPhoto(currentPhoto + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    setPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
$$('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  let backdropPress = false;
  dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && backdropPress) dialog.close();
    backdropPress = false;
  });
});

const messages = {
  envelope: [
    'A Little Note for My Special Didi 💌',
    'Happy Birthday, Swati Didi! 🎂❤️ You are not just my sister, but also someone very special in my life. May your life always be filled with happiness, love, success and countless beautiful moments. I am lucky to have you as my sister. Keep smiling and shining always! Love you, Didi! 🥰🌸'
  ],

  gift: [
    'A Special Gift Just for You 🎁',
    'May this year bring you new opportunities, beautiful surprises, success in everything you do and endless reasons to smile. You deserve all the happiness in the world. Keep chasing your dreams and making them come true! ✨💖🌷'
  ],

  cake: [
    'Make a Wish, Birthday Girl! 🎂🎉',
    'May God bless you with good health, happiness, peace and success. 🙏❤️ May all your dreams come true and may every new day bring something beautiful into your life. Keep smiling, stay blessed and enjoy your special day to the fullest! 🥳🎈💕'
  ]
};
const coupons = [
  ['Unlimited Hugs 🤗', 'A warm hug from your little brother whenever you need one. ❤️'],
  ['Your Favourite Treat 🍕', 'One special treat of your choice. Enjoy, Didi!'],
  ['Movie Time 🎬', 'A fun movie day together with snacks and lots of laughter.'],
  ['Surprise Gift 🎁', 'A little surprise specially picked for you. You will have to wait and see! ❤️']
];
const couponKey = 'swati-didi-premium-coupons-v1';
const claimed = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(couponKey) || '[]');
  if (Array.isArray(saved)) saved.forEach(id => claimed.add(id));
} catch {
  // Some browsers disable storage for local files.
}

const popup = $('#popup');
const claim = $('#claim');
let selectedCoupon = null;
function openMessage(title, message, coupon = null) {
  selectedCoupon = coupon;
  $('#popup-title').textContent = title;
  $('#popup-message').textContent = message;
  claim.hidden = coupon === null;
  claim.disabled = coupon !== null && claimed.has(coupon);
  claim.textContent = claim.disabled ? '✓ Redeemed' : 'Redeem coupon';
  popup.showModal();
}
const ticketButtons = coupons.map(([title, message], index) => {
  const ticket = document.createElement('button');
  ticket.className = 'ticket';
  ticket.innerHTML = '<strong></strong><span></span>';
  ticket.querySelector('strong').textContent = title;
  ticket.addEventListener('click', () => openMessage(title, message, index));
  $('#tickets').append(ticket);
  return ticket;
});

function updateTickets() {
  ticketButtons.forEach((ticket, index) => {
    ticket.dataset.claimed = String(claimed.has(index));
    ticket.querySelector('span').textContent = claimed.has(index) ? '✓ Redeemed' : 'Tap to open';
  });
}
updateTickets();
claim.addEventListener('click', () => {
  if (selectedCoupon === null || claimed.has(selectedCoupon)) return;
  claimed.add(selectedCoupon);
  try { localStorage.setItem(couponKey, JSON.stringify([...claimed])); } catch { /* Current session still works. */ }
  updateTickets();
  claim.disabled = true;
  claim.textContent = '✓ Redeemed';
  celebrate();
});

let surpriseTimer;
let pendingSurprise;
$$('[data-surprise]').forEach(button => {
  button.addEventListener('click', () => {
    if (pendingSurprise === button) return;
    if (pendingSurprise) {
      clearTimeout(surpriseTimer);
      pendingSurprise.removeAttribute('aria-disabled');
    }
    const id = button.dataset.surprise;
    const card = button.closest('article');
    const alreadyOpen = card.classList.contains('is-open');
    card.classList.add('is-open');
    if (!alreadyOpen && id !== 'envelope') celebrate();
    pendingSurprise = button;
    button.setAttribute('aria-disabled', 'true');
    surpriseTimer = setTimeout(() => {
      pendingSurprise = undefined;
      button.removeAttribute('aria-disabled');
      if (!document.querySelector('dialog[open]')) openMessage(...messages[id]);
    }, alreadyOpen || motion.matches ? 0 : 535);
  });
});

// The canvas runs only while particles are visible. Keep the particle count bounded.
const canvas = $('#celebration');
const ctx = canvas.getContext('2d');
const colors = ['#b577eb', '#fa94d4', '#9ce1cc', '#ffc780', '#efccff'];
let particles = [];
let frame = 0;
function celebrate(fireworks = false) {
  if (motion.matches || !ctx) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const count = fireworks ? 130 : 65;
  const bursts = [.22, .51, .77];
  particles = particles.slice(-65);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 7;
    particles.push({
      x: fireworks ? innerWidth * bursts[i % 3] : Math.random() * innerWidth,
      y: fireworks ? innerHeight * (.24 + (i % 3) * .13) : -Math.random() * 140,
      vx: fireworks ? Math.cos(angle) * speed : (Math.random() - .5) * 4,
      vy: fireworks ? Math.sin(angle) * speed : Math.random() * 3 + 2,
      age: 0, life: 65 + Math.random() * 95, turn: Math.random() * 5,
      color: colors[i % colors.length], heart: i % 9 === 0, spark: fireworks && i % 4 === 0
    });
  }
  if (!frame) frame = requestAnimationFrame(drawParticles);
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (motion.matches) particles = [];
  particles = particles.filter(p => p.age < p.life && p.y < canvas.height + 30);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += .085;
    p.age++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.turn + p.age * .038);
    ctx.globalAlpha = Math.min(1, (p.life - p.age) / 23);
    ctx.fillStyle = p.color;
    if (p.heart) {
      ctx.font = '15px Georgia';
      ctx.fillText('♥', 0, 0);
    } else {
      ctx.fillRect(-2, -2, p.spark ? 3 : 6, p.spark ? 11 : 8);
    }
    ctx.restore();
  });
  frame = particles.length ? requestAnimationFrame(drawParticles) : 0;
}
const cakeStage = $('.celebration-stage');
function celebrateWithCake() {
  if (motion.matches) return;
  cakeStage.classList.remove('is-celebrating');
  // Flush the class change so a second tap can replay the animation.
  void cakeStage.offsetWidth;
  cakeStage.classList.add('is-celebrating');
  celebrate(true);
}
cakeStage.addEventListener('animationend', event => {
  if (event.animationName === 'heart-rise') cakeStage.classList.remove('is-celebrating');
});
$('#celebrate').addEventListener('click', celebrateWithCake);
$('#replay').addEventListener('click', () => {
  clearTimeout(surpriseTimer);
  pendingSurprise?.removeAttribute('aria-disabled');
  pendingSurprise = undefined;
  $$('.is-open').forEach(card => card.classList.remove('is-open'));
  finalePlayed = false;
  $('#surprises').scrollIntoView({behavior: motion.matches ? 'auto' : 'smooth'});
  $('#surprise-title').tabIndex = -1;
  $('#surprise-title').focus({preventScroll: true});
});

let finalePlayed = false;
if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    reveals.unobserve(entry.target);
  }), {threshold: .12});
  $$('.reveal').forEach((element, index) => {
    element.style.setProperty('--delay', (index % 4) * 46 + 'ms');
    reveals.observe(element);
  });
  const finale = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !finalePlayed) {
      finalePlayed = true;
      celebrateWithCake();
    }
  }, {threshold: .55});
  finale.observe($('#finale'));
}

// Keep the hero parallax subtle and stop updating it once the hero leaves view.
let parallaxFrame = 0;
window.addEventListener('scroll', () => {
  if (parallaxFrame || motion.matches || innerWidth <= 740) return;
  parallaxFrame = requestAnimationFrame(() => {
    if (scrollY < $('#home').offsetHeight + 65) {
      $('.portrait-stage').style.setProperty('--parallax', Math.min(24, scrollY * .065) + 'px');
    }
    parallaxFrame = 0;
  });
}, {passive: true});

const greeting = $('.hero h1 span');
const greetingText = greeting.textContent;
greeting.setAttribute('aria-label', greetingText);
if (!motion.matches && typeof greeting.animate === 'function') {
  // A visual type-on effect keeps the full heading available to assistive technology.
  greeting.animate([{clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0)'}], {
    duration: 1050, delay: 180, easing: 'steps(14, end)', fill: 'backwards'
  });
}

const audio = $('#birthday-audio');
const musicPlay = $('#music-play');
const musicStatus = $('#music-status');
function renderAudio() {
  musicPlay.textContent = audio.paused ? 'Play music' : 'Pause music';
  musicPlay.setAttribute('aria-pressed', String(!audio.paused));
}
audio.addEventListener('pause', renderAudio);
audio.addEventListener('playing', renderAudio);
musicPlay.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause();
    return;
  }
  musicStatus.textContent = '';
  try { await audio.play(); } catch { musicStatus.textContent = 'The birthday track could not play.'; }
});
let audioContext;
function softClick() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context || !$('#click-sounds').checked) return;
  try {
    audioContext ||= new Context();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    const time = audioContext.currentTime;
    const tone = audioContext.createOscillator();
    const volume = audioContext.createGain();
    tone.frequency.setValueAtTime(590, time);
    tone.frequency.exponentialRampToValueAtTime(365, time + .09);
    volume.gain.setValueAtTime(.075, time);
    volume.gain.exponentialRampToValueAtTime(.001, time + .11);
    tone.connect(volume).connect(audioContext.destination);
    tone.start(time);
    tone.stop(time + .12);
  } catch { /* Audio permissions are optional. */ }
}

document.addEventListener('click', event => {
  const control = event.target.closest('button, a, summary');
  if (!control) return;
  softClick();
  if (!control.classList.contains('btn') || motion.matches) return;
  const bounds = control.getBoundingClientRect();
  const ripple = document.createElement('i');
  ripple.className = 'ripple';
  ripple.setAttribute('aria-hidden', 'true');
  ripple.style.setProperty('--x', (event.detail ? event.clientX - bounds.left : bounds.width / 2) + 'px');
  ripple.style.setProperty('--y', (event.detail ? event.clientY - bounds.top : bounds.height / 2) + 'px');
  ripple.addEventListener('animationend', () => ripple.remove(), {once: true});
  control.append(ripple);
});
