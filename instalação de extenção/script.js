/**
 * ENG.START - Lógica Interativa e Animação de Símbolos da Engenharia
 * 
 * Inclui:
 * 1. Simulação física em HTML5 Canvas de símbolos da Engenharia em órbita contínua (Engrenagens, Compasso, Viga I, Nível, Teodolito).
 * 2. Canvas interativo interno do Modal CREA respondendo aos movimentos do cursor.
 * 3. Gerenciamento das abas de Carreira, Remuneração, Dificuldades e Consolidação.
 * 4. Simulador interativo em tempo real de Honorários de Gestão de Obras (CUB).
 * 5. Mapeamento interativo dos 4 modelos societários (Autônomo, PJ Unipessoal, CNPJ Construtora, CLT).
 * 6. Filtro dinâmico por categoria de patologias construtivas e inovações.
 * 7. Janela modal de validação do CREA com feedback visual e regras de validação.
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initModalCanvas();
  initPillarsTabs();
  initFeeCalculator();
  initModelSelector();
  initPathologyFilter();
  initAuthModal();
  initEngChat();
  checkPersistedSession();
});

/* ==========================================================================
   1. CANVAS DE FUNDO: SÍMBOLOS DA ENGENHARIA EM MOVIMENTO INTERATIVO
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('engineeringSymbolsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Tipos de símbolos: 'gear' (engrenagem), 'compass' (compasso), 'beam' (perfil I), 'triangle' (esquadro)
  const symbols = [];
  const symbolTypes = ['gear', 'compass', 'beam', 'square', 'plumb'];
  const count = Math.min(24, Math.floor(width / 60));

  for (let i = 0; i < count; i++) {
    symbols.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: 18 + Math.random() * 26,
      angle: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.015,
      type: symbolTypes[Math.floor(Math.random() * symbolTypes.length)],
      alpha: 0.12 + Math.random() * 0.22,
      color: Math.random() > 0.4 ? '#f59e0b' : '#06b6d4'
    });
  }

  function drawSymbol(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.alpha;
    ctx.lineWidth = 1.6;

    if (s.type === 'gear') {
      // Desenha engrenagem técnica de engenharia
      const teeth = 8;
      const rOuter = s.size;
      const rInner = s.size * 0.72;
      const rHole = s.size * 0.35;

      ctx.beginPath();
      for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = (i * Math.PI) / teeth;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Furo central com chaveta
      ctx.beginPath();
      ctx.arc(0, 0, rHole, 0, Math.PI * 2);
      ctx.stroke();
    } else if (s.type === 'compass') {
      // Compasso da engenharia civil / arquitetura
      const len = s.size * 1.2;
      ctx.beginPath();
      // Ponto de articulação superior
      ctx.arc(0, -len * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Perna esquerda
      ctx.beginPath();
      ctx.moveTo(0, -len * 0.5);
      ctx.lineTo(-s.size * 0.7, len * 0.5);
      // Perna direita
      ctx.moveTo(0, -len * 0.5);
      ctx.lineTo(s.size * 0.7, len * 0.5);
      // Arco graduado central
      ctx.moveTo(-s.size * 0.4, 0);
      ctx.quadraticCurveTo(0, -s.size * 0.2, s.size * 0.4, 0);
      ctx.stroke();
    } else if (s.type === 'beam') {
      // Perfil metálico estrutural em I
      const w = s.size * 0.9;
      const h = s.size * 1.4;
      const t = 4; // espessura
      ctx.beginPath();
      // Mesa superior
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      // Alma central
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
      // Mesa inferior
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.stroke();
    } else if (s.type === 'square') {
      // Esquadro técnico triangular com perfuração
      const side = s.size * 1.3;
      ctx.beginPath();
      ctx.moveTo(-side / 2, side / 2);
      ctx.lineTo(side / 2, side / 2);
      ctx.lineTo(-side / 2, -side / 2);
      ctx.closePath();
      ctx.stroke();

      // Furo interno
      ctx.beginPath();
      ctx.moveTo(-side / 4, side / 4);
      ctx.lineTo(side / 6, side / 4);
      ctx.lineTo(-side / 4, -side / 6);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Fio de prumo de obra
      ctx.beginPath();
      ctx.moveTo(0, -s.size);
      ctx.lineTo(0, 0);
      ctx.arc(0, 0, s.size * 0.4, 0, Math.PI, false);
      ctx.lineTo(0, s.size * 0.8);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Conectar nós próximos com linhas técnicas sutis tipo blueprint
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const dx = symbols[i].x - symbols[j].x;
        const dy = symbols[i].y - symbols[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          ctx.beginPath();
          ctx.strokeStyle = '#06b6d4';
          ctx.globalAlpha = (1 - dist / 140) * 0.12;
          ctx.lineWidth = 1;
          ctx.moveTo(symbols[i].x, symbols[i].y);
          ctx.lineTo(symbols[j].x, symbols[j].y);
          ctx.stroke();
        }
      }
    }

    // Atualizar posição dos símbolos
    for (let s of symbols) {
      s.x += s.vx;
      s.y += s.vy;
      s.angle += s.vRot;

      if (s.x < -40) s.x = width + 40;
      if (s.x > width + 40) s.x = -40;
      if (s.y < -40) s.y = height + 40;
      if (s.y > height + 40) s.y = -40;

      drawSymbol(s);
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. CANVAS DEDICADO DO MODAL CREA (INTERAÇÃO COM CURSOR DO MOUSE)
   ========================================================================== */
