const root = document.documentElement;
const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
const prev = document.querySelector<HTMLButtonElement>('[data-prev]')!;
const next = document.querySelector<HTMLButtonElement>('[data-next]')!;
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!;
const notesToggle = document.querySelector<HTMLButtonElement>('[data-notes-toggle]')!;
const chapterDialog = document.querySelector<HTMLDialogElement>('[data-chapter-dialog]')!;
const zoomDialog = document.querySelector<HTMLDialogElement>('[data-zoom-dialog]')!;
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu]')!;
const progress = document.querySelector<HTMLProgressElement>('[data-progress]')!;
const shellStatus = document.querySelector<HTMLElement>('[data-shell-status]')!;
let current = 0;
let zoomOrigin: HTMLElement | null = null;

const text = (selector: string, value: string) => {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
};
const setPressed = (selector: string, active: HTMLElement) => {
  document.querySelectorAll<HTMLElement>(selector).forEach((button) => button.setAttribute('aria-pressed', String(button === active)));
};
function updateNotes() {
  const details = sections[current].querySelector<HTMLDetailsElement>('.gov-notes')!;
  notesToggle.setAttribute('aria-pressed', String(details.open));
  notesToggle.setAttribute('aria-expanded', String(details.open));
  notesToggle.setAttribute('aria-controls', details.id);
}
function showScene(focusHeading = false) {
  const id = location.hash.slice(1);
  const index = sections.findIndex((section) => section.id === id);
  current = index < 0 ? 0 : index;
  if (index < 0 && id) history.replaceState(null, '', `${location.pathname}${location.search}#${sections[0].id}`);
  sections.forEach((section, sectionIndex) => section.classList.toggle('is-active', sectionIndex === current));
  prev.disabled = current === 0;
  next.disabled = current === sections.length - 1;
  progress.value = current + 1;
  text('[data-scene-count]', `${String(current + 1).padStart(2, '0')} / ${sections.length}`);
  const eyebrow = sections[current].querySelector('.gov-eyebrow')!;
  text('[data-current-chapter]', (eyebrow.textContent || '').replace(/^\s*\d+\s*/, ''));
  const title = sections[current].querySelector<HTMLElement>('h1, h2')!;
  document.title = `${title.textContent} | A Guide to Cloud`;
  document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]').forEach((link) => {
    if (link.hash === `#${sections[current].id}`) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  updateNotes();
  if (focusHeading) {
    title.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
function go(index: number) {
  const bounded = Math.max(0, Math.min(sections.length - 1, index));
  if (bounded !== current) location.hash = sections[bounded].id;
}
prev.addEventListener('click', () => go(current - 1));
next.addEventListener('click', () => go(current + 1));
window.addEventListener('hashchange', () => showScene(true));
menuButton.addEventListener('click', () => chapterDialog.showModal());
document.querySelector<HTMLAnchorElement>('.gov-skip')!.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector<HTMLElement>('#gov-main')!.focus();
});
document.querySelector('[data-close-menu]')!.addEventListener('click', () => chapterDialog.close());
document.querySelector('[data-print]')!.addEventListener('click', () => {
  chapterDialog.close();
  window.print();
});
chapterDialog.addEventListener('close', () => menuButton.focus({ preventScroll: true }));
document.querySelectorAll('[data-chapter-link]').forEach((link) => link.addEventListener('click', () => chapterDialog.close()));
[chapterDialog, zoomDialog].forEach((dialog) => {
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
});

function updateThemeButton() {
  const dark = root.dataset.theme === 'dark';
  themeToggle.textContent = dark ? 'Light view' : 'Dark view';
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
}
themeToggle.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  const url = new URL(location.href);
  url.searchParams.set('scoutTheme', theme);
  history.replaceState(null, '', url);
  updateThemeButton();
});
const fullscreen = document.querySelector<HTMLButtonElement>('[data-fullscreen]')!;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else shellStatus.textContent = 'Full screen is unavailable in this browser. Use the browser’s full screen control.';
  } catch {
    shellStatus.textContent = 'The browser did not allow full screen. The presentation is still available in this window.';
  }
});
document.addEventListener('fullscreenchange', () => {
  fullscreen.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
});
notesToggle.addEventListener('click', () => {
  const notes = sections[current].querySelector<HTMLDetailsElement>('.gov-notes')!;
  notes.open = !notes.open;
  updateNotes();
  if (notes.open) notes.scrollIntoView({ block: 'nearest' });
});
sections.forEach((section) => section.querySelector('.gov-notes')!.addEventListener('toggle', updateNotes));
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
  if (chapterDialog.open || zoomDialog.open) return;
  const target = event.target;
  if (target instanceof Element && target.closest('input, button, a, select, textarea, summary, dialog, [contenteditable], [role="slider"], [role="switch"]')) return;
  if (event.key === 'ArrowRight' || event.code === 'Space') {
    event.preventDefault();
    go(current + 1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    go(current - 1);
  }
});

