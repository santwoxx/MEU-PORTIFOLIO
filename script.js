// Registrar o plugin ScrollTrigger do GSAP
gsap.registerPlugin(ScrollTrigger);

// ==========================================================
// 1. HERO CANVAS 3D SCROLL ANIMATION (271 FRAMES PRESERVADOS)
// ==========================================================
const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d");

const frameCount = 271;

// Função para gerar o caminho de cada frame
const currentFrame = index => (
  `./frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`
);

const images = new Array(frameCount);
const frameData = { frame: 0 };

let renderProps = null;
let lastRenderedFrame = -1;

// Responsividade do canvas
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  const firstValidImg = images.find(img => img && img.complete && img.width > 0);
  if (firstValidImg) {
      calculateRenderProps(firstValidImg);
  }
  
  lastRenderedFrame = -1;
  render();
}

function calculateRenderProps(img) {
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

// Carregamento otimizado (Progressivo)
function initPreloader() {
  const firstImage = new Image();
  firstImage.src = currentFrame(0);
  firstImage.decode().then(() => {
    images[0] = firstImage;
    resizeCanvas(); 
    startSequentialPreload(); 
  }).catch(() => {
    startSequentialPreload();
  });
}

// Carrega o restante das imagens em lotes simultâneos
function startSequentialPreload() {
  let currentIndex = 1;
  
  function loadNext() {
    if (currentIndex >= frameCount) return;
    
    const index = currentIndex++;
    const img = new Image();
    img.src = currentFrame(index);
    
    img.decode().then(() => {
      images[index] = img;
      
      const currentFrameIndex = Math.max(0, Math.min(frameCount - 1, Math.round(frameData.frame)));
      if (currentFrameIndex === index) {
        render();
      }
      loadNext();
    }).catch(() => {
      loadNext(); 
    });
  }
  
  for(let i = 0; i < 4; i++) {
    loadNext();
  }
}

initPreloader();

// Animação dos frames conectada ao scroll
gsap.to(frameData, {
  frame: frameCount - 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5,
    fastScrollEnd: true,
    onUpdate: render
  }
});

// Função para desenhar a imagem atual no canvas
function render() {
  const currentFrameIndex = Math.max(0, Math.min(frameCount - 1, Math.round(frameData.frame)));
  if (currentFrameIndex === lastRenderedFrame) return;
  
  const img = images[currentFrameIndex];
  
  if (img && img.complete && renderProps) {
    lastRenderedFrame = currentFrameIndex;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, img.width, img.height,
                      renderProps.x, renderProps.y, renderProps.width, renderProps.height);
  }
}

// ==========================================================
// 2. TRANSIÇÃO & FADE-OUT SUAVE DO HERO CANVAS AO SAIR
// ==========================================================
gsap.to("#hero-canvas", {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "90% top",
        end: "100% top",
        scrub: true
    },
    opacity: 0,
    ease: "power1.out"
});

// Ocultar o indicador de scroll ao começar a rolar a página
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
// 3. ANIMAÇÕES DOS MODAIS DE PROJETOS (PRESERVADOS)
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

gsap.fromTo("#project-1", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "8% top", 
        end: "20% top",   
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

gsap.fromTo("#project-2", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "25% top", 
        end: "37% top",
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

gsap.fromTo("#project-3", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "42% top", 
        end: "54% top",
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

gsap.fromTo("#project-4", modalHiddenState, {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "59% top", 
        end: "71% top",
        toggleActions: "play reverse play reverse",
    },
    ...modalConfig
});

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
// 4. FULLSCREEN OVERLAY LOGIC (PRESERVADO)
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
// 5. STICKY HEADER SCROLL EFFECT
// ==========================================================
const mainHeader = document.getElementById('main-header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        mainHeader.classList.add('scrolled');
    } else {
        mainHeader.classList.remove('scrolled');
    }
});

// ==========================================================
// 6. ANIMAÇÕES GSAP PARA AS NOVAS SEÇÕES
// ==========================================================
// Revelação de Pilares na Seção Sobre
gsap.from(".pillar-card", {
    scrollTrigger: {
        trigger: ".pillars-grid",
        start: "top 85%",
        toggleActions: "play none none reverse"
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
});

// Revelação da Metodologia / Processo
gsap.from(".process-card", {
    scrollTrigger: {
        trigger: ".process-timeline",
        start: "top 85%",
        toggleActions: "play none none reverse"
    },
    y: 35,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "power3.out"
});

// Revelação do Card de Contato
gsap.from(".contact-card-wrapper", {
    scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    scale: 0.95,
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out"
});

// ==========================================================
// 7. ACORDEÃO INTERATIVO DE SERVIÇOS
// ==========================================================
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    
    header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Fecha todos os outros itens para um efeito focado
        accordionItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });
        
        // Se não estava ativo, abre
        if (!isActive) {
            item.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
        }
    });
});

// ==========================================================
// 8. SELETOR INTERATIVO DE PROJETOS PARA O WHATSAPP
// ==========================================================
const selectorChips = document.querySelectorAll('.selector-chip');
const btnWhatsApp = document.getElementById('btn-whatsapp');
const whatsappPhone = "5513996287485";

selectorChips.forEach(chip => {
    chip.addEventListener('click', () => {
        // Remove estado ativo de todos os chips
        selectorChips.forEach(c => c.classList.remove('active'));
        
        // Ativa o clicado
        chip.classList.add('active');
        
        const serviceName = chip.getAttribute('data-service');
        const customMessage = `Olá Natan, gostaria de conversar sobre um projeto de ${serviceName}!`;
        const encodedMessage = encodeURIComponent(customMessage);
        
        // Atualiza dinamicamente o link do WhatsApp
        btnWhatsApp.href = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    });
});

// ==========================================================
// 9. CÓPIA DE E-MAIL COM 1 CLIQUE & FEEDBACK VISUAL
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
// 10. RELÓGIO EM TEMPO REAL NO RODAPÉ (FUSO DE BRASÍLIA)
// ==========================================================
const clockEl = document.getElementById('brasilia-clock');

function updateBrasiliaClock() {
    if (!clockEl) return;
    
    try {
        const now = new Date();
        const options = {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const timeString = new Intl.DateTimeFormat('pt-BR', options).format(now);
        clockEl.textContent = `Brasília: ${timeString}`;
    } catch (e) {
        const now = new Date();
        clockEl.textContent = `Horário: ${now.toLocaleTimeString()}`;
    }
}

setInterval(updateBrasiliaClock, 1000);
updateBrasiliaClock();

// ==========================================================
// 11. BOTÃO VOLTAR AO TOPO
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
