const appConfig = window.APP_CONFIG || { templates: {}, fields: {}, selectedCanned: null };

const templateSelect = document.getElementById("templateSelect");
const cannedSelect = document.getElementById("cannedSelect");
const loadCannedBtn = document.getElementById("loadCannedBtn");
const dynamicFields = document.getElementById("dynamicFields");
const generateBtn = document.getElementById("generateBtn");
const outputEditor = document.getElementById("outputEditor");
const copyBtn = document.getElementById("copyBtn");
const copyStatus = document.getElementById("copyStatus");
const historyList = document.getElementById("historyList");
const inlineStatus = document.getElementById("inlineStatus");
const saveCustomBtn = document.getElementById("saveCustomBtn");
const savedTemplatesWrap = document.getElementById("savedTemplatesWrap");
const savedTemplates = document.getElementById("savedTemplates");

const CUSTOM_STORAGE_KEY = "maildesk_custom_templates";

function flashMessage(element, text) {
  element.textContent = text;
  element.classList.remove("opacity-0");
  element.classList.add("opacity-1");

  window.setTimeout(() => {
    element.classList.remove("opacity-1");
    element.classList.add("opacity-0");
  }, 1500);
}

function getCurrentTemplateKey() {
  return templateSelect.value;
}

function buildInput(fieldKey) {
  const definition = appConfig.fields[fieldKey];
  if (!definition) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "mb-3 field-wrap";

  const label = document.createElement("label");
  label.className = "form-label";
  label.htmlFor = `field_${fieldKey}`;
  label.textContent = definition.label;

  const isTextArea = definition.type === "textarea";
  const input = document.createElement(isTextArea ? "textarea" : "input");
  input.className = "form-control";
  input.id = `field_${fieldKey}`;
  input.name = fieldKey;
  input.placeholder = definition.placeholder || "";
  input.required = Boolean(definition.required);

  if (isTextArea) {
    input.rows = 4;
  } else {
    input.type = definition.type || "text";
  }

  input.addEventListener("input", validateForm);
  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

function renderFields(templateKey) {
  const templateConfig = appConfig.templates[templateKey];
  dynamicFields.innerHTML = "";

  if (!templateConfig) {
    validateForm();
    return;
  }

  templateConfig.fields.forEach((fieldKey) => {
    const node = buildInput(fieldKey);
    if (node) {
      dynamicFields.appendChild(node);
    }
  });

  const isCustom = templateKey === "custom";
  saveCustomBtn.classList.toggle("d-none", !isCustom);
  savedTemplatesWrap.classList.toggle("d-none", !isCustom);
  if (isCustom) {
    renderSavedCustomTemplates();
  }

  validateForm();
}

function getFormValues() {
  const values = { template: getCurrentTemplateKey() };
  const fields = dynamicFields.querySelectorAll("input, textarea");
  fields.forEach((field) => {
    values[field.name] = field.value.trim();
  });
  return values;
}

function validateForm() {
  const templateKey = getCurrentTemplateKey();
  const templateConfig = appConfig.templates[templateKey];

  if (!templateConfig) {
    generateBtn.disabled = true;
    return;
  }

  generateBtn.disabled = false;
}

function renderHistory(items) {
  historyList.innerHTML = "";

  if (!items || items.length === 0) {
    const li = document.createElement("li");
    li.className = "history-meta";
    li.textContent = "No generated emails yet.";
    historyList.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <div class="fw-semibold">${item.subject || "(No subject)"}</div>
      <div class="history-meta">${item.template} - ${item.created_at}</div>
    `;
    historyList.appendChild(li);
  });
}

async function generateEmail() {
  const values = getFormValues();

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      outputEditor.value = data.error || "Failed to generate email.";
      copyBtn.disabled = true;
      return;
    }

    outputEditor.value = data.email || "";
    copyBtn.disabled = !outputEditor.value.trim();
    renderHistory(data.recent || []);
  } catch {
    outputEditor.value = "Unable to reach server. Please try again.";
    copyBtn.disabled = true;
  }
}

async function copyEmail() {
  const text = outputEditor.value.trim();
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    flashMessage(copyStatus, "Copied!");
  } catch {
    flashMessage(copyStatus, "Copy failed");
  }
}

function getSavedCustomTemplates() {
  const raw = window.localStorage.getItem(CUSTOM_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomTemplates(items) {
  window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(items));
}

function applyCustomTemplate(template) {
  const mappings = {
    custom_template_name: template.name,
    custom_subject: template.subject,
    custom_body: template.body,
  };

  Object.entries(mappings).forEach(([fieldName, value]) => {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) {
      input.value = value;
    }
  });

  validateForm();
  flashMessage(inlineStatus, "Template loaded");
}

function renderSavedCustomTemplates() {
  const items = getSavedCustomTemplates();
  savedTemplates.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item small text-secondary";
    li.textContent = "No saved custom templates.";
    savedTemplates.appendChild(li);
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const title = document.createElement("button");
    title.type = "button";
    title.className = "btn btn-link p-0 text-decoration-none";
    title.textContent = item.name || `Custom Template ${index + 1}`;
    title.addEventListener("click", () => applyCustomTemplate(item));

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-sm btn-outline-danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      const current = getSavedCustomTemplates();
      current.splice(index, 1);
      saveCustomTemplates(current);
      renderSavedCustomTemplates();
      flashMessage(inlineStatus, "Template removed");
    });

    li.appendChild(title);
    li.appendChild(removeBtn);
    savedTemplates.appendChild(li);
  });
}

function saveCurrentCustomTemplate() {
  const values = getFormValues();
  const name = values.custom_template_name || "Untitled Template";
  const subject = values.custom_subject || "";
  const body = values.custom_body || "";

  if (!subject || !body) {
    flashMessage(inlineStatus, "Fill custom subject/body first");
    return;
  }

  const existing = getSavedCustomTemplates();
  existing.unshift({ name, subject, body });
  saveCustomTemplates(existing.slice(0, 6));
  renderSavedCustomTemplates();
  flashMessage(inlineStatus, "Template saved");
}

async function loadCannedEmail(cannedId) {
  if (!cannedId) {
    flashMessage(inlineStatus, "Select a canned email first");
    return;
  }

  try {
    const response = await fetch(`/api/canned-emails/${encodeURIComponent(cannedId)}`);
    const data = await response.json();

    if (!response.ok || !data.item) {
      flashMessage(inlineStatus, "Unable to load canned email");
      return;
    }

    outputEditor.value = `Subject: ${data.item.subject}\n\n${data.item.body}`;
    copyBtn.disabled = !outputEditor.value.trim();
    flashMessage(inlineStatus, "Canned email loaded. You can now edit preview.");
  } catch {
    flashMessage(inlineStatus, "Unable to load canned email");
  }
}

function initSelectedCanned() {
  if (appConfig.selectedCanned) {
    outputEditor.value = `Subject: ${appConfig.selectedCanned.subject}\n\n${appConfig.selectedCanned.body}`;
    copyBtn.disabled = !outputEditor.value.trim();
  }
}

function init() {
  renderFields(getCurrentTemplateKey());
  renderHistory([]);
  initSelectedCanned();

  templateSelect.addEventListener("change", () => {
    renderFields(getCurrentTemplateKey());
  });

  loadCannedBtn.addEventListener("click", () => {
    loadCannedEmail(cannedSelect.value);
  });

  generateBtn.addEventListener("click", generateEmail);
  copyBtn.addEventListener("click", copyEmail);
  saveCustomBtn.addEventListener("click", saveCurrentCustomTemplate);
  outputEditor.addEventListener("input", () => {
    copyBtn.disabled = !outputEditor.value.trim();
  });
}

init();
