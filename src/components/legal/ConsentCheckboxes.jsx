import React from 'react';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

const link = 'text-white underline underline-offset-[3px] decoration-white/40 hover:decoration-white';

function Box({ id, checked, onChange, invalid, children }) {
  return (
    <label htmlFor={id} className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${checked ? 'bg-accent/70 border-accent-hover' : invalid ? 'bg-surface border-white/40' : 'bg-surface border-white/[0.1] hover:border-white/[0.2]'}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          triggerHaptic(8);
          onChange(e.target.checked);
        }}
        aria-invalid={invalid || undefined}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`mt-0.5 w-[22px] h-[22px] shrink-0 rounded-md border flex items-center justify-center transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white ${checked ? 'bg-white border-white text-app' : 'border-white/40 text-transparent'}`}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
      <span className="text-[14px] leading-relaxed text-zinc-200">{children}</span>
    </label>
  );
}

/**
 * Consentimentos do registo, em separado e sem pré-seleção:
 *  1. Termos, Privacidade, Aviso Médico e idade mínima;
 *  2. Consentimento explícito para dados de saúde (art. 9.º, n.º 2, al. a) do RGPD).
 * `value` = { terms: boolean, health: boolean }.
 */
export default function ConsentCheckboxes({ value, onChange, showErrors = false }) {
  const set = (key) => (checked) => onChange({ ...value, [key]: checked });

  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">Consentimentos obrigatórios para criar conta</legend>

      <Box id="consent-terms" checked={value.terms} onChange={set('terms')} invalid={showErrors && !value.terms}>
        Li e aceito os{' '}
        <a href="/termos" target="_blank" rel="noopener noreferrer" className={link} onClick={(e) => e.stopPropagation()}>Termos e Condições</a>, a{' '}
        <a href="/privacidade" target="_blank" rel="noopener noreferrer" className={link} onClick={(e) => e.stopPropagation()}>Política de Privacidade</a> e o{' '}
        <a href="/aviso-medico" target="_blank" rel="noopener noreferrer" className={link} onClick={(e) => e.stopPropagation()}>Aviso Médico e de IA</a>. Confirmo que tenho 16 anos ou mais (ou autorização do meu responsável legal, se tiver 14 ou 15).
      </Box>

      <Box id="consent-health" checked={value.health} onChange={set('health')} invalid={showErrors && !value.health}>
        <strong className="font-semibold text-white">Consinto expressamente</strong> que a ABEX Studio trate os meus dados de saúde e biométricos (peso, altura, idade, lesões, check-ins e fadiga muscular) para calcular a progressão, o mapa de recuperação e as sugestões do AB Coach. Posso retirar este consentimento a qualquer momento, eliminando a conta. Sem ele, posso usar o modo convidado, sem conta.
      </Box>

      {showErrors && (!value.terms || !value.health) && (
        <p role="alert" className="text-[13px] text-zinc-100 px-1">Para criar conta, aceite as duas opções acima.</p>
      )}
    </fieldset>
  );
}
