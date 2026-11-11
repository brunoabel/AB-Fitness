import React, {createContext, useContext} from 'react';
import {Img, staticFile} from 'remotion';
import {colors} from '../theme';

// Coordenadas dos overlays: espaço do screenshot em 390 x 844 (viewport mobile da app).
export const SCREEN = {w: 390, h: 844, status: 34};

const UnitContext = createContext(1);
// Quantos píxeis do vídeo vale 1 unidade do ecrã (inclui o zoom). Útil para traços de 2 px.
export const useScreenUnit = () => useContext(UnitContext);

// Telemóvel genérico feito em código: retângulo preto, borda subtil, ilha no topo. Sem marcas.
export const PhoneMockup = ({src, x, y, width, zoom, style, children, monochrome = true}) => {
  const z = zoom ?? {scale: 1, cx: SCREEN.w / 2, cy: SCREEN.h / 2};
  const bezel = width * 0.03;
  const screenW = width - bezel * 2;
  const s = screenW / SCREEN.w;
  const screenH = (SCREEN.h + SCREEN.status) * s;
  const outerH = screenH + bezel * 2;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height: outerH,
        borderRadius: width * 0.13,
        background: colors.black,
        border: `2px solid ${colors.borderStrong}`,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: bezel - 2,
          top: bezel - 2,
          width: screenW,
          height: screenH,
          borderRadius: width * 0.105,
          overflow: 'hidden',
          background: colors.canvas,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: SCREEN.w,
            height: SCREEN.h + SCREEN.status,
            transformOrigin: '0 0',
            scale: String(s),
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: `${z.cx}px ${z.cy + SCREEN.status}px`,
              scale: String(z.scale),
            }}
          >
            <Img
              src={staticFile(src)}
              style={{
                position: 'absolute',
                left: 0,
                top: SCREEN.status,
                width: SCREEN.w,
                height: SCREEN.h,
                // Os ecrãs atuais ainda têm ciano e dourado: em monocromático ficam dentro da paleta.
                filter: monochrome ? 'grayscale(1)' : undefined,
              }}
            />
            <UnitContext.Provider value={s * z.scale}>
              <div style={{position: 'absolute', left: 0, top: SCREEN.status, width: SCREEN.w, height: SCREEN.h}}>
                {children}
              </div>
            </UnitContext.Provider>
          </div>
          <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: SCREEN.status, background: colors.surface}} />
          <div
            style={{
              position: 'absolute',
              left: SCREEN.w / 2 - 46,
              top: 7,
              width: 92,
              height: 22,
              borderRadius: 11,
              background: colors.black,
            }}
          />
        </div>
      </div>
    </div>
  );
};
