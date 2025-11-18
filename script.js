// Global Constants for Gemini API
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
const API_KEY = "AIzaSyDDz_n6ptgqGkZTGoQWKvG8XUbL9Gn8--c";
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// --- GEMINI API UTILITY FUNCTION with EXPONENTIAL BACKOFF ---

async function fetchGemini(userQuery, systemInstruction = "", useSearch = false) {
  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    tools: useSearch ? [{ "google_search": {} }] : undefined,
  };

  const MAX_RETRIES = 5;
  let delay = 1000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(API_URL_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
          const text = candidate.content.parts[0].text;
          let sources = [];
          const groundingMetadata = candidate.groundingMetadata;
          if (groundingMetadata && groundingMetadata.groundingAttributions) {
            sources = groundingMetadata.groundingAttributions
              .map(attribution => ({
                uri: attribution.web?.uri,
                title: attribution.web?.title,
              }))
              .filter(source => source.uri && source.title);
          }
          return { text, sources };
        } else {
          throw new Error("Gemini response structure invalid or empty.");
        }
      }

      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        const errorBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errorBody}`);
      }

    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw new Error(`Gemini API failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      delay *= 2;
    }
  }
}

const pageContent = document.getElementById('pageContent');
const consoleEl = document.getElementById('console');

// Game state variables for cleanup
let activeGameInterval = null;
let activeGameRAF = null;
let gameEventListeners = [];

// --- Console and Navigation Helpers ---
function setConsole(txt){
  consoleEl.innerHTML += `\n$ ${txt}`;
  consoleEl.scrollTop = consoleEl.scrollHeight; // Auto-scroll
}

function setActiveNav(path){
  const navIds = ['navProfile', 'navGames', 'navPortfolio', 'navProfileMobile', 'navGamesMobile', 'navPortfolioMobile'];
  navIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  if(path.startsWith('/games')) {
    document.getElementById('navGames')?.classList.add('active');
    document.getElementById('navGamesMobile')?.classList.add('active');
  }
  else if(path === '/portfolio') {
    document.getElementById('navPortfolio')?.classList.add('active');
    document.getElementById('navPortfolioMobile')?.classList.add('active');
  }
  else { // /profile or /
    document.getElementById('navProfile')?.classList.add('active');
    document.getElementById('navProfileMobile')?.classList.add('active');
  }
}

function cleanupGame(){
  if (activeGameInterval) clearInterval(activeGameInterval);
  if (activeGameRAF) cancelAnimationFrame(activeGameRAF);
  gameEventListeners.forEach(({el, event, fn}) => el.removeEventListener(event, fn));
  activeGameInterval = null;
  activeGameRAF = null;
  gameEventListeners = [];
}

// --- Route Content Renderers ---
function renderProfile(){
  cleanupGame();
  setActiveNav('/profile');
  setConsole("Route: /profile. Displaying system credentials...");

  const bioText = document.getElementById('bio').textContent
    .replace(/\*\*|Access the ARCADE to test the system's runtime capabilities\./g, '').trim();


  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">📋</span> SYSTEM CREDENTIALS</h2>
    <div style="padding:10px; line-height: 1.8; font-family: monospace;">
      <p style="color:var(--neon-primary);">> **NAME**: Hakkan Parbej Shah</p>
      <p style="color:var(--neon-primary);">> **ROLE**: Full Stack Developer</p>
      <p style="color:var(--neon-primary);">> **STACK**: MERN, NEXT, TypeScript, Tailwind, ShadCN, Git, GitHub</p>
      <p style="color:var(--neon-primary);">> **EMAIL**: <a href="mailto:hakkanparbej@gmail.com" style="color:var(--neon-accent); text-decoration: none;">hakkanparbej@gmail.com</a></p>
      <div style="margin-top:25px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="Hakkan_Parbej_Shah_Resume.pdf" download class="small"><span class="icon">💾</span> Downlaod CV</a>
        <button class="small" id="visitGames"><span class="icon">💻</span> Switch Mode: ARCADE</button>
        <button class="small" id="generateMantra"><span class="icon">✨</span> GENERATE MANTRA</button>
      </div>

      <div id="mantraOutput" style="margin-top: 20px; padding: 10px; border: 1px dashed var(--neon-accent)33; border-radius: 6px; font-style: italic; color: var(--muted-color); min-height: 50px;">
        <span style="font-family: monospace; font-weight: 700; color: var(--neon-accent); margin-right: 10px;">// MANTRA:</span> Awaiting generation...
      </div>
    </div>
  `;

  document.getElementById('visitGames').addEventListener('click', ()=>{ location.hash = '#/games'; });

  const generateMantraBtn = document.getElementById('generateMantra');
  const mantraOutput = document.getElementById('mantraOutput');

  const mantraGenerator = async () => {
    generateMantraBtn.disabled = true;
    generateMantraBtn.innerHTML = '<span class="icon">🔄</span> GENERATING...';
    mantraOutput.innerHTML = '<span style="font-family: monospace; font-weight: 700; color: var(--neon-accent);">// MANTRA:</span> Processing bio data...';

    try {
      const system = "You are an AI specialized in writing short, powerful, technical mantras for senior developers. The mantra must be a single, short sentence, maximum 10 words, focusing on system architecture, code elegance, or aesthetic design. Do not include any introductory phrases.";
      const query = `Create a technical philosophy mantra based on this core principle: "${bioText}"`;
      const { text } = await fetchGemini(query, system, false);
      mantraOutput.innerHTML = `<span style="font-family: monospace; font-weight: 700; color: var(--neon-accent);">// MANTRA:</span> ${text}`;
      setConsole("Mantra generated successfully.");
    } catch (error) {
      mantraOutput.innerHTML = `<span style="color:#ff6666">// ERROR:</span> Failed to generate mantra. Check console for details.`;
      setConsole(`Mantra Generator Failed: ${error.message}`);
    } finally {
      generateMantraBtn.disabled = false;
      generateMantraBtn.innerHTML = '<span class="icon">✨</span> GENERATE MANTRA';
    }
  };

  generateMantraBtn.addEventListener('click', mantraGenerator);
  gameEventListeners.push({el: generateMantraBtn, event: 'click', fn: mantraGenerator});
}

