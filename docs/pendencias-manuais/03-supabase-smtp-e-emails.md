# 03 — Supabase: Custom SMTP e Templates de E-mail (PT-PT)

- **Email Templates:** https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/auth/templates
- *(O Custom SMTP fica na mesma secção: Authentication > Emails / SMTP Settings)*

---

## 1. Configurar o Custom SMTP (recomendado: Resend)

O envio embutido do Supabase tem limite muito baixo (3–4 e-mails/hora) e pode falhar/cair em spam para utilizadores externos. O remetente tem de pertencer ao teu domínio (`abfitness.app`), não pode ser `@gmail.com`.

### No Resend (ou Brevo / Postmark):
1. Vai a **Domains > Add Domain** e adiciona `abfitness.app`.
2. No painel DNS do teu domínio (Vercel / Cloudflare / registrador), adiciona os registos **SPF (`TXT`)**, **DKIM (`TXT`/`CNAME`)** e **DMARC (`TXT`)** até ficar **Verified**.
3. Cria uma **API Key** com permissão de envio (*Sending access*) e copia a chave (`re_...`).

### No Supabase (SMTP Settings):
1. Liga **Enable Custom SMTP**.
2. Preenche:
   - **Sender email:** `no-reply@abfitness.app`
   - **Sender name:** `AB Fitness`
   - **Host:** `smtp.resend.com` *(se usares Resend)*
   - **Port number:** `465` *(SSL)* ou `587` *(STARTTLS)*
   - **Username:** `resend` *(no Resend é literalmente `resend`)*
   - **Password:** cola a API Key (`re_...`)
   - **Minimum interval per user:** `60` *(corresponde ao cooldown de 60s já existente na app)*
3. Clica em **Save changes**.

---

## 2. Colar os 3 Templates HTML em PT-PT

Em **Authentication > Email Templates**, cola cada bloco no respetivo separador e clica em **Save** em cada um (mantendo `{{ .ConfirmationURL }}` intacto).

### A) Confirm signup
- **Subject heading:** `Confirma a tua conta na AB Fitness`

```html
<div style="margin:0;padding:32px 16px;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background-color:#0A0A0A;border:1px solid #1D3557;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8EA8C8;">AB FITNESS</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#FFFFFF;">Confirma o teu e-mail</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#B8C0CC;">
          Estás a um passo de entrar na tua conta. Clica no botão abaixo para validar o teu endereço e começar os treinos.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 26px;background-color:#FFFFFF;color:#000000;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">
          Confirmar conta
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
          Se não criaste uma conta na AB Fitness, podes ignorar este e-mail com segurança.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #161B24;font-size:11px;color:#6B7280;">
        AB Fitness · ABEX Studio · <a href="https://www.abfitness.app" style="color:#9CA3AF;text-decoration:none;">www.abfitness.app</a>
      </td>
    </tr>
  </table>
</div>
```

### B) Reset password
- **Subject heading:** `Repor palavra-passe — AB Fitness`

```html
<div style="margin:0;padding:32px 16px;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background-color:#0A0A0A;border:1px solid #1D3557;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8EA8C8;">AB FITNESS</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#FFFFFF;">Repor palavra-passe</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#B8C0CC;">
          Recebemos um pedido para alterar a palavra-passe da tua conta. Clica no botão abaixo para definir uma nova.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 26px;background-color:#FFFFFF;color:#000000;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">
          Definir nova palavra-passe
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
          Se não foste tu a pedir esta alteração, ignora este e-mail — a tua palavra-passe atual mantém-se igual.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #161B24;font-size:11px;color:#6B7280;">
        AB Fitness · ABEX Studio · <a href="https://www.abfitness.app" style="color:#9CA3AF;text-decoration:none;">www.abfitness.app</a>
      </td>
    </tr>
  </table>
</div>
```

### C) Magic Link
- **Subject heading:** `O teu link de acesso — AB Fitness`

```html
<div style="margin:0;padding:32px 16px;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background-color:#0A0A0A;border:1px solid #1D3557;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8EA8C8;">AB FITNESS</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#FFFFFF;">Entrar na tua conta</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#B8C0CC;">
          Usa o botão abaixo para iniciar sessão diretamente na AB Fitness sem precisares de palavra-passe.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 26px;background-color:#FFFFFF;color:#000000;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">
          Entrar na AB Fitness
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
          Se não pediste este link, podes ignorar este e-mail.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #161B24;font-size:11px;color:#6B7280;">
        AB Fitness · ABEX Studio · <a href="https://www.abfitness.app" style="color:#9CA3AF;text-decoration:none;">www.abfitness.app</a>
      </td>
    </tr>
  </table>
</div>
```
