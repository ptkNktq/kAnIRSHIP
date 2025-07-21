// features/inventory/inventoryManager.js

import { allItemDefinitions } from "./item.js"; // item.jsからアイテム定義をインポート

let inventoryData = {
  bagInventory: [],
  shipContainerInventory: [],
  allItemDefinitions: [], // ここは初期化時に設定されるため、空の配列にしておく
  maxItemTypesInBag: 0, // initInventoryで設定される
  maxItemTypesInShipContainer: 49, // 船体コンテナは常に7x7とする
  initialUsableShipContainerSlots: 16, // 新しく追加: 船体コンテナの初期で使えるスロット数（4x4=16を想定）
};

let _inventoryGridElement;
let _availableItemsListElement;
let _itemListTitleElement;
let _inventoryModalContentWrapperElement;
let _displayMessageCallback;

// 新しいグリッド表示用の変数
let _totalBagRows = 0;
let _totalBagCols = 0;
let _initialUsableBagSlots = 0; // 初期で使えるスロット数

/**
 * インベントリシステムを初期化する
 * @param {Object} elements - DOM要素の参照
 * @param {function} displayMessageCallback - メッセージ表示用のコールバック関数
 * @param {number} initialUsableBagSlots - 初期で使えるカバンのスロット数（今回は4x4=16を想定）
 * @param {number} totalBagRows - カバンの表示グリッドの総行数（今回は7を想定）
 * @param {number} totalBagCols - カバンの表示グリッドの総列数（今回は7を想定）
 */
export function initInventory(
  elements,
  displayMessageCallback,
  initialUsableBagSlots,
  totalBagRows,
  totalBagCols
) {
  _inventoryGridElement = elements.inventoryGrid;
  _availableItemsListElement = elements.availableItemsList;
  _itemListTitleElement = elements.itemListTitle;
  _inventoryModalContentWrapperElement = elements.inventoryModalContentWrapper;
  _displayMessageCallback = displayMessageCallback;

  _initialUsableBagSlots = initialUsableBagSlots; // この値は引き続き、使えるスロットの総数として使う
  _totalBagRows = totalBagRows;
  _totalBagCols = totalBagCols;

  // カバンの最大アイテム種類数（使えるスロット数）を設定
  inventoryData.maxItemTypesInBag = initialUsableBagSlots;

  // item.jsからインポートしたアイテム定義をセット
  inventoryData.allItemDefinitions = allItemDefinitions;

  // 初期アイテムを追加
  const fuelTankDef = inventoryData.allItemDefinitions.find(
    (item) => item.id === "fuel_tank"
  );
  if (fuelTankDef) {
    addItemToBag(fuelTankDef, 2);
  }
  const repairKitDef = inventoryData.allItemDefinitions.find(
    (item) => item.id === "repair_kit"
  );
  if (repairKitDef) {
    addItemToBag(repairKitDef, 2);
  }
  const mapDef = inventoryData.allItemDefinitions.find(
    (item) => item.id === "map"
  );
  if (mapDef) {
    addItemToBag(mapDef, 1);
  }

  // 初期アイテム追加後にインベントリの描画を行う
  renderInventoryGrid();
  renderAvailableItems();
}

/**
 * インベントリモーダルの表示/非表示を切り替える
 * @param {boolean} show - trueで表示、falseで非表示
 */
export function toggleInventoryModal(show) {
  if (_inventoryModalContentWrapperElement) {
    if (show) {
      _inventoryModalContentWrapperElement.classList.add("is-open");
      renderInventoryGrid(); // 開くときにグリッドを再描画して最新の状態にする
      renderAvailableItems(); // 利用可能なアイテムリストも更新
    } else {
      _inventoryModalContentWrapperElement.classList.remove("is-open");
    }
  }
}

/**
 * インベントリモーダルが開いているかどうかを返す
 * @returns {boolean}
 */
export function isInventoryOpen() {
  return (
    _inventoryModalContentWrapperElement &&
    _inventoryModalContentWrapperElement.classList.contains("is-open")
  );
}

/**
 * カバンにアイテムを追加する
 * @param {Object} itemDef - アイテム定義
 * @param {number} quantity - 数量
 * @returns {boolean} - 追加に成功したかどうか
 */
