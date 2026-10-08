const theme = require('./theme');

function addSlideTitle(slide, title, options = {}) {
  const { eyebrow, x = theme.margin, y = 0.72, w = theme.width - theme.margin * 2 } = options;

  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x,
      y: y - 0.28,
      w,
      h: 0.2,
      fontFace: theme.fonts.body,
      fontSize: theme.fontSize.label,
      bold: true,
      color: theme.colors.accent,
      charSpacing: 1.2,
      margin: 0,
      breakLine: false,
    });
  }

  slide.addText(title, {
    x,
    y,
    w,
    h: 0.72,
    fontFace: theme.fonts.heading,
    fontSize: theme.fontSize.section,
    bold: true,
    color: theme.colors.ink,
    margin: 0,
    breakLine: false,
    fit: 'shrink',
  });
}

function addTextBlock(slide, text, options = {}) {
  const {
    x = theme.margin,
    y,
    w = theme.width - theme.margin * 2,
    h,
    fontSize = theme.fontSize.body,
    color = theme.colors.body,
    bold = false,
    ...rest
  } = options;

  slide.addText(text, {
    x,
    y,
    w,
    h,
    fontFace: theme.fonts.body,
    fontSize,
    color,
    bold,
    margin: 0,
    breakLine: false,
    valign: 'mid',
    fit: 'shrink',
    ...rest,
  });
}

function addImage(slide, path, options) {
  slide.addImage({ path, ...options });
}

function addCaption(slide, text, options = {}) {
  addTextBlock(slide, text, {
    ...options,
    fontSize: theme.fontSize.caption,
    color: theme.colors.muted,
  });
}

function addFooter(slide, slideNumber, section = 'Research workflow') {
  const y = theme.spacing.footerY;
  slide.addShape('line', {
    x: theme.margin,
    y: y - 0.13,
    w: theme.width - theme.margin * 2,
    h: 0,
    line: { color: theme.colors.rule, width: 0.8 },
  });
  addCaption(slide, section, { x: theme.margin, y, w: 8, h: 0.16 });
  addCaption(slide, String(slideNumber).padStart(2, '0'), {
    x: theme.width - theme.margin - 0.38,
    y,
    w: 0.38,
    h: 0.16,
    align: 'right',
  });
}

function addSectionSlide(pptx, title, subtitle, options = {}) {
  const slide = pptx.addSlide();
  const background = options.background || theme.colors.ink;
  slide.background = { color: background };
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.16,
    h: theme.height,
    line: { color: theme.colors.highlight, transparency: 100 },
    fill: { color: theme.colors.highlight },
  });
  addTextBlock(slide, options.eyebrow || 'TECHNICAL PRESENTATION', {
    x: theme.margin,
    y: 2.12,
    w: 10,
    h: 0.3,
    fontSize: theme.fontSize.label,
    color: '9DD7D8',
    bold: true,
    charSpacing: 1.2,
  });
  addTextBlock(slide, title, {
    x: theme.margin,
    y: 2.72,
    w: 10.8,
    h: 1.25,
    fontFace: theme.fonts.heading,
    fontSize: 38,
    color: theme.colors.white,
    bold: true,
    valign: 'mid',
  });
  addTextBlock(slide, subtitle, {
    x: theme.margin,
    y: 4.18,
    w: 9.4,
    h: 0.7,
    fontSize: 20,
    color: 'D6E0E7',
  });
  return slide;
}

function addCard(slide, { x, y, w, h, label, title, body }) {
  slide.addShape('roundRect', {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    line: { color: theme.colors.rule, width: 0.8 },
    fill: { color: theme.colors.white },
    radius: 0.08,
  });
  addTextBlock(slide, label, {
    x: x + 0.24,
    y: y + 0.22,
    w: w - 0.48,
    h: 0.22,
    fontSize: theme.fontSize.label,
    color: theme.colors.accent,
    bold: true,
  });
  addTextBlock(slide, title, {
    x: x + 0.24,
    y: y + 0.66,
    w: w - 0.48,
    h: 0.46,
    fontFace: theme.fonts.heading,
    fontSize: 21,
    color: theme.colors.ink,
    bold: true,
  });
  addTextBlock(slide, body, {
    x: x + 0.24,
    y: y + 1.25,
    w: w - 0.48,
    h: h - 1.48,
    fontSize: 16,
    color: theme.colors.body,
    valign: 'top',
  });
}

