const fs = require('node:fs');
const path = require('node:path');
const PptxGenJS = require('pptxgenjs');
const theme = require('./theme');
const {
  addBackButton,
  addCaption,
  addClickableCard,
  addFooter,
  addHomeButton,
  addNavButton,
  addNextButton,
  addSectionSlide,
  addSlideTitle,
  addTextBlock,
} = require('./helpers');

const SLIDES = Object.freeze({
  title: 1,
  agenda: 2,
  overview: 3,
  workflow: 4,
  input: 5,
  processing: 6,
  analysis: 7,
  output: 8,
});

const STAGES = [
  {
    key: 'input',
    title: 'Data Input',
    description: 'Sensors stream machine and line-state signals into a monitored edge gateway.',
    points: [
      ['CAPTURE', 'Temperature, vibration, and flow are sampled at the equipment.'],
      ['VALIDATE', 'Range checks flag missing or implausible readings before use.'],
      ['HAND OFF', 'A timestamped event is passed to the processing stage.'],
    ],
    visualTitle: 'LIVE SENSOR FEED',
    visual: [
      ['Temperature', '22.4 C', 0.68],
      ['Vibration', '38 Hz', 0.42],
      ['Flow rate', '96 L/min', 0.82],
    ],
  },
  {
    key: 'processing',
    title: 'Processing',
    description: 'The edge runtime prepares incoming signals for consistent downstream analysis.',
    points: [
      ['NORMALISE', 'Units and field names are aligned to the factory data model.'],
      ['ENRICH', 'Each event is paired with its machine, line, and shift context.'],
      ['ROUTE', 'Validated events are sent to the quality analytics service.'],
    ],
    visualTitle: 'EDGE EVENT PIPELINE',
    visual: [
      ['01', 'Normalise', 'Align fields'],
      ['02', 'Enrich', 'Add context'],
      ['03', 'Route', 'Send event'],
    ],
  },
  {
    key: 'analysis',
    title: 'Analysis',
    description: 'A fictional quality model compares the live process with expected operating ranges.',
    points: [
      ['COMPARE', 'Live measurements are checked against configured thresholds.'],
      ['PRIORITISE', 'Potential process drift is ranked for an operator to review.'],
      ['EXPLAIN', 'The dashboard keeps each signal and its context together.'],
    ],
    visualTitle: 'ILLUSTRATIVE QUALITY SCORE',
    visual: [0.48, 0.62, 0.71, 0.86],
  },
  {
    key: 'output',
    title: 'Output',
    description: 'Operators receive a concise line status and a clear next action.',
    points: [
      ['SUMMARISE', 'Current quality and throughput appear in one line-level view.'],
      ['NOTIFY', 'A review prompt is raised when a configured limit is crossed.'],
      ['FOLLOW UP', 'The operator can acknowledge, investigate, or escalate.'],
    ],
    visualTitle: 'OPERATOR LINE SUMMARY',
    visual: [
      ['Quality review', 'No action'],
      ['Throughput', 'On target'],
      ['Open alerts', '0'],
    ],
  },
];

const outputPath = path.join(__dirname, '..', 'output', 'presentation.pptx');

function addArrow(slide, x, y, width) {
  slide.addShape('line', {
    x,
    y,
    w: width,
    h: 0,
    line: { color: theme.colors.accent, width: 1.7, endArrowType: 'triangle' },
  });
}

