function layoutEqualRow(region, count, gap) {
  if (!Number.isInteger(count) || count < 1) throw new Error('Equal-row count must be a positive integer.');
  if (gap < 0 || region.w <= gap * (count - 1)) throw new Error('Equal-row gaps leave no usable item width.');
  const itemWidth = (region.w - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, index) => ({
    x: region.x + index * (itemWidth + gap),
    y: region.y,
    w: itemWidth,
    h: region.h,
  }));
}

function assertEqualRow(boxes, tolerance = 0.01) {
  if (boxes.length < 2) return;
  const first = boxes[0];
  for (const box of boxes.slice(1)) {
    if (Math.abs(box.y - first.y) > tolerance || Math.abs(box.h - first.h) > tolerance || Math.abs(box.w - first.w) > tolerance) {
      throw new Error('Repeated diagram items must share a row, width, and height.');
    }
  }
  const gaps = boxes.slice(1).map((box, index) => box.x - (boxes[index].x + boxes[index].w));
  if (gaps.some((gap) => Math.abs(gap - gaps[0]) > tolerance)) {
    throw new Error('Repeated diagram items must use consistent gaps.');
  }
}

function connectAdjacentBoxes(slide, source, destination, palette, options = {}) {
  const clearance = options.clearance ?? 0.08;
  const anchorRatio = options.anchorRatio ?? 0.56;
  const sourceCenterY = source.y + source.h * anchorRatio;
  const destinationCenterY = destination.y + destination.h * anchorRatio;
  if (Math.abs(sourceCenterY - destinationCenterY) > 0.015) {
    throw new Error('Horizontal process connectors require aligned source/destination anchors.');
  }

  const startX = source.x + source.w + clearance;
  const endX = destination.x - clearance;
  if (endX <= startX) throw new Error('Cards are too close for a clear connector gap.');
  slide.addShape('line', {
    x: startX,
    y: (sourceCenterY + destinationCenterY) / 2,
    w: endX - startX,
    h: 0,
    line: {
      color: options.color || palette.blue,
      width: options.width || 1.5,
      endArrowType: 'triangle',
    },
  });
}

module.exports = { assertEqualRow, connectAdjacentBoxes, layoutEqualRow };