export function addItemToBag(itemDef, quantity) {
  // 既存のアイテムを更新
  const existingItem = inventoryData.bagInventory.find(
    (item) => item && item.id === itemDef.id
  ); // itemがnull/undefinedでないことを確認
  if (existingItem) {
    // スタック制限を超えないかチェック
    if (existingItem.quantity + quantity <= itemDef.stackLimit) {
      existingItem.quantity += quantity;
      _displayMessageCallback(
        `${itemDef.name}を${quantity}個手に入れた！(合計: ${existingItem.quantity})`
      );
      return true;
    } else {
      _displayMessageCallback(
        `${itemDef.name}のスタック制限を超えてしまう！(最大: ${itemDef.stackLimit})`
      );
      return false;
    }
  }

  // 新しいアイテムを追加
  // カバンの空きスロットを探す
  // _initialUsableBagSlots の範囲内で空きスロットを探す
  let emptySlotIndex = -1;
  for (let i = 0; i < _initialUsableBagSlots; i++) {
    if (!inventoryData.bagInventory[i]) {
      emptySlotIndex = i;
      break;
    }
  }

  if (emptySlotIndex !== -1) {
    // 空きスロットがある場合、そこに追加
    inventoryData.bagInventory[emptySlotIndex] = {
      ...itemDef,
      quantity: quantity,
    };
    _displayMessageCallback(`${itemDef.name}を${quantity}個手に入れた！`);
    return true;
  } else {
    _displayMessageCallback("カバンがいっぱいで、これ以上アイテムを持てない！");
    return false;
  }
}

/**
 * 船体コンテナにアイテムを追加する
 * @param {Object} itemDef - アイテム定義
 * @param {number} quantity - 数量
 * @returns {boolean} - 追加に成功したかどうか
 */
export function addItemToShipContainer(itemDef, quantity) {
  const existingItem = inventoryData.shipContainerInventory.find(
    (item) => item && item.id === itemDef.id
  );
  if (existingItem) {
    // スタック制限を超えないかチェック
    if (existingItem.quantity + quantity <= itemDef.stackLimit) {
      existingItem.quantity += quantity;
      _displayMessageCallback(
        `${itemDef.name}を${quantity}個船体コンテナに入れた！(合計: ${existingItem.quantity})`
      );
      return true;
    } else {
      _displayMessageCallback(
        `${item.name}のスタック制限を超えてしまう！(最大: ${item.stackLimit})`
      );
      return false;
    }
  }

  // 船体コンテナの空きスロットを探す
  let emptySlotIndex = -1;
  for (let i = 0; i < inventoryData.maxItemTypesInShipContainer; i++) {
    if (!inventoryData.shipContainerInventory[i]) {
      emptySlotIndex = i;
      break;
    }
  }

  if (emptySlotIndex !== -1) {
    inventoryData.shipContainerInventory[emptySlotIndex] = {
      ...itemDef,
      quantity: quantity,
    };
    _displayMessageCallback(
      `${itemDef.name}を${quantity}個船体コンテナに入れた！`
    );
    return true;
  } else {
    _displayMessageCallback(
      "船体コンテナがいっぱいで、これ以上アイテムを置けない！"
    );
    return false;
  }
}

/**
 * カバンからアイテムを削除する
 * @param {string} itemId - 削除するアイテムのID
 * @param {number} quantity - 削除する数量
 * @returns {boolean} - 削除に成功したかどうか
 */
export function removeItemFromBag(itemId, quantity) {
  const itemIndex = inventoryData.bagInventory.findIndex(
    (item) => item && item.id === itemId
  );
  if (itemIndex !== -1) {
    if (inventoryData.bagInventory[itemIndex].quantity > quantity) {
      inventoryData.bagInventory[itemIndex].quantity -= quantity;
      _displayMessageCallback(
        `${inventoryData.bagInventory[itemIndex].name}を${quantity}個使った。`
      );
    } else {
      const removedItemName = inventoryData.bagInventory[itemIndex].name;
      inventoryData.bagInventory.splice(itemIndex, 1); // アイテムを完全に削除
      _displayMessageCallback(`${removedItemName}を使い切った。`);
    }
    renderInventoryGrid();
    return true;
  }
  _displayMessageCallback("指定されたアイテムはカバンにありません。");
  return false;
}

/**
 * 船体コンテナからアイテムを削除する
 * @param {string} itemId - 削除するアイテムのID
 * @param {number} quantity - 削除する数量
 * @returns {boolean} - 削除に成功したかどうか
 */
export function removeItemFromShipContainer(itemId, quantity) {
  const itemIndex = inventoryData.shipContainerInventory.findIndex(
    (item) => item && item.id === itemId
  );
  if (itemIndex !== -1) {
    if (inventoryData.shipContainerInventory[itemIndex].quantity > quantity) {
      inventoryData.shipContainerInventory[itemIndex].quantity -= quantity;
      _displayMessageCallback(
        `${inventoryData.shipContainerInventory[itemIndex].name}を${quantity}個取り出した。`
      );
    } else {
      const removedItemName =
        inventoryData.shipContainerInventory[itemIndex].name;
      inventoryData.shipContainerInventory.splice(itemIndex, 1); // アイテムを完全に削除
      _displayMessageCallback(`${removedItemName}を全て取り出した。`);
    }
    renderInventoryGrid();
    return true;
  }
  _displayMessageCallback("指定されたアイテムは船体コンテナにありません。");
  return false;
}