function addNavButton(slide, label, destination, options = {}) {
  const {
    x = theme.margin,
    y = 6.43,
    w = 1.55,
    h = 0.42,
    tooltip = `Go to ${label}`,
    fill = theme.colors.white,
    color = theme.colors.ink,
    lineColor = theme.colors.rule,
    align = 'center',
  } = options;

  slide.addShape('roundRect', {
    x,
    y,
    w,
    h,
    hyperlink: { slide: destination, tooltip },
    line: { color: lineColor, width: 1 },
    fill: { color: fill },
    rectRadius: 0.06,
    radius: 0.06,
  });
  slide.addText([{
    text: label,
    options: {
      hyperlink: { slide: destination, tooltip },
      fontFace: theme.fonts.body,
      fontSize: 13,
      bold: true,
      color,
    },
  }], {
    x,
    y,
    w,
    h,
    fontFace: theme.fonts.body,
    align,
    valign: 'mid',
    margin: 0.08,
    breakLine: false,
    fit: 'shrink',
  });
}

function addHomeButton(slide, destination, options = {}) {
  addNavButton(slide, options.label || 'Home', destination, {
    tooltip: 'Return to the agenda',
    ...options,
  });
}

function addBackButton(slide, destination, options = {}) {
  addNavButton(slide, 'Back to Workflow', destination, {
    w: 2.05,
    tooltip: 'Return to the workflow overview',
    ...options,
  });
}

function addNextButton(slide, label, destination, options = {}) {
  addNavButton(slide, label, destination, {
    fill: theme.colors.accent,
    color: theme.colors.white,
    lineColor: theme.colors.accent,
    tooltip: `Continue to ${label.replace(/^Next:\s*/, '')}`,
    ...options,
  });
}

function addClickableCard(slide, {
  x,
  y,
  w,
  h,
  eyebrow,
  title,
  description,
  destination,
  tooltip,
  fill = theme.colors.white,
  lineColor = theme.colors.rule,
  eyebrowColor = theme.colors.accent,
  titleColor = theme.colors.ink,
  callToAction = 'OPEN MODULE  >',
}) {
  const linkOptions = { slide: destination, tooltip };
  slide.addShape('roundRect', {
    x,
    y,
    w,
    h,
    hyperlink: linkOptions,
    line: { color: lineColor, width: 1 },
    fill: { color: fill },
    rectRadius: 0.08,
    radius: 0.08,
    shadow: { type: 'outer', color: '17324D', blur: 2, angle: 45, distance: 1, opacity: 0.08 },
  });
  slide.addText([
    {
      text: eyebrow.toUpperCase(),
      options: {
        hyperlink: { ...linkOptions },
        fontFace: theme.fonts.body,
        fontSize: theme.fontSize.label,
        bold: true,
        color: eyebrowColor,
        charSpacing: 1,
        breakLine: true,
      },
    },
    {
      text: title,
      options: {
        hyperlink: { ...linkOptions },
        fontFace: theme.fonts.heading,
        fontSize: 22,
        bold: true,
        color: titleColor,
        breakLine: true,
      },
    },
    {
      text: description,
      options: {
        hyperlink: { ...linkOptions },
        fontFace: theme.fonts.body,
        fontSize: 15,
        color: theme.colors.body,
        breakLine: true,
      },
    },
    {
      text: callToAction,
      options: {
        hyperlink: { ...linkOptions },
        fontFace: theme.fonts.body,
        fontSize: 11,
        bold: true,
        color: eyebrowColor,
      },
    },
  ], {
    x,
    y,
    w,
    h,
    margin: 0.24,
    valign: 'mid',
    fit: 'shrink',
    breakLine: false,
  });
}

module.exports = {
  addCaption,
  addCard,
  addBackButton,
  addClickableCard,
  addFooter,
  addHomeButton,
  addImage,
  addNavButton,
  addNextButton,
  addSectionSlide,
  addSlideTitle,
  addTextBlock,
};