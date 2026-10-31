// Canvas drawing for the 전선 작전 shooter (pure drawing, no game rules).

export const HORIZON = 0.38;
export const GAME_FONT = "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif";

/** Screen position/scale of an enemy at depth z (1 = far, 0 = at the player). */
export function project(enemy, width, height) {
  const t = 1 - enemy.z;
  const y = height * HORIZON + t * height * 0.5;
  const spread = 0.35 + t * 0.65;
  const x = width / 2 + (enemy.lane * width * 0.45) * spread;
  const scale = (0.35 + t * 1.25) * enemy.size;
  return { x, y, scale };
}

export function drawScene(g, width, height, light) {
  const horizon = height * HORIZON;
  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, light ? '#7fb2e5' : '#1b2238');
  sky.addColorStop(1, light ? '#e8d9b5' : '#a0573a');
  g.fillStyle = sky;
  g.fillRect(0, 0, width, horizon);

  // Distant ruins silhouette
  g.fillStyle = light ? '#8a8f86' : '#2a2026';
  for (let i = 0; i < 14; i += 1) {
    const w = width / 14;
    const h = 18 + ((i * 37) % 50);
    g.fillRect(i * w, horizon - h, w * 0.8, h);
  }

  const ground = g.createLinearGradient(0, horizon, 0, height);
  ground.addColorStop(0, light ? '#9c8f6a' : '#3b3326');
  ground.addColorStop(1, light ? '#6d6243' : '#17140f');
  g.fillStyle = ground;
  g.fillRect(0, horizon, width, height - horizon);

  // Perspective trench lines
  g.strokeStyle = light ? 'rgba(60,50,30,.25)' : 'rgba(255,200,150,.07)';
  g.lineWidth = 1;
  for (let i = -6; i <= 6; i += 1) {
    g.beginPath();
    g.moveTo(width / 2 + i * 20, horizon);
    g.lineTo(width / 2 + i * width * 0.25, height);
    g.stroke();
  }
}

export function drawEnemy(g, enemy, pos, locked, typedLength, labelSize) {
  const { x, y, scale } = pos;
  const s = 40 * scale;
  g.save();
  g.translate(x, y);
  g.shadowColor = 'rgba(255,190,120,.55)';
  g.shadowBlur = 6;
  g.fillStyle = enemy.kind === 'boss' ? '#6b1a1a' : enemy.kind === 'runner' ? '#45604c' : enemy.kind === 'heavy' ? '#4d4a3c' : '#3e4a40';
  // legs, body, head, helmet, rifle
  g.fillRect(-s * 0.28, -s * 0.9, s * 0.22, s * 0.9);
  g.fillRect(s * 0.06, -s * 0.9, s * 0.22, s * 0.9);
  g.fillRect(-s * 0.4, -s * 2.0, s * 0.8, s * 1.15);
  g.beginPath();
  g.arc(0, -s * 2.3, s * 0.3, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(0, -s * 2.42, s * 0.42, s * 0.2, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = '#111';
  g.fillRect(-s * 0.7, -s * 1.6, s * 1.4, s * 0.14);
  if (enemy.flash > 0) {
    g.fillStyle = `rgba(255,220,120,${enemy.flash})`;
    g.beginPath();
    g.arc(s * 0.75, -s * 1.53, s * 0.25, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  drawLabel(g, enemy.text, x, y - s * 2.75, locked, typedLength, enemy.kind, labelSize);
}

function drawLabel(g, text, x, y, locked, typedLength, kind, labelSize) {
  const size = Math.round(kind === 'boss' ? labelSize * 1.2 : labelSize);
  const padX = size * 0.6;
  const boxH = size * 1.55;
  g.save();
  g.font = `500 ${size}px ${GAME_FONT}`;
  const width = g.measureText(text).width + padX * 2;
  g.fillStyle = locked ? 'rgba(200,30,30,.92)' : kind === 'boss' ? 'rgba(90,10,10,.9)' : 'rgba(10,12,16,.82)';
  g.strokeStyle = locked ? '#ffd2d2' : 'rgba(255,255,255,.25)';
  g.beginPath();
  g.roundRect(x - width / 2, y - boxH, width, boxH, size * 0.3);
  g.fill();
  g.stroke();
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  const chars = [...text];
  let cx = x - width / 2 + padX;
  chars.forEach((ch, i) => {
    g.fillStyle = locked && i < typedLength ? '#ffe066' : '#fff';
    g.fillText(ch, cx, y - boxH / 2);
    cx += g.measureText(ch).width;
  });
  g.restore();
}

export function drawCrosshair(g, x, y, locked) {
  g.save();
  g.strokeStyle = locked ? '#ff4d4d' : 'rgba(255,255,255,.85)';
  g.lineWidth = 2;
  const r = 16;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
    g.moveTo(x + dx * (r - 6), y + dy * (r - 6));
    g.lineTo(x + dx * (r + 8), y + dy * (r + 8));
  });
  g.stroke();
  g.restore();
}

export function drawTracer(g, width, height, tracer) {
  g.save();
  g.strokeStyle = `rgba(255,230,140,${tracer.life})`;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(width / 2 + 60, height);
  g.lineTo(tracer.x, tracer.y);
  g.stroke();
  g.restore();
}

export function drawWeapon(g, width, height, recoil) {
  g.save();
  g.translate(width / 2 + 80, height + recoil * 18);
  g.fillStyle = '#20232a';
  g.fillRect(-30, -110, 60, 120);
  g.fillStyle = '#353a44';
  g.fillRect(-12, -170, 24, 70);
  g.fillStyle = '#15171c';
  g.fillRect(-40, -60, 80, 30);
  if (recoil > 0.5) {
    g.fillStyle = 'rgba(255,200,80,.9)';
    g.beginPath();
    g.arc(0, -178, 16 * recoil, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

export function drawDamage(g, width, height, amount) {
  if (amount <= 0) return;
  const grad = g.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.8);
  grad.addColorStop(0, 'rgba(180,0,0,0)');
  grad.addColorStop(1, `rgba(180,0,0,${amount * 0.6})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, width, height);
}
