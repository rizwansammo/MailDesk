const cannedItems = Array.isArray(window.CANNED_EMAILS) ? window.CANNED_EMAILS : [];
const standardTemplates = window.STANDARD_TEMPLATES || {};
const cannedById = Object.fromEntries(cannedItems.map((item) => [item.id, item]));

const previewEditor = document.getElementById("libraryPreviewEditor");
const previewModalLabel = document.getElementById("previewModalLabel");
const copyBtn = document.getElementById("copyLibraryBtn");
const copyStatus = document.getElementById("libraryCopyStatus");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const createTemplateForm = document.getElementById("createTemplateForm");
const createTemplateStatus = document.getElementById("createTemplateStatus");
const baseTemplateSelect = document.getElementById("baseStandardTemplate");
const newTemplateSubject = document.getElementById("newTemplateSubject");
const newTemplateBody = document.getElementById("newTemplateBody");
const placeholderTokenButtons = document.querySelectorAll(".placeholder-token-btn");

const previewModalElement = document.getElementById("previewModal");
const createModalElement = document.getElementById("createTemplateModal");
const previewModal = previewModalElement ? new bootstrap.Modal(previewModalElement) : null;
const createModal = createModalElement ? new bootstrap.Modal(createModalElement) : null;

function flashMessage(element, text) {
  element.textContent = text;
  element.classList.remove("opacity-0");
  element.classList.add("opacity-1");

  window.setTimeout(() => {
    element.classList.remove("opacity-1");
    element.classList.add("opacity-0");
  }, 1400);
}

function getSelectedIds() {
  const checkboxes = document.querySelectorAll(".canned-select-checkbox:checked");
  return Array.from(checkboxes).map((node) => node.value);
}

function updateDeleteButtonState() {
  if (!deleteSelectedBtn) {
    return;
  }

  const selectedCount = getSelectedIds().length;
  deleteSelectedBtn.disabled = selectedCount === 0;
  deleteSelectedBtn.textContent =
    selectedCount > 0 ? `Delete Selected (${selectedCount})` : "Delete Selected";
}

function openPreview(cannedId) {
  const item = cannedById[cannedId];
  if (!item) {
    return;
  }

  previewModalLabel.textContent = item.title;
  previewEditor.value = `Subject: ${item.subject}\n\n${item.body}`;
  copyBtn.disabled = !previewEditor.value.trim();
  previewModal.show();
}

async function copyCurrentPreview() {
  const text = previewEditor.value.trim();
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

function applyBaseTemplate() {
  const templateKey = baseTemplateSelect.value;
  if (!templateKey) {
    return;
  }

  const selected = standardTemplates[templateKey];
  if (!selected) {
    return;
  }

  newTemplateSubject.value = selected.subject || "";
  newTemplateBody.value = selected.body || "";
}

function insertAtCursor(textarea, token) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);

  textarea.value = `${before}${token}${after}`;

  const nextPos = start + token.length;
  textarea.focus();
  textarea.setSelectionRange(nextPos, nextPos);
}

async function createTemplate(event) {
  event.preventDefault();

  const formData = new FormData(createTemplateForm);
  const payload = {
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    tags: String(formData.get("tags") || "").trim(),
  };

  if (!payload.title || !payload.subject || !payload.body) {
    flashMessage(createTemplateStatus, "Fill title, subject and body");
    return;
  }

  try {
    const response = await fetch("/api/canned-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      flashMessage(createTemplateStatus, data.error || "Unable to create template");
      return;
    }

    flashMessage(createTemplateStatus, "Template created");
    window.setTimeout(() => {
      createModal.hide();
      window.location.reload();
    }, 500);
  } catch {
    flashMessage(createTemplateStatus, "Unable to create template");
  }
}

async function deleteSelectedTemplates() {
  const ids = getSelectedIds();
  if (ids.length === 0) {
    return;
  }

  const confirmed = window.confirm(`Delete ${ids.length} selected template(s)?`);
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch("/api/canned-emails", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    const data = await response.json();
    if (!response.ok) {
      window.alert(data.error || "Unable to delete selected templates");
      return;
    }

    window.location.reload();
  } catch {
    window.alert("Unable to delete selected templates");
  }
}

function initLibraryPage() {
  if (!previewEditor || !previewModal || !createTemplateForm || !deleteSelectedBtn) {
    return;
  }

  document.querySelectorAll(".canned-open-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const cannedId = button.getAttribute("data-canned-id");
      openPreview(cannedId);
    });
  });

  document.querySelectorAll(".canned-select-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", updateDeleteButtonState);
  });

  if (baseTemplateSelect) {
    baseTemplateSelect.addEventListener("change", applyBaseTemplate);
  }

  placeholderTokenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const token = button.getAttribute("data-placeholder-token");
      if (!token || !newTemplateBody) {
        return;
      }

      insertAtCursor(newTemplateBody, token);
    });
  });

  previewEditor.addEventListener("input", () => {
    copyBtn.disabled = !previewEditor.value.trim();
  });

  copyBtn.addEventListener("click", copyCurrentPreview);
  createTemplateForm.addEventListener("submit", createTemplate);
  deleteSelectedBtn.addEventListener("click", deleteSelectedTemplates);

  createModalElement.addEventListener("hidden.bs.modal", () => {
    createTemplateForm.reset();
    createTemplateStatus.classList.remove("opacity-1");
    createTemplateStatus.classList.add("opacity-0");
  });

  updateDeleteButtonState();
}

initLibraryPage();
