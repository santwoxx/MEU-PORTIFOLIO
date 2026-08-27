// Registrar o plugin ScrollTrigger do GSAP
gsap.registerPlugin(ScrollTrigger);

// ==========================================================
// 1. HERO CANVAS 3D SCROLL & PRELOADER SCREEN
// ==========================================================
const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d", { alpha: true });

// Configuração de alta fidelidade visual
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = "high";

const frameCount = 271;

// Caminho dos frames (WebP de Alta Performance - 92.6% mais leve)
const currentFrame = index => (
  `./frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.webp`
);

const images = new Array(frameCount);
const frameData = { frame: 0 };

let renderProps = null;
let lastRenderedFrame = -1;

// Elementos da Tela de Carregamento
const preloaderScreen = document.getElementById('preloader-screen');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderPct = document.getElementById('preloader-pct');

// Bloquear scroll durante o carregamento inicial
document.body.style.overflow = 'hidden';

let loadedCount = 0;
let isPreloaderFinished = false;

// Atualiza o progresso visual da tela de carregamento
function updatePreloaderProgress() {
  loadedCount++;
  const pct = Math.min(100, Math.round((loadedCount / frameCount) * 100));
  
  if (preloaderBar) preloaderBar.style.width = pct + '%';
  if (preloaderPct) preloaderPct.textContent = pct + '%';
  
  // Quando 100% dos frames estiverem carregados
  if (loadedCount >= frameCount) {
    finishPreloader();
  }
}

// Conclui o preloader e revela o portfólio suavemente
function finishPreloader() {
  if (isPreloaderFinished) return;
  isPreloaderFinished = true;
  
  if (preloaderBar) preloaderBar.style.width = '100%';
  if (preloaderPct) preloaderPct.textContent = '100%';
  
  // Renderizar o primeiro frame
  resizeCanvas();
  render();
  
  // Transição de saída suave da tela preta
  setTimeout(() => {
    if (preloaderScreen) {
      preloaderScreen.classList.add('loaded');
    }
    document.body.style.overflow = '';
    ScrollTrigger.refresh();
  }, 350);
}

// Responsividade e redimensionamento preciso do Canvas
function resizeCanvas() {
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  
  const firstValidImg = images.find(img => img && img.complete && img.width > 0);
  if (firstValidImg) {
      calculateRenderProps(firstValidImg);
  }
  
  lastRenderedFrame = -1;
  render();
}

function calculateRenderProps(img) {
    if (!img || img.width === 0 || img.height === 0) return;
    
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    
    const isMobile = window.innerWidth <= 768;
    const ratio = isMobile ? Math.max(hRatio, vRatio) : Math.min(hRatio, vRatio); 
    
    renderProps = {
        width: img.width * ratio,
        height: img.height * ratio,
        x: (canvas.width - (img.width * ratio)) / 2,
        y: canvas.height - (img.height * ratio)
    };
}

window.addEventListener("resize", resizeCanvas);

// Carregamento de todos os frames em paralelo com 12 threads simultâneas
function startFullPreload() {
  let currentIndex = 0;
  const concurrentLimit = 12;
  
  function worker() {
    if (currentIndex >= frameCount) return;
    
    const index = currentIndex++;
    const img = new Image();
    img.src = currentFrame(index);
    
    img.onload = () => {
      images[index] = img;
      if (!renderProps && img.width > 0) {
        calculateRenderProps(img);
      }
      updatePreloaderProgress();
      worker();
    };
    
    img.onerror = () => {
      images[index] = images[0] || img;
      updatePreloaderProgress();
      worker();
    };
  }
  
  for (let i = 0; i < concurrentLimit; i++) {
    worker();
  }
}

// Inicia o pré-carregamento completo
startFullPreload();

// Timeout de segurança (para conexões muito lentas)
setTimeout(() => {
  if (!isPreloaderFinished && loadedCount >= 30) {
    finishPreloader();
  }
}, 8000);

