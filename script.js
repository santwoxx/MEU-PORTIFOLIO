// Registrar o plugin ScrollTrigger do GSAP
gsap.registerPlugin(ScrollTrigger);

// ==========================================================
// 1. HERO CANVAS 3D SCROLL ANIMATION (ULTRA-FLUIDA & SEM ENGASGOS)
// ==========================================================
const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d", { alpha: true });

// Configuração de alta fidelidade visual
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = "high";

const frameCount = 271;

// Caminho dos frames
const currentFrame = index => (
  `./frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`
);

const images = new Array(frameCount);
const frameData = { frame: 0 };

let renderProps = null;
let lastRenderedFrame = -1;

// Responsividade e redimensionamento preciso do Canvas
function resizeCanvas() {
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  
  // Reconfigurar suavização após resize
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

// Pré-carregamento de alta performance
function initPreloader() {
  const firstImage = new Image();
  firstImage.src = currentFrame(0);
  
  firstImage.onload = () => {
    images[0] = firstImage;
    resizeCanvas();
    render();
    startFastPreload();
    ScrollTrigger.refresh();
  };
  
  firstImage.onerror = () => {
    startFastPreload();
  };
}

// Carregamento paralelo em lotes balanceados
function startFastPreload() {
  let currentIndex = 1;
  const concurrentLimit = 6;
  
  function loadNext() {
    if (currentIndex >= frameCount) return;
    
    const index = currentIndex++;
    const img = new Image();
    img.src = currentFrame(index);
    
    img.onload = () => {
      images[index] = img;
      
      if (!renderProps && img.width > 0) {
        calculateRenderProps(img);
      }
      
      const currentFrameIndex = Math.max(0, Math.min(frameCount - 1, Math.round(frameData.frame)));
      if (currentFrameIndex === index || lastRenderedFrame === -1) {
        render();
      }
      loadNext();
    };
    
    img.onerror = () => {
      loadNext();
    };
  }
  
  for (let i = 0; i < concurrentLimit; i++) {
    loadNext();
  }
}

initPreloader();

// Animação dos frames conectada ao scroll com máxima fluidez
gsap.to(frameData, {
  frame: frameCount - 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.0, // Resposta ultra-suave e responsiva
    fastScrollEnd: true,
    invalidateOnRefresh: true,
    onUpdate: render
  }
});

// Renderizador com proteção contra engasgos (Fallback inteligente para o frame mais próximo)
function render() {
  const targetIndex = Math.max(0, Math.min(frameCount - 1, Math.round(frameData.frame)));
  if (targetIndex === lastRenderedFrame && lastRenderedFrame !== -1) return;
  
  let img = images[targetIndex];
  
  // Se o frame exato ainda estiver carregando, usa o vizinho mais próximo carregado
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

// Ocultar indicador de scroll
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
const fullscreenImg = document.getElementById('fullscreen-img');
const closeFullscreenBtn = document.querySelector('.close-fullscreen');

function openModalPreview(e, modal) {
    if (e.target.tagName.toLowerCase() === 'a') return;
    
    const previewImg = modal.querySelector('.preview-media');
    if (previewImg && previewImg.src) {
        fullscreenImg.src = previewImg.src;
        fullscreenImg.alt = previewImg.alt;
        fullscreenOverlay.classList.add('active');
    }
}

modals.forEach(modal => {
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
    setTimeout(() => {
        fullscreenImg.src = "";
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