function initModalCanvas() {
  const canvas = document.getElementById('modalEngCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = canvas.parentElement.offsetWidth || 480);
  let height = (canvas.height = canvas.parentElement.offsetHeight || 180);

  let mouseX = width / 2;
  let mouseY = height / 2;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // Rodas de engrenagens interconectadas (Sistema mecânico e de cálculo)
  const gears = [
    { x: width * 0.22, y: height * 0.5, r: 42, teeth: 12, speed: 0.02, color: '#f59e0b' },
    { x: width * 0.5, y: height * 0.5, r: 60, teeth: 16, speed: -0.015, color: '#06b6d4' },
    { x: width * 0.78, y: height * 0.5, r: 42, teeth: 12, speed: 0.02, color: '#f59e0b' }
  ];

  let rotation = 0;

  function renderModalCanvas() {
    ctx.clearRect(0, 0, width, height);
    rotation += 0.01;

    // Fundo com retícula blueprint de prancha técnica
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Desenhar engrenagens sincronizadas
    gears.forEach((gear, idx) => {
      ctx.save();
      ctx.translate(gear.x, gear.y);

      // Leve atração ao mouse
      const dx = (mouseX - gear.x) * 0.03;
      const dy = (mouseY - gear.y) * 0.03;
      ctx.translate(dx, dy);

      ctx.rotate(rotation * (gear.speed > 0 ? 1 : -1) * (idx === 1 ? 1.2 : 1));

      ctx.strokeStyle = gear.color;
      ctx.fillStyle = gear.color;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;

      // Dentes da engrenagem
      ctx.beginPath();
      for (let i = 0; i < gear.teeth * 2; i++) {
        const rad = i % 2 === 0 ? gear.r : gear.r * 0.78;
        const ang = (i * Math.PI) / gear.teeth;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Raios internos
      for (let r = 0; r < 4; r++) {
        const a = (r * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * gear.r * 0.65, Math.sin(a) * gear.r * 0.65);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, gear.r * 0.28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });

    requestAnimationFrame(renderModalCanvas);
  }

  renderModalCanvas();
}

/* ==========================================================================
   3. ABAS DOS 4 PILARES DA CARREIRA
   ========================================================================== */
function initPillarsTabs() {
  const tabs = document.querySelectorAll('.pillar-tab-btn');
  const panels = document.querySelectorAll('.pillar-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. SIMULADOR DE HONORÁRIOS DE GESTÃO DE OBRAS (CUB)
   ========================================================================== */
function initFeeCalculator() {
  const areaInput = document.getElementById('calcArea');
  const cubInput = document.getElementById('calcCub');
  const taxaInput = document.getElementById('calcTaxa');
  const resultDisplay = document.getElementById('calcResultado');

  function calculate() {
    const area = parseFloat(areaInput.value) || 0;
    const cub = parseFloat(cubInput.value) || 0;
    const taxa = parseFloat(taxaInput.value) || 0;

    const custoEstimadoObra = area * cub;
    const honorario = custoEstimadoObra * (taxa / 100);

    resultDisplay.textContent = honorario.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  if (areaInput && cubInput && taxaInput) {
    areaInput.addEventListener('input', calculate);
    cubInput.addEventListener('change', calculate);
    taxaInput.addEventListener('input', calculate);
    calculate();
  }
}

/* ==========================================================================
   5. SELETOR DE MODELOS DE ATUAÇÃO (Autônomo, PJ, CNPJ, CLT)
   ========================================================================== */
const modelsDatabase = {
  autonomo: {
    title: '1. Engenheiro Autônomo (Pessoa Física com RPA)',
    desc: 'Atuação direta com emissão de Recibo de Pagamento a Autônomo (RPA) ou carnê-leão. Indicado exclusivamente para pequenos laudos esporádicos no início absoluto.',
    pros: [
      'Sem custo de abertura ou encerramento de CNPJ',
      'Pode assinar ART imediatamente com registro de PF no CREA',
      'Ideal para perícias judiciais nomeadas (TJ paga direto à PF)'
    ],
    cons: [
      'Carga tributária pesadíssima: IRPF progressivo de até 27,5%',
      'INSS autônomo de 20% retido na fonte',
      'Dificuldade de contratação por médias e grandes construtoras'
    ],
    taxRegime: 'Tabela Progressiva IRPF (até 27,5%) + ISS municipal (2% a 5%) + INSS Autônomo',
    creaRule: 'Paga apenas a Anuidade de Pessoa Física do CREA regional.',
    bestFit: 'Peritos Judiciais iniciantes, avaliadores de imóveis e projetos residenciais esporádicos.'
  },
  pj: {
    title: '2. PJ Unipessoal (SLU - Sociedade Limitada Unipessoal)',
    desc: 'Empresa constituída por apenas um titular com separação total entre patrimônio pessoal e da empresa. O modelo mais adotado por consultores e coordenadores de projetos.',
    pros: [
      'Tributação no Simples Nacional (Anexo III - 6% via Fator R)',
      'Abertura de portas em grandes empresas corporativas via B2B',
      'Blindagem do patrimônio pessoal contra passivos da empresa'
    ],
    cons: [
      'Exige duas anuidades: Anuidade PF + Anuidade PJ no CREA',
      'Custos mensais obrigatórios com honorários contábeis',
      'Necessidade de emissão formal de pró-labore com INSS (11%)'
    ],
    taxRegime: 'Simples Nacional Anexo III (6% inicial se Fator R ≥ 28%) ou Lucro Presumido (13,33% a 16,33%)',
    creaRule: 'Obrigatoriedade de Registro de Pessoa Jurídica no CREA + Taxa de Anotação de RT.',
    bestFit: 'Prestadores de serviços para escritórios de engenharia, projetistas BIM e peritos corporativos.'
  },
  cnpj: {
    title: '3. Construtora / Empreiteira (CNPJ com Obra Própria)',
    desc: 'Habilitação para execução integral de obras, contratação direta de operários da construção civil, compra de insumos no atacado e faturamento por medições.',
    pros: [
      'Possibilidade de optar pela Desoneração da Folha de Pagamento (CPRB)',
      'Escala de faturamento elevada através de taxa de administração e empreitada global',
      'Criação de Acervo Técnico robusto (CAT) para disputar licitações públicas'
    ],
    cons: [
      'Alta responsabilidade trabalhista e fiscal de canteiro de obras',
      'Exigência de capital social compatível para certidões e editais',
      'Gestão complexa de CNO (Cadastro Nacional de Obras) e eSocial'
    ],
    taxRegime: 'Lucro Presumido ou Simples Nacional Anexo IV (tributação sem INSS patronal no DAS)',
    creaRule: 'Registro PJ de Engenharia Civil com Capital Social registrado e Engenheiro Responsável Técnico.',
    bestFit: 'Empreiteiros de reformas comerciais, construtores residenciais de alto padrão e obras públicas.'
  },
  clt: {
    title: '4. Carteira Assinada (CLT - Piso Salarial da Categoria)',
    desc: 'Vínculo empregatício regido pela Consolidação das Leis do Trabalho e protegido pela Lei Federal nº 4.950-A/66.',
    pros: [
      'Estabilidade relativa com FGTS (8%), 13º salário e férias remuneradas + 1/3',
      'Piso salarial legal garantido quando contratado formalmente como "Engenheiro"',
      'A empresa arca com custos de infraestrutura, EPIs, seguros e softwares'
    ],
    cons: [
      'Prática de mercado de registrar como "Analista de Engenharia" para pagar menos',
      'Teto de ganhos limitado ao salário fixado pelo empregador',
      'Pouca autonomia no gerenciamento dos próprios horários e projetos'
    ],
    taxRegime: 'Desconto em folha (INSS + IRRF) e FGTS depositado pelo empregador.',
    creaRule: 'Exige registro ativo no CREA do estado para exercer e assinar projetos internos.',
    bestFit: 'Recém-formados buscando experiência imersiva de canteiro em médias e grandes incorporadoras.'
  }
};

function initModelSelector() {
  const buttons = document.querySelectorAll('.model-btn');
  const display = document.getElementById('modelDisplay');

  function renderModel(key) {
    const data = modelsDatabase[key];
    if (!data || !display) return;

    display.innerHTML = `
      <div class="model-content-card">
        <div class="model-details">
          <h3>${data.title}</h3>
          <p class="model-desc-text">${data.desc}</p>
          <div class="model-pros-cons">
            <div class="box-pros">
              <h5><i class="ph-bold ph-thumbs-up"></i> Vantagens Estratégicas</h5>
              <ul>
                ${data.pros.map((p) => `<li>▸ ${p}</li>`).join('')}
              </ul>
            </div>
            <div class="box-cons">
              <h5><i class="ph-bold ph-warning"></i> Atenção & Desvantagens</h5>
              <ul>
                ${data.cons.map((c) => `<li>▸ ${c}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="model-tax-sidebar">
          <div>
            <span class="tax-header"><i class="ph-bold ph-calculator"></i> Enquadramento Fiscal</span>
            <div class="tax-row">
              <strong>Regime Tributário:</strong>
              <span>${data.taxRegime}</span>
            </div>
            <div class="tax-row">
              <strong>Regra de CREA:</strong>
              <span>${data.creaRule}</span>
            </div>
            <div class="tax-row">
              <strong>Melhor Aplicação:</strong>
              <span>${data.bestFit}</span>
            </div>
          </div>

          <div class="tax-cnaes">
            <strong>CNAEs Recomendados:</strong>
            <p>7112-0/00 (Serviços de Engenharia), 4120-4/00 (Construção de Edifícios), 7119-7/03 (Desenho Técnico).</p>
          </div>
        </div>
      </div>
    `;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const model = btn.getAttribute('data-model');
      renderModel(model);
    });
  });

  // Render inicial
  renderModel('autonomo');
}

/* ==========================================================================
   6. FILTRAGEM DINÂMICA DE PATOLOGIAS CONSTRUTIVAS
   ========================================================================== */
function initPathologyFilter() {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.pathology-card');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.getAttribute('data-filter');

      cards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. MODAL DE ACESSO CREA COM VALIDAÇÃO E FEEDBACK VISUAL
   ========================================================================== */
function initAuthModal() {
  const modal = document.getElementById('authModal');
  const btnOpen = document.getElementById('btnOpenAuth');
  const btnClose = document.getElementById('btnCloseModal');
  const form = document.getElementById('creaLoginForm');
  const togglePass = document.getElementById('btnTogglePass');
  const passwordInput = document.getElementById('userPassword');
  const feedback = document.getElementById('loginFeedback');

  if (!modal || !btnOpen) return;

  btnOpen.addEventListener('click', () => {
    modal.classList.add('open');
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  // Fechar clicando fora do card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

  // Alternar visualização da senha
  if (togglePass && passwordInput) {
    togglePass.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePass.innerHTML = type === 'password' ? '<i class="ph ph-eye"></i>' : '<i class="ph ph-eye-slash"></i>';
    });
  }

  // Submissão do formulário
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = document.getElementById('userName').value.trim();
      const crea = document.getElementById('creaNumber').value.trim();
      const email = document.getElementById('userEmail').value.trim();

      feedback.className = 'login-feedback-msg';
      feedback.textContent = 'Verificando chave pública e credenciamento no banco CONFEA/CREA...';

      setTimeout(() => {
        feedback.className = 'login-feedback-msg success';
        feedback.innerHTML = `✓ Engenheiro Civil autenticado com sucesso! Registro CREA <strong>${crea}</strong> validado. Liberando biblioteca técnica.`;

        // Armazenar sessão
        const sessionData = {
          name: userName,
          crea: crea,
          email: email
        };
        localStorage.setItem('eng_logged_user', JSON.stringify(sessionData));

        setTimeout(() => {
          modal.classList.remove('open');
          feedback.textContent = '';
          applyLoggedInState(sessionData);

          // Abre o chat para boas-vindas na rede técnica
          const chatDrawer = document.getElementById('engChatDrawer');
          if (chatDrawer) {
            chatDrawer.classList.add('open');
            const chatBtn = document.getElementById('btnToggleChat');
            if (chatBtn) chatBtn.classList.add('active');
          }
        }, 1200);
      }, 900);
    });
  }

  // Logout do Engenheiro
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('eng_logged_user');
      const authBtn = document.getElementById('btnOpenAuth');
      const profileArea = document.getElementById('userProfileArea');
      const chatDrawer = document.getElementById('engChatDrawer');

      if (profileArea) profileArea.style.display = 'none';
      if (authBtn) authBtn.style.display = 'flex';
      if (chatDrawer) chatDrawer.classList.remove('open');

      alert('Sessão técnica finalizada. Você pode autenticar outro profissional a qualquer momento.');
    });
  }
}

function checkPersistedSession() {
  const saved = localStorage.getItem('eng_logged_user');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      applyLoggedInState(data);
    } catch (err) {
      console.error(err);
    }
  }
}

function applyLoggedInState(user) {
  const authBtn = document.getElementById('btnOpenAuth');
  const profileArea = document.getElementById('userProfileArea');
  const navUserName = document.getElementById('navUserName');
  const navUserCrea = document.getElementById('navUserCrea');

  if (authBtn && profileArea && navUserName && navUserCrea) {
    authBtn.style.display = 'none';
    profileArea.style.display = 'flex';
    navUserName.textContent = `Eng. ${user.name}`;
    navUserCrea.textContent = `CREA ${user.crea}`;
  }
}

/* ==========================================================================
   8. CHAT TÉCNICO INTERATIVO ENTRE ENGENHEIROS CIVIS (TROCA DE EXPERIÊNCIAS)
   ========================================================================== */
const sampleChatData = {
  geral: [
    {
      author: 'Eng. Marcelo Castro',
      crea: '506.189/SP',
      time: '19:42',
      text: 'Boa noite colegas! Alguém aqui migrou de CLT para PJ Unipessoal (SLU) recentemente? O Fator R no Simples Nacional realmente compensou para vocês?',
      mine: false
    },
    {
      author: 'Enga. Beatriz Nogueira',
      crea: '142.990/MG',
      time: '19:46',
      text: 'Com certeza Marcelo! Mantendo o pró-labore em 28% da receita bruta caí do Anexo V (15,5%) direto para o Anexo III pagando apenas 6% de DAS inicial. Vale muito a pena para consultorias e laudos.',
      mine: false
    },
    {
      author: 'Eng. Rodrigo Alencar',
      crea: '088.312/PR',
      time: '19:50',
      text: 'Recomendo demais também abrir uma conta PJ separada para não misturar os patrimônios. Isso evita problemas na fiscalização.',
      mine: false
    }
  ],
  patologias: [
    {
      author: 'Eng. Tiago Mendes',
      crea: '210.450/RJ',
      time: '18:15',
      text: 'Colegas de obra, peguei uma contenção em solo grampeado com lixiviação severa após chuvas torrenciais. Qual o método de injeção de graute polimérico com melhor custo-benefício que usam?',
      mine: false
    },
    {
      author: 'Enga. Camila Fontana',
      crea: '334.120/SC',
      time: '18:30',
      text: 'Tiago, recomendo resina de poliuretano hidrofóbica com bico injetor packer. Ela expande em contato com a água e estanca a percolação na hora!',
      mine: false
    }
  ],
  pj: [
    {
      author: 'Eng. Lucas Vianna',
      crea: '556.780/GO',
      time: '17:10',
      text: 'Dica para quem está montando a primeira proposta de administração de obra: use sempre o CUB como balizador e feche contrato com ART vinculada explicitando a taxa de 12% a 15%.',
      mine: false
    }
  ],
  softwares: [
    {
      author: 'Enga. Juliana Sato',
      crea: '499.020/RS',
      time: '19:15',
      text: 'Quem está usando Revit 2026 integrado com Navisworks para compatibilização mecânica e hidráulica? A detecção de colisões (Clash Detection) reduziu o retrabalho em canteiro em quase 40%.',
      mine: false
    }
  ]
};

let currentChannel = 'geral';

function initEngChat() {
  const chatDrawer = document.getElementById('engChatDrawer');
  const btnToggle = document.getElementById('btnToggleChat');
  const btnClose = document.getElementById('btnCloseChat');
  const btnMinimize = document.getElementById('btnMinimizeChat');
  const channels = document.querySelectorAll('.channel-chip');
  const chatForm = document.getElementById('chatMessageForm');
  const chatInput = document.getElementById('chatInputText');

  if (!chatDrawer) return;

  // Toggle do Drawer do Chat
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      chatDrawer.classList.toggle('open');
      btnToggle.classList.toggle('active');
      renderMessages();
      scrollChatToBottom();
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      chatDrawer.classList.remove('open');
      if (btnToggle) btnToggle.classList.remove('active');
    });
  }

  if (btnMinimize) {
    btnMinimize.addEventListener('click', () => {
      chatDrawer.classList.remove('open');
      if (btnToggle) btnToggle.classList.remove('active');
    });
  }

  // Alternar canais
  channels.forEach((chip) => {
    chip.addEventListener('click', () => {
      channels.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentChannel = chip.getAttribute('data-channel');
      renderMessages();
      scrollChatToBottom();
    });
  });

  // Enviar mensagem
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      const saved = localStorage.getItem('eng_logged_user');
      let userName = 'Engenheiro Recém-Formado';
      let userCrea = 'CREA Ativo';

      if (saved) {
        try {
          const userObj = JSON.parse(saved);
          userName = `Eng. ${userObj.name}`;
          userCrea = userObj.crea;
        } catch (err) {}
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (!sampleChatData[currentChannel]) {
        sampleChatData[currentChannel] = [];
      }

      sampleChatData[currentChannel].push({
        author: userName,
        crea: userCrea,
        time: timeStr,
        text: text,
        mine: true
      });

      chatInput.value = '';
      renderMessages();
      scrollChatToBottom();

      // Resposta simulada de outro engenheiro para interatividade após 2.5 segundos
      setTimeout(() => {
        simulateEngineerReply(text);
      }, 2500);
    });
  }

  renderMessages();
}

function renderMessages() {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  const msgs = sampleChatData[currentChannel] || [];

  container.innerHTML = msgs
    .map(
      (m) => `
    <div class="chat-msg-item ${m.mine ? 'mine' : 'other'}">
      <div class="msg-header-meta">
        <span class="msg-author">${m.author}</span>
        <span class="msg-crea-tag">${m.crea}</span>
        <span class="msg-time">${m.time}</span>
      </div>
      <div class="msg-bubble">${escapeHtml(m.text)}</div>
    </div>
  `
    )
    .join('');
}

function scrollChatToBottom() {
  const container = document.getElementById('chatMessagesContainer');
  if (container) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }
}

function simulateEngineerReply(lastMsg) {
  const replies = [
    'Excelente colocação! No meu último canteiro de obras tivemos exatamente esse cenário e documentamos tudo no diário de obras fotográfico.',
    'Muito bem observado, colega. Vale a pena também consultar a recomendação da NBR 6118 para blindar seu laudo de responsabilidade técnica.',
    'Ótima contribuição para quem está começando agora! É essa troca técnica que faz a engenharia crescer.',
    'Concordo plenamente. Já passei por isso e o segredo foi alinhar a expectativa com o mestre de obras desde a primeira reunião de planejamento.',
    'Perfeito! Se precisar de um modelo de memorial descritivo ou planilha de curva ABC nesse padrão, posso disponibilizar aqui no canal.'
  ];

  const randomReply = replies[Math.floor(Math.random() * replies.length)];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  sampleChatData[currentChannel].push({
    author: 'Eng. Fernando Siqueira',
    crea: '388.940/MG',
    time: timeStr,
    text: randomReply,
    mine: false
  });

  renderMessages();
  scrollChatToBottom();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ==========================================================================
   9. VISUALIZADOR INTEGRADO DAS TELAS GOOGLE STITCH (MCP)
   ========================================================================== */
function openStitchViewer(url, title) {
  const modal = document.getElementById('stitchViewerModal');
  const iframe = document.getElementById('stitchIframe');
  const titleEl = document.getElementById('stitchViewerTitle');
  const urlEl = document.getElementById('stitchViewerUrl');
  const openTab = document.getElementById('btnViewerOpenTab');

  if (!modal || !iframe) return;

  iframe.src = url;
  if (titleEl) titleEl.textContent = title || 'Módulo Google Stitch';
  if (urlEl) urlEl.textContent = url;
  if (openTab) openTab.href = url;

  modal.classList.add('open');
}

function initStitchViewerControls() {
  const modal = document.getElementById('stitchViewerModal');
  const btnClose = document.getElementById('btnCloseStitchViewer');
  const btnToggle = document.getElementById('btnDeviceToggle');
  const wrapper = document.getElementById('stitchIframeWrapper');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('open');
      const iframe = document.getElementById('stitchIframe');
      if (iframe) iframe.src = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        const iframe = document.getElementById('stitchIframe');
        if (iframe) iframe.src = '';
      }
    });
  }

  if (btnToggle && wrapper) {
    btnToggle.addEventListener('click', () => {
      if (wrapper.classList.contains('mobile-frame')) {
        wrapper.classList.remove('mobile-frame');
        wrapper.classList.add('desktop-frame');
        btnToggle.innerHTML = '<i class="ph-bold ph-device-mobile"></i>';
        btnToggle.setAttribute('title', 'Alternar para formato Mobile');
      } else {
        wrapper.classList.remove('desktop-frame');
        wrapper.classList.add('mobile-frame');
        btnToggle.innerHTML = '<i class="ph-bold ph-devices"></i>';
        btnToggle.setAttribute('title', 'Alternar para formato Desktop');
      }
    });
  }
}

// Chamar inicialização dos controles do viewer
document.addEventListener('DOMContentLoaded', () => {
  initStitchViewerControls();
});