function renderPortfolio(){
  cleanupGame();
  setActiveNav('/portfolio');
  setConsole("Route: /projects. Accessing codebase registry...");
  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">📂</span> PROJECT REGISTER (Q3/Q4)</h2>
    <div style="padding:10px; font-family: monospace;">
      <p style="color:#fff; margin-bottom: 15px;">**LOG**: High-level projects focus on scale and optimization. For full scope and live demos, please access the primary domain.</p>
      <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; color: var(--neon-accent);"><span class="icon">▶</span> Cloud-Native Real-Time Data Pipeline (Go/Kafka)</li>
        <li style="margin-bottom: 8px; color: var(--neon-accent);"><span class="icon">▶</span> Headless E-commerce Platform (React/Node.js)</li>
        <li style="margin-bottom: 8px; color: var(--neon-accent);"><span class="icon">▶</span> Decentralized Identity Layer (Web3/Solidity)</li>
      </ul>

      <div style="margin-top:30px; border-top: 1px dashed var(--neon-primary)33; padding-top: 20px;">
        <button class="btn primary" id="generateProject" style="width: 100%;"><span class="icon">💡</span> GENERATE NEXT PROJECT IDEA</button>
        <div id="projectOutput" style="margin-top: 15px; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; border: 1px solid var(--neon-primary)55; min-height: 100px;">
          <p style="color:var(--muted-color)">Awaiting Project Generation. Click the button above to synthesize a concept.</p>
        </div>
      </div>
      <p style="font-size: 1.1rem; margin-top: 20px;"><a href="https://hakkan.is-a.dev" target="_blank" style="color:var(--neon-primary); text-decoration: underline;"><span class="icon">🌐</span> Open Primary Domain: hakkan.is-a.dev</a></p>
    </div>
  `;

  const generateProjectBtn = document.getElementById('generateProject');
  const projectOutput = document.getElementById('projectOutput');
  const projectGenerator = async () => {
    generateProjectBtn.disabled = true;
    generateProjectBtn.innerHTML = '<span class="icon">🔄</span> ANALYZING MARKET TRENDS...';
    projectOutput.innerHTML = `<p style="color:var(--neon-accent)">Executing market analysis and trend synthesis...</p>`;

    try {
      const techStack = "MERN, NEXT, TypeScript, Tailwind, ShadCN, Git, GitHub, High-Performance Systems, Cyberpunk/Sci-Fi aesthetics.";
      const system = "You are a Chief Technology Officer (CTO) tasked with brainstorming the next market-disrupting product. Generate a project idea, its core market problem, and the proposed technical solution using the provided stack. The output must be in markdown format with a bold title, followed by two bullet points: **Problem** and **Solution**. Use Google Search grounding.";
      const query = `Based on current technological and market trends, generate one highly innovative project idea that leverages the following stack: ${techStack}.`;
      const { text, sources } = await fetchGemini(query, system, true);

      let outputHTML = `<div style="color:#fff; font-size: 0.95rem;">${text.replace(/\n/g, '<br>')}</div>`;

      if (sources.length > 0) {
        outputHTML += `<p style="margin-top:10px; font-size: 0.8rem; color: var(--muted-color);">**GROUNDING SOURCES:**</p>`;
        sources.forEach(source => {
          outputHTML += `<p style="font-size: 0.75rem; color: var(--neon-primary); margin-left: 10px;">- <a href="${source.uri}" target="_blank" style="color: inherit; text-decoration: underline;">${source.title}</a></p>`;
        });
      }
      projectOutput.innerHTML = outputHTML;
      setConsole("New project idea synthesized and delivered.");
    } catch (error) {
      projectOutput.innerHTML = `<p style="color:#ff6666">// ERROR:</p> <p style="color:#ff6666">Project Generation Failed. ${error.message}</p>`;
      setConsole(`Project Generator Failed: ${error.message}`);
    } finally {
      generateProjectBtn.disabled = false;
      generateProjectBtn.innerHTML = '<span class="icon">💡</span> GENERATE NEXT PROJECT IDEA';
    }
  };

  generateProjectBtn.addEventListener('click', projectGenerator);
  gameEventListeners.push({el: generateProjectBtn, event: 'click', fn: projectGenerator});
}

