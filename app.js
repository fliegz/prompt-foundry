const templates = {
  build: { goal: 'Add [feature or outcome].', context: 'This is a [project type] for [audience]. Relevant files, tools, or existing patterns: [context].', paths: '[path/to/relevant/file]\\n[path/to/another/file]', constraints: 'Preserve [what must stay]. Avoid [what to avoid].', standard: 'It is complete when [verifiable result]. Test [nearby behavior] too.', stop: 'Stop before publishing, sending, deleting, or changing production data without my approval.' },
  understand: { goal: 'Explain this project in plain English.', context: 'Inspect the existing files and identify the main entry points, data flow, and how it runs.', paths: '[path/to/entry-point]\\n[path/to/important/file]', constraints: 'Do not change anything.', standard: 'Include the three biggest risks or unfinished areas and cite the relevant files.', stop: 'If something cannot be determined from the files, label it as unknown instead of guessing.' },
  debug: { goal: 'Fix this problem: [describe the symptom].', context: 'Reproduce it if possible and trace the real cause before changing code.', paths: '[path/to/buggy/file]\\n[path/to/shared/helper]', constraints: 'Make the smallest reliable fix and preserve unrelated behavior.', standard: 'Test the fix and nearby functionality. Explain the root cause and changed files.', stop: 'Do not paper over the symptom with a caller-only guard if the shared path is the source.' },
  review: { goal: 'Review this work for correctness, security, usability, and maintainability.', context: 'Inspect the relevant files and compare the implementation with its intended behavior.', paths: '[path/to/feature]\\n[path/to/tests]', constraints: 'Do not rewrite anything yet. Prioritize findings by severity.', standard: 'Return actionable findings with file references, impact, and recommended fixes.', stop: 'If you are unsure whether something is a defect, call out the uncertainty.' },
  custom: { goal: '', context: '', paths: '', constraints: '', standard: '', stop: '' }
};

const form = document.querySelector('#prompt-form');
const fields = [...form.querySelectorAll('[data-field]')];
const preview = document.querySelector('#preview');
const score = document.querySelector('#score');
const tip = document.querySelector('#tip');

function values() { return Object.fromEntries(fields.map((field) => [field.dataset.field, field.value.trim()])); }
function buildPrompt() {
  const value = values();
  const sections = [['Goal', value.goal], ['Context', value.context], ['File paths', value.paths], ['Constraints', value.constraints], ['Done when', value.standard], ['Stop if', value.stop]];
  const filled = sections.filter(([, text]) => text);
  if (!filled.length) return 'Start filling in the brief on the left.';
  return `# Task brief\n\n${filled.map(([name, text]) => `## ${name}\n${text}`).join('\n\n')}\n\n## How to work\n1. Inspect the relevant files and existing patterns first.\n2. Make a focused plan before changing anything.\n3. Implement the smallest reliable change.\n4. Verify the result and test nearby behavior.\n5. Finish with what changed, what was tested, and what remains uncertain.\n\nUse the file paths above as your starting point. Ask before taking any action covered by “Stop if.”`;
}
function render() {
  const filled = fields.filter((field) => field.value.trim()).length;
  score.textContent = `${filled} / ${fields.length}`;
  preview.textContent = buildPrompt();
  tip.textContent = filled < 3 ? 'Add the context and proof of success before you build.' : filled === fields.length ? 'Ready: this tells the agent what to do, how to do it, and when to stop.' : 'A little more context or a clearer done-when will make this stronger.';
}
function loadTemplate(name) { fields.forEach((field) => { field.value = templates[name][field.dataset.field] ?? ''; }); render(); }

document.querySelectorAll('.mode').forEach((button) => button.addEventListener('click', () => {
  document.querySelector('.mode.active').classList.remove('active');
  button.classList.add('active');
  loadTemplate(button.dataset.template);
}));
fields.forEach((field) => field.addEventListener('input', render));
document.querySelector('#fill-example').addEventListener('click', () => loadTemplate('build'));
document.querySelector('#clear').addEventListener('click', () => loadTemplate('custom'));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
  preview.focus();
  const button = form.querySelector('button[type="submit"]');
  button.firstChild.textContent = 'Prompt built ✓ ';
  setTimeout(() => { button.firstChild.textContent = 'Build my prompt '; }, 1600);
});
async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

document.querySelector('#copy').addEventListener('click', async () => {
  await copyText(buildPrompt());
  const button = document.querySelector('#copy'); button.textContent = 'Copied';
  setTimeout(() => { button.textContent = 'Copy'; }, 1200);
});

// ponytail: one render path keeps the editor and preview in sync; split state only if persistence grows.
loadTemplate('build');
