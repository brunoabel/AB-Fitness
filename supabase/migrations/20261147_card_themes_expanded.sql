-- Cartão de perfil: 6 temas novos (obsidian, fiber, slate, sapphire, ink, rose).
-- Mantém todos os ids anteriores, para quem já os escolheu continuar válido.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_cover_style_valid;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_cover_style_valid
  CHECK (cover_style IN (
    'midnight', 'carbon', 'abyss', 'gold', 'titanium', 'cyberpunk', 'aurora', 'crimson',
    'emerald', 'amethyst', 'sunset', 'electric_blue', 'magma', 'monochrome_luxury',
    'obsidian', 'fiber', 'slate', 'sapphire', 'ink', 'rose'
  ));