function renderGamesHub(){
  cleanupGame();
  setActiveNav('/games');
  setConsole("Route: /arcade. Select executable...");

  const gameDescriptions = {
    'whack': 'Whack Profile: A whack-a-mole game targeting the profile image. Goal: 15 hits. Penalty: 7 misses for game over.',
    'memory': 'Memory Match: A game of concentration/pairs with 10 pairs of cards to match.',
    'pong': 'Profile Pong: A classic single-player Pong game where the paddle is moved horizontally to hit the profile image ball.',
    'typerace': 'Type Race: A typing speed and accuracy test for the quote: "CODE IS POETRY AND DESIGN IS THE RHYTHM. NEVER STOP LEARNING AND BUILDING."',
    'gridhacker': 'Grid Hacker (Simon Says): A pattern recall game where the player must repeat a sequence of 3x3 grid highlights.',
  };

  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">💻</span> ARCADE EXECUTABLES</h2>
    <p style="color:var(--muted-color)">Select a module to test system latency and input response.</p>
    <div class="game-controls">
      <button class="small" data-link="#/games/whack"><span class="icon">💣</span> WHACK PROFILE</button>
      <button class="small" data-link="#/games/memory"><span class="icon">🧠</span> MEMORY MATCH</button>
      <button class="small" data-link="#/games/pong"><span class="icon">🎾</span> PROFILE PONG</button>
      <button class="small" data-link="#/games/typerace"><span class="icon">⌨️</span> TYPE RACE</button>
      <button class="small" data-link="#/games/gridhacker"><span class="icon">🔒</span> GRID HACKER</button>
    </div>
    <div class="play-area" style="border: none; box-shadow: none; background: transparent; height: 300px;">
      <p style="color:var(--neon-accent); font-family: monospace; text-shadow: var(--neon-shadow-accent);">**STATUS**: AWAITING EXECUTION COMMAND...</p>
    </div>

    <div style="margin-top: 30px; border-top: 1px dashed var(--neon-accent)33; padding-top: 20px;">
      <h3 style="color:var(--neon-accent); font-family: sans-serif; font-size: 1.2rem; margin-bottom: 10px;"><span class="icon">🤖</span> TACTICAL AI SUPPORT</h3>
      <p style="color:var(--muted-color); margin-bottom: 10px;">Request a strategic analysis for any ARCADE executable.</p>
      <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap;">
        <select id="gameSelector" class="small" style="background: var(--bg-dark); color: var(--neon-primary);">
          <option value="whack">WHACK PROFILE</option>
          <option value="memory">MEMORY MATCH</option>
          <option value="pong">PROFILE PONG</option>
          <option value="typerace">TYPE RACE</option>
          <option value="gridhacker">GRID HACKER</option>
        </select>
        <button class="btn primary" id="generateStrategy" style="padding: 8px 15px; border-radius: 6px;"><span class="icon">♟️</span> GENERATE STRATEGY</button>
      </div>
      <div id="strategyOutput" style="margin-top: 15px; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; border: 1px solid var(--neon-accent)55; min-height: 50px; color: var(--neon-primary); font-family: monospace; font-size: 0.9rem;">
        <p style="color:var(--muted-color)">Awaiting strategic analysis...</p>
      </div>
    </div>
  `;
  pageContent.querySelectorAll('button[data-link]').forEach(b=>{
    const clickHandler = ()=>{ location.hash = b.dataset.link; };
    b.addEventListener('click', clickHandler);
    gameEventListeners.push({el: b, event: 'click', fn: clickHandler});
  });

  const generateStrategyBtn = document.getElementById('generateStrategy');
  const gameSelector = document.getElementById('gameSelector');
  const strategyOutput = document.getElementById('strategyOutput');

  const strategyGenerator = async () => {
    const selectedGame = gameSelector.value;
    const gameInfo = gameInfoMap[selectedGame];

    generateStrategyBtn.disabled = true;
    generateStrategyBtn.innerHTML = '<span class="icon">🔄</span> CALCULATING...';
    strategyOutput.innerHTML = `<p style="color:var(--neon-accent)">Executing tactical analysis for ${selectedGame.toUpperCase()}...</p>`;

    try {
      const system = "You are a Tactical Gaming AI. Your task is to analyze the provided game description and generate a highly effective, concise strategy. The output must be exactly three (3) critical, numbered tactical points. Do not include any introductory or concluding sentences.";
      const query = `Generate a strategy for this game: ${gameInfo}.`;
      const { text } = await fetchGemini(query, system, false);
      strategyOutput.innerHTML = `<p style="color:var(--neon-primary)">**TACTICAL REPORT: ${selectedGame.toUpperCase()}**</p> <p>${text.replace(/\n/g, '<br>')}</p>`;
      setConsole(`Tactical analysis complete for ${selectedGame}.`);
    } catch (error) {
      strategyOutput.innerHTML = `<p style="color:#ff6666">// ERROR:</span> Failed to generate strategy. Try again.</p>`;
      setConsole(`Strategy Generator Failed: ${error.message}`);
    } finally {
      generateStrategyBtn.disabled = false;
      generateStrategyBtn.innerHTML = '<span class="icon">♟️</span> GENERATE STRATEGY';
    }
  };

  generateStrategyBtn.addEventListener('click', strategyGenerator);
  gameEventListeners.push({el: generateStrategyBtn, event: 'click', fn: strategyGenerator});
}

