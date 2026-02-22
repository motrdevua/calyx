<template>
  <div class="quick-links-container">
    <draggable
      v-model="links"
      item-key="id"
      class="links-grid-layout"
      :class="{ loading: isLoading }"
      ghost-class="dragging-ghost"
      :animation="250"
      :swapThreshold="0.65"
      :group="{ name: 'shared-links' }"
      draggable=".link-item"
      @start="onMainDragStart"
      @end="onMainDragEnd"
      :move="handleMove"
    >
      <template #item="{ element }">
        <div
          class="link-item"
          :data-id="element.id"
          :class="{ 'drop-target-active': readyToMergeId === element.id }"
          @contextmenu.prevent.stop="handleContextMenu($event, element)"
        >
          <div
            v-if="element.type === 'folder'"
            class="folder-card animate-border"
            @click="openFolder(element)"
            @mousemove="handleMouseMove"
          >
            <div class="folder-grid-preview">
              <img
                v-for="sub in element.children.slice(0, 4)"
                :key="sub.id"
                :src="`${API_ENDPOINTS.FAVICON}?domain=${getDomain(
                  sub.url
                )}&sz=16`"
                class="mini-favicon"
                alt=""
              />
            </div>
            <span class="folder-label">{{ element.name }}</span>
          </div>

          <a
            v-else
            :href="element.url"
            class="link-card animate-border"
            @mousemove="handleMouseMove"
          >
            <img
              :src="`${API_ENDPOINTS.FAVICON}?domain=${getDomain(
                element.url
              )}&sz=32`"
              class="link-favicon"
              alt=""
            />
            <span class="link-name-text">{{ element.name }}</span>
          </a>
        </div>
      </template>

      <template #footer>
        <button
          class="add-btn-grid animate-border"
          @click="showAddModal = true"
          @contextmenu.stop
          title="Add Link"
          @mousemove="handleMouseMove"
        >
          <svg
            width="24"
            height="24"
            :viewBox="ICONS.PLUS.viewBox"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-html="ICONS.PLUS.content"
          ></svg>
        </button>
      </template>
    </draggable>

    <transition name="fade-blur-zoom">
      <div
        v-if="activeFolder"
        class="folder-modal-overlay"
        :class="{ 'is-dragging-out': isDraggingFromFolder }"
        @click.self="closeFolder"
      >
        <div
          class="folder-modal-content animate-border"
          ref="folderModalContent"
        >
          <div class="folder-title-wrapper">
            <input
              ref="folderTitleInputRef"
              v-model="activeFolder.name"
              class="folder-title-input"
              @blur="saveLinks"
              @keyup.enter="$event.target.blur()"
              placeholder="Название папки"
            />
            <svg
              @click="focusFolderTitle"
              class="edit-title-icon"
              width="24"
              height="24"
              :viewBox="ICONS.EDIT.viewBox"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              v-html="ICONS.EDIT.content"
            ></svg>
          </div>

          <draggable
            v-model="activeFolder.children"
            item-key="id"
            class="folder-inner-grid"
            ghost-class="dragging-ghost"
            :animation="200"
            :group="{ name: 'shared-links' }"
            draggable=".link-item"
            @start="onFolderDragStart"
            @end="onFolderDragEnd"
          >
            <template #item="{ element }">
              <div
                class="link-item"
                @contextmenu.prevent.stop="handleContextMenu($event, element)"
              >
                <a
                  :href="element.url"
                  class="link-card animate-border"
                  @mousemove="handleMouseMove"
                >
                  <img
                    :src="`${API_ENDPOINTS.FAVICON}?domain=${getDomain(
                      element.url
                    )}&sz=32`"
                    class="link-favicon"
                    alt=""
                  />
                  <span class="link-name-text">{{ element.name }}</span>
                </a>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </transition>

    <transition name="menu-fade">
      <div
        v-if="showContextMenu"
        class="context-menu glass-panel"
        :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
        v-click-outside="closeContextMenu"
        @contextmenu.stop
      >
        <template v-if="contextMenuType === 'folder'">
          <div class="menu-item" @click="handleRenameFolderFromMenu">
            <svg
              width="14"
              height="14"
              :viewBox="ICONS.EDIT.viewBox"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              v-html="ICONS.EDIT.content"
            ></svg>
            Rename Folder
          </div>
          <div class="menu-item danger" @click="handleUnpackFolderFromMenu">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              ></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Unpack Folder
          </div>
        </template>

        <template v-else>
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
            Edit Link
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
            Delete Link
          </div>
        </template>
      </div>
    </transition>

    <Modal v-if="showAddModal" @close="showAddModal = false">
      <template #header>Add New Link</template>
      <template #body>
        <div class="add-link-form">
          <div class="url-input-wrapper">
            <label>URL</label>
            <input
              v-model="newLinkUrl"
              v-focus
              placeholder="google.com"
              @input="handleUrlInput"
              @blur="handleUrlBlur"
              @keyup.enter="handleAddLink"
              ref="urlInput"
            />
            <transition name="fade">
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
            </transition>
            <div v-if="isValidating" class="validation-status loading">
              <span class="mini-spinner"></span> Checking site...
            </div>
            <div v-if="validationError" class="validation-status error">
              {{ validationError }}
            </div>
          </div>
          <div class="url-input-wrapper">
            <label>Name</label>
            <input
              v-model="newLinkName"
              placeholder="Example"
              @input="handleNameInput"
              @keyup.enter="handleAddLink"
              :disabled="isValidating"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <button
          class="btn animate-border"
          @click="showAddModal = false"
          @mousemove="handleMouseMove"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary animate-border"
          @click="handleAddLink"
          @mousemove="handleMouseMove"
        >
          Add Link
        </button>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="cancelDelete">
      <template #header>Delete Link</template>
      <template #body>
        <p class="delete-text">
          Are you sure you want to delete
          <strong style="color: #fff">{{ itemToDelete?.name }}</strong
          >?
        </p>
      </template>
      <template #footer>
        <button
          class="btn animate-border"
          @click="cancelDelete"
          @mousemove="handleMouseMove"
        >
          Cancel
        </button>
        <button
          class="btn btn-danger animate-border"
          @click="confirmDelete"
          @mousemove="handleMouseMove"
        >
          Delete
        </button>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #header>Edit Link</template>
      <template #body>
        <div class="add-link-form">
          <div class="url-input-wrapper">
            <label>URL</label>
            <input
              v-model="editLinkUrl"
              v-focus
              placeholder="google.com"
              @input="handleEditUrlInput"
              @blur="handleUrlBlur"
              @keyup.enter="handleSaveEdit"
              :disabled="isValidating"
            />
            <transition name="fade">
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
            </transition>
            <div v-if="isValidating" class="validation-status loading">
              <span class="mini-spinner"></span> Checking site...
            </div>
            <div v-if="validationError" class="validation-status error">
              {{ validationError }}
            </div>
          </div>
          <div class="url-input-wrapper">
            <label>Name</label>
            <input
              v-model="editLinkName"
              placeholder="Example"
              @input="handleEditNameInput"
              @keyup.enter="handleSaveEdit"
              :disabled="isValidating"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <button
          class="btn animate-border"
          @click="showEditModal = false"
          @mousemove="handleMouseMove"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary animate-border"
          @click="handleSaveEdit"
          @mousemove="handleMouseMove"
        >
          Save Changes
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import draggable from "vuedraggable";
import { useLinks } from "@/composables/useLinks";
import Modal from "@/components/Modal.vue";
import {
  validateUrl,
  extractName,
  getDomain,
  commonSites,
  checkUrlExistence,
} from "@/utils/helpers";
import { API_ENDPOINTS } from "@/config";
import { ICONS } from "@/assets/icons";
// ИМПОРТИРУЕМ ОБЩУЮ ЛОГИКУ ФОНАРИКА
import { useSpotlight } from "@/composables/useSpotlight";

// ДИРЕКТИВА АВТОФОКУСА
const vFocus = { mounted: (el) => el.focus() };

const { links, isLoading, addLink, editItem, removeItem, saveLinks } =
  useLinks();

// ИСПОЛЬЗУЕМ КОМПОЗАБЛ
const { handleMouseMove } = useSpotlight();

// ==========================================
// ЛОГИКА ПАПОК И ГЛАВНОЙ СЕТКИ
// ==========================================
const dragId = ref(null);
const hoveredTargetId = ref(null);
const readyToMergeId = ref(null);
let hoverTimer = null;

const onMainDragStart = (evt) => {
  dragId.value = links.value[evt.oldIndex]?.id;
  closeContextMenu();
};

const handleMove = (evt) => {
  const draggedContextId = evt.draggedContext.element?.id;
  const relatedId = evt.relatedContext.element?.id;
  const draggedType = evt.draggedContext.element?.type;

  if (draggedType === "folder") return true;

  if (hoveredTargetId.value !== relatedId) {
    hoveredTargetId.value = relatedId || null;
    readyToMergeId.value = null;
    clearTimeout(hoverTimer);
    if (relatedId && relatedId !== draggedContextId) {
      hoverTimer = setTimeout(() => {
        readyToMergeId.value = relatedId;
      }, 400);
    }
  }
  if (readyToMergeId.value === relatedId) return false;
  return true;
};

const onMainDragEnd = async (evt) => {
  const draggedItemId = dragId.value;
  dragId.value = null;

  const x = evt.originalEvent.clientX;
  const y = evt.originalEvent.clientY;
  const elUnderMouse = document.elementFromPoint(x, y);
  const droppedOnTarget =
    elUnderMouse &&
    elUnderMouse.closest(`.link-item[data-id="${readyToMergeId.value}"]`);

  if (evt.item) {
    evt.item.classList.add("bounce-drop-anim");
    setTimeout(() => evt.item.classList.remove("bounce-drop-anim"), 400);
  }

  if (readyToMergeId.value && droppedOnTarget) {
    const targetId = readyToMergeId.value;
    readyToMergeId.value = null;
    hoveredTargetId.value = null;
    clearTimeout(hoverTimer);

    await nextTick();
    await createFolder(draggedItemId, targetId);
  } else {
    readyToMergeId.value = null;
    hoveredTargetId.value = null;
    clearTimeout(hoverTimer);
    await saveLinks();
  }
};

const createFolder = async (sourceId, targetId) => {
  const sourceIdx = links.value.findIndex((l) => l.id === sourceId);
  if (sourceIdx === -1) return;
  const sourceItem = links.value.splice(sourceIdx, 1)[0];
  const targetIdx = links.value.findIndex((l) => l.id === targetId);

  if (targetIdx === -1) {
    links.value.splice(sourceIdx, 0, sourceItem);
    return;
  }
  const targetItem = links.value[targetIdx];

  if (targetItem.type === "folder") {
    targetItem.children.push(sourceItem);
    activeFolder.value = targetItem;
  } else {
    const newFolder = {
      id: "folder_" + Date.now(),
      name: "Новая папка",
      type: "folder",
      children: [targetItem, sourceItem],
    };
    links.value.splice(targetIdx, 1, newFolder);
    activeFolder.value = newFolder;
  }
  await saveLinks();
};

// ==========================================
// ЛОГИКА ВНУТРИ МОДАЛКИ ПАПКИ
// ==========================================
const activeFolder = ref(null);
const isDraggingFromFolder = ref(false);
const folderModalContent = ref(null);
const folderTitleInputRef = ref(null);

const openFolder = (folder) => {
  activeFolder.value = folder;
};
const focusFolderTitle = () => {
  folderTitleInputRef.value?.focus();
};

const onFolderDragStart = () => {
  isDraggingFromFolder.value = true;
  closeContextMenu();
};

const onFolderDragEnd = async (evt) => {
  isDraggingFromFolder.value = false;

  if (evt.item) {
    evt.item.classList.add("bounce-drop-anim");
    setTimeout(() => evt.item.classList.remove("bounce-drop-anim"), 400);
  }

  if (evt.to === evt.from && folderModalContent.value) {
    const x = evt.originalEvent.clientX;
    const y = evt.originalEvent.clientY;
    const rect = folderModalContent.value.getBoundingClientRect();
    const isOutside =
      x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
    if (isOutside && activeFolder.value) {
      const extractedItem = activeFolder.value.children.splice(
        evt.oldIndex,
        1
      )[0];
      links.value.push(extractedItem);
    }
  }
  await nextTick();
  checkAndDissolveFolder();
  await saveLinks();
};

const closeFolder = async () => {
  checkAndDissolveFolder();
  activeFolder.value = null;
  await saveLinks();
};

const checkAndDissolveFolder = () => {
  if (activeFolder.value && activeFolder.value.children.length <= 1) {
    const folderIdx = links.value.findIndex(
      (l) => l.id === activeFolder.value.id
    );
    if (folderIdx > -1) {
      if (activeFolder.value.children.length === 1) {
        links.value.splice(folderIdx, 1, activeFolder.value.children[0]);
      } else {
        links.value.splice(folderIdx, 1);
      }
    }
    activeFolder.value = null;
  }
};

// ==========================================
// УМНОЕ КОНТЕКСТНОЕ МЕНЮ
// ==========================================
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const idToManage = ref(null);
const contextMenuType = ref("link");

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

const handleContextMenu = (event, element) => {
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  idToManage.value = element.id;
  contextMenuType.value = element.type === "folder" ? "folder" : "link";
  showContextMenu.value = true;
};

const closeContextMenu = () => {
  showContextMenu.value = false;
};

const handleRenameFolderFromMenu = () => {
  const folder = links.value.find((l) => l.id === idToManage.value);
  if (folder) {
    openFolder(folder);
    setTimeout(() => focusFolderTitle(), 300);
  }
  closeContextMenu();
};

const handleUnpackFolderFromMenu = async () => {
  const folderIdx = links.value.findIndex((l) => l.id === idToManage.value);
  if (folderIdx > -1) {
    const folder = links.value[folderIdx];
    links.value.splice(folderIdx, 1, ...folder.children);
    await saveLinks();
  }
  closeContextMenu();
};

// ==========================================
// ОРИГИНАЛЬНАЯ ЛОГИКА
// ==========================================
const showAddModal = ref(false);
const newLinkName = ref("");
const newLinkUrl = ref("");
const isValidating = ref(false);
const validationError = ref("");
const suggestions = ref([]);
const showSuggestions = ref(false);
const isNameManuallyEdited = ref(false);
const handleUrlBlur = () => {
  window.setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};
const handleUrlInput = () => {
  const query = newLinkUrl.value.toLowerCase();
  validationError.value = "";
  if (!isNameManuallyEdited.value)
    newLinkName.value = extractName(newLinkUrl.value);
  if (query.length > 1) {
    suggestions.value = commonSites
      .filter((s) => s.includes(query))
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
  if (!isNameManuallyEdited.value) newLinkName.value = extractName(site);
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
  await addLink(name, formattedUrl);
  newLinkName.value = "";
  newLinkUrl.value = "";
  isNameManuallyEdited.value = false;
  isValidating.value = false;
  showAddModal.value = false;
};
const showEditModal = ref(false);
const editLinkName = ref("");
const editLinkUrl = ref("");
const isEditNameManuallyEdited = ref(false);
const handleEditFromMenu = () => {
  if (idToManage.value) {
    let item = links.value.find((l) => l.id === idToManage.value);
    if (!item && activeFolder.value) {
      item = activeFolder.value.children.find((l) => l.id === idToManage.value);
    }
    if (item) {
      editLinkName.value = item.name;
      editLinkUrl.value = item.url;
      isEditNameManuallyEdited.value = true;
      showEditModal.value = true;
    }
  }
  closeContextMenu();
};
const handleEditUrlInput = () => {
  const query = editLinkUrl.value.toLowerCase();
  validationError.value = "";
  if (!isEditNameManuallyEdited.value)
    editLinkName.value = extractName(editLinkUrl.value);
  if (query.length > 1) {
    suggestions.value = commonSites
      .filter((s) => s.includes(query))
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
  if (!isEditNameManuallyEdited.value) editLinkName.value = extractName(site);
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
  await editItem(idToManage.value, {
    name: editLinkName.value,
    url: formattedUrl,
  });
  editLinkName.value = "";
  editLinkUrl.value = "";
  idToManage.value = null;
  isValidating.value = false;
  showEditModal.value = false;
};
const showDeleteModal = ref(false);
const itemToDelete = computed(() => {
  if (idToManage.value) {
    let item = links.value.find((l) => l.id === idToManage.value);
    if (!item && activeFolder.value)
      item = activeFolder.value.children.find((l) => l.id === idToManage.value);
    return item;
  }
  return null;
});
const handleDeleteFromMenu = () => {
  if (idToManage.value) showDeleteModal.value = true;
  closeContextMenu();
};
const confirmDelete = async () => {
  if (idToManage.value) {
    const mainIdx = links.value.findIndex((l) => l.id === idToManage.value);
    if (mainIdx > -1) {
      await removeItem(idToManage.value);
    } else if (activeFolder.value) {
      const folderIdx = activeFolder.value.children.findIndex(
        (l) => l.id === idToManage.value
      );
      if (folderIdx > -1) {
        activeFolder.value.children.splice(folderIdx, 1);
        checkAndDissolveFolder();
        await saveLinks();
      }
    }
    cancelDelete();
  }
};
const cancelDelete = () => {
  showDeleteModal.value = false;
  idToManage.value = null;
};
</script>

<style scoped>
/* ГЛОБАЛЬНЫЕ СТИЛИ СЕТКИ */
.quick-links-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 1em 2em;
}
.links-grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, 160px);
  grid-auto-rows: 48px;
  gap: 16px;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  position: relative;
  opacity: 1;
  transition: opacity 0.3s ease;
}
.links-grid-layout.loading {
  opacity: 0.5;
  pointer-events: none;
}
.link-item {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
  cursor: grab;
  width: 100%;
  height: 100%;
}
.link-item:active {
  cursor: grabbing;
}

/* КАРТОЧКИ (СВЕТЛЫЙ ФРОСТ) + SPOTLIGHT */
.link-card,
.folder-card,
.add-btn-grid {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}
.add-btn-grid {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

/* Фонарик для ссылок (уменьшен до 60px) */
.link-card::after,
.folder-card::after,
.add-btn-grid::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    60px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.2),
    transparent 100%
  );
}
.link-card:hover::after,
.folder-card:hover::after,
.add-btn-grid:hover::after {
  opacity: 1;
}

.link-card:hover,
.folder-card:hover,
.add-btn-grid:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #1da2fc;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 10px 25px rgba(29, 162, 252, 0.25);
}
.add-btn-grid:hover {
  color: #fff;
}

.link-favicon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
  background: transparent;
  display: block;
}
.link-name-text,
.folder-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}
.folder-grid-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  margin-right: 10px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 6px;
}
.mini-favicon {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* ЭФФЕКТЫ DRAG & DROP И АНИМАЦИИ */
.drop-target-active {
  transform: scale(1.1) !important;
  box-shadow: 0 0 25px rgba(29, 162, 252, 0.7) !important;
  border-radius: 16px;
  z-index: 10;
}
.dragging-ghost {
  opacity: 0.2 !important;
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}
.dragging-ghost .link-card,
.dragging-ghost .folder-card {
  opacity: 0;
}

@keyframes dropBounceAnim {
  0% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
.bounce-drop-anim {
  animation: dropBounceAnim 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* МОДАЛКА ПАПКИ (ZOOM АНИМАЦИЯ iOS) */
.fade-blur-zoom-enter-active,
.fade-blur-zoom-leave-active {
  transition: all 0.3s ease;
}
.fade-blur-zoom-enter-from,
.fade-blur-zoom-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.fade-blur-zoom-enter-active .folder-modal-content {
  animation: modalZoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-blur-zoom-leave-active .folder-modal-content {
  animation: modalZoomOut 0.3s ease forwards;
}

@keyframes modalZoomIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes modalZoomOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}

.folder-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  transition: all 0.3s ease;
}
.folder-modal-overlay.is-dragging-out {
  pointer-events: none;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.folder-modal-content {
  pointer-events: auto;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 30px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ИНПУТ ПАПКИ И КАРАНДАШ */
.folder-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  position: relative;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s;
  padding: 4px;
  border-radius: 8px;
}
.folder-title-wrapper:focus-within {
  border-bottom-color: #1da2fc;
}
.folder-title-input {
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding: 4px 8px;
  width: auto;
  min-width: 150px;
}
.edit-title-icon {
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 6px;
}
.edit-title-icon:hover {
  color: #1da2fc;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}
.folder-inner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 160px);
  grid-auto-rows: 48px;
  gap: 16px;
  justify-content: center;
  width: 100%;
  min-height: 80px;
}

/* СТИЛИ ДЛЯ ВНУТРЕННОСТЕЙ ТВОЕГО MODAL.VUE ЧЕРЕЗ :DEEP() */
:deep(.add-link-form) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
:deep(.url-input-wrapper) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
:deep(.url-input-wrapper label) {
  font-size: 13px;
  color: #aaa;
  margin-left: 4px;
}
:deep(.url-input-wrapper input) {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  padding: 12px 16px;
  outline: none;
  transition: all 0.3s;
  font-family: inherit;
}
:deep(.url-input-wrapper input:focus) {
  border-color: #1da2fc;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(29, 162, 252, 0.15);
}
:deep(.suggestions-list) {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  z-index: 1000;
  backdrop-filter: blur(15px);
  max-height: 160px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  padding: 4px;
}
:deep(.suggestion-item) {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #ddd;
  border-radius: 8px;
  transition: all 0.2s;
}
:deep(.suggestion-item:hover) {
  background: rgba(29, 162, 252, 0.2);
  color: #fff;
}
:deep(.validation-status) {
  font-size: 12px;
  margin-top: 2px;
  margin-left: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
:deep(.validation-status.loading) {
  color: #1da2fc;
}
:deep(.validation-status.error) {
  color: #ff4757;
}
:deep(.delete-text) {
  color: #ccc;
  line-height: 1.5;
  font-size: 15px;
}

/* Кнопки в модалках (Уменьшенный фонарик до 50px) */
:deep(.btn) {
  position: relative;
  overflow: hidden;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-family: inherit;
  backdrop-filter: blur(10px);
}
:deep(.btn::after) {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    50px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.2),
    transparent 100%
  );
}
:deep(.btn:hover::after) {
  opacity: 1;
}
:deep(.btn:hover) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

:deep(.btn-primary) {
  background: rgba(29, 162, 252, 0.2);
  color: #1da2fc;
  border-color: rgba(29, 162, 252, 0.4);
}
:deep(.btn-primary:hover) {
  background: #1da2fc;
  color: #fff;
}
:deep(.btn-danger) {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border-color: rgba(255, 71, 87, 0.4);
}
:deep(.btn-danger:hover) {
  background: #ff4757;
  color: #fff;
}

/* НОВОЕ КРАСИВОЕ КОНТЕКСТНОЕ МЕНЮ */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
.glass-panel {
  background: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(25px) saturate(200%);
  -webkit-backdrop-filter: blur(25px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.context-menu {
  position: fixed;
  border-radius: 12px;
  padding: 6px;
  min-width: 170px;
  z-index: 9999;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: #ddd;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}
.menu-item svg {
  opacity: 0.6;
}
.menu-item:hover {
  background: rgba(29, 162, 252, 0.2);
  color: #fff;
  transform: translateX(2px);
}
.menu-item:hover svg {
  opacity: 1;
  color: #fff;
}
.menu-item.danger:hover {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}
.menu-item.danger:hover svg {
  stroke: #ff4757;
  opacity: 1;
}
</style>