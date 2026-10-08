const EMU_PER_INCH = 914400;
const EPSILON_EMU = 15000;

function boundsOf(element) {
  if (!element?.position) throw new Error('element has no position');
  const { x, y, cx, cy } = element.position;
  if (![x, y, cx, cy].every(Number.isFinite) || cx < 0 || cy < 0) throw new Error(`element ${element.name || '(unnamed)'} has invalid geometry`);
  return { left: x, top: y, right: x + cx, bottom: y + cy };
}

function regionBounds(region) {
  return {
    left: region.x * EMU_PER_INCH,
    top: region.y * EMU_PER_INCH,
    right: (region.x + region.w) * EMU_PER_INCH,
    bottom: (region.y + region.h) * EMU_PER_INCH,
  };
}

function assertElementInside(element, region, where) {
  const b = boundsOf(element);
  const r = regionBounds(region);
  if (b.left < r.left - EPSILON_EMU || b.top < r.top - EPSILON_EMU || b.right > r.right + EPSILON_EMU || b.bottom > r.bottom + EPSILON_EMU) {
    throw new Error(`${where}: ${element.visualType || 'element'} ${JSON.stringify(element.name)} is outside its allowed region`);
  }
}

function assertNoReservedOverlap(element, reserved, where) {
  const b = boundsOf(element);
  for (const zone of reserved || []) {
    const r = regionBounds(zone);
    if (b.left < r.right - EPSILON_EMU && b.right > r.left + EPSILON_EMU && b.top < r.bottom - EPSILON_EMU && b.bottom > r.top + EPSILON_EMU) {
      throw new Error(`${where}: ${JSON.stringify(element.name)} overlaps reserved zone ${zone.name || '(unnamed)'}`);
    }
  }
}

function assertGeneratedGeometry(elements, mainContent, reserved, slideSize, where) {
  const slideRegion = { x: 0, y: 0, w: slideSize.widthInches, h: slideSize.heightInches };
  for (const element of elements) {
    assertElementInside(element, slideRegion, where);
    if (mainContent) assertElementInside(element, mainContent, where);
    assertNoReservedOverlap(element, reserved, where);
  }
}

module.exports = { assertElementInside, assertGeneratedGeometry, assertNoReservedOverlap, boundsOf };