// --- Game Logic: Whack Profile ---
function renderWhack(){
  cleanupGame();
  setActiveNav('/games/whack');
  let score = 0; let misses = 0; let running = true;
  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">💣</span> WHACK PROFILE</h2>
    <p style="color:var(--muted-color)">Target: 15 Hits. Avoid the empty holes. **Misses**: <span id="whackMisses" style="color:#ff6666;">0</span></p>
    <div id="whackArea" class="play-area">
      <div id="whackGrid" class="whack-grid"></div>
    </div>
    <div class="game-controls">
      <button class="small active" id="stopWhack"><span class="icon">⏸️</span> PAUSE</button>
      <span id="whackScore" style="color:var(--neon-primary); font-weight:700;">SCORE: 0</span>
    </div>
  `;
  const grid = document.getElementById('whackGrid');
  const scoreEl = document.getElementById('whackScore');
  const missesEl = document.getElementById('whackMisses');
  for(let i=0;i<9;i++){ const hole = document.createElement('div'); hole.className='whack-hole'; hole.dataset.id = i; grid.appendChild(hole); }
  const holes = Array.from(grid.children);

  const moleUp = (hole) => {
    const img = document.createElement('img');
    img.src = 'profile.jpg';
    img.className = 'mole-img mole-up';
    hole.appendChild(img);
    hole.dataset.hasMole = 'true';
    setTimeout(() => { if (hole.contains(img)) moleDown(img); }, 1000);
  };

  const moleDown = (img) => {
    const hole = img.parentElement;
    if (!hole) return;
    delete hole.dataset.hasMole;
    img.classList.remove('mole-up');
    img.addEventListener('transitionend', () => img.remove(), { once: true });
  };

  const hitHandler = (e) => {
    const hole = e.currentTarget;
    if (hole.dataset.hasMole) {
      score++; scoreEl.textContent = `SCORE: ${score}`;
      setConsole(`HIT +1! Current: ${score}`);
      spawnBurst(hole);
      moleDown(hole.querySelector('.mole-img'));
      if(score >= 15) gameOver('Game Over: Target 15 reached. System unlocked.');
    } else {
      misses++; missesEl.textContent = misses;
      setConsole(`MISS -1! Misclicks: ${misses}`);
      hole.style.boxShadow = `0 0 15px #ff0000aa inset`;
      setTimeout(()=> hole.style.boxShadow = `0 0 10px var(--neon-accent)55 inset`, 150);
      if(misses >= 7) gameOver('Game Over: Too many misclicks. System locked.');
    }
  };

  holes.forEach(hole => {
    hole.addEventListener('click', hitHandler);
    gameEventListeners.push({el: hole, event: 'click', fn: hitHandler});
  });

  const spawnMole = () => {
    if (!running) return;
    const availableHoles = holes.filter(h => !h.dataset.hasMole);
    if (availableHoles.length > 0) {
      const hole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
      moleUp(hole);
    }
  };

  const startWhack = () => {
    running = true;
    activeGameInterval = setInterval(spawnMole, 700);
    document.getElementById('stopWhack').textContent = 'PAUSE';
    document.getElementById('stopWhack').classList.add('active');
    setConsole('Whack game running...');
  };

  const gameOver = (msg) => {
    clearInterval(activeGameInterval); activeGameInterval = null; running = false;
    setConsole(msg);
    document.getElementById('stopWhack').textContent = 'RESTART';
    document.getElementById('stopWhack').classList.remove('active');
  };

  document.getElementById('stopWhack').addEventListener('click', ()=>{
    if (activeGameInterval) { gameOver('Game Paused.'); }
    else if (!running && score < 15 && misses < 7) { startWhack(); }
    else { score = 0; misses = 0; renderWhack(); } // Restart
  });
  startWhack();
}

