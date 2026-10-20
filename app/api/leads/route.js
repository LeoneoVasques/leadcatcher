import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { empresa, telefone, email } = body;

    if (!empresa?.trim() || !telefone?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const cleanEmpresa = empresa.trim();
    const cleanTelefone = telefone.trim();
    const cleanEmail = email.trim();

    // Data e Hora no fuso de Brasília
    const now = new Date();
    const dataHora = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // 1. BACKUP LOCAL: Salva no leads.csv (segurança para nunca perder dados)
    const filePath = path.join(process.cwd(), 'leads.csv');
    const safeEmpresa = cleanEmpresa.replace(/,/g, ' ');
    const safeTelefone = cleanTelefone.replace(/,/g, ' ');
    const safeEmail = cleanEmail.replace(/,/g, ' ');
    const csvLine = `${dataHora},${safeEmpresa},${safeTelefone},${safeEmail}\n`;

    try {
      await fs.access(filePath);
      await fs.appendFile(filePath, csvLine, 'utf8');
    } catch {
      const header = 'Data/Hora,Empresa,Telefone,Email\n';
      await fs.writeFile(filePath, header + csvLine, 'utf8');
    }

    // 2. GOOGLE SHEETS: Envia para o Webhook do Google Apps Script
    const googleWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    let googleSyncStatus = 'skipped';

    if (googleWebhookUrl && googleWebhookUrl.trim()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const googleRes = await fetch(googleWebhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataHora,
            empresa: cleanEmpresa,
            telefone: cleanTelefone,
            email: cleanEmail,
          }),
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeoutId);

        if (googleRes.ok) {
          googleSyncStatus = 'success';
          console.log('📊 [Google Sheets] Lead gravado na planilha com sucesso!');
        } else {
          googleSyncStatus = 'failed_http_' + googleRes.status;
          console.warn(`⚠️ [Google Sheets] Resposta não-200: ${googleRes.status}`);
        }
      } catch (gErr) {
        googleSyncStatus = 'error_' + gErr.name;
        console.error('⚠️ [Google Sheets] Erro ao sincronizar com a planilha:', gErr.message);
      }
    } else {
      console.log('ℹ️ [Aviso] GOOGLE_SHEET_WEBHOOK_URL não configurado em .env.local. Dados salvos apenas no CSV local.');
    }

    // Log legível no terminal
    console.log('\n==============================');
    console.log('✅ NOVO LEAD CAPTURADO:');
    console.log(`Data/Hora      : ${dataHora}`);
    console.log(`Empresa/Nome   : ${cleanEmpresa}`);
    console.log(`Telefone       : ${cleanTelefone}`);
    console.log(`E-mail         : ${cleanEmail}`);
    console.log(`Google Sheets  : ${googleSyncStatus}`);
    console.log(`CSV Backup     : Salvo`);
    console.log('==============================\n');

    return NextResponse.json(
      { 
        message: 'Lead registrado com sucesso!',
        googleSynced: googleSyncStatus === 'success'
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar dados. Tente novamente.' },
      { status: 500 }
    );
  }
}
