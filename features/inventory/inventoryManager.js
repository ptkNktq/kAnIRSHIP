// features/inventory/inventoryManager.js

let inventoryData = {
  bagInventory: [],
  shipContainerInventory: [],
  allItemDefinitions: [], // この定義はgame.jsから渡されることを想定
  maxItemTypesInBag: 0, // initInventoryで設定される
  maxItemTypesInShipContainer: 49, // 船体コンテナは常に7x7とする
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

  // 仮のアイテム定義（実際はgame.jsから渡されるか、別のデータファイルからロードされる）
  inventoryData.allItemDefinitions = [
    {
      id: "fuel_tank",
      name: "燃料タンク",
      description: "飛行船の燃料を補給する。",
      type: "consumable",
    },
    {
      id: "repair_kit",
      name: "修理キット",
      description: "飛行船の損傷を修理する。",
      type: "consumable",
    },
    {
      id: "scrap_metal",
      name: "スクラップ金属",
      description: "ガラクタの金属。何かに使えるかも？",
      type: "material",
    },
    {
      id: "rare_gem",
      name: "レアな宝石",
      description: "非常に珍しい輝く宝石。高値で売れる。",
      type: "valuable",
    },
    {
      id: "compass",
      name: "方位磁石",
      description: "方角を示す。",
      type: "tool",
    },
    {
      id: "map",
      name: "地図",
      description: "周辺の地形が描かれた地図。",
      type: "tool",
    },
    {
      id: "old_book",
      name: "古びた本",
      description: "読めない文字で書かれている。",
      type: "misc",
    },
    {
      id: "empty_bottle",
      name: "空き瓶",
      description: "何かに使えるかもしれない空の瓶。",
      type: "misc",
    },
    {
      id: "rope",
      name: "ロープ",
      description: "丈夫なロープ。",
      type: "material",
    },
    {
      id: "cloth",
      name: "布",
      description: "使い古された布。",
      type: "material",
    },
    { id: "gear", name: "歯車", description: "機械の部品。", type: "material" },
    {
      id: "spring",
      name: "バネ",
      description: "弾力性のあるバネ。",
      type: "material",
    },
    {
      id: "wire",
      name: "ワイヤー",
      description: "細い金属線。",
      type: "material",
    },
    {
      id: "battery",
      name: "バッテリー",
      description: "電力を供給する。",
      type: "consumable",
    },
    {
      id: "medicine",
      name: "薬",
      description: "体力を回復する。",
      type: "consumable",
    },
    {
      id: "food_ration",
      name: "食料",
      description: "空腹を満たす。",
      type: "consumable",
    },
    {
      id: "water_bottle",
      name: "水筒",
      description: "水を運ぶための容器。",
      type: "consumable",
    },
  ];

  // 初期インベントリの描画
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
    (item) => item.id === itemDef.id
  );
  if (existingItem) {
    existingItem.quantity += quantity;
    _displayMessageCallback(
      `${itemDef.name}を${quantity}個手に入れた！(合計: ${existingItem.quantity})`
    );
    renderInventoryGrid();
    return true;
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
    renderInventoryGrid();
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
    (item) => item.id === itemDef.id
  );
  if (existingItem) {
    existingItem.quantity += quantity;
    _displayMessageCallback(
      `${itemDef.name}を${quantity}個船体コンテナに入れた！(合計: ${existingItem.quantity})`
    );
    renderInventoryGrid();
    return true;
  }

  const emptySlotIndex = inventoryData.shipContainerInventory.findIndex(
    (item) => item === null || item === undefined
  );

  if (
    emptySlotIndex !== -1 &&
    emptySlotIndex < inventoryData.maxItemTypesInShipContainer
  ) {
    inventoryData.shipContainerInventory[emptySlotIndex] = {
      ...itemDef,
      quantity: quantity,
    };
    _displayMessageCallback(
      `${itemDef.name}を${quantity}個船体コンテナに入れた！`
    );
    renderInventoryGrid();
    return true;
  } else if (
    inventoryData.shipContainerInventory.length <
    inventoryData.maxItemTypesInShipContainer
  ) {
    inventoryData.shipContainerInventory.push({
      ...itemDef,
      quantity: quantity,
    });
    _displayMessageCallback(
      `${itemDef.name}を${quantity}個船体コンテナに入れた！`
    );
    renderInventoryGrid();
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

  const totalCells = _totalBagRows * _totalBagCols;
  const usableRows = Math.floor(_initialUsableBagSlots / _totalBagCols); // 使える行数（4x4なら4）
  const usableCols = _initialUsableBagSlots % _totalBagCols; // 使える列数（4x4なら4）

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("inventory-cell");

    const row = Math.floor(i / _totalBagCols);
    const col = i % _totalBagCols;

    // 4x4の範囲内かどうかで usable-cell クラスを適用
    // rowが4未満 AND colが4未満の場合にusableとする
    if (row < 4 && col < 4) {
      // ここで4x4の範囲を指定したわ！
      cell.dataset.usable = "true";
    } else {
      cell.classList.add("unusable-cell");
      cell.dataset.usable = "false";
    }

    const item = inventoryData.bagInventory[i];
    if (item) {
      cell.textContent = `${item.name} x${item.quantity}`;
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
 * 利用可能なアイテムリストを描画する
 */
function renderAvailableItems() {
  if (!_availableItemsListElement) {
    console.error("Available items list element not found.");
    return;
  }
  _availableItemsListElement.innerHTML = ""; // 既存のアイテムをクリア

  inventoryData.allItemDefinitions.forEach((itemDef) => {
    const listItem = document.createElement("li");
    listItem.textContent = itemDef.name;
    listItem.dataset.itemId = itemDef.id; // データ属性にIDを保存

    // クリックでアイテムをカバンに追加する機能（テスト用）
    listItem.addEventListener("click", () => {
      addItemToBag(itemDef, 1); // 1個追加
    });
    _availableItemsListElement.appendChild(listItem);
  });
}