// --- Game Logic: Memory Match ---
function renderMemory(){
  cleanupGame();
  setActiveNav('/games/memory');
  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">🧠</span> MEMORY MATCH</h2>
    <p style="color:var(--muted-color)">Match **10 Pairs**. High cognitive load test. Pairs Found: <span id="memPairs" style="color:var(--neon-primary)">0/10</span></p>
    <div id="memArea" class="play-area" style="height: auto; padding: 20px;">
      <div id="memGrid" class="mem-grid"></div>
    </div>
    <div class="game-controls">
      <button class="small" id="restartMemory"><span class="icon">🔄</span> RESTART</button>
    </div>
  `;
  const grid = document.getElementById('memGrid');
  const pairsEl = document.getElementById('memPairs');
  const symbols=['#','@','&','*','^','?','!','~','<','>'];
  let pool = symbols.slice(0, 9).concat(symbols.slice(0, 9));
  pool.push('PROFILE', 'PROFILE'); 

  let firstCard=null, lockBoard=false, pairs=0;

  function createCard(val){
    const card = document.createElement('div'); card.className = 'mem-card'; card.dataset.value = val;
    const content = document.createElement('div'); content.className = 'mem-content'; content.textContent = '🔎';
    const back = document.createElement('div'); back.className = 'mem-back';
    if(val === 'PROFILE'){
      const img=document.createElement('img'); img.src='profile.jpg'; img.alt='Profile'; back.appendChild(img);
    } else { back.textContent = val; }
    card.appendChild(content); card.appendChild(back);
    return card;
  }

  const flipCard = (card)=>{
    if(lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    if(!firstCard){ firstCard=card; setConsole(`Flipped: ${card.dataset.value}`); return; }
    lockBoard = true;
    checkForMatch(card);
  };

  const checkForMatch = (secondCard)=>{
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;
    isMatch ? disableCards(secondCard) : unflipCards(secondCard);
  };

  const disableCards = (secondCard)=>{
    pairs++; pairsEl.textContent = `${pairs}/10`;
    firstCard.classList.add('matched'); secondCard.classList.add('matched');
    setConsole(`MATCH FOUND! Total pairs: ${pairs}`);
    spawnBurst(firstCard);
    if(pairs >= 10){ setConsole('System Unlocked: Memory Complete!'); }
    resetBoard();
  };

  const unflipCards = (secondCard)=>{
    setTimeout(()=>{
      [firstCard, secondCard].forEach(card=>card.classList.remove('flipped'));
      setConsole('NO MATCH. Resetting cards...');
      resetBoard();
    }, 1000);
  };

  const resetBoard = ()=>{ firstCard = null; lockBoard = false; };

  const initGame = () => {
    pairs = 0; pairsEl.textContent = '0/10'; grid.innerHTML = '';
    pool.sort(()=>Math.random()-0.5);
    pool.forEach(val => {
      const card = createCard(val);
      const clickHandler = ()=> flipCard(card);
      card.addEventListener('click', clickHandler);
      gameEventListeners.push({el: card, event: 'click', fn: clickHandler});
      grid.appendChild(card);
    });
    setConsole('Memory module loaded. Begin cognitive test...');
  };
  initGame();

  document.getElementById('restartMemory').addEventListener('click', initGame);
}

// --- Game Logic: Pong ---
function renderPong(){
  cleanupGame();
  setActiveNav('/games/pong');
  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">🎾</span> PROFILE PONG</h2>
    <p style="color:var(--muted-color)">Use pointer/touch to move the paddle. Keep the profile ball in play. Score: <span id="pongScoreEl" style="color:var(--neon-primary)">0</span></p>
    <div id="pongArea" class="play-area" style="cursor:none; height:450px;">
      <canvas id="pongCanvas" style="width:100%; height:100%; display:block;"></canvas>
    </div>
    <div class="game-controls">
      <button class="small" id="restartPong"><span class="icon">🔄</span> RESTART</button>
    </div>
  `;

  const area = document.getElementById('pongArea');
  const canvas = document.getElementById('pongCanvas');
  const c = canvas.getContext('2d');
  const scoreEl = document.getElementById('pongScoreEl');

  let score = 0; let gameRunning = true;
  const paddleW=100, paddleH=12; let paddleX=0;
  let ball={x:0,y:0,vx:4,vy:3,r:15};
  const img = new Image(); img.src='profile.jpg';

  const getCssVar = (name) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };
  const PADDLE_COLOR = getCssVar('--neon-accent');
  const BALL_COLOR_FALLBACK = getCssVar('--neon-primary');

  const resize = ()=>{
    const dpr = window.devicePixelRatio || 1;
    canvas.width = area.clientWidth * dpr;
    canvas.height = area.clientHeight * dpr;
    c.setTransform(dpr,0,0,dpr,0,0);
    ball.x = ball.x || area.clientWidth / 2;
    ball.y = ball.y || 60;
  };

  const draw = ()=>{
    if (!gameRunning) return;

    c.clearRect(0,0,canvas.width,canvas.height);
    const W = area.clientWidth, H = area.clientHeight;

    c.fillStyle=PADDLE_COLOR;
    const py = H - 30;
    c.fillRect(paddleX, py, paddleW, paddleH);

    ball.x += ball.vx; ball.y += ball.vy;

    if(ball.x - ball.r < 0 || ball.x + ball.r > W) ball.vx *= -1;
    if(ball.y - ball.r < 0) ball.vy *= -1;

    if(ball.y + ball.r > py && ball.y + ball.r < py + paddleH && ball.x > paddleX && ball.x < paddleX + paddleW){
      ball.vy *= -1.05; 
      score++; scoreEl.textContent = score;
      setConsole(`Bounce! Score: ${score}`);
      spawnPixelBurst(ball.x, ball.y, true);
      ball.y = py - ball.r - 1;
    }

    if(ball.y - ball.r > H){
      gameRunning = false; cancelAnimationFrame(activeGameRAF);
      setConsole(`PONG OVER! Final Score: ${score}. Click RESTART.`);
      return;
    }

    c.save(); c.beginPath(); c.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); c.closePath(); c.clip();
    if(img.complete) c.drawImage(img, ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2);
    else { c.fillStyle = BALL_COLOR_FALLBACK; c.fillRect(ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2); }
    c.restore();

    activeGameRAF = requestAnimationFrame(draw);
  };

  const pointerMoveHandler = (e)=>{
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    paddleX = Math.max(0, Math.min(area.clientWidth - paddleW, x - paddleW/2));
  };

  const initPong = () => {
    score = 0; scoreEl.textContent = '0';
    ball = {x: area.clientWidth/2, y: 60, vx: (Math.random() > 0.5 ? 4 : -4), vy: 3, r: 15};
    gameRunning = true;
    setConsole('Pong initialized. Move pointer to control paddle.');
    resize();
    activeGameRAF = requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize);
  gameEventListeners.push({el: window, event: 'resize', fn: resize});
  area.addEventListener('pointermove', pointerMoveHandler);
  gameEventListeners.push({el: area, event: 'pointermove', fn: pointerMoveHandler});
  document.getElementById('restartPong').addEventListener('click', initPong);

  initPong();
}

