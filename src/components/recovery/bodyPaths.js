/**
 * Silhueta anatómica estilizada, viewBox 0 0 120 270. Só a metade esquerda (x ≤ 60) é desenhada;
 * o mapa espelha-a em x = 60. `axis`: peças centrais, desenhadas uma vez.
 * `region` liga cada path a MUSCLE_REGIONS; sem região = estrutura neutra (cabeça, mãos, joelhos).
 */
const HEAD = 'M60 5C66 5 70 10 70 17C70 24 66 29 60 29C54 29 50 24 50 17C50 10 54 5 60 5Z';
const NECK = 'M55 28L65 28L66.5 37L53.5 37Z';
const DELT = 'M43 40C36.5 40 31.5 44 30 51C29 57 30 62 32 66C34 61 37 56 41 52C44 49 46 45 47 41Z';
const UPPER_ARM = 'M32 68C29 74 28 82 29 90C31 94 35 94 37 90C38 82 38 74 37 68C35 66 33 66 32 68Z';
const FOREARM = 'M29 96C26 104 25 113 26 122C28 125 31 125 33 122C35 113 37 104 36 96C34 94 31 94 29 96Z';
const HAND = 'M26.5 127C24.5 131 24.5 136 27 139C30 140.5 32.5 137.5 32.5 132.5C32.5 128.5 31.5 126.5 29.5 125.5Z';
const KNEE = 'M46 190C44 193 44 198 46 201C49 203 53 202 54 199C55 195 54 191 52 189C50 188 47.5 188.5 46 190Z';
const FOOT = 'M45 252C42 256 41 261 44 264C48 266 53 265 53 261C53 257 52 253 50 251Z';

export const BODY = {
  front: {
    axis: [{ d: HEAD }, { d: NECK }],
    half: [
      { region: 'trapezio', d: 'M53.5 34C50 37 46.5 38.5 43 40L53.5 40Z' },
      { region: 'ombros', d: DELT },
      { region: 'peito', d: 'M59 41.5L48.5 41.5C44.5 44 41.5 49 40.5 55C40.5 62 44.5 67 51 68C55 68 58 66 59 63Z' },
      { region: 'biceps', d: UPPER_ARM },
      { region: 'antebracos', d: FOREARM },
      { region: 'abdomen', d: 'M59 71L51.5 71C49.5 82 49.5 96 50.5 108C52 115 55 119 59 121Z' },
      { region: 'abdomen', d: 'M48.5 71C44.5 77 43.5 89 44.5 101C45.5 107 47 111 49 113C47.5 100 47.5 84 48.5 71Z' },
      { region: 'adutores', d: 'M59 128C56.5 130 55 136 55 144C55.5 153 57 160 59 165Z' },
      { region: 'quadriceps', d: 'M51 120C45 122 42 130 41 144C40 160 42 175 46 186C49 189 53 188 54.5 184C55.5 172 55.5 158 54 146C53 136 53 127 51 120Z' },
      { region: 'gemeos', d: 'M45 204C42 213 41 226 43 240C44 247 47 250 50 248C52 237 53 222 52 208C50 203 47 202 45 204Z' },
      { d: HAND },
      { d: KNEE },
      { d: FOOT }
    ]
  },
  back: {
    axis: [{ d: HEAD }, { d: NECK }],
    half: [
      { region: 'trapezio', d: 'M60 27C57 31 51 36 43 41C48.5 44 53 50 55 58C57 68 58.5 78 60 88Z' },
      { region: 'ombros', d: DELT },
      { region: 'costas', d: 'M54 61C50 55 45.5 51 41.5 52.5C40.5 62 42 75 46 87C49 96 54 104 58 109C58 97 57 82 56 71Z' },
      { region: 'costas', d: 'M59.5 92C57.5 97 56.5 105 56.5 112C57 116 58 118 59.5 119Z' },
      { region: 'triceps', d: UPPER_ARM },
      { region: 'antebracos', d: FOREARM },
      { region: 'gluteos', d: 'M59 120.5C52 118.5 46 121.5 44 130C43 140 46 148 53 151C56 151 59 149 59 147Z' },
      { region: 'posteriores', d: 'M53 154C47 154 43 161 42 175C43 183 45 189 48 193C51 192 54 187 55 179C56.5 169 56 160 53 154Z' },
      { region: 'posteriores', d: 'M58 153C56.5 159 56.5 168 56.5 178C56.5 184 57 187.5 58 190C59 180 59 165 58 153Z' },
      { region: 'gemeos', d: 'M44 202C40 208 39 218 41 228C43 234 47 236 50 233C52 225 53 213 51 205C49 201 46 200 44 202Z' },
      { d: 'M46 236C46 242 47 248 48 251L51 251C51 246 51 240 50.5 235Z' },
      { d: HAND },
      { d: KNEE },
      { d: FOOT }
    ]
  }
};
