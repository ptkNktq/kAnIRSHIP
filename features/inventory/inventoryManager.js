// features/inventory/inventoryManager.js

// Inventory-specific DOM elements (will be initialized via init function)
let _inventoryGrid;
let _availableItemsList;
let _itemListTitle;
let _inventoryModalContentWrapper;
// let _modalOverlay; // This is now managed by game.js's toggleModal
let _displayMessageCallback; // Callback to game.js's displayMessage

// Inventory constants
const inventoryRows = 4;
const inventoryCols = 4;
const maxItemTypesInBag = 6;

// All item definitions (master list)
const allItemDefinitions = [
  { name: "修理キット", size: { width: 3, height: 3 }, stackLimit: 5 },
  { name: "燃料タンク", size: { width: 3, height: 3 }, stackLimit: 10 },
  { name: "食料パック", size: { width: 2, height: 2 }, stackLimit: 20 },
  { name: "地図", size: { width: 1, height: 1 }, stackLimit: 1 },
  { name: "望遠鏡", size: { width: 1, height: 1 }, stackLimit: 1 },
  { name: "ロープ", size: { width: 2, height: 1 }, stackLimit: 10 },
  { name: "懐中電灯", size: { width: 1, height: 1 }, stackLimit: 1 },
  { name: "水筒", size: { width: 1, height: 1 }, stackLimit: 5 },
  { name: "予備の部品", size: { width: 2, height: 2 }, stackLimit: 10 },
  { name: "コンパス", size: { width: 1, height: 1 }, stackLimit: 1 },
];

// Player's inventory data
let bagInventory = [
  {
    name: "修理キット",
    quantity: 3,
    stackLimit: 5,
    size: { width: 3, height: 3 },
  },
  {
    name: "燃料タンク",
    quantity: 3,
    stackLimit: 10,
    size: { width: 3, height: 3 },
  },
];
let shipContainerInventory = [];

/**
 * Initializes the inventory manager with necessary DOM elements and callbacks.
 * This should be called once on window.onload.
 * @param {Object} elements - Object containing DOM element references.
 * @param {Function} displayMessageFn - Callback function for displaying messages in the game log.
 */
export function initInventory(elements, displayMessageFn) {
  _inventoryGrid = elements.inventoryGrid;
  _availableItemsList = elements.availableItemsList;
  _itemListTitle = elements.itemListTitle;
  _inventoryModalContentWrapper = elements.inventoryModalContentWrapper;
  // _modalOverlay = elements.modalOverlay; // No longer needed here
  _displayMessageCallback = displayMessageFn;

  // Initial setup
  createInventoryCells();
  updateBagDisplay();
  updateShipContainerDisplay();
}

/**
 * Displays a message in the game log (using the callback).
 * @param {string} message - The message to display.
 */
function displayMessage(message) {
  if (_displayMessageCallback) {
    _displayMessageCallback(message);
  } else {
    console.warn("displayMessage callback not set in inventoryManager.");
  }
}

/**
 * Creates inventory cells dynamically.
 */
function createInventoryCells() {
  _inventoryGrid.innerHTML = "";
  for (let i = 0; i < inventoryRows * inventoryCols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("inventory-cell");
    _inventoryGrid.appendChild(cell);
  }
}

/**
 * Updates the display of items in the player's bag.
 */
