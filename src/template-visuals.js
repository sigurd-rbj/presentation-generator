const { fitText } = require('./text-layout');
const { assertEqualRow, connectAdjacentBoxes, layoutEqualRow } = require('./diagram-layout');

function addText(slide, text, box, palette, options = {}) {
  const { minFontSize, maxLines, ...textOptions } = options;
  const requestedFontSize = textOptions.fontSize || 12;
  const fit = fitText(text, {
    ...box,
    fontSize: requestedFontSize,
    minFontSize: minFontSize || Math.max(8, requestedFontSize - 2),
    maxLines,
    horizontalInsetInches: 0,
    verticalInsetInches: 0,
  });
  if (!fit.fits) throw new Error(`visual text ${JSON.stringify(String(text).slice(0, 70))} does not fit box x=${box.x}, y=${box.y}, w=${box.w}, h=${box.h} at minimum ${fit.fontSize} pt`);
  slide.addText(text, {
    ...box,
    fontFace: palette.font,
    fontSize: fit.fontSize,
    color: palette.ink,
    margin: 0,
    breakLine: false,
    fit: 'shrink',
    wrap: true,
    valign: 'mid',
    ...textOptions,
  });
}

function addProductionLine(slide, visual, palette, region) {
  addText(slide, visual.kicker, { x: region.x, y: region.y, w: region.w, h: 0.28 }, palette, {
    fontSize: 10,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    charSpacing: 0.6,
    color: palette.muted,
  });

  const stations = visual.stations;
  const y = region.y + 0.48;
  const gap = 0.32;
  const cardHeight = 1.62;
  const boxes = layoutEqualRow({ x: region.x, y, w: region.w, h: cardHeight }, stations.length, gap);
  assertEqualRow(boxes);
  boxes.slice(0, -1).forEach((box, index) => connectAdjacentBoxes(slide, box, boxes[index + 1], palette, { anchorRatio: 0.56 }));
  stations.forEach((station, index) => {
    const { x, w } = boxes[index];
    slide.addShape('rect', {
      x,
      y,
      w,
      h: cardHeight,
      line: { color: palette.rule, width: 0.9 },
      fill: { color: index === 2 ? palette.blueTint : palette.white },
    });
    slide.addShape('rect', {
      x,
      y,
      w: 0.07,
      h: cardHeight,
      line: { color: station.accent || palette.blue, transparency: 100 },
      fill: { color: station.accent || palette.blue },
    });
    addText(slide, `0${index + 1}  ${station.name.toUpperCase()}`, {
      x: x + 0.18,
      y: y + 0.2,
      w: w - 0.32,
      h: 0.34,
    }, palette, { fontSize: 11, minFontSize: 9, maxLines: 1, bold: true, color: palette.ink });
    addText(slide, station.detail, {
      x: x + 0.18,
      y: y + 0.62,
      w: w - 0.32,
      h: 0.5,
    }, palette, { fontSize: 10, minFontSize: 8.5, maxLines: 2, color: palette.muted, valign: 'top' });
    addText(slide, `${station.sensors} SENSORS`, {
      x: x + 0.18,
      y: y + cardHeight - 0.3,
      w: w - 0.32,
      h: 0.18,
    }, palette, { fontSize: 8, minFontSize: 7.5, maxLines: 1, bold: true, color: station.accent || palette.blue });
  });

  const separatorY = y + cardHeight + 0.32;
  slide.addShape('line', {
    x: region.x + 0.12,
    y: separatorY,
    w: region.w - 0.24,
    h: 0,
    line: { color: palette.rule, width: 1 },
  });
  addText(slide, visual.note, { x: region.x + 0.12, y: separatorY + 0.22, w: region.w - 0.24, h: 0.56 }, palette, {
    fontSize: 14,
    minFontSize: 11,
    maxLines: 2,
    bold: true,
    color: palette.ink,
    align: 'center',
  });
  addText(slide, visual.footnote, { x: region.x + 0.12, y: separatorY + 1.0, w: region.w - 0.24, h: Math.max(0.34, region.y + region.h - separatorY - 1.12) }, palette, {
    fontSize: 9,
    minFontSize: 8,
    maxLines: 2,
    color: palette.muted,
    align: 'center',
  });
}

