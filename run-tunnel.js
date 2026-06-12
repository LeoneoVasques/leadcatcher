const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tunnelFile = path.join(__dirname, 'tunnel.txt');

// Inicializa o arquivo vazio
fs.writeFileSync(tunnelFile, '', 'utf8');

console.log('🔄 Iniciando Gerenciador de Túnel Inteligente...');

// O comando SSH que conecta no localhost.run
const ssh = spawn('ssh', [
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=60', // Evita que caia por inatividade
  '-R', '80:localhost:3000',
  'nokey@localhost.run'
]);

// Função para buscar a URL nos logs
const parseOutput = (data) => {
  const output = data.toString();
  process.stdout.write(output); // Repassa o log para a tela do usuário

  // Procura por algo parecido com https://qualquercoisa.lhr.life
  const match = output.match(/https:\/\/[a-z0-9-]+\.lhr\.life/);
  
  if (match) {
    const activeUrl = match[0];
    console.log('\n==============================================');
    console.log('✅ NOVO LINK DETECTADO E SALVO:');
    console.log('👉 ' + activeUrl);
    console.log('==============================================\n');
    
    // Salva o link no arquivo txt para a API do Next.js poder ler
    fs.writeFileSync(tunnelFile, activeUrl, 'utf8');
  }
};

ssh.stdout.on('data', parseOutput);
ssh.stderr.on('data', parseOutput);

ssh.on('close', (code) => {
  console.log(`\n❌ O túnel fechou (código ${code}). Reinicie este script para reconectar.`);
});
