import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { empresa, telefone, email } = body;

    if (!empresa || !telefone || !email) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'leads.csv');
    const now = new Date();
    // Formata a data/hora para o fuso local do evento
    const dataHora = now.toLocaleString('pt-BR');

    // Remove vírgulas dos campos para evitar quebra do CSV
    const safeEmpresa = empresa.replace(/,/g, '');
    const safeTelefone = telefone.replace(/,/g, '');
    const safeEmail = email.replace(/,/g, '');

    const csvLine = `${dataHora},${safeEmpresa},${safeTelefone},${safeEmail}\n`;

    try {
      // Tenta ler o arquivo para ver se existe
      await fs.access(filePath);
      // Se existir, apenas anexa
      await fs.appendFile(filePath, csvLine, 'utf8');
    } catch (error) {
      // Se não existir, cria com cabeçalho
      const header = 'Data/Hora,Empresa,Telefone,Email\n';
      await fs.writeFile(filePath, header + csvLine, 'utf8');
    }

    // Log para o terminal do notebook
    console.log('\n==============================');
    console.log('✅ NOVO LEAD CAPTURADO:');
    console.log(`Data/Hora : ${dataHora}`);
    console.log(`Empresa   : ${empresa}`);
    console.log(`Telefone  : ${telefone}`);
    console.log(`E-mail    : ${email}`);
    console.log('==============================\n');

    return NextResponse.json({ message: 'Lead registrado com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar dados' },
      { status: 500 }
    );
  }
}
