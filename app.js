const templates = {
  build: { goal: 'Add [feature or outcome].', context: 'This is a [project type] for [audience]. Relevant files, tools, or existing patterns: [context].', constraints: 'Preserve [what must stay]. Avoid [what to avoid].', standard: 'It is complete when [verifiable result]. Test [nearby behavior] too.', stop: 'Stop before publishing, sending, deleting, or changing production data without my approval.' },
  understand: { goal: 'Explain this project in plain English.', context: 'Inspect the existing files and identify the main entry points, data flow, and how it runs.', constraints: 'Do not change anything.', standard: 'Include the three biggest risks or unfinished areas and cite the relevant files.', stop: 'If something cannot be determined from the files, label it as unknown instead of guessing.' },
  debug: { goal: 'Fix this problem: [describe the symptom].', context: 'Reproduce it if possible and trace the real cause before changing code.', constraints: 'Make the smallest reliable fix and preserve unrelated behavior.', standard: 'Test the fix and nearby functionality. Explain the root cause and changed files.', stop: 'Do not paper over the symptom with a caller-only guard if the shared path is the source.' },
  review: { goal: 'Review this work for correctness, security, usability, and maintainability.', context: 'Inspect the relevant files and compare the implementation with its intended behavior.', constraints: 'Do not rewrite anything yet. Prioritize findings by severity.', standard: 'Return actionable findings with file references, impact, and recommended fixes.', stop: 'If you are unsure whether something is a defect, call out the uncertainty.' },
  custom: { goal: '', context: '', constraints: '', standard: '', stop: '' }
};

const form = document.querySelector('#prompt-form');
const fields = [...form.querySelectorAll('[data-field]')];
const preview = document.querySelector('#preview');
const score = document.querySelector('#score');
const tip = document.querySelector('#tip');

function values() { return Object.fromEntries(fields.map((field) => [field.dataset.field, field.value.trim()])); }
function buildPrompt() {
  const value = values();
  const sections = [['Goal', value.goal], ['Context', value.context], ['Constraints', value.constraints], ['Done when', value.standard], ['Stop if', value.stop]];
  const filled = sections.filter(([, text]) => text);
  if (!filled.length) return 'Start filling in the brief on the left.';
  return `${filled.map(([name, text]) => `${name}:\n${text}`).join('\n\n')}\n\nAction:\nInspect the existing work first. Then make a focused plan, implement the change, verify it, and finish with what changed, what was tested, what remains uncertain, and the next best step.`;
}
function render() {
  const filled = fields.filter((field) => field.value.trim()).length;
  score.textContent = `${filled} / ${fields.length}`;
  preview.textContent = buildPrompt();
  tip.textContent = filled < 3 ? 'Add the context and proof of success before you build.' : filled === 5 ? 'Ready: this tells the agent what to do, how to do it, and when to stop.' : 'A little more context or a clearer done-when will make this stronger.';
}
function loadTemplate(name) { fields.forEach((field) => { field.value = templates[name][field.dataset.field]; }); render(); }

document.querySelectorAll('.mode').forEach((button) => button.addEventListener('click', () => {
  document.querySelector('.mode.active').classList.remove('active');
  button.classList.add('active');
  loadTemplate(button.dataset.template);
}));
fields.forEach((field) => field.addEventListener('input', render));
document.querySelector('#fill-example').addEventListener('click', () => loadTemplate('build'));
document.querySelector('#clear').addEventListener('click', () => loadTemplate('custom'));
form.addEventListener('submit', (event) => { event.preventDefault(); render(); preview.focus(); });
document.querySelector('#copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText(buildPrompt());
  const button = document.querySelector('#copy'); button.textContent = 'Copied';
  setTimeout(() => { button.textContent = 'Copy'; }, 1200);
});

// ponytail: one render path keeps the editor and preview in sync; split state only if persistence grows.
loadTemplate('build');
