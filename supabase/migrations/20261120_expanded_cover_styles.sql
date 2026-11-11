-- AB Fitness — Temas e Estilos de Capa Exclusivos para o Cartão de Atleta
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_cover_style_valid;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_cover_style_valid
  CHECK (cover_style IN ('midnight', 'carbon', 'abyss', 'gold', 'titanium', 'cyberpunk', 'aurora', 'crimson'));