// Animação dos frames conectada ao scroll com máxima fluidez
gsap.to(frameData, {
  frame: frameCount - 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.0, // Resposta ultra-suave e instantânea
    fastScrollEnd: true,
    invalidateOnRefresh: true,
    onUpdate: render
  }
});

// Renderizador com proteção contra engasgos
function render() {
  const targetIndex = Math.max(0, Math.min(frameCount - 1, Math.round(frameData.frame)));
  if (targetIndex === lastRenderedFrame && lastRenderedFrame !== -1) return;
  
  let img = images[targetIndex];
  
  // Se o frame exato ainda estiver carregando, usa o vizinho mais próximo
  if (!img || !img.complete || img.width === 0) {
    for (let offset = 1; offset < 20; offset++) {
      const prev = images[targetIndex - offset];
      if (prev && prev.complete && prev.width > 0) {
        img = prev;
        break;
      }
      const next = images[targetIndex + offset];
      if (next && next.complete && next.width > 0) {
        img = next;
        break;
      }
    }
  }
  
  if (!img || !img.complete || img.width === 0) {
    img = images[0];
  }
  
  if (img && img.complete && img.width > 0) {
    if (!renderProps) {
      calculateRenderProps(img);
    }
    
    if (renderProps) {
      lastRenderedFrame = targetIndex;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        img,
        0, 0, img.width, img.height,
        renderProps.x, renderProps.y, renderProps.width, renderProps.height
      );
    }
  }
}

// Ocultar indicador de scroll ao começar a rolar
gsap.to(".scroll-indicator", {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "2% top",
        toggleActions: "play none none reverse",
    },
    opacity: 0,
    duration: 0.3
});

// ==========================================================
// 2. ANIMAÇÕES DOS MODAIS DE PROJETOS (PRESERVADOS)
// ==========================================================
const modalConfig = {
    opacity: 1,
    autoAlpha: 1, 
    scale: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    force3D: true
};

const modalHiddenState = {
    opacity: 0,
    autoAlpha: 0,
    scale: 0.9,
    y: 50
};

// Projeto 1
gsap.fromTo("#project-1", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "8% top", 
        end: "20% top",   
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

// Projeto 2
gsap.fromTo("#project-2", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "25% top", 
        end: "37% top",
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

// Projeto 3
gsap.fromTo("#project-3", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "42% top", 
        end: "54% top",
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

// Projeto 4
gsap.fromTo("#project-4", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "59% top", 
        end: "71% top",
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

// Projeto 5
gsap.fromTo("#project-5", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "76% top", 
        end: "88% top",
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

// ==========================================================
// 3. FULLSCREEN OVERLAY LOGIC (PRESERVADO)
// ==========================================================
const modals = document.querySelectorAll('.project-modal');
const fullscreenOverlay = document.getElementById('fullscreen-overlay');
const fullscreenVideo = document.getElementById('fullscreen-video');
const closeFullscreenBtn = document.querySelector('.close-fullscreen');

function openModalPreview(e, modal) {
    if (e.target.tagName.toLowerCase() === 'a') return;

    const preview = modal.querySelector('.preview-media');
    if (preview && preview.getAttribute('src')) {
        fullscreenVideo.src = preview.getAttribute('src');
        fullscreenVideo.poster = preview.getAttribute('poster') || '';
        fullscreenOverlay.classList.add('active');
        fullscreenVideo.play().catch(() => {});
    }
}

// Os vídeos usam preload="none": só baixam quando o card é revelado no hover
modals.forEach(modal => {
    const preview = modal.querySelector('.preview-media');
    if (preview) {
        modal.addEventListener('mouseenter', () => preview.play().catch(() => {}));
        modal.addEventListener('mouseleave', () => preview.pause());
    }

    modal.addEventListener('click', (e) => openModalPreview(e, modal));
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModalPreview(e, modal);
        }
    });
});

function closeFullscreen() {
    fullscreenOverlay.classList.remove('active');
    fullscreenVideo.pause();
    setTimeout(() => {
        fullscreenVideo.removeAttribute('src');
        fullscreenVideo.load();
    }, 300);
}

closeFullscreenBtn.addEventListener('click', closeFullscreen);
fullscreenOverlay.addEventListener('click', (e) => {
    if (e.target === fullscreenOverlay) {
        closeFullscreen();
    }
});

// ==========================================================
// 4. STICKY HEADER SCROLL EFFECT
// ==========================================================
const mainHeader = document.getElementById('main-header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        mainHeader.classList.add('scrolled');
    } else {
        mainHeader.classList.remove('scrolled');
    }
});