function addAgendaSlide(pptx) {
  const slide = pptx.addSlide('CONTENT');
  addSlideTitle(slide, 'Choose a destination', { eyebrow: 'INTERACTIVE AGENDA' });
  addTextBlock(slide, 'Jump to a topic, then use on-slide controls to explore further.', {
    x: theme.margin,
    y: 1.55,
    w: 11.6,
    h: 0.48,
    fontSize: 17,
  });
  [
    {
      eyebrow: '01 / ARCHITECTURE',
      title: 'System Overview',
      description: 'Explore connected stations and open a component detail.',
      destination: SLIDES.overview,
      tooltip: 'Open the smart-factory system overview',
    },
    {
      eyebrow: '02 / PROCESS',
      title: 'Workflow',
      description: 'Follow data from the sensor feed through to an operator action.',
      destination: SLIDES.workflow,
      tooltip: 'Open the four-stage workflow overview',
    },
    {
      eyebrow: '03 / OUTCOME',
      title: 'Results',
      description: 'See a sample line-status summary and operator-facing result.',
      destination: SLIDES.output,
      tooltip: 'Open the results and output detail slide',
      fill: theme.colors.accentLight,
      lineColor: 'B9DCDD',
    },
  ].forEach((card, index) => {
    addClickableCard(slide, {
      ...card,
      x: theme.margin + index * 4.0,
      y: 2.42,
      w: 3.76,
      h: 2.86,
    });
  });
  addCaption(slide, 'Every card is a direct link. Return here from any section.', {
    x: theme.margin,
    y: 5.65,
    w: 10,
    h: 0.22,
  });
  addFooter(slide, SLIDES.agenda, 'SMART FACTORY / NAVIGATION HUB');
}

function addOverviewSlide(pptx) {
  const slide = pptx.addSlide('CONTENT');
  addSlideTitle(slide, 'A connected system turns signals into action', {
    eyebrow: 'SYSTEM OVERVIEW',
  });
  addTextBlock(slide, 'Select any component to drill into the workflow stage that owns it.', {
    x: theme.margin,
    y: 1.55,
    w: 11.6,
    h: 0.44,
    fontSize: 17,
  });

  const components = [
    ['01 / SENSING', 'Machine sensors', 'Live equipment signals', SLIDES.input],
    ['02 / EDGE', 'Edge gateway', 'Validate and timestamp', SLIDES.input],
    ['03 / RUNTIME', 'Control engine', 'Prepare and route events', SLIDES.processing],
    ['04 / INTELLIGENCE', 'Quality analytics', 'Compare process state', SLIDES.analysis],
    ['05 / OPERATIONS', 'Operator console', 'Review and respond', SLIDES.output],
  ];
  const x0 = theme.margin;
  const y = 2.62;
  const w = 2.08;
  const gap = 0.38;
  components.forEach(([eyebrow, title, description, destination], index) => {
    const x = x0 + index * (w + gap);
    if (index < components.length - 1) addArrow(slide, x + w + 0.02, y + 1.19, gap - 0.04);
    addClickableCard(slide, {
      eyebrow,
      title,
      description,
      destination,
      tooltip: `Open the ${title} workflow detail`,
      callToAction: 'OPEN DETAIL  >',
      x,
      y,
      w,
      h: 2.56,
    });
  });
  addCaption(slide, 'Data moves left to right; each station can be explored independently.', {
    x: theme.margin,
    y: 5.55,
    w: 10,
    h: 0.22,
  });
  addHomeButton(slide, SLIDES.agenda, { x: theme.margin, y: 6.43, w: 1.55, label: 'Home / Agenda' });
  addNextButton(slide, 'Next: Workflow  >', SLIDES.workflow, {
    x: 10.55,
    y: 6.43,
    w: 2.1,
    tooltip: 'Continue to the workflow overview',
  });
  addFooter(slide, SLIDES.overview, 'SMART FACTORY / SYSTEM OVERVIEW');
}

function addWorkflowSlide(pptx) {
  const slide = pptx.addSlide('CONTENT');
  addSlideTitle(slide, 'Trace the signal from input to outcome', {
    eyebrow: 'WORKFLOW OVERVIEW',
  });
  addTextBlock(slide, 'Each stage opens a focused detail view. Use Previous and Next to move through the sequence.', {
    x: theme.margin,
    y: 1.55,
    w: 11.7,
    h: 0.48,
    fontSize: 17,
  });

  const x0 = 0.81;
  const y = 2.65;
  const w = 2.72;
  const gap = 0.27;
  STAGES.forEach((stage, index) => {
    const x = x0 + index * (w + gap);
    if (index < STAGES.length - 1) addArrow(slide, x + w + 0.02, y + 1.19, gap - 0.04);
    addClickableCard(slide, {
      eyebrow: `0${index + 1} / ${['CAPTURE', 'PREPARE', 'INTERPRET', 'RESPOND'][index]}`,
      title: stage.title,
      description: [
        'Signals arrive from the machine floor.',
        'Events are checked and enriched.',
        'Quality trends are assessed.',
        'Operators receive the next action.',
      ][index],
      destination: SLIDES[stage.key],
      tooltip: `Open the ${stage.title} detail slide`,
      x,
      y,
      w,
      h: 2.62,
    });
  });
  addHomeButton(slide, SLIDES.agenda, { x: theme.margin, y: 6.43, w: 1.55, label: 'Home / Agenda' });
  addFooter(slide, SLIDES.workflow, 'SMART FACTORY / WORKFLOW');
}