function addArchitecture(slide, visual, palette, region) {
  addText(slide, visual.kicker, { x: region.x, y: region.y, w: region.w, h: 0.25 }, palette, {
    fontSize: 9,
    minFontSize: 8,
    maxLines: 1,
    bold: true,
    color: palette.muted,
    charSpacing: 0.5,
  });

  const nodes = visual.nodes;
  const y = region.y + 0.4;
  const gap = 0.42;
  const nodeHeight = 1.48;
  const boxes = layoutEqualRow({ x: region.x, y, w: region.w, h: nodeHeight }, nodes.length, gap);
  assertEqualRow(boxes);
  boxes.slice(0, -1).forEach((box, index) => connectAdjacentBoxes(slide, box, boxes[index + 1], palette, { anchorRatio: 0.56 }));
  nodes.forEach((node, index) => {
    const { x, w } = boxes[index];
    slide.addShape('rect', {
      x,
      y,
      w,
      h: nodeHeight,
      line: { color: index === 2 ? palette.blue : palette.rule, width: index === 2 ? 1.3 : 0.9 },
      fill: { color: index === 2 ? palette.blueTint : palette.white },
    });
    addText(slide, node.label.toUpperCase(), {
      x: x + 0.16,
      y: y + 0.18,
      w: w - 0.32,
      h: 0.25,
    }, palette, { fontSize: 9, minFontSize: 8, maxLines: 1, bold: true, color: node.accent || palette.blue });
    addText(slide, node.title, {
      x: x + 0.16,
      y: y + 0.5,
      w: w - 0.32,
      h: 0.36,
    }, palette, { fontSize: 14, minFontSize: 11, maxLines: 1, bold: true, color: palette.ink });
    addText(slide, node.detail, {
      x: x + 0.16,
      y: y + 0.94,
      w: w - 0.32,
      h: 0.4,
    }, palette, { fontSize: 9, minFontSize: 8, maxLines: 2, color: palette.muted, valign: 'top' });
  });

  const guardrailY = region.y + region.h - 0.62;
  slide.addShape('rect', {
    x: region.x,
    y: guardrailY,
    w: region.w,
    h: 0.55,
    line: { color: palette.orange, width: 1 },
    fill: { color: palette.orangeTint },
  });
  addText(slide, visual.guardrail, { x: region.x + 0.18, y: guardrailY + 0.1, w: region.w - 0.36, h: 0.36 }, palette, {
    fontSize: 11,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    align: 'center',
    color: palette.ink,
  });
}

function addKpiCards(slide, visual, palette, region) {
  addText(slide, visual.kicker, { x: region.x, y: region.y, w: region.w, h: 0.28 }, palette, {
    fontSize: 10,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    color: palette.muted,
  });
  const x0 = region.x;
  const y = region.y + 0.42;
  const gap = 0.18;
  const h = 2.1;
  const boxes = layoutEqualRow({ x: x0, y, w: region.w, h }, visual.items.length, gap);
  assertEqualRow(boxes);
  visual.items.forEach((item, index) => {
    const { x, w } = boxes[index];
    slide.addShape('rect', {
      x,
      y,
      w,
      h,
      line: { color: palette.rule, width: 0.9 },
      fill: { color: palette.white },
    });
    slide.addShape('rect', {
      x,
      y,
      w,
      h: 0.07,
      line: { color: item.accent || palette.blue, transparency: 100 },
      fill: { color: item.accent || palette.blue },
    });
    addText(slide, item.value, { x: x + 0.2, y: y + 0.28, w: w - 0.4, h: 0.62 }, palette, {
      fontSize: 27,
      minFontSize: 22,
      maxLines: 1,
      bold: true,
      color: item.accent || palette.blue,
    });
    addText(slide, item.label.toUpperCase(), { x: x + 0.2, y: y + 1.02, w: w - 0.4, h: 0.34 }, palette, {
      fontSize: 10,
      minFontSize: 8.5,
      maxLines: 2,
      bold: true,
      color: palette.ink,
    });
    addText(slide, item.detail, { x: x + 0.2, y: y + 1.48, w: w - 0.4, h: 0.42 }, palette, {
      fontSize: 10,
      minFontSize: 8.5,
      maxLines: 2,
      color: palette.muted,
    });
  });

  const footnoteY = region.y + region.h - 0.72;
  slide.addShape('line', { x: region.x, y: footnoteY - 0.15, w: region.w, h: 0, line: { color: palette.rule, width: 0.8 } });
  addText(slide, visual.footnote, { x: region.x, y: footnoteY, w: region.w, h: 0.58 }, palette, {
    fontSize: 10,
    minFontSize: 8.5,
    maxLines: 2,
    color: palette.ink,
    align: 'center',
  });
}

