// Layout por formato. As cenas e o conteúdo são iguais; só estas zonas mudam.
// Vertical: nada importante nos 220 px de cima nem nos 380 px de baixo.

export const formats = {
  vertical: {width: 1080, height: 1920},
  wide: {width: 1920, height: 1080},
};

export const layouts = {
  vertical: {
    safe: {top: 220, bottom: 1540, left: 60, right: 1020},
    avatar: {
      // retângulo 16:9 no terço superior (o topo da imagem é fundo preto)
      hero: {x: 0, y: 190, w: 1080, h: 608, round: 0},
      // cenas com telemóvel: o avatar vira um medalhão redondo ao lado
      compact: {x: 64, y: 250, w: 250, h: 250, round: 1},
    },
    bars: {hero: {x: 800, y: 330}, compact: {x: 128, y: 530}},
    stage: {x: 80, y: 818, w: 920, h: 480},
    phone: {cx: 640, top: 236, height: 1062},
    caption: {x: 60, w: 960, bottom: 1530, fontSize: 56, tail: 'up'},
    scale: 1,
  },
  wide: {
    safe: {top: 60, bottom: 1020, left: 80, right: 1840},
    avatar: {
      hero: {x: 40, y: 70, w: 1000, h: 563, round: 0},
      compact: {x: 40, y: 70, w: 1000, h: 563, round: 0},
    },
    bars: {hero: {x: 740, y: 200}, compact: {x: 740, y: 200}},
    stage: {x: 1100, y: 190, w: 740, h: 520},
    phone: {cx: 1440, top: 60, height: 960},
    caption: {x: 90, w: 900, bottom: 1000, fontSize: 50, tail: 'up'},
    scale: 1,
  },
};

export const phoneRect = (layout) => {
  const p = layouts[layout].phone;
  // proporção do mockup: ecrã 390 x (844 + 34 da barra de estado) + molduras
  const screenH = p.height / 1.035;
  const screenW = (screenH * 390) / 878;
  const width = screenW * 1.06;
  return {x: p.cx - width / 2, y: p.top, width, height: p.height};
};
