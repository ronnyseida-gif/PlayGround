const hair = document.getElementById('hairOverlay');
const makeup = document.getElementById('makeupOverlay');
const photoStage = document.getElementById('photoStage');
const toast = document.getElementById('toast');
let hairColor = '#31221e';
let makeupColor = '#e98692';
let lookNumber = 1;
let toastTimer;

const tips = {
  textured: 'A touch of blush brings the whole look to life.',
  curtain: 'Curtain bangs frame the face beautifully.',
  waves: 'Soft waves add a little movement to your look.',
  fluffy: 'Big, fluffy texture brings all the main-character energy.'
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function selectGroup(containerId, selector, apply) {
  document.getElementById(containerId).addEventListener('click', event => {
    const button = event.target.closest(selector);
    if (!button) return;
    document.querySelectorAll(`#${containerId} ${selector}`).forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    apply(button);
  });
}

selectGroup('styleGrid', '.style-card', button => {
  hair.classList.remove('textured', 'curtain', 'waves', 'fluffy');
  hair.classList.add(button.dataset.style);
  document.getElementById('beautyTip').textContent = tips[button.dataset.style];
});

selectGroup('hairSwatches', '.swatch', button => {
  hairColor = button.dataset.color;
  hair.style.setProperty('--hair', hairColor);
});

selectGroup('makeupSwatches', '.swatch', button => {
  makeupColor = button.dataset.color;
  makeup.style.setProperty('--makeup', makeupColor);
});

document.getElementById('blushToggle').addEventListener('change', event => {
  makeup.classList.toggle('makeup-off', !event.target.checked);
});
document.getElementById('eyeToggle').addEventListener('change', event => {
  makeup.classList.toggle('eyes-off', !event.target.checked);
});
document.getElementById('lipToggle').addEventListener('change', event => {
  makeup.classList.toggle('lips-off', !event.target.checked);
});

function celebrate() {
  const confetti = document.getElementById('confetti');
  const colors = ['#e7a69c', '#d2b579', '#f7d8ad', '#be8ca2', '#f4eee1'];
  confetti.replaceChildren();
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('i');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * .45}s`;
    piece.style.transform = `rotate(${Math.random() * 160}deg)`;
    confetti.append(piece);
  }
  setTimeout(() => confetti.replaceChildren(), 2400);
}

document.getElementById('finishButton').addEventListener('click', () => {
  lookNumber += 1;
  document.getElementById('lookCount').textContent = `LOOK ${String(lookNumber).padStart(2, '0')}`;
  celebrate();
  showToast('Look complete — Ronny is glowing! ✨');
});

function resetLook() {
  hair.classList.remove('curtain', 'waves', 'fluffy');
  hair.classList.add('textured');
  hairColor = '#31221e';
  makeupColor = '#e98692';
  hair.style.setProperty('--hair', hairColor);
  makeup.style.setProperty('--makeup', makeupColor);
  makeup.classList.remove('makeup-off', 'lips-off');
  makeup.classList.add('eyes-off');
  document.querySelectorAll('.style-card').forEach(button => {
    const selected = button.dataset.style === 'textured';
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('#hairSwatches .swatch, #makeupSwatches .swatch').forEach(button => {
    const selected = button.dataset.color === (button.closest('#hairSwatches') ? '#31221e' : '#e98692');
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.getElementById('blushToggle').checked = true;
  document.getElementById('eyeToggle').checked = false;
  document.getElementById('lipToggle').checked = true;
  document.getElementById('beautyTip').textContent = tips.textured;
  lookNumber = 1;
  document.getElementById('lookCount').textContent = 'LOOK 01';
  document.getElementById('accessoryOverlay').classList.remove('show');
  showToast('Fresh canvas! Make a whole new look.');
}
document.getElementById('resetButton').addEventListener('click', resetLook);

async function saveLook() {
  const button = document.getElementById('snapshotButton');
  button.disabled = true;
  button.innerHTML = '<span>…</span> Saving';
  try {
    const portrait = document.querySelector('.portrait');
    if (!portrait.complete) await new Promise((resolve, reject) => {
      portrait.addEventListener('load', resolve, { once: true });
      portrait.addEventListener('error', reject, { once: true });
    });
    const width = 900;
    const height = Math.round(width * 1406 / 1080);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(portrait, 0, 420, 1080, 1406, 0, 0, width, height);

    const overlay = document.querySelector('.overlays').cloneNode(true);
    overlay.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    overlay.setAttribute('width', '1080');
    overlay.setAttribute('height', '1406');
    overlay.setAttribute('viewBox', '0 420 1080 1406');
    const selectedStyle = [...hair.classList].find(name => ['textured', 'curtain', 'waves', 'fluffy'].includes(name)) || 'textured';
    const styleOpacity = { textured: .28, curtain: .32, waves: .3, fluffy: .44 }[selectedStyle];
    const styleTag = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleTag.textContent = `
      .hair-fill{fill:${hairColor};opacity:${styleOpacity}}.hair-glint{fill:none;stroke:#e6c6a9;stroke-width:11;stroke-linecap:round;opacity:.28}
      .curtain-fringe{fill:none;stroke:${hairColor};stroke-width:${selectedStyle === 'waves' ? 34 : 25};stroke-linecap:round;stroke-linejoin:round;opacity:${selectedStyle === 'curtain' ? .52 : selectedStyle === 'waves' ? .36 : 0}}
      .curl-dots{fill:${hairColor};opacity:${selectedStyle === 'fluffy' ? .22 : 0}}
      .long-strands{fill:none;stroke:${hairColor};stroke-width:36;stroke-linecap:round;opacity:${['waves','fluffy'].includes(selectedStyle) ? .28 : 0}}
      .hair.fluffy .hair-fill{opacity:.44}.hair.curtain .hair-fill{opacity:.32}.hair.waves .hair-fill{opacity:.3}
      .hair.textured .hair-fill{opacity:.28}
      #blushLeft,#blushRight{fill:${makeupColor};opacity:${document.getElementById('blushToggle').checked ? .22 : 0};filter:blur(23px)}
      #eyeLeft,#eyeRight{fill:${makeupColor};opacity:${document.getElementById('eyeToggle').checked ? .4 : 0};filter:blur(7px)}
      #lipShape{fill:${makeupColor};opacity:${document.getElementById('lipToggle').checked ? .54 : 0};filter:blur(2px)}
      .lip-shine{fill:none;stroke:#fff4ea;stroke-width:8;stroke-linecap:round;opacity:${document.getElementById('lipToggle').checked ? .38 : 0}}
      .accessory{fill:none;stroke:#dfc078;stroke-width:9;stroke-linecap:round;opacity:${document.getElementById('accessoryOverlay').classList.contains('show') ? .9 : 0}}.accessory circle{fill:#fff0c2;stroke:#bd8e56;stroke-width:6}`;
    overlay.insertBefore(styleTag, overlay.firstChild);
    const svgImage = new Image();
    const svgUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(overlay)], { type: 'image/svg+xml;charset=utf-8' }));
    await new Promise((resolve, reject) => {
      svgImage.onload = resolve;
      svgImage.onerror = reject;
      svgImage.src = svgUrl;
    });
    context.drawImage(svgImage, 0, 0, width, height);
    URL.revokeObjectURL(svgUrl);
    context.fillStyle = 'rgba(255,255,255,.92)';
    context.font = '600 30px Georgia, serif';
    context.fillText('The glow-up is in the details.', 38, height - 42);
    const link = document.createElement('a');
    link.download = `ronny-glow-up-${String(lookNumber).padStart(2, '0')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Your look is saved — looking good! ✨');
  } catch (error) {
    console.error('Could not save makeover image:', error);
    showToast('Could not save the image. Try again in a moment.');
  } finally {
    button.disabled = false;
    button.innerHTML = '<span>↗</span> Save look';
  }
}
document.getElementById('snapshotButton').addEventListener('click', saveLook);

// A little surprise: the first click on the preview adds (or removes) statement earrings.
photoStage.addEventListener('dblclick', () => {
  const earrings = document.getElementById('accessoryOverlay');
  earrings.classList.toggle('show');
  showToast(earrings.classList.contains('show') ? 'Statement earrings: added! ✨' : 'Earrings removed.');
});