function addBarPair(slide, measure, x, y, pairWidth, palette) {
  addText(slide, measure.label.toUpperCase(), { x, y, w: pairWidth, h: 0.34 }, palette, {
    fontSize: 10,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    color: palette.ink,
  });
  const labelW = 0.98;
  const valueW = 0.78;
  const barX = x + labelW;
  const barW = pairWidth - labelW - valueW - 0.12;
  const barH = 0.4;
  const rows = [
    { label: 'BASELINE', value: measure.baseline, color: palette.muted },
    { label: 'PILOT', value: measure.pilot, color: palette.blue },
  ];
  rows.forEach((row, index) => {
    const rowY = y + 0.54 + index * 0.72;
    addText(slide, row.label, { x, y: rowY, w: 0.96, h: barH }, palette, {
      fontSize: 8,
      bold: true,
      color: palette.muted,
    });
    slide.addShape('rect', {
      x: barX,
      y: rowY,
      w: barW,
      h: barH,
      line: { color: palette.rule, transparency: 100 },
      fill: { color: palette.rule },
    });
    slide.addShape('rect', {
      x: barX,
      y: rowY,
      w: Math.max(0.08, barW * row.value / measure.maximum),
      h: barH,
      line: { color: row.color, transparency: 100 },
      fill: { color: row.color },
    });
    addText(slide, `${row.value} ${measure.unit}`, { x: barX + barW + 0.08, y: rowY, w: valueW, h: barH }, palette, {
      fontSize: 9,
      minFontSize: 8,
      maxLines: 1,
      bold: true,
      color: palette.ink,
    });
  });
  addText(slide, measure.change, { x, y: y + 2.12, w: pairWidth, h: 0.48 }, palette, {
    fontSize: 12,
    minFontSize: 10,
    maxLines: 2,
    bold: true,
    color: palette.green,
  });
}

function addComparison(slide, visual, palette, region) {
  addText(slide, visual.kicker, { x: region.x, y: region.y, w: region.w, h: 0.28 }, palette, {
    fontSize: 10,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    color: palette.muted,
  });
  const pairGap = 0.46;
  const pairBoxes = layoutEqualRow({ x: region.x, y: region.y, w: region.w, h: region.h }, 2, pairGap);
  assertEqualRow(pairBoxes);
  const pairWidth = pairBoxes[0].w;
  const pairY = region.y + 0.38;
  addBarPair(slide, visual.measures[0], pairBoxes[0].x, pairY, pairWidth, palette);
  addBarPair(slide, visual.measures[1], pairBoxes[1].x, pairY, pairWidth, palette);
  const calloutY = region.y + region.h - 0.68;
  slide.addShape('rect', {
    x: region.x,
    y: calloutY,
    w: region.w,
    h: 0.62,
    line: { color: palette.blue, width: 1 },
    fill: { color: palette.blueTint },
  });
  addText(slide, visual.callout, { x: region.x + 0.18, y: calloutY + 0.1, w: region.w - 0.36, h: 0.42 }, palette, {
    fontSize: 12,
    minFontSize: 10,
    maxLines: 2,
    bold: true,
    align: 'center',
    color: palette.ink,
  });
}

function addDecisionPanels(slide, visual, palette, region) {
  addText(slide, visual.kicker, { x: region.x, y: region.y, w: region.w, h: 0.28 }, palette, {
    fontSize: 10,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    color: palette.muted,
  });
  const y = region.y + 0.4;
  const h = Math.min(2.82, region.h - 1.02);
  const columnGap = 0.36;
  const columnsLayout = layoutEqualRow({ x: region.x, y, w: region.w, h }, 2, columnGap);
  assertEqualRow(columnsLayout);
  const w = columnsLayout[0].w;
  const columns = [
    { ...columnsLayout[0], data: visual.supported, color: palette.green, tint: palette.greenTint },
    { ...columnsLayout[1], data: visual.openQuestions, color: palette.orange, tint: palette.orangeTint },
  ];
  columns.forEach(({ x, y: columnY, w: columnWidth, h: columnHeight, data, color, tint }) => {
    slide.addShape('rect', {
      x,
      y: columnY,
      w: columnWidth,
      h: columnHeight,
      line: { color, width: 1 },
      fill: { color: palette.white },
    });
    slide.addShape('rect', {
      x,
      y: columnY,
      w: columnWidth,
      h: 0.58,
      line: { color, transparency: 100 },
      fill: { color: tint },
    });
    addText(slide, data.title.toUpperCase(), { x: x + 0.22, y: columnY + 0.16, w: columnWidth - 0.44, h: 0.25 }, palette, {
      fontSize: 10,
      bold: true,
      color,
    });
    data.items.forEach((item, index) => {
      const itemY = columnY + 0.78 + index * 0.62;
      slide.addShape('ellipse', {
        x: x + 0.25,
        y: itemY + 0.07,
        w: 0.12,
        h: 0.12,
        line: { color, transparency: 100 },
        fill: { color },
      });
      addText(slide, item, { x: x + 0.52, y: itemY, w: columnWidth - 0.76, h: 0.48 }, palette, {
        fontSize: 10,
        minFontSize: 8.5,
        maxLines: 2,
        color: palette.ink,
        valign: 'top',
      });
    });
  });
  addText(slide, visual.decision, { x: region.x, y: region.y + region.h - 0.52, w: region.w, h: 0.42 }, palette, {
    fontSize: 12,
    minFontSize: 10,
    maxLines: 2,
    bold: true,
    align: 'center',
    color: palette.blue,
  });
}