// ==========================================================
// 5. ANIMAÇÕES GSAP PARA AS NOVAS SEÇÕES
// ==========================================================
gsap.from(".pillar-card", {
    scrollTrigger: {
        trigger: ".pillars-grid",
        start: "top 85%",
        toggleActions: "play none none reverse"
    },
    y: 35,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out"
});

gsap.from(".process-card", {
    scrollTrigger: {
        trigger: ".process-timeline",
        start: "top 85%",
        toggleActions: "play none none reverse"
    },
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: "power3.out"
});

gsap.from(".contact-card-wrapper", {
    scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    scale: 0.96,
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
});

// ==========================================================
// 6. ACORDEÃO INTERATIVO DE SERVIÇOS
// ==========================================================
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    
    header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        accordionItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });
        
        if (!isActive) {
            item.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
        }
    });
});

// ==========================================================
// 7. SELETOR INTERATIVO DE PROJETOS PARA O WHATSAPP
// ==========================================================
const selectorChips = document.querySelectorAll('.selector-chip');
const btnWhatsApp = document.getElementById('btn-whatsapp');
const whatsappPhone = "5573991422872"; // Número atualizado

selectorChips.forEach(chip => {
    chip.addEventListener('click', () => {
        selectorChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        const serviceName = chip.getAttribute('data-service');
        const customMessage = `Olá Natan, gostaria de conversar sobre um projeto de ${serviceName}!`;
        const encodedMessage = encodeURIComponent(customMessage);
        
        btnWhatsApp.href = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    });
});

// ==========================================================
// 8. CÓPIA DE E-MAIL COM 1 CLIQUE & FEEDBACK VISUAL
// ==========================================================
const btnCopyEmail = document.getElementById('btn-copy-email');
const copyEmailText = document.getElementById('copy-email-text');

if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
        const email = btnCopyEmail.getAttribute('data-email') || "natanmarinhooficial@gmail.com";
        
        navigator.clipboard.writeText(email).then(() => {
            const originalText = copyEmailText.textContent;
            copyEmailText.textContent = "✓ E-mail Copiado!";
            btnCopyEmail.style.borderColor = "#25d366";
            btnCopyEmail.style.color = "#25d366";
            
            setTimeout(() => {
                copyEmailText.textContent = originalText;
                btnCopyEmail.style.borderColor = "";
                btnCopyEmail.style.color = "";
            }, 2500);
        }).catch(err => {
            console.error("Erro ao copiar e-mail:", err);
        });
    });
}

// ==========================================================
// 9. RELÓGIO EM TEMPO REAL NO RODAPÉ (ITABUNA - BA)
// ==========================================================
const clockEl = document.getElementById('brasilia-clock');

function updateBrasiliaClock() {
    if (!clockEl) return;
    
    try {
        const now = new Date();
        const options = {
            timeZone: 'America/Bahia',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const timeString = new Intl.DateTimeFormat('pt-BR', options).format(now);
        clockEl.textContent = `Itabuna (BA): ${timeString}`;
    } catch (e) {
        const now = new Date();
        const fallback = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
        clockEl.textContent = `Itabuna (BA): ${fallback}`;
    }
}

setInterval(updateBrasiliaClock, 1000);
updateBrasiliaClock();

// ==========================================================
// 10. BOTÃO VOLTAR AO TOPO
// ==========================================================
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Recálculo ao carregar completamente
window.addEventListener('load', () => {
    resizeCanvas();
    ScrollTrigger.refresh();
});
