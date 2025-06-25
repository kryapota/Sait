let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let tags = JSON.parse(localStorage.getItem("tags")) || [];

const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const statusInput = document.getElementById("statusInput");
const imageInput = document.getElementById("imageInput");
const tagCheckboxes = document.getElementById("tagCheckboxes");
const taskList = document.getElementById("taskList");

const newTag = document.getElementById("newTag");
const tagList = document.getElementById("tagList");

const editModal = document.getElementById("editModal");
const editTitle = document.getElementById("editTitle");
const editDesc = document.getElementById("editDesc");
const editStatus = document.getElementById("editStatus");
const editTagCheckboxes = document.getElementById("editTagCheckboxes");

let editingId = null;

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("tags", JSON.stringify(tags));
}

function renderTagCheckboxes(container, selected = []) {
  container.innerHTML = "";
  tags.forEach(tag => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = tag;
    if (selected.includes(tag)) checkbox.checked = true;
    label.appendChild(checkbox);
    label.append(` ${tag}`);
    container.appendChild(label);
  });
}

function renderTagsPanel() {
  tagList.innerHTML = "";
  tags.forEach((tag, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${tag} <button onclick="deleteTag(${i})">❌</button>`;
    tagList.appendChild(li);
  });
  renderTagCheckboxes(tagCheckboxes);
}

function deleteTag(index) {
  const removed = tags.splice(index, 1)[0];
  tasks.forEach(t => t.tags = t.tags.filter(tag => tag !== removed));
  save();
  renderTagsPanel();
  renderTasks();
}

document.getElementById("addTag").onclick = () => {
  const val = newTag.value.trim();
  if (val && !tags.includes(val)) {
    tags.push(val);
    newTag.value = "";
    save();
    renderTagsPanel();
  }
};

document.getElementById("addBtn").onclick = () => {
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const status = statusInput.value;
  const selectedTags = Array.from(tagCheckboxes.querySelectorAll("input:checked")).map(cb => cb.value);
  const file = imageInput.files[0];

  if (!title) return alert("Введите заголовок");

  const task = {
    id: Date.now(),
    title,
    desc,
    status,
    tags: selectedTags,
    image: null
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      task.image = e.target.result;
      tasks.push(task);
      finalizeAdd();
    };
    reader.readAsDataURL(file);
  } else {
    tasks.push(task);
    finalizeAdd();
  }
};

function finalizeAdd() {
  titleInput.value = "";
  descInput.value = "";
  statusInput.value = "ожидание";
  imageInput.value = "";
  renderTagCheckboxes(tagCheckboxes);
  save();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";
  const colors = {
    "ожидание": "#ef4444",
    "в процессе": "#f59e0b",
    "завершен": "#10b981"
  };

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task";

    const tagsHTML = task.tags.map(tag => `<span class="tag">${tag}</span>`).join("");
    const imgHTML = task.image ? `<img src="${task.image}" alt="task image" />` : "";

    li.innerHTML = `
      <div class="task-header" style="background:${colors[task.status] || "#ccc"}"></div>
      <h3>${task.title}</h3>
      <p>${task.desc}</p>
      ${imgHTML}
      <div class="tags">${tagsHTML}</div>
    `;
    li.onclick = () => openEditModal(task.id);
    taskList.appendChild(li);
  });
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  editTitle.value = task.title;
  editDesc.value = task.desc;
  editStatus.value = task.status;
  renderTagCheckboxes(editTagCheckboxes, task.tags);
  editModal.style.display = "flex";
}

document.getElementById("cancelEdit").onclick = () => {
  editModal.style.display = "none";
  editingId = null;
};

document.getElementById("saveEdit").onclick = () => {
  const task = tasks.find(t => t.id === editingId);
  if (!task) return;

  task.title = editTitle.value.trim();
  task.desc = editDesc.value.trim();
  task.status = editStatus.value;
  task.tags = Array.from(editTagCheckboxes.querySelectorAll("input:checked")).map(cb => cb.value);

  save();
  renderTasks();
  editModal.style.display = "none";
  editingId = null;
};

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab + "Tab").classList.add("active");
  };
});

renderTagsPanel();
renderTasks();
