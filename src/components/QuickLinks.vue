<template>
  <div class="quick-links-container">
    <div class="quick-links" :class="{ loading: isLoading }">
      <div
        class="links-wrapper"
        :class="{ 'is-dragging': dragIndex !== null }"
        @dragover.prevent="handleGlobalDragOver"
      >
        <div
          v-for="(link, index) in links"
          :key="link.url + index"
          class="link-item"
          :class="{
            'dragging-ghost': dragIndex === index,
          }"
          :style="getItemStyle(index)"
          draggable="true"
          @dragstart="handleDragStart(index, $event)"
          @dragend="handleDragEnd"
          @drop="handleDrop"
          @contextmenu.prevent.stop="handleContextMenu($event, index)"
        >
          <a :href="link.url" class="animate-border">
            <img
              :src="`${API_ENDPOINTS.FAVICON}?domain=${getDomain(
                link.url
              )}&sz=32`"
              class="link-favicon"
              alt=""
            />
            {{ link.name }}
          </a>
        </div>

        <!-- Visual Placeholder (Magnet) -->
        <div
          v-if="dragIndex !== null"
          class="link-placeholder"
          :style="getPlaceholderStyle()"
        >
          <div class="placeholder-content"></div>
        </div>
      </div>
      <button
        class="btn btn-primary animate-border"
        @click="showAddModal = true"
        @contextmenu.stop
        title="Add Link"
      >
        <svg
          width="20"
          height="20"
          :viewBox="ICONS.PLUS.viewBox"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          v-html="ICONS.PLUS.content"
        ></svg>
      </button>

      <!-- Custom Context Menu -->
      <div
        v-if="showContextMenu"
        class="context-menu"
        :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
        v-click-outside="closeContextMenu"
        @contextmenu.stop
      >
        <div class="menu-item" @click="handleEditFromMenu">
          <svg
            width="14"
            height="14"
            :viewBox="ICONS.EDIT.viewBox"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            v-html="ICONS.EDIT.content"
          ></svg>
          Edit
        </div>
        <div class="menu-item danger" @click="handleDeleteFromMenu">
          <svg
            width="14"
            height="14"
            :viewBox="ICONS.TRASH.viewBox"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            v-html="ICONS.TRASH.content"
          ></svg>
          Delete
        </div>
      </div>
    </div>

    <!-- Add Link Modal -->
    <Modal v-if="showAddModal" @close="showAddModal = false">
      <template #header>Add New Link</template>
      <template #body>
        <div class="add-link-form">
          <label>URL</label>
          <div class="url-input-wrapper">
            <input
              v-model="newLinkUrl"
              placeholder="google.com или просто google"
              @input="handleUrlInput"
              @blur="handleUrlBlur"
              @keyup.enter="handleAddLink"
              ref="urlInput"
              autoFocus
            />
            <div v-if="showSuggestions" class="suggestions-list">
              <div
                v-for="site in suggestions"
                :key="site"
                class="suggestion-item"
                @click="selectSuggestion(site)"
              >
                {{ site }}
              </div>
            </div>
            <div v-if="isValidating" class="validation-status loading">
              <span class="mini-spinner"></span> Checking site...
            </div>
            <div v-if="validationError" class="validation-status error">
              {{ validationError }}
            </div>
          </div>
          <label>Name</label>
          <input
            v-model="newLinkName"
            placeholder="Example"
            @input="handleNameInput"
            @keyup.enter="handleAddLink"
            :disabled="isValidating"
          />
        </div>
      </template>
      <template #footer>
        <button class="btn animate-border" @click="showAddModal = false">
          Cancel
        </button>
        <button class="btn btn-primary animate-border" @click="handleAddLink">
          Add Link
        </button>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="cancelDelete">
      <template #header>Delete Link</template>
      <template #body>
        <p>
          Are you sure you want to delete
          <strong>{{ linkToDelete?.name }}</strong
          >?
        </p>
      </template>
      <template #footer>
        <button class="btn animate-border" @click="cancelDelete">Cancel</button>
        <button class="btn btn-danger animate-border" @click="confirmDelete">
          Delete
        </button>
      </template>
    </Modal>

    <!-- Edit Link Modal -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #header>Edit Link</template>
      <template #body>
        <div class="add-link-form">
          <label>URL</label>
          <div class="url-input-wrapper">
            <input
              v-model="editLinkUrl"
              placeholder="google.com"
              @input="handleEditUrlInput"
              @blur="handleUrlBlur"
              @keyup.enter="handleSaveEdit"
              :disabled="isValidating"
            />
            <div v-if="showSuggestions" class="suggestions-list">
              <div
                v-for="site in suggestions"
                :key="site"
                class="suggestion-item"
                @click="selectEditSuggestion(site)"
              >
                {{ site }}
              </div>
            </div>
            <div v-if="isValidating" class="validation-status loading">
              <span class="mini-spinner"></span> Checking site...
            </div>
            <div v-if="validationError" class="validation-status error">
              {{ validationError }}
            </div>
          </div>
          <label>Name</label>
          <input
            v-model="editLinkName"
            placeholder="Example"
            @input="handleEditNameInput"
            @keyup.enter="handleSaveEdit"
            :disabled="isValidating"
          />
        </div>
      </template>
      <template #footer>
        <button class="btn animate-border" @click="showEditModal = false">
          Cancel
        </button>
        <button class="btn btn-primary animate-border" @click="handleSaveEdit">
          Save Changes
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useLinks } from "@/composables/useLinks";
import Modal from "@/components/Modal.vue";
import {
  validateUrl,
  extractName,
  getDomain,
  commonSites,
  checkUrlExistence,
} from "@/utils/helpers";
import { API_ENDPOINTS, UI_CONSTANTS } from "@/config";
import { ICONS } from "@/assets/icons";

const { links, isLoading, addLink, editLink, removeLink, reorderLinks } =
  useLinks();

// Directives
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

// Drag and Drop state
const dragIndex = ref(null);
const hoverIndex = ref(null);
const dragWidth = ref(0);
const dragHeight = ref(0);
const itemCoords = ref([]);

const handleDragStart = (index, event) => {
  // Set drag data to ensure initialization across all browsers
  event.dataTransfer.setData("text/plain", index);
  event.dataTransfer.effectAllowed = "move";

  // Use timeout to prevent browser from canceling the drag
  // if styles (like opacity: 0) change immediately
  setTimeout(() => {
    dragIndex.value = index;
    hoverIndex.value = index;
  }, 0);

  // Capture stable coordinates for all items AND the add button
  const container = event.currentTarget.parentElement;
  const containerRect = container.getBoundingClientRect();
  const children = container.querySelectorAll(".link-item");
  const addButton = container.parentElement.querySelector(
    ".btn-primary:not(.action-btn)"
  );

  itemCoords.value = Array.from(children).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left - containerRect.left,
      top: r.top - containerRect.top,
      width: r.width,
      height: r.height,
    };
  });

  // Also add the "Add" button as a potential empty slot hit-zone
  if (addButton) {
    const r = addButton.getBoundingClientRect();
    itemCoords.value.push({
      left: r.left - containerRect.left,
      top: r.top - containerRect.top,
      width: r.width,
      height: r.height,
      isButton: true,
    });
  }

  const rect = event.currentTarget.getBoundingClientRect();
  dragWidth.value = rect.width;
  dragHeight.value = rect.height;
};

const handleGlobalDragOver = (event) => {
  if (dragIndex.value === null || !itemCoords.value.length) return;

  const container = event.currentTarget;
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Find which "slot" we are hovering over based on center-point distance
  let closestIndex = -1;
  let minDistanceSq = Infinity;

  itemCoords.value.forEach((coord, i) => {
    const centerX = coord.left + coord.width / 2;
    const centerY = coord.top + coord.height / 2;
    const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestIndex = i;
    }
  });

  if (closestIndex !== -1) {
    // If we're closest to the "Add" button, we want to hover the last item
    // to allow inserting at the end.
    const realLinksCount = links.value.length;
    let targetHoverIndex = closestIndex;

    if (itemCoords.value[closestIndex].isButton) {
      targetHoverIndex = realLinksCount - 1;
    }

    if (hoverIndex.value !== targetHoverIndex) {
      hoverIndex.value = targetHoverIndex;
    }
  }
};

const getItemStyle = (index) => {
  if (
    dragIndex.value === null ||
    index === dragIndex.value ||
    !itemCoords.value.length
  )
    return {};

  let dx = 0;
  let dy = 0;

  // Logical index for this item during drag
  let logicalIndex = index;
  if (dragIndex.value < hoverIndex.value) {
    if (index > dragIndex.value && index <= hoverIndex.value)
      logicalIndex = index - 1;
  } else if (dragIndex.value > hoverIndex.value) {
    if (index >= hoverIndex.value && index < dragIndex.value)
      logicalIndex = index + 1;
  }

  if (logicalIndex !== index && itemCoords.value[logicalIndex]) {
    dx = itemCoords.value[logicalIndex].left - itemCoords.value[index].left;
    dy = itemCoords.value[logicalIndex].top - itemCoords.value[index].top;
  }

  return {
    transform: `translate(${dx}px, ${dy}px)`,
    transition: "transform 0.4s cubic-bezier(0.2, 0, 0, 1)",
  };
};

const getPlaceholderStyle = () => {
  if (
    dragIndex.value === null ||
    hoverIndex.value === null ||
    !itemCoords.value[hoverIndex.value]
  ) {
    return { display: "none" };
  }

  const coord = itemCoords.value[hoverIndex.value];
  return {
    width: `${coord.width}px`,
    height: `${coord.height}px`,
    left: `${coord.left}px`,
    top: `${coord.top}px`,
    transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
  };
};

const handleDragEnd = () => {
  if (
    dragIndex.value !== null &&
    hoverIndex.value !== null &&
    dragIndex.value !== hoverIndex.value
  ) {
    reorderLinks(dragIndex.value, hoverIndex.value);
  }
  dragIndex.value = null;
  hoverIndex.value = null;
};

const handleDrop = () => {
  handleDragEnd();
};

// Add Modal State
const showAddModal = ref(false);
const newLinkName = ref("");
const newLinkUrl = ref("");
const isValidating = ref(false);
const validationError = ref("");
const suggestions = ref([]);
const showSuggestions = ref(false);
const isNameManuallyEdited = ref(false);

const handleUrlBlur = () => {
  // Use window.setTimeout because setTimeout is not globally accessible in template context
  // but better to keep logic in script anyway
  window.setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const handleUrlInput = () => {
  const query = newLinkUrl.value.toLowerCase();
  validationError.value = "";

  // Auto-fill name if not manually edited
  if (!isNameManuallyEdited.value) {
    newLinkName.value = extractName(newLinkUrl.value);
  }

  if (query.length > 1) {
    suggestions.value = commonSites
      .filter((site) => site.includes(query))
      .slice(0, 5);
    showSuggestions.value = suggestions.value.length > 0;
  } else {
    showSuggestions.value = false;
  }
};

const handleNameInput = () => {
  isNameManuallyEdited.value = true;
};

const selectSuggestion = (site) => {
  newLinkUrl.value = site;
  showSuggestions.value = false;
  if (!isNameManuallyEdited.value) {
    newLinkName.value = extractName(site);
  }
};

// Delete Modal State
const showDeleteModal = ref(false);
const indexToDelete = ref(-1);

const linkToDelete = computed(() => {
  if (indexToDelete.value >= 0 && indexToDelete.value < links.value.length) {
    return links.value[indexToDelete.value];
  }
  return null;
});

// Logic
const autoFillName = () => {
  if (!newLinkName.value && newLinkUrl.value) {
    newLinkName.value = extractName(newLinkUrl.value);
  }
};

const handleAddLink = async () => {
  if (isValidating.value) return;

  const formattedUrl = validateUrl(newLinkUrl.value, true);
  if (!formattedUrl) {
    validationError.value = "Please enter a valid URL";
    return;
  }

  isValidating.value = true;
  validationError.value = "";

  const exists = await checkUrlExistence(formattedUrl);

  if (!exists) {
    validationError.value = "Site not found or unreachable";
    isValidating.value = false;
    return;
  }

  const name = newLinkName.value || extractName(formattedUrl);
  addLink(name, formattedUrl);

  // Reset
  newLinkName.value = "";
  newLinkUrl.value = "";
  isNameManuallyEdited.value = false;
  isValidating.value = false;
  showAddModal.value = false;
};

// Edit Modal State
const showEditModal = ref(false);
const editLinkName = ref("");
const editLinkUrl = ref("");
const editIndex = ref(-1);
const isEditNameManuallyEdited = ref(false);

// Context Menu State
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const indexToManage = ref(-1);

const handleContextMenu = (event, index) => {
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  indexToManage.value = index;
  showContextMenu.value = true;
};

const closeContextMenu = () => {
  showContextMenu.value = false;
};

const handleEditFromMenu = () => {
  if (indexToManage.value !== -1) {
    const link = links.value[indexToManage.value];
    editLinkName.value = link.name;
    editLinkUrl.value = link.url;
    editIndex.value = indexToManage.value;
    isEditNameManuallyEdited.value = true; // Don't auto-fill if we're editing existing
    showEditModal.value = true;
  }
  closeContextMenu();
};

const handleDeleteFromMenu = () => {
  if (indexToManage.value !== -1) {
    indexToDelete.value = indexToManage.value;
    showDeleteModal.value = true;
  }
  closeContextMenu();
};

const handleEditUrlInput = () => {
  const query = editLinkUrl.value.toLowerCase();
  validationError.value = "";

  if (!isEditNameManuallyEdited.value) {
    editLinkName.value = extractName(editLinkUrl.value);
  }

  if (query.length > 1) {
    suggestions.value = commonSites
      .filter((site) => site.includes(query))
      .slice(0, 5);
    showSuggestions.value = suggestions.value.length > 0;
  } else {
    showSuggestions.value = false;
  }
};

const handleEditNameInput = () => {
  isEditNameManuallyEdited.value = true;
};

const selectEditSuggestion = (site) => {
  editLinkUrl.value = site;
  showSuggestions.value = false;
  if (!isEditNameManuallyEdited.value) {
    editLinkName.value = extractName(site);
  }
};

const handleSaveEdit = async () => {
  if (isValidating.value) return;

  const formattedUrl = validateUrl(editLinkUrl.value, true);
  if (!formattedUrl) {
    validationError.value = "Please enter a valid URL";
    return;
  }

  isValidating.value = true;
  validationError.value = "";

  const exists = await checkUrlExistence(formattedUrl);

  if (!exists) {
    validationError.value = "Site not found or unreachable";
    isValidating.value = false;
    return;
  }

  await editLink(editIndex.value, editLinkName.value, formattedUrl);

  // Reset
  editLinkName.value = "";
  editLinkUrl.value = "";
  editIndex.value = -1;
  isValidating.value = false;
  showEditModal.value = false;
};

const promptDelete = (index) => {
  indexToDelete.value = index;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (indexToDelete.value !== -1) {
    removeLink(indexToDelete.value);
    cancelDelete();
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  indexToDelete.value = -1;
};
</script>

<style scoped>
.quick-links-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.quick-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1em 2em;
  max-width: calc(100vw - 4em);
  opacity: 1;
  transition: all 0.4s linear;
  position: relative;
  min-height: 100px; /* Ensure space for loader */
}

.quick-links.loading {
  opacity: 0.5;
  pointer-events: none;
}

.links-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0px; /* Gap is handled by link margins */
}

.link-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  margin: 10px;
}

/* FLIP Animation - apply only to non-dragging items */
.flip-list-move {
  transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1);
}

.link-item.dragging-ghost {
  opacity: 0;
  pointer-events: none;
}

/* Disable pointer events on ALL links while dragging to prevent dragenter firing on children */
.is-dragging .link-item * {
  pointer-events: none;
}

.link-item:active {
  cursor: grabbing;
}

.link-favicon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
  background: transparent;
  display: block;
}

.link-placeholder {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.placeholder-content {
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  margin: 10px;
  border: 2px dashed rgba(29, 162, 252, 0.5);
  background: rgba(29, 162, 252, 0.1);
  border-radius: 4px;
}

.quick-links a {
  position: relative;
  padding: 10px 24px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  font-size: clamp(13px, 2vw, 16px);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.quick-links a:hover {
  background: rgba(29, 162, 252, 0.08);
  border-color: #1da2fc;
  color: #fff;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 10px 25px rgba(29, 162, 252, 0.25);
}

/* Modal Form Styles */
.add-link-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 350px;
}

.add-link-form label {
  font-size: 0.85em;
  color: #888;
  margin-top: 8px;
}

.add-link-form input {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 12px;
  border-radius: 6px;
  outline: none;
  font-family: inherit;
  transition: all 0.3s;
}

.add-link-form input:focus {
  border-color: #1da2fc;
  background: rgba(255, 255, 255, 0.08);
}

/* Autocomplete & Validation Styles */
.url-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-radius: 0 0 8px 8px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  max-height: 150px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 0.9em;
  color: #ccc;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background: rgba(29, 162, 252, 0.15);
  color: #1da2fc;
}

.validation-status {
  font-size: 11px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.validation-status.loading {
  color: #1da2fc;
}

.validation-status.error {
  color: #ff4757;
}

.mini-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(29, 162, 252, 0.3);
  border-top-color: #1da2fc;
  border-radius: 50%;
  animation: mini-spin 0.6s linear infinite;
}

@keyframes mini-spin {
  to {
    transform: rotate(360deg);
  }
}

.url-input-wrapper input:focus {
  border-radius: 4px 4px 0 0;
}

/* Context Menu Styles */
.context-menu {
  position: fixed;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 6px;
  min-width: 140px;
  z-index: 2000;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: menu-fade-in 0.2s ease-out;
}

@keyframes menu-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: #ccc;
  font-size: 0.9em;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.2s;
}

.menu-item svg {
  opacity: 0.6;
}

.menu-item:hover {
  background: rgba(29, 162, 252, 0.15);
  color: #1da2fc;
}

.menu-item:hover svg {
  opacity: 1;
}

.menu-item.danger:hover {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
}

.menu-item.danger:hover svg {
  stroke: #ff4757;
}
</style>