function addDetailVisual(slide, stage) {
  const panel = { x: 7.0, y: 2.28, w: 5.65, h: 3.82 };
  slide.addShape('roundRect', {
    ...panel,
    rectRadius: 0.08,
    line: { color: theme.colors.rule, width: 1 },
    fill: { color: theme.colors.white },
    radius: 0.08,
  });
  addTextBlock(slide, stage.visualTitle, {
    x: panel.x + 0.28,
    y: panel.y + 0.22,
    w: panel.w - 0.56,
    h: 0.25,
    fontSize: theme.fontSize.label,
    color: theme.colors.muted,
    bold: true,
    charSpacing: 0.8,
  });

  if (stage.key === 'input') {
    stage.visual.forEach(([label, value, ratio], index) => {
      const y = panel.y + 0.91 + index * 0.83;
      slide.addShape('ellipse', {
        x: panel.x + 0.3,
        y: y + 0.06,
        w: 0.34,
        h: 0.34,
        line: { color: theme.colors.accent, width: 1 },
        fill: { color: theme.colors.accentLight },
      });
      addTextBlock(slide, label, {
        x: panel.x + 0.8,
        y,
        w: 1.48,
        h: 0.24,
        fontSize: 14,
        color: theme.colors.ink,
        bold: true,
      });
      slide.addShape('roundRect', {
        x: panel.x + 2.25,
        y: y + 0.06,
        w: 1.92,
        h: 0.22,
        line: { color: theme.colors.accentLight, transparency: 100 },
        fill: { color: theme.colors.accentLight },
        radius: 0.06,
      });
      slide.addShape('roundRect', {
        x: panel.x + 2.25,
        y: y + 0.06,
        w: 1.92 * ratio,
        h: 0.22,
        line: { color: theme.colors.accent, transparency: 100 },
        fill: { color: theme.colors.accent },
        radius: 0.06,
      });
      addTextBlock(slide, value, {
        x: panel.x + 4.25,
        y,
        w: 1.08,
        h: 0.28,
        fontSize: 12,
        color: theme.colors.muted,
        align: 'right',
      });
    });
  } else if (stage.key === 'processing') {
    const names = stage.visual;
    const boxW = 1.46;
    const gap = 0.31;
    const y = panel.y + 1.12;
    names.forEach(([number, title, note], index) => {
      const x = panel.x + 0.38 + index * (boxW + gap);
      if (index < names.length - 1) addArrow(slide, x + boxW + 0.02, y + 0.58, gap - 0.04);
      slide.addShape('roundRect', {
        x,
        y,
        w: boxW,
        h: 1.42,
        rectRadius: 0.06,
        line: { color: theme.colors.rule, width: 1 },
        fill: { color: index === 1 ? theme.colors.accentLight : theme.colors.paper },
        radius: 0.06,
      });
      addTextBlock(slide, number, {
        x: x + 0.16,
        y: y + 0.18,
        w: 0.36,
        h: 0.2,
        fontSize: 11,
        color: theme.colors.accent,
        bold: true,
      });
      addTextBlock(slide, title, {
        x: x + 0.15,
        y: y + 0.51,
        w: boxW - 0.3,
        h: 0.34,
        fontSize: 16,
        color: theme.colors.ink,
        bold: true,
      });
      addTextBlock(slide, note, {
        x: x + 0.15,
        y: y + 0.97,
        w: boxW - 0.3,
        h: 0.24,
        fontSize: 11,
        color: theme.colors.muted,
      });
    });
    addCaption(slide, 'Events remain traceable through each transformation.', {
      x: panel.x + 0.4,
      y: panel.y + 3.02,
      w: panel.w - 0.8,
      h: 0.2,
    });
  } else if (stage.key === 'analysis') {
    const left = panel.x + 0.62;
    const bottom = panel.y + 3.13;
    const top = panel.y + 1.08;
    slide.addShape('line', { x: left, y: top, w: 0, h: bottom - top, line: { color: theme.colors.rule, width: 1 } });
    slide.addShape('line', { x: left, y: bottom, w: 4.3, h: 0, line: { color: theme.colors.rule, width: 1 } });
    stage.visual.forEach((ratio, index) => {
      const x = left + 0.48 + index * 0.9;
      const barH = 1.75 * ratio;
      slide.addShape('rect', {
        x,
        y: bottom - barH,
        w: 0.5,
        h: barH,
        line: { color: index === 3 ? theme.colors.highlight : theme.colors.accent, transparency: 100 },
        fill: { color: index === 3 ? theme.colors.highlight : theme.colors.accent },
      });
      addCaption(slide, `S${index + 1}`, { x: x - 0.05, y: bottom + 0.1, w: 0.6, h: 0.2, align: 'center' });
    });
    addTextBlock(slide, '88', {
      x: panel.x + 4.45,
      y: panel.y + 1.28,
      w: 0.75,
      h: 0.52,
      fontFace: theme.fonts.heading,
      fontSize: 30,
      bold: true,
      color: theme.colors.ink,
      align: 'center',
    });
    addCaption(slide, 'CURRENT', { x: panel.x + 4.35, y: panel.y + 1.82, w: 0.95, h: 0.2, align: 'center' });
    addCaption(slide, 'Sample values for demonstration', {
      x: panel.x + 0.42,
      y: panel.y + 3.4,
      w: panel.w - 0.84,
      h: 0.18,
    });
  } else {
    slide.addShape('roundRect', {
      x: panel.x + 0.35,
      y: panel.y + 0.78,
      w: panel.w - 0.7,
      h: 0.7,
      rectRadius: 0.06,
      line: { color: 'B9DED2', width: 1 },
      fill: { color: 'EAF5F0' },
      radius: 0.06,
    });
    slide.addShape('ellipse', {
      x: panel.x + 0.56,
      y: panel.y + 0.96,
      w: 0.32,
      h: 0.32,
      line: { color: '287A5B', transparency: 100 },
      fill: { color: '287A5B' },
    });
    addTextBlock(slide, 'LINE STATUS: READY', {
      x: panel.x + 1.05,
      y: panel.y + 0.98,
      w: 3.95,
      h: 0.28,
      fontSize: 16,
      color: '205B46',
      bold: true,
    });
    stage.visual.forEach(([label, value], index) => {
      const y = panel.y + 1.82 + index * 0.56;
      if (index > 0) {
        slide.addShape('line', {
          x: panel.x + 0.4,
          y: y - 0.12,
          w: panel.w - 0.8,
          h: 0,
          line: { color: theme.colors.rule, width: 0.7 },
        });
      }
      addTextBlock(slide, label, { x: panel.x + 0.48, y, w: 2.7, h: 0.25, fontSize: 14 });
      addTextBlock(slide, value, {
        x: panel.x + 3.4,
        y,
        w: 1.7,
        h: 0.25,
        fontSize: 14,
        color: theme.colors.ink,
        bold: true,
        align: 'right',
      });
    });
    addCaption(slide, 'Example operator-facing summary', {
      x: panel.x + 0.4,
      y: panel.y + 3.47,
      w: panel.w - 0.8,
      h: 0.18,
    });
  }
}