export function updateBagDisplay() {
  _availableItemsList.innerHTML = "";

  bagInventory.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<span>${item.name}</span><span class="item-quantity">x${item.quantity}</span>`;
    listItem.addEventListener("click", () => {
      displayMessage(`${item.name} をカバンから選択しました。`);
      // TODO: Add logic for item usage/transfer
    });
    _availableItemsList.appendChild(listItem);
  });

  const currentUniqueTypes = getUniqueItemTypesCountInBag();
  _itemListTitle.innerHTML = `カバン (${currentUniqueTypes}/${maxItemTypesInBag})<span class="inventory-open-key">(E)</span>`;
}

/**
 * Updates the display of items in the ship's container.
 */
export function updateShipContainerDisplay() {
  const cells = _inventoryGrid.querySelectorAll(".inventory-cell");
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.style.backgroundColor = "#2c3e50";
  });

  shipContainerInventory.forEach((item, index) => {
    if (cells[index]) {
      cells[
        index
      ].innerHTML = `<span>${item.name}</span><span class="item-quantity">x${item.quantity}</span>`;
      cells[index].style.backgroundColor = "#4a627a";
      cells[index].addEventListener("click", () => {
        displayMessage(`${item.name} を船体コンテナから選択しました。`);
        // TODO: Add logic for item usage/transfer
      });
    }
  });
}

/**
 * Adds an item to the player's bag.
 * @param {Object} itemDefinition - The item definition (name, stackLimit, size).
 * @param {number} quantityToAdd - The quantity to add.
 * @returns {boolean} - True if successful, false otherwise.
 */
export function addItemToBag(itemDefinition, quantityToAdd) {
  const existingItem = bagInventory.find(
    (item) => item.name === itemDefinition.name
  );

  if (existingItem) {
    if (existingItem.quantity + quantityToAdd <= existingItem.stackLimit) {
      existingItem.quantity += quantityToAdd;
      updateBagDisplay();
      return true;
    } else {
      displayMessage(`${itemDefinition.name} のスタック上限に達しています。`);
      return false;
    }
  } else {
    if (getUniqueItemTypesCountInBag() < maxItemTypesInBag) {
      bagInventory.push({
        name: itemDefinition.name,
        quantity: quantityToAdd,
        stackLimit: itemDefinition.stackLimit,
        size: itemDefinition.size,
      });
      updateBagDisplay();
      return true;
    } else {
      displayMessage("カバンがアイテムの種類数上限に達しています。");
      return false;
    }
  }
}

/**
 * Adds an item to the ship's container.
 * @param {Object} itemDefinition - The item definition (name, stackLimit, size).
 * @param {number} quantityToAdd - The quantity to add.
 * @returns {boolean} - True if successful, false otherwise.
 */
export function addItemToShipContainer(itemDefinition, quantityToAdd) {
  const existingItem = shipContainerInventory.find(
    (item) => item.name === itemDefinition.name
  );

  if (existingItem) {
    if (existingItem.quantity + quantityToAdd <= existingItem.stackLimit) {
      existingItem.quantity += quantityToAdd;
      updateShipContainerDisplay();
      return true;
    } else {
      displayMessage(
        `${itemDefinition.name} のスタック上限に達しています。（船体コンテナ）`
      );
      return false;
    }
  } else {
    shipContainerInventory.push({
      name: itemDefinition.name,
      quantity: quantityToAdd,
      stackLimit: itemDefinition.stackLimit,
      size: itemDefinition.size,
    });
    updateShipContainerDisplay();
    return true;
  }
}

/**
 * Returns the count of unique item types in the player's bag.
 * @returns {number}
 */
export function getUniqueItemTypesCountInBag() {
  return bagInventory.length;
}

/**
 * Toggles the visibility of the inventory modal.
 * This function is specifically for the inventory modal and handles its state.
 * @param {boolean} [forceState=null] - If true, forces open. If false, forces close. If null, toggles current state.
 * Note: This function only manages the modal's 'is-open' class, not the overlay.
 */
export function toggleInventoryModal(forceState = null) {
  const isOpen = _inventoryModalContentWrapper.classList.contains("is-open");

  if (forceState === true || (forceState === null && !isOpen)) {
    // Open
    _inventoryModalContentWrapper.classList.add("is-open");
    if (_inventoryGrid.children.length === 0) {
      createInventoryCells();
    }
    updateBagDisplay();
    updateShipContainerDisplay();
  } else if (forceState === false || (forceState === null && isOpen)) {
    // Close
    _inventoryModalContentWrapper.classList.remove("is-open");
  }
}

/**
 * Returns true if the inventory modal is currently open.
 * @returns {boolean}
 */
export function isInventoryOpen() {
  return _inventoryModalContentWrapper.classList.contains("is-open");
}

// Expose inventory data for gameContext if needed (read-only access)
export const inventoryData = {
  get bagInventory() {
    return bagInventory;
  },
  get shipContainerInventory() {
    return shipContainerInventory;
  },
  get allItemDefinitions() {
    return allItemDefinitions;
  },
  get maxItemTypesInBag() {
    return maxItemTypesInBag;
  },
};
