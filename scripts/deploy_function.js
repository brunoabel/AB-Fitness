import fs from 'fs';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'tegdtjmglvrvgerrtivx';

async function main() {
  console.log('1. Verificando funções existentes no projeto...');
  const listRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const list = await listRes.json();
  console.log('Funções atuais:', list);

  const code = fs.readFileSync('supabase/functions/ab-coach/index.ts', 'utf8');
  console.log(`2. Código lido de supabase/functions/ab-coach/index.ts (${code.length} bytes)`);

  const existing = Array.isArray(list) && list.find(f => f.slug === 'ab-coach');

  if (existing) {
    console.log('3. Atualizando função existente ab-coach...');
    const updateRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/ab-coach`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'ab-coach',
        body: code,
        verify_jwt: true
      })
    });
    const updateData = await updateRes.json().catch(() => updateRes.statusText);
    console.log('Resultado do update:', updateRes.status, updateData);
  } else {
    console.log('3. Criando nova função ab-coach...');
    const createRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slug: 'ab-coach',
        name: 'ab-coach',
        body: code,
        verify_jwt: true
      })
    });
    const createData = await createRes.json().catch(() => createRes.statusText);
    console.log('Resultado da criação:', createRes.status, createData);
  }
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
