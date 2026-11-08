import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.resolve('public', 'screens');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Iniciando captura das 5 telas em modo escuro iPhone (390x844)...');
  
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. Abrir app e configurar dados no localStorage
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('ab_fitness_theme_mode_v1', 'dark');
    localStorage.setItem('ab_fitness_guest_mode_v1', 'true');
    localStorage.setItem('ab_fitness_user_profile_v1', JSON.stringify({ onboardingDone: true, name: 'Atleta AB', goal: 'hipertrofia' }));
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // Aguardar o Splash Screen desaparecer (3.5 segundos)
  console.log('⏳ Aguardando splash screen sumir...');
  await new Promise(r => setTimeout(r, 3800));

  // Garantir que a classe dark está ativa
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    // Clicar em "Seg" no cronograma semanal para carregar os exercícios de segunda
    const segBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Seg'));
    if (segBtn) segBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // TELA 1: DASHBOARD
  console.log('📸 Capturando Tela 1: Dashboard Dark Mode...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '1-dashboard.png') });

  // TELA 2: BIOMECÂNICA (abrir o modal técnico)
  console.log('📸 Capturando Tela 2: Biomecânica Dark Mode...');
  // Rolar para baixo até os exercícios da segunda-feira
  await page.evaluate(() => {
    window.scrollTo({ top: 500, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  // Clicar no primeiro exercício listado
  await page.evaluate(() => {
    const exerciseCards = Array.from(document.querySelectorAll('div[class*="cursor-pointer"]')).filter(el => {
      const h5 = el.querySelector('h5');
      return h5 && (h5.textContent.includes('Supino') || h5.textContent.includes('Agachamento') || h5.textContent.includes('Desenvolvimento') || h5.textContent.includes('Puxada'));
    });
    if (exerciseCards.length > 0) {
      exerciseCards[0].click();
    } else {
      // Fallback: qualquer div com h5 dentro da lista de exercícios
      const anyH5 = document.querySelector('h5');
      if (anyH5 && anyH5.closest('div[class*="cursor-pointer"]')) {
        anyH5.closest('div[class*="cursor-pointer"]').click();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '2-biomechanics.png') });

  // Fechar o modal de exercício
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Fechar"]') || 
                     document.querySelector('button svg.lucide-x')?.closest('button') ||
                     Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // TELA 3: TREINO ATIVO
  console.log('📸 Capturando Tela 3: Treino Ativo...');
  await page.evaluate(() => {
    window.scrollTo({ top: 800, behavior: 'instant' });
    const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Iniciar Treino'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Marcar a primeira série como concluída para disparar o timer e o check verde
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    // Encontrar botão de check da primeira série
    const checkBtn = document.querySelector('button[title*="série"]') || 
                     document.querySelector('button[title*="descanso"]') ||
                     Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-check'));
    if (checkBtn) checkBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '3-workout.png') });

  // Recarregar dashboard
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3800));
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  // TELA 4: RUNNING CLUB
  console.log('📸 Capturando Tela 4: Running Club...');
  await page.evaluate(() => {
    const corridaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Corrida'));
    if (corridaBtn) corridaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '4-running.png') });

  // TELA 5: MEDALHAS & CONQUISTAS
  console.log('📸 Capturando Tela 5: Medalhas & Conquistas...');
  await page.evaluate(() => {
    const histBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Histórico'));
    if (histBtn) histBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const medalhasBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Medalhas'));
    if (medalhasBtn) medalhasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '5-badges.png') });

  await browser.close();
  console.log('✅ SUCESSO: Todas as 5 telas salvas em public/screens/ em modo escuro iPhone!');
}

run().catch(err => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
