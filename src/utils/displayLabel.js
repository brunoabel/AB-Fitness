/**
 * Rótulos de grupo muscular para o ecrã em PT-PT.
 * Os dados usam 'Abdômen' como identificador de grupo (motor, catálogo do AB Coach e planos já guardados),
 * por isso a grafia só muda na apresentação.
 */
export function displayLabel(value) {
  return typeof value === 'string' ? value.replace(/Abdômen/g, 'Abdómen') : value;
}