// --- Game Logic: Type Race ---
function renderTypeRace() {
  cleanupGame();
  setActiveNav('/games/typerace');

  const quote = "CODE IS POETRY AND DESIGN IS THE RHYTHM. NEVER STOP LEARNING AND BUILDING.";
  let index = 0; let startTime = 0; let errors = 0;

  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">⌨️</span> TYPE RACE</h2>
    <p style="color:var(--muted-color)">Replicate the code quote below. Test accuracy and speed. Press any key to activate.</p>
    <div id="typeArea" class="play-area" style="height: auto; padding: 20px; text-align: left; font-family: monospace; font-size: 1.1rem; color: #fff; line-height: 1.8; cursor: text;">
      <div id="quoteDisplay"></div>
    </div>
    <div class="game-controls">
      <button class="small" id="restartType"><span class="icon">🔄</span> RESTART</button>
      <span id="wpmDisplay" style="color:var(--neon-primary); font-weight:700;">WPM: 0</span>
      <span id="errorDisplay" style="color:var(--neon-accent); font-weight:700;">ACCURACY: 100%</span>
    </div>
  `;

  const displayEl = document.getElementById('quoteDisplay');
  const wpmEl = document.getElementById('wpmDisplay');
  const errorEl = document.getElementById('errorDisplay');
  let gameActive = false;

  const renderQuote = () => {
    displayEl.innerHTML = '';
    quote.split('').forEach((char, i) => {
      const span = document.createElement('span'); span.textContent = char;
      if (i < index) {
        span.style.color = 'var(--neon-primary)'; span.style.fontWeight = '700';
      } else if (i === index) {
        span.style.borderBottom = '3px solid var(--neon-accent)'; span.style.paddingBottom = '2px'; span.style.color = '#fff';
      } else {
        span.style.color = 'var(--muted-color)';
      }
      displayEl.appendChild(span);
    });
    const accuracy = index > 0 ? ((index - errors) / index) * 100 : 100;
    errorEl.textContent = `ACCURACY: ${accuracy.toFixed(0)}% (${errors} errors)`;
  };

  const handleKeydown = (e) => {
    if (e.key.length !== 1 && e.key !== 'Backspace') return;
    if (index >= quote.length) return;

    if (!gameActive && index === 0) {
      gameActive = true; startTime = new Date().getTime(); setConsole("Typing race started! GO!");
    }

    const expectedChar = quote[index];
    if (e.key === expectedChar) {
      index++;
      if (index === quote.length) {
        gameActive = false;
        const endTime = new Date().getTime();
        const timeInMinutes = (endTime - startTime) / 60000;
        const words = quote.split(' ').length;
        const wpm = Math.round(words / timeInMinutes);
        setConsole(`Race Complete! WPM: ${wpm}, ACCURACY: ${((index - errors) / index) * 100}%`);
        wpmEl.textContent = `WPM: ${wpm} (FINAL)`;
        spawnGlobalBurst();
      }
    } else if (e.key !== 'Backspace' && expectedChar) {
      errors++;
      setConsole(`ERROR! Expected: '${expectedChar}'`);
    } else if (e.key === 'Backspace' && index > 0) {
      index--;
      if (errors > 0) errors--; 
      setConsole('Backspace...');
    }

    if (gameActive && index > 0 && index < quote.length) {
      const currentTime = new Date().getTime();
      const elapsedSeconds = (currentTime - startTime) / 1000;
      const charactersTyped = index;
      const wpm = Math.round((charactersTyped / 5) / (elapsedSeconds / 60));
      wpmEl.textContent = `WPM: ${isNaN(wpm) ? 0 : wpm}`;
    }

    renderQuote();
    e.preventDefault();
  };

  const initGame = () => {
    index = 0; errors = 0; gameActive = false; startTime = 0;
    setConsole('Type Race module loaded. Press any key to begin...');
    renderQuote();
    wpmEl.textContent = 'WPM: 0';
  };

  document.getElementById('restartType').addEventListener('click', initGame);
  window.addEventListener('keydown', handleKeydown);
  gameEventListeners.push({el: window, event: 'keydown', fn: handleKeydown});
  initGame();
}

// --- Game Logic: Grid Hacker ---
function renderGridHacker() {
  cleanupGame();
  setActiveNav('/games/gridhacker');

  let sequence = []; let playerSequence = []; let level = 1; let score = 0; let active = false;

  pageContent.innerHTML = `
    <h2 class="title"><span class="icon">🔒</span> GRID HACKER (SIMON SAYS)</h2>
    <p style="color:var(--muted-color)">Repeat the glowing sequence. **LEVEL: <span id="hackerLevel" style="color:var(--neon-primary)">1</span>** | **SCORE: <span id="hackerScore" style="color:var(--neon-accent)">0</span>**</p>
    <div id="hackerArea" class="play-area" style="height: 350px; padding: 20px;">
      <div id="hackerGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 300px; height: 300px;">
      </div>
    </div>
    <div class="game-controls">
      <button class="small" id="hackerStart"><span class="icon">▶</span> START</button>
      <button class="small" id="hackerRestart"><span class="icon">🔄</span> RESTART</button>
    </div>
  `;

  const grid = document.getElementById('hackerGrid');
  const levelEl = document.getElementById('hackerLevel');
  const scoreEl = document.getElementById('hackerScore');
  const startBtn = document.getElementById('hackerStart');
  const restartBtn = document.getElementById('hackerRestart');

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'hacker-cell'; 
    cell.dataset.id = i;
    cell.style.height = '100%';
    grid.appendChild(cell);
  }
  const cells = Array.from(grid.children);

  const highlightCell = (cell, duration = 300) => {
    cell.style.opacity = 1;
    cell.style.boxShadow = `var(--neon-shadow-accent), var(--neon-shadow-primary)`;
    spawnBurst(cell);
    setTimeout(() => {
      cell.style.opacity = 0.5;
      cell.style.boxShadow = 'none';
    }, duration);
  };

  const playSequence = async () => {
    active = false;
    startBtn.disabled = true;
    setConsole(`Playing sequence for level ${level}...`);
    await new Promise(r => setTimeout(r, 1000));

    for (const id of sequence) {
      highlightCell(cells[id]);
      await new Promise(r => setTimeout(r, 600 - (level * 10)));
    }

    active = true;
    setConsole("Your turn. Repeat the pattern.");
    startBtn.textContent = 'REPEAT';
    startBtn.disabled = false;
  };

  const generateSequence = () => {
    sequence.push(Math.floor(Math.random() * 9));
    playerSequence = [];
    levelEl.textContent = level;
    playSequence();
  };

  const cellClickHandler = (e) => {
    if (!active) return;
    const cell = e.currentTarget;
    const id = parseInt(cell.dataset.id);
    playerSequence.push(id);
    highlightCell(cell, 150);

    const currentStep = playerSequence.length - 1;
    if (playerSequence[currentStep] !== sequence[currentStep]) {
      active = false;
      setConsole(`HACK FAILED! Sequence break at step ${currentStep + 1}. Final Score: ${score}`);
      cell.style.backgroundColor = '#ff0000';
      setTimeout(() => cell.style.backgroundColor = 'transparent', 300); 
      startBtn.textContent = 'GAME OVER';
      startBtn.disabled = true;
    } else if (playerSequence.length === sequence.length) {
      active = false;
      score += level * 10;
      level++;
      scoreEl.textContent = score;
      setConsole("Sequence accepted. Proceeding to next level...");
      setTimeout(generateSequence, 1500);
    }
  };

  cells.forEach(cell => {
    cell.addEventListener('click', cellClickHandler);
    gameEventListeners.push({el: cell, event: 'click', fn: cellClickHandler});
    cell.addEventListener('mousedown', () => cell.style.opacity = 0.8);
    cell.addEventListener('mouseup', () => cell.style.opacity = active ? 0.5 : 0.8);
  });


  const initGame = () => {
    sequence = []; playerSequence = []; level = 1; score = 0; active = false;
    levelEl.textContent = 1; scoreEl.textContent = 0;
    startBtn.textContent = 'START';
    startBtn.disabled = false;
    cells.forEach(cell => {
      cell.style.backgroundColor = 'transparent';
      cell.style.opacity = 0.5;
    });
    setConsole('Grid Hacker module loaded. Ready for pattern analysis.');
  };
  initGame();

  startBtn.addEventListener('click', () => {
    if (startBtn.textContent === 'GAME OVER') return;
    if (startBtn.textContent === 'START') {
      sequence.push(Math.floor(Math.random() * 9));
      playSequence();
    } else if (startBtn.textContent === 'REPEAT' && !active) {
      playSequence();
    }
  });

  restartBtn.addEventListener('click', initGame);
  gameEventListeners.push({el: restartBtn, event: 'click', fn: initGame});
}


// --- Helpers: Particles & Bursts ---
const globalCanvas = document.createElement('canvas');
const panel = document.getElementById('page');
panel.appendChild(globalCanvas);
const gctx = globalCanvas.getContext('2d');

globalCanvas.style.position='absolute'; globalCanvas.style.inset='0'; globalCanvas.style.pointerEvents='none'; globalCanvas.style.zIndex='999';

function resizeGlobal(){
  const dpr = window.devicePixelRatio || 1;
  globalCanvas.width = panel.clientWidth * dpr;
  globalCanvas.height = panel.clientHeight * dpr;
  gctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resizeGlobal);
resizeGlobal();

let gparts=[];
function spawnBurst(el){
  const rect = el.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const x = rect.left + rect.width/2 - panelRect.left;
  const y = rect.top + rect.height/2 - panelRect.top;
  spawnPixels(x,y,28);
}
function spawnGlobalBurst(){
  const w=panel.clientWidth;
  const h=panel.clientHeight;
  spawnPixels(w/2,h/2,120);
}
function spawnPixelBurst(x, y, isPong=false){
  const n = isPong ? 15 : 30;
  spawnPixels(x, y, n);
}
function spawnPixels(x,y,n=30){
  const cols=['#00ffc8', '#ff00ff', '#ffffff', '#ff6666'];
  for(let i=0;i<n;i++){
    gparts.push({
      x, y,
      vx: (Math.random()-0.5)*8,
      vy: (Math.random()-2.8)*6,
      size: 3+Math.random()*6,
      color: cols[Math.floor(Math.random()*cols.length)],
      life: 60+Math.random()*80
    });
  }
}
function tickGlobal(){
  gctx.clearRect(0,0,globalCanvas.width,globalCanvas.height);
  for(let i=gparts.length-1;i>=0;i--){
    const p=gparts[i];
    p.vy += 0.22;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if(p.life<=0){ gparts.splice(i,1); continue; }

    gctx.globalAlpha = Math.max(0.06, p.life/100);
    gctx.fillStyle = p.color;
    gctx.fillRect(p.x, p.y, p.size, p.size);
  }
  gctx.globalAlpha = 1;
  activeGameRAF = requestAnimationFrame(tickGlobal);
}
requestAnimationFrame(tickGlobal);

// --- Router and Event Wiring ---
function router(){
  cleanupGame();
  const hash = location.hash.replace('#','') || '/';
  switch(hash){
    case '/':
    case '/profile': renderProfile(); break;
    case '/games': renderGamesHub(); break;
    case '/games/whack': renderWhack(); break;
    case '/games/memory': renderMemory(); break;
    case '/games/pong': renderPong(); break;
    case '/games/typerace': renderTypeRace(); break;
    case '/games/gridhacker': renderGridHacker(); break;
    case '/portfolio': renderPortfolio(); break;
    default: renderProfile();
  }
  setActiveNav(hash);
}

document.getElementById('navProfile')?.addEventListener('click', ()=> location.hash = '#/profile');
document.getElementById('navGames')?.addEventListener('click', ()=> location.hash = '#/games');
document.getElementById('navPortfolio')?.addEventListener('click', ()=> location.hash = '#/portfolio');
document.getElementById('openGames').addEventListener('click', ()=> location.hash = '#/games');
document.getElementById('navProfileMobile')?.addEventListener('click', ()=> location.hash = '#/profile');
document.getElementById('navGamesMobile')?.addEventListener('click', ()=> location.hash = '#/games');
document.getElementById('navPortfolioMobile')?.addEventListener('click', ()=> location.hash = '#/portfolio');

window.addEventListener('hashchange', router);

if(!location.hash) location.hash = '#/profile'; else router();