function addDetailSlide(pptx, stage, index) {
  const slide = pptx.addSlide('CONTENT');
  addSlideTitle(slide, stage.title, { eyebrow: `WORKFLOW DETAIL / 0${index + 1}` });
  addTextBlock(slide, stage.description, {
    x: theme.margin,
    y: 1.62,
    w: 5.72,
    h: 0.78,
    fontSize: 18,
    color: theme.colors.body,
    valign: 'top',
  });
  stage.points.forEach(([label, body], pointIndex) => {
    const y = 2.72 + pointIndex * 1.03;
    addTextBlock(slide, label, {
      x: theme.margin,
      y,
      w: 5.7,
      h: 0.24,
      fontSize: theme.fontSize.label,
      color: theme.colors.accent,
      bold: true,
      charSpacing: 0.8,
    });
    addTextBlock(slide, body, {
      x: theme.margin,
      y: y + 0.3,
      w: 5.78,
      h: 0.54,
      fontSize: 16,
      color: theme.colors.body,
      valign: 'top',
    });
  });
  addDetailVisual(slide, stage);

  addHomeButton(slide, SLIDES.agenda, { x: theme.margin, y: 6.43, w: 1.35 });
  addBackButton(slide, SLIDES.workflow, { x: 2.18, y: 6.43 });
  if (index > 0) {
    const previous = STAGES[index - 1];
    addNavButton(slide, `< ${previous.title}`, SLIDES[previous.key], {
      x: 8.18,
      y: 6.43,
      w: 1.88,
      tooltip: `Go to the ${previous.title} detail slide`,
    });
  }
  if (index < STAGES.length - 1) {
    const next = STAGES[index + 1];
    addNextButton(slide, `Next: ${next.title}  >`, SLIDES[next.key], {
      x: 10.14,
      y: 6.43,
      w: 2.51,
      tooltip: `Continue to the ${next.title} detail slide`,
    });
  }
  addFooter(slide, SLIDES[stage.key], 'SMART FACTORY / STAGE DETAIL');
}

