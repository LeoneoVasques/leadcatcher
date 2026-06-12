const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tunnelFile = path.join(__dirname, 'tunnel.txt');

// Inicializa o arquivo vazio
fs.writeFileSync(tunnelFile, '', 'utf8');

function startTunnel() {
  console.log('\n🔄 Iniciando/Reiniciando o Túnel Seguro...');

  const ssh = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=60',
    '-R', '80:localhost:3000',
    'nokey@localhost.run'
  ]);

  const parseOutput = (data) => {
    const output = data.toString();
    process.stdout.write(output);

    const match = output.match(/https:\/\/[a-z0-9-]+\.lhr\.life/);
    if (match) {
      const activeUrl = match[0];
      console.log('\n==============================================');
      console.log('✅ NOVO LINK DETECTADO E SALVO:');
      console.log('👉 ' + activeUrl);
      console.log('==============================================\n');
      
      fs.writeFileSync(tunnelFile, activeUrl, 'utf8');
    }
  };

  ssh.stdout.on('data', parseOutput);
  ssh.stderr.on('data', parseOutput);

  ssh.on('close', (code) => {
    console.log(`\n❌ O túnel caiu (código ${code}). Reiniciando automaticamente em 3 segundos...`);
    fs.writeFileSync(tunnelFile, '', 'utf8'); // Limpa o arquivo para o front-end mostrar a tela de "aguardando"
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
