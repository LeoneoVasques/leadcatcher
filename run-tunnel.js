const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const tunnelFile = path.join(__dirname, 'tunnel.txt');
const redirectFile = path.join(__dirname, '..', 'leadcatcher-redirect', 'index.html');
const binPath = path.join(__dirname, 'cloudflared.exe');

// Inicializa o arquivo vazio
fs.writeFileSync(tunnelFile, '', 'utf8');

let activeProcess = null;
let healthCheckTimer = null;
let consecutiveFailures = 0;
let isReconnecting = false;

function updateRedirectFile(activeUrl) {
  if (fs.existsSync(redirectFile)) {
    try {
      let content = fs.readFileSync(redirectFile, 'utf8');
      // Regex que casa com lhr.life ou trycloudflare.com
      const regex = /https:\/\/[a-z0-9-]+\.(?:lhr\.life|trycloudflare\.com)/g;
      if (regex.test(content)) {
        content = content.replace(regex, activeUrl);
        fs.writeFileSync(redirectFile, content, 'utf8');
        console.log(`📝 Arquivo de redirecionamento index.html atualizado!`);
      } else {
        console.log(`⚠️ Link não encontrado para substituição no index.html.`);
      }
    } catch (err) {
      console.error(`❌ Erro ao atualizar o arquivo de redirecionamento:`, err.message);
    }
  }
}

function startHealthCheck(url) {
  if (healthCheckTimer) clearInterval(healthCheckTimer);
  consecutiveFailures = 0;
  
  healthCheckTimer = setInterval(() => {
    if (!url || isReconnecting) return;
    
    const req = https.get(url, { timeout: 15000 }, (res) => {
      // Qualquer resposta HTTP (mesmo 200, 302, 404) significa que a conexão está ativa
      consecutiveFailures = 0;
    });
    
    req.on('error', (err) => {
      if (isReconnecting) return;
      consecutiveFailures++;
      console.log(`⚠️ [Healthcheck] Falha detectada (${consecutiveFailures}/3): ${err.message}`);
      if (consecutiveFailures >= 3) {
        triggerReconnect();
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      if (isReconnecting) return;
      consecutiveFailures++;
      console.log(`⚠️ [Healthcheck] Timeout detectado (${consecutiveFailures}/3)`);
      if (consecutiveFailures >= 3) {
        triggerReconnect();
      }
    });
  }, 20000);
}

function triggerReconnect() {
  if (isReconnecting) return;
  isReconnecting = true;
  console.log(`\n🔴 [Healthcheck] O túnel está inativo. Forçando reinicialização do processo...`);
  if (activeProcess) {
    activeProcess.kill('SIGTERM');
    setTimeout(() => {
      if (activeProcess) {
        activeProcess.kill('SIGKILL');
      }
    }, 2000);
  }
}

function startTunnel() {
  isReconnecting = false;
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = null;
  }

  // Verifica se o cloudflared.exe está disponível no diretório
  const useCloudflare = fs.existsSync(binPath);

  if (useCloudflare) {
    console.log('\n🔄 Iniciando Túnel Seguro via Cloudflare...');
    // Exibe via trycloudflare.com (excelente reputação, compatível com 5G e iPhone)
    activeProcess = spawn(binPath, ['tunnel', '--url', 'http://127.0.0.1:3000']);
  } else {
    console.log('\n🔄 Iniciando Túnel Seguro via Localhost.run (SSH Fallback)...');
    activeProcess = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=15',
      '-o', 'ServerAliveCountMax=3',
      '-o', 'ExitOnForwardFailure=yes',
      '-R', '80:127.0.0.1:3000',
      'nokey@localhost.run'
    ]);
  }

  const parseOutput = (data) => {
    const output = data.toString();
    process.stdout.write(output);

    // Regex para extrair URL da Cloudflare ou do localhost.run
    const cfMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    const lhrMatch = output.match(/https:\/\/[a-z0-9-]+\.lhr\.life/);
    const match = cfMatch || lhrMatch;

    if (match) {
      const activeUrl = match[0];
      console.log('\n==============================================');
      console.log('✅ NOVO LINK DETECTADO E SALVO:');
      console.log('👉 ' + activeUrl);
      console.log('==============================================\n');
      
      fs.writeFileSync(tunnelFile, activeUrl, 'utf8');
      updateRedirectFile(activeUrl);
      startHealthCheck(activeUrl);
    }
  };

  activeProcess.stdout.on('data', parseOutput);
  activeProcess.stderr.on('data', parseOutput);

  activeProcess.on('close', (code) => {
    console.log(`\n❌ O túnel caiu (código ${code}). Reiniciando automaticamente em 3 segundos...`);
    fs.writeFileSync(tunnelFile, '', 'utf8'); // Limpa o arquivo para o front-end
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
      healthCheckTimer = null;
    }
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