function addTimeline(slide, visual, palette, region) {
  addText(slide, visual.kicker, { x: region.x, y: region.y, w: region.w, h: 0.28 }, palette, {
    fontSize: 10,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    color: palette.muted,
    charSpacing: 0.5,
  });

  const phases = visual.phases;
  const gap = 0.28;
  const cardY = region.y + 0.58;
  const cardHeight = Math.min(2.56, region.h - 1.35);
  const cards = layoutEqualRow({ x: region.x, y: cardY, w: region.w, h: cardHeight }, phases.length, gap);
  assertEqualRow(cards);
  cards.slice(0, -1).forEach((box, index) => connectAdjacentBoxes(slide, box, cards[index + 1], palette, {
    anchorRatio: 0.57,
    clearance: 0.08,
    width: 1.5,
  }));
  phases.forEach((phase, index) => {
    const { x, w: cardWidth } = cards[index];
    slide.addShape('rect', {
      x,
      y: cardY,
      w: cardWidth,
      h: cardHeight,
      line: { color: palette.rule, width: 0.9 },
      fill: { color: palette.white },
    });
    slide.addShape('rect', {
      x,
      y: cardY,
      w: cardWidth,
      h: 0.08,
      line: { color: phase.accent || palette.blue, transparency: 100 },
      fill: { color: phase.accent || palette.blue },
    });
    addText(slide, phase.period, { x: x + 0.16, y: cardY + 0.34, w: cardWidth - 0.32, h: 0.24 }, palette, {
      fontSize: 9,
      minFontSize: 8,
      maxLines: 1,
      bold: true,
      color: phase.accent || palette.blue,
    });
    addText(slide, phase.title, { x: x + 0.16, y: cardY + 0.78, w: cardWidth - 0.32, h: 0.42 }, palette, {
      fontSize: 19,
      minFontSize: 15,
      maxLines: 1,
      bold: true,
      color: palette.ink,
    });
    addText(slide, phase.detail, { x: x + 0.16, y: cardY + 1.38, w: cardWidth - 0.32, h: Math.max(0.55, cardHeight - 1.58) }, palette, {
      fontSize: 11,
      minFontSize: 9,
      maxLines: 3,
      color: palette.muted,
      valign: 'top',
    });
  });

  const guardrailY = region.y + region.h - 0.62;
  slide.addShape('rect', {
    x: region.x,
    y: guardrailY,
    w: region.w,
    h: 0.56,
    line: { color: palette.blue, width: 0.9 },
    fill: { color: palette.blueTint },
  });
  addText(slide, visual.guardrail, { x: region.x + 0.16, y: guardrailY + 0.1, w: region.w - 0.32, h: 0.34 }, palette, {
    fontSize: 11,
    minFontSize: 9,
    maxLines: 1,
    bold: true,
    align: 'center',
    color: palette.ink,
  });
}

const renderers = {
  productionLine: addProductionLine,
  architecture: addArchitecture,
  kpiCards: addKpiCards,
  comparison: addComparison,
  decisionPanels: addDecisionPanels,
  timeline: addTimeline,
};

function addTemplateVisual(slide, visual, palette, layout, context = 'Visual') {
  if (!visual) return;
  const renderer = renderers[visual.type];
  if (!renderer) throw new Error(`Unknown generated visual type: ${visual.type}`);
  if (!layout?.mainContent) throw new Error(`No main-content region configured for visual type: ${visual.type}`);
  try { renderer(slide, visual, palette, layout.mainContent); }
  catch (error) { throw new Error(`${context}: ${error.message}`, { cause: error }); }
}

module.exports = { addTemplateVisual };