const flowDetails = [
  'A signed-in user asks a question. This diagram stays within the built-in Microsoft 365 retrieval path.',
  'Orchestration plans the supported request. Other agent architectures can use different engines and tools.',
  'The permission gate checks the source in the user’s context. Broad permissions can make more content eligible for retrieval.',
  'The model uses eligible grounding to form a response. Access eligibility does not guarantee a file is found, cited or used.',
  'Supported audit events provide investigation evidence. Coverage varies by host and activity; not every tool invocation is captured.',
];
document.querySelectorAll<HTMLButtonElement>('[data-flow-step]').forEach((button) => button.addEventListener('click', () => {
  const index = Number(button.dataset.flowStep);
  setPressed('[data-flow-step]', button);
  text('[data-flow-detail]', flowDetails[index]);
  text('[data-flow-count]', `${index + 1} / 5`);
}));
document.querySelector('[data-flow-reset]')!.addEventListener('click', () => {
  document.querySelector<HTMLButtonElement>('[data-flow-step="0"]')!.click();
});
const acl = document.querySelector<HTMLInputElement>('[data-permission="acl"]')!;
const rac = document.querySelector<HTMLInputElement>('[data-permission="rac"]')!;
const group = document.querySelector<HTMLInputElement>('[data-permission="group"]')!;
function updatePermission() {
  const allowed = acl.checked && (!rac.checked || group.checked);
  const result = document.querySelector<HTMLElement>('[data-access-result]')!;
  result.dataset.state = allowed ? 'allowed' : 'denied';
  document.querySelector<HTMLElement>('[data-gate="acl"]')!.dataset.pass = String(acl.checked);
  document.querySelector<HTMLElement>('[data-gate="rac"]')!.dataset.pass = String(!rac.checked || group.checked);
  text('[data-gate-acl]', acl.checked ? 'Granted' : 'Missing');
  text('[data-gate-rac]', !rac.checked ? 'RAC is off' : group.checked ? 'Member' : 'Missing');
  text('[data-access-heading]', allowed ? 'Direct access eligible' : 'Direct access denied');
  text('[data-access-symbol]', allowed ? '✓' : '×');
  let reason = '';
  if (!acl.checked) reason = 'Existing source permission is missing. RAC group membership cannot grant it.';
  else if (rac.checked && !group.checked) reason = 'Source permission exists, but the allowed RAC group membership is missing.';
  else if (!rac.checked) reason = 'Source permission exists. With RAC off, the extra group gate does not apply.';
  else reason = 'Both gates are satisfied: existing source permission and allowed RAC group membership.';
  text('[data-access-reason]', reason);
  const preset = !rac.checked ? '' : acl.checked && group.checked ? 'both' : acl.checked ? 'permission' : group.checked ? 'group' : '';
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.preset === preset)));
}
[acl, rac, group].forEach((input) => input.addEventListener('change', updatePermission));
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => button.addEventListener('click', () => {
  rac.checked = true;
  acl.checked = button.dataset.preset !== 'group';
  group.checked = button.dataset.preset !== 'permission';
  updatePermission();
}));
function clearGateHighlight() {
  document.querySelectorAll('[data-gate-control]').forEach((row) => row.classList.remove('is-lit'));
  document.querySelectorAll('[data-gate-phrase]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
}
document.querySelectorAll<HTMLButtonElement>('[data-gate-phrase]').forEach((button) => button.addEventListener('click', () => {
  clearGateHighlight();
  button.setAttribute('aria-pressed', 'true');
  document.querySelector<HTMLElement>(`[data-gate-control="${button.dataset.gatePhrase}"]`)!.classList.add('is-lit');
}));
document.querySelector('[data-permission-reset]')!.addEventListener('click', () => {
  acl.checked = true;
  rac.checked = true;
  group.checked = false;
  clearGateHighlight();
  updatePermission();
});
function showControl(kind: string) {
  document.querySelectorAll<HTMLButtonElement>('[data-control]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.control === kind)));
  const isRcd = kind === 'rcd';
  document.querySelector<HTMLElement>('[data-capture-kind="rcd"] [data-image-crop]')!.dataset.imageCrop = isRcd ? 'rcd' : 'rac';
  text('[data-control-heading]', isRcd ? 'Reduce organisation-wide discovery' : 'Require both the ACL and the group');
  text('[data-control-detail]', isRcd
    ? 'RCD keeps source permissions intact. Direct access and site-context search remain different routes.'
    : 'RAC adds an allowed-group gate to existing source permission. Group and search-index changes can take time; channel sites have exceptions.');
  text('[data-capture-callout]', isRcd
    ? 'This hides discovery.\nThe file can still open.'
    : 'This is a separate gate.\nIt is not set in this capture.');
}
document.querySelectorAll<HTMLButtonElement>('[data-control]').forEach((button) => button.addEventListener('click', () => showControl(button.dataset.control || 'rcd')));
document.querySelector('[data-rcd-context]')!.addEventListener('click', () => {
  document.querySelector<HTMLElement>('[data-capture-kind="rcd"] [data-image-crop]')!.dataset.imageCrop = 'settings';
  text('[data-capture-callout]', 'Same Settings page.\nDifferent jobs.');
});
const evidenceCaptions: Record<string, string> = {
  prompt: 'The prompt, with the original lab annotation. Content is cropped for readability, not changed.',
  response: 'The response view, with its original annotation. Review the content through an authorised role.',
  resources: 'The files referenced in this published interaction. Existing redactions remain intact.',
};
document.querySelectorAll<HTMLButtonElement>('[data-evidence-crop]').forEach((button) => button.addEventListener('click', () => {
  const crop = button.dataset.evidenceCrop!;
  setPressed('[data-evidence-crop]', button);
  document.querySelector<HTMLElement>('[data-capture-kind="dspm"] [data-image-crop]')!.dataset.imageCrop = crop;
  text('[data-evidence-caption]', evidenceCaptions[crop]);
}));

const dlpModes = {
  simulation: ['OBSERVE', 'See matches before enforcement', 'Simulation lets you review policy matches without blocking the interaction.', 'Use the evidence to tune scope and conditions before turning on enforcement.'],
  label: ['EXCLUDE SUPPORTED CONTENT', 'Opening a file is a separate decision', 'A label-based policy can exclude supported content from Copilot processing even when the user can open the file. Citations may remain.', 'Requires eligible Purview E5-equivalent entitlements. Verify the supported file, email and Copilot surfaces.'],
  prompt: ['PREVIEW / PROMPT SITS', 'Block a matching sensitive prompt', 'Prompt sensitive-information-type policies can prevent a response. This separate preview is rolling out; verify availability in the target tenant.', 'The prompt check does not inspect uploaded file contents. Do not apply a blanket E5 requirement from label-based content protection.'],
};
document.querySelectorAll<HTMLButtonElement>('[data-dlp]').forEach((button) => button.addEventListener('click', () => {
  const mode = button.dataset.dlp as keyof typeof dlpModes;
  setPressed('[data-dlp]', button);
  const [status, title, detail, limit] = dlpModes[mode];
  text('[data-dlp-status]', status);
  text('[data-dlp-title]', title);
  text('[data-dlp-detail]', detail);
  text('[data-dlp-limit]', limit);
}));
const identities = {
  user: ['User’s connection', 'The user’s granted scope', 'The tool acts through the signed-in user’s delegated connection. Downstream permissions and authorisation still matter.'],
  maker: ['Maker’s connection', 'The configured maker authority', 'A tool can use a maker-provided connection even during an interactive chat. Its access may differ from the person asking. Review its actual scope.'],
  automated: ['Configured connection', 'The connection chosen for that action', 'An automated action uses its configured connection. Check the owner, grants and destination for each tool or flow; there is no single universal automation identity.'],
};
document.querySelectorAll<HTMLButtonElement>('[data-identity]').forEach((button) => button.addEventListener('click', () => {
  const key = button.dataset.identity as keyof typeof identities;
  setPressed('[data-identity]', button);
  const [name, title, detail] = identities[key];
  text('[data-identity-name]', name);
  text('[data-identity-title]', title);
  text('[data-identity-detail]', detail);
}));
const auditDetails: Record<string, string> = {
  who: 'Who initiated the activity? Check the recorded user identity within the supported event.',
  host: 'Which application hosted the interaction? Host and activity affect the fields and audit coverage available.',
  resource: 'Which resource was referenced? Use the resource evidence to investigate scope. demo-resource-01 is invented.',
  message: 'Which message is this linked to? A message identifier can support correlation. It is not the full conversation text.',
};
const auditPen: Record<string, string> = {
  who: 'Start with who asked.',
  host: 'Which app was this in?',
  resource: 'Follow the resource reference.',
  message: 'Those are message IDs.',
};
document.querySelectorAll<HTMLButtonElement>('[data-audit-field]').forEach((button) => button.addEventListener('click', () => {
  const field = button.dataset.auditField!;
  setPressed('[data-audit-field]', button);
  document.querySelectorAll<HTMLElement>('[data-event-field]').forEach((row) => row.classList.toggle('is-highlighted', row.dataset.eventField === field));
  text('[data-audit-explain]', auditDetails[field]);
  text('[data-audit-pen]', auditPen[field]);
}));

const readiness = Array.from(document.querySelectorAll<HTMLInputElement>('[data-readiness]'));
function updateReadiness() {
  const count = readiness.filter((input) => input.checked).length;
  text('[data-readiness-status]', `${count} of ${readiness.length} discussion gates marked. Evidence still needs review.`);
}
readiness.forEach((input) => input.addEventListener('change', updateReadiness));
document.querySelector('[data-readiness-reset]')!.addEventListener('click', () => {
  readiness.forEach((input) => { input.checked = false; });
  updateReadiness();
});
const zoomImage = document.querySelector<HTMLImageElement>('[data-zoom-image]')!;
const zoomViewport = document.querySelector<HTMLElement>('.gov-zoom-viewport')!;
const zoomSize = document.querySelector<HTMLButtonElement>('[data-zoom-size]')!;
document.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach((button) => button.addEventListener('click', () => {
  zoomOrigin = button;
  zoomImage.src = button.dataset.zoom!;
  zoomImage.alt = button.dataset.zoomAlt!;
  text('[data-zoom-description]', button.dataset.zoomCaption!);
  zoomViewport.classList.remove('is-actual');
  zoomSize.setAttribute('aria-pressed', 'false');
  zoomSize.textContent = 'Actual size';
  zoomDialog.showModal();
  zoomViewport.scrollTo(0, 0);
}));
zoomSize.addEventListener('click', () => {
  const actual = zoomViewport.classList.toggle('is-actual');
  zoomSize.setAttribute('aria-pressed', String(actual));
  zoomSize.textContent = actual ? 'Fit to window' : 'Actual size';
});
document.querySelector('[data-close-zoom]')!.addEventListener('click', () => zoomDialog.close());
zoomDialog.addEventListener('close', () => zoomOrigin?.focus({ preventScroll: true }));

// Keep disclosure text readable in browsers that do not print closed details.
let printDetails: HTMLDetailsElement[] = [];
let screenTitle: string | null = null;
window.addEventListener('beforeprint', () => {
  screenTitle ??= document.title;
  document.title = 'Copilot governance, made visible | A Guide to Cloud';
  printDetails = Array.from(document.querySelectorAll<HTMLDetailsElement>('details:not([open])'));
  printDetails.forEach((details) => { details.open = true; });
});
window.addEventListener('afterprint', () => {
  printDetails.forEach((details) => { details.open = false; });
  printDetails = [];
  if (screenTitle !== null) document.title = screenTitle;
  screenTitle = null;
});
updateThemeButton();
updatePermission();
showScene();
root.classList.add('gov-ready');
