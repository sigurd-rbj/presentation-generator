const NARROW_GLYPHS = new Set('ijlI.,:;!|\'`');
const WIDE_GLYPHS = new Set('MW@%&#QG');

function glyphWidth(character) {
  if (character === ' ') return 0.3;
  if (NARROW_GLYPHS.has(character)) return 0.3;
  if (WIDE_GLYPHS.has(character)) return 0.88;
  if (/[A-Z0-9]/.test(character)) return 0.64;
  return 0.55;
}

function wrapParagraph(text, widthPoints, fontSize) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let current = '';
  let currentWidth = 0;
  for (const word of words) {
    const wordWidth = [...word].reduce((total, character) => total + glyphWidth(character), 0) * fontSize;
    const spaceWidth = current ? fontSize * 0.3 : 0;
    if (current && currentWidth + spaceWidth + wordWidth > widthPoints) {
      lines.push(current);
      current = word;
      currentWidth = wordWidth;
    } else {
      current = current ? `${current} ${word}` : word;
      currentWidth += spaceWidth + wordWidth;
    }
  }
  lines.push(current);
  return lines;
}

function estimateText(text, widthInches, fontSize, options = {}) {
  const paragraphs = Array.isArray(text) ? text : String(text).split(/\n/);
  const inset = options.horizontalInsetInches ?? 0.08;
  const widthPoints = Math.max(1, (widthInches - inset * 2) * 72);
  const lines = paragraphs.flatMap((paragraph) => wrapParagraph(paragraph, widthPoints, fontSize));
  const lineHeight = fontSize * (options.leading ?? 1.3) / 72;
  const paragraphGap = Math.max(0, paragraphs.length - 1) * (options.paragraphGapInches ?? 0.045);
  const estimatedHeight = Math.max(lineHeight, lines.length * lineHeight + paragraphGap + (options.verticalInsetInches ?? 0.08));
  const lastLineWords = (lines.at(-1) || '').split(/\s+/).filter(Boolean).length;
  return { lines: lines.length, lineHeight, height: estimatedHeight, orphanedLastWord: lines.length > 1 && lastLineWords === 1 };
}

function fitText(text, region) {
  const maxFontSize = region.fontSize || 16;
  const minFontSize = region.minFontSize || Math.max(8, maxFontSize - 2);
  const step = region.step || 0.5;
  const maxHeight = region.maxHeight ?? region.h ?? Infinity;
  let fallback;
  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= step) {
    const measurement = estimateText(text, region.w, fontSize, region);
    fallback = { fontSize, ...measurement };
    if (measurement.height <= maxHeight && measurement.lines <= (region.maxLines || Infinity) && !measurement.orphanedLastWord) {
      return { ...fallback, fits: true };
    }
  }
  if (fallback && fallback.height <= maxHeight && fallback.lines <= (region.maxLines || Infinity)) return { ...fallback, fits: true };
  return { ...fallback, fits: false };
}

function computeTextFlow(contract, fields, context = 'Layout') {
  if (!contract) return { regions: {}, mainContent: null };
  const regions = {};
  const fieldRegionNames = Object.fromEntries(
    Object.entries(contract.fieldRegions || {}).map(([field, region]) => [region, field]),
  );
  for (const [name, definition] of Object.entries(contract.regions || {})) {
    const region = { ...definition };
    if (region.flowAfter) {
      const previous = regions[region.flowAfter];
      if (!previous) throw new Error(`Layout region "${name}" flows after unknown region "${region.flowAfter}"`);
      region.y = previous.y + previous.h + (region.gap || 0);
    }

    const fieldName = region.field || fieldRegionNames[name];
    if (fieldName) {
      const value = fields[fieldName];
      const fit = fitText(value ?? '', region);
      if (!fit.fits) {
        throw new Error(`${context}, field ${fieldName}, region ${name}: text needs ${fit.height.toFixed(2)} in and ${fit.lines} line(s) at minimum ${fit.fontSize} pt; allowed ${region.maxHeight ?? region.h ?? 'auto'} in and ${region.maxLines ?? 'unlimited'} line(s). Shorten the text or enlarge the configured region.`);
      }
      const minHeight = region.minHeight || region.h || 0;
      region.h = region.h === undefined
        ? Math.min(region.maxHeight ?? Infinity, Math.max(minHeight, fit.height))
        : region.h;
      region.fontSize = fit.fontSize;
      region.measuredLines = fit.lines;
    }
    regions[name] = region;
  }

  // Paired or comparison fields form one visual group. Fit each field, then
  // apply the smallest fitting size to every member so their type stays equal.
  for (const group of contract.sharedTextGroups || []) {
    const names = group.map((fieldName) => contract.fieldRegions[fieldName]);
    const sharedFontSize = Math.min(...names.map((name) => regions[name].fontSize));
    for (const [index, name] of names.entries()) {
      const fieldName = group[index];
      const sharedFit = fitText(fields[fieldName] ?? '', {
        ...regions[name], fontSize: sharedFontSize, minFontSize: sharedFontSize,
      });
      if (!sharedFit.fits) {
        throw new Error(`${context}, field ${fieldName}: shared text group cannot fit at ${sharedFontSize} pt`);
      }
      regions[name].fontSize = sharedFontSize;
      regions[name].measuredLines = sharedFit.lines;
    }
  }

  const main = { ...(contract.mainContent || contract.regions?.visuals) };
  if (main.flowAfter) {
    const previous = regions[main.flowAfter];
    main.y = previous.y + previous.h + (main.gap || 0);
  }
  if (main.bottom !== undefined) main.h = main.bottom - main.y;
  if (main.h <= 0) throw new Error(`Layout contract leaves no main content height (${main.h} in).`);

  for (const [name, region] of Object.entries(regions)) {
    for (const reserved of contract.reserved || []) {
      if (rectanglesOverlap(region, reserved)) {
        throw new Error(`Layout region "${name}" overlaps reserved template area "${reserved.name}"`);
      }
    }
  }
  for (const reserved of contract.reserved || []) {
    if (rectanglesOverlap(main, reserved)) {
      throw new Error(`Main content region overlaps reserved template area "${reserved.name}"`);
    }
  }
  return { regions, mainContent: main, reserved: contract.reserved || [] };
}

function rectanglesOverlap(left, right) {
  if ([left.x, left.y, left.w, left.h, right.x, right.y, right.w, right.h].some((value) => value === undefined)) return false;
  return left.x < right.x + right.w && left.x + left.w > right.x && left.y < right.y + right.h && left.y + left.h > right.y;
}

module.exports = { computeTextFlow, estimateText, fitText };
