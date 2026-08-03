// Registrar o plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d");

// Total de frames da pasta (271 frames confirmados)
const frameCount = 271;

// Função para gerar o caminho de cada frame
const currentFrame = index => (
  `./frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`
);

const images = new Array(frameCount);
const frameData = { frame: 0 };

// Responsividade do canvas
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  // Ajusta a resolução interna do canvas baseada no tamanho real da tela e densidade de pixels
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  render();
}

window.addEventListener("resize", resizeCanvas);

// Carregamento otimizado (Progressivo)
function initPreloader() {
  // Carrega o primeiro frame imediatamente
  const firstImage = new Image();
  firstImage.onload = () => {
    images[0] = firstImage;
    resizeCanvas(); // Chama o primeiro resize/render
    startSequentialPreload(); // Começa a carregar os próximos
  };
  firstImage.src = currentFrame(0);
}

// Carrega o restante das imagens em lotes para não travar o navegador
function startSequentialPreload() {
  let currentIndex = 1;
  
  function loadNext() {
    if (currentIndex >= frameCount) return;
    
    const index = currentIndex++;
    const img = new Image();
    
    img.onload = () => {
      images[index] = img;
      // Se a animação já chegou nesse frame, renderiza-o imediatamente
      const currentFrameIndex = Math.max(0, Math.min(frameCount - 1, Math.round(frameData.frame)));
      if (currentFrameIndex === index) {
        render();
      }
      loadNext();
    };
    
    img.onerror = () => {
      loadNext(); // Tenta o próximo em caso de falha
    };
    
    img.src = currentFrame(index);
  }
  
  // Abre 4 "threads" simultâneas para carregar mais rápido, mas sem afogar a rede
  for(let i = 0; i < 4; i++) {
    loadNext();
  }
}

// Inicia o carregamento
initPreloader();

// Animação dos frames conectada ao scroll
gsap.to(frameData, {
  frame: frameCount - 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 2.5,
    onUpdate: render
  }
});

// Função para desenhar a imagem atual no canvas
function render() {
  const currentFrameIndex = Math.max(0, Math.min(frameCount - 1, Math.round(frameData.frame)));
  const img = images[currentFrameIndex];
  
  if (img && img.complete) {
    // Limpar o canvas anterior
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calcula a proporção para o canvas
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    
    // No computador mantemos como antes para não dar zoom (Math.min),
    // No celular usamos Math.max para preencher o formato vertical (cover)
    const isMobile = window.innerWidth <= 768;
    const ratio = isMobile ? Math.max(hRatio, vRatio) : Math.min(hRatio, vRatio); 
    
    const newWidth = img.width * ratio;
    const newHeight = img.height * ratio;
    
    // Centraliza no eixo X
    const centerShift_x = (canvas.width - newWidth) / 2;
    // Encosta no final do eixo Y (embaixo)
    const centerShift_y = canvas.height - newHeight;  

    context.drawImage(img, 0, 0, img.width, img.height,
                      centerShift_x, centerShift_y, newWidth, newHeight);
  }
}

// === ANIMAÇÕES DOS MODAIS ===

// Configuração padrão para a entrada/saída dos modais
const modalConfig = {
    opacity: 1,
    autoAlpha: 1, 
    scale: 1,
    y: 0, // Chega na posição original (controlada pelo CSS)
    duration: 0.8,
    ease: "power3.out"
};

// Configuração do estado inicial escondido (deslocado um pouco para baixo)
const modalHiddenState = {
    opacity: 0,
    autoAlpha: 0,
    scale: 0.9,
    y: 50 // Começa 50px abaixo da posição original e sobe suavemente
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

// Ocultar o indicador de scroll (mousezinho) ao começar a descer
gsap.to(".scroll-indicator", {
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "2% top",
        toggleActions: "play none none reverse",
    },
    opacity: 0,
    duration: 0.3
});

// === FULLSCREEN OVERLAY LOGIC ===
const modals = document.querySelectorAll('.project-modal');
const fullscreenOverlay = document.getElementById('fullscreen-overlay');
const fullscreenImg = document.getElementById('fullscreen-img');
const closeFullscreenBtn = document.querySelector('.close-fullscreen');

function openModalPreview(e, modal) {
    // Se clicar/pressionar em um botão dentro do modal, não abre a imagem
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
    
    // Suporte para navegação por teclado
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Evita scroll ao pressionar espaço
            openModalPreview(e, modal);
        }
    });
});

function closeFullscreen() {
    fullscreenOverlay.classList.remove('active');
    setTimeout(() => {
        fullscreenImg.src = ""; // Limpa a imagem após a transição fechar
    }, 300);
}

closeFullscreenBtn.addEventListener('click', closeFullscreen);

// Fecha também ao clicar fora da imagem
fullscreenOverlay.addEventListener('click', (e) => {
    if (e.target === fullscreenOverlay) {
        closeFullscreen();
    }
});