async function buildGenericPresentation() {
  const pptx = new PptxGenJS();
  pptx.layout = theme.layout;
  pptx.author = 'Presentation Generator';
  pptx.subject = 'Clickable navigation and drill-down demo';
  pptx.title = 'Interactive Presentation Demo';
  pptx.company = 'Fictional smart factory';
  pptx.lang = 'en-US';
  pptx.theme = {
    headFontFace: theme.fonts.heading,
    bodyFontFace: theme.fonts.body,
    lang: 'en-US',
  };
  pptx.defineSlideMaster({
    title: 'CONTENT',
    background: { color: theme.colors.paper },
    objects: [],
  });

  const titleSlide = addSectionSlide(
    pptx,
    'Interactive Presentation Demo',
    'A demo of clickable PowerPoint navigation and drill-down',
    { eyebrow: 'SMART FACTORY / INTERACTIVE DEMO' },
  );
  addTextBlock(titleSlide, 'Explore the system, follow its workflow, and drill into each stage.', {
    x: theme.margin,
    y: 5.12,
    w: 8.8,
    h: 0.32,
    fontSize: 15,
    color: 'D6E0E7',
  });
  addNextButton(titleSlide, 'Start  >', SLIDES.agenda, {
    x: theme.margin,
    y: 5.68,
    w: 1.85,
    h: 0.54,
    fill: theme.colors.highlight,
    lineColor: theme.colors.highlight,
    color: theme.colors.ink,
    tooltip: 'Start the demo at the agenda',
  });

  addAgendaSlide(pptx);
  addOverviewSlide(pptx);
  addWorkflowSlide(pptx);
  STAGES.forEach((stage, index) => addDetailSlide(pptx, stage, index));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Created ${outputPath}`);
}

async function buildPresentation({ project, presentation } = {}) {
  if (project && presentation) {
    const { buildTemplatePresentation } = require('./template-presentation');
    return buildTemplatePresentation({ projectId: project, presentationId: presentation });
  }
  if (project || presentation) throw new Error('Template builds require both --project <id> and --presentation <id>. Use npm run test:template for template validation.');
  return buildGenericPresentation();
}

function readArguments(args) {
  const result = {};
  for (let index = 0; index < args.length; index++) {
    const [key, inlineValue] = args[index].split('=', 2);
    if (key === '--project') result.project = inlineValue || args[++index];
    if (key === '--presentation') result.presentation = inlineValue || args[++index];
  }
  return result;
}

if (require.main === module) {
  buildPresentation(readArguments(process.argv.slice(2))).catch((error) => {
    console.error('Failed to generate presentation:', error);
    process.exitCode = 1;
  });
}

module.exports = { buildGenericPresentation, buildPresentation };