/**
 * カバン内のユニークなアイテム種類の数を返す
 * @returns {number}
 */
export function getUniqueItemTypesCountInBag() {
  return inventoryData.bagInventory.filter(
    (item) => item !== null && item !== undefined
  ).length;
}

/**
 * インベントリグリッドを描画する
 */
function renderInventoryGrid() {
  if (!_inventoryGridElement) {
    console.error("Inventory grid element not found.");
    return;
  }
  _inventoryGridElement.innerHTML = ""; // 既存のセルをクリア

  // グリッドの列数を設定
  _inventoryGridElement.style.gridTemplateColumns = `repeat(${_totalBagCols}, 1fr)`;

  // ここは常に船体コンテナを描画するロジック
  // _inventoryGridElement.id === "inventoryGrid" は、この関数が船体コンテナのDOM要素を操作していることを示唆
  let inventoryToRender = inventoryData.shipContainerInventory;
  let maxSlots = inventoryData.maxItemTypesInShipContainer;

  for (let i = 0; i < maxSlots; i++) {
    const cell = document.createElement("div");
    cell.classList.add("inventory-cell");

    // 船体コンテナの初期制約を適用 (4x4の範囲)
    const row = Math.floor(i / _totalBagCols); // _totalBagCols (7) を使って列を計算
    const col = i % _totalBagCols;

    if (row < 4 && col < 4) {
      // 4x4の範囲内であればusable
      cell.dataset.usable = "true";
    } else {
      cell.classList.add("unusable-cell");
      cell.dataset.usable = "false";
    }

    const item = inventoryToRender[i]; // 描画するインベントリからアイテムを取得
    if (item) {
      // item.imageUrl が存在すれば画像を表示、なければテキスト
      if (item.imageUrl) {
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.name;
        img.classList.add("item-image");
        cell.appendChild(img);
      }
      const nameText = document.createElement("span");
      nameText.textContent = `${item.name} (${item.size.width}x${item.size.height})`; // サイズを追加
      nameText.classList.add("item-name");
      cell.appendChild(nameText);

      const quantityText = document.createElement("span");
      quantityText.textContent = `x${item.quantity}`;
      quantityText.classList.add("item-quantity");
      cell.appendChild(quantityText);

      cell.dataset.itemId = item.id; // アイテムIDをデータ属性として保存
      cell.dataset.itemQuantity = item.quantity;
      cell.dataset.itemType = item.type; // アイテムタイプをデータ属性として保存
    } else {
      cell.textContent = ""; // 空のセル
      cell.dataset.itemId = "";
      cell.dataset.itemQuantity = 0;
      cell.dataset.itemType = "";
    }

    // クリックイベントリスナーを追加
    cell.addEventListener("click", (event) => {
      // 使えないスロットで、かつアイテムがない場合はメッセージを表示して何もしない
      if (cell.dataset.usable === "false" && !item) {
        _displayMessageCallback("このスロットはまだロックされています。");
        return;
      }

      // アイテムがある場合は、そのアイテムの情報を表示する
      if (item) {
        _displayMessageCallback(
          `${item.name} (${item.description}) - 数量: ${item.quantity}`
        );
        // ここでアイテム使用などの追加アクションを実装することも可能
      } else {
        _displayMessageCallback("このスロットは空です。");
      }
    });

    _inventoryGridElement.appendChild(cell);
  }
}

/**
 * 利用可能なアイテムリスト（カバン）を描画する
 */
function renderAvailableItems() {
  if (!_availableItemsListElement) {
    console.error("Available items list element not found.");
    return;
  }
  _availableItemsListElement.innerHTML = ""; // 既存のアイテムをクリア

  // カバンの中身を描画
  inventoryData.bagInventory.forEach((item) => {
    // bagInventoryを参照
    if (item) {
      // nullやundefinedの要素はスキップ
      const listItem = document.createElement("li");
      listItem.classList.add("inventory-list-item"); // スタイル用のクラスを追加

      const itemText = document.createElement("span");
      itemText.textContent = `${item.name} (${item.size.width}x${item.size.height}) x${item.quantity}`; // サイズを追加
      listItem.appendChild(itemText);

      listItem.dataset.itemId = item.id; // データ属性にIDを保存

      // クリックでアイテム情報を表示する機能
      listItem.addEventListener("click", () => {
        _displayMessageCallback(
          `${item.name} (${item.description}) - 数量: ${item.quantity}`
        );
        // ここでアイテム使用などの追加アクションを実装することも可能
      });
      _availableItemsListElement.appendChild(listItem);
    }
  });
}
