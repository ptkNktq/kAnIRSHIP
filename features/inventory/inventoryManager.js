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

// ドラッグ中のアイテム情報を保持するグローバル変数
let draggedItemInfo = null;

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

  _totalBagRows = totalBagRows; // グリッドの総行数 (7)
  _totalBagCols = totalBagCols; // グリッドの総列数 (7)

  _initialUsableBagSlots = initialUsableBagSlots; // カバンの初期で使えるスロット数 (16)

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

  // ドロップターゲットイベントリスナーを設定
  // グリッド全体へのイベントリスナーは、セルにドロップされなかった場合のフォールバックとして残す
  _inventoryGridElement.addEventListener("dragover", handleDragOver);
  _inventoryGridElement.addEventListener("dragleave", handleDragLeave);
  _inventoryGridElement.addEventListener("drop", handleDrop);

  _availableItemsListElement.addEventListener("dragover", handleDragOver);
  _availableItemsListElement.addEventListener("dragleave", handleDragLeave);
  _availableItemsListElement.addEventListener("drop", handleDrop);
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
 * @param {number} [targetIndex = -1] - アイテムを追加する特定のインデックス。-1の場合は空きスロットを自動で探す。
 * @returns {boolean} - 追加に成功したかどうか
 */
export function addItemToShipContainer(itemDef, quantity, targetIndex = -1) {
  // 既存のアイテムへのスタックを試みる（サイズに関わらず）
  const existingStackableItem = inventoryData.shipContainerInventory.find(
    (item) =>
      item &&
      typeof item === "object" &&
      item.id === itemDef.id &&
      item.quantity < itemDef.stackLimit
  );
  if (existingStackableItem) {
    const spaceLeft =
      existingStackableItem.stackLimit - existingStackableItem.quantity;
    const quantityToAdd = Math.min(quantity, spaceLeft);
    if (quantityToAdd > 0) {
      existingStackableItem.quantity += quantityToAdd;
      _displayMessageCallback(
        `${itemDef.name}を${quantityToAdd}個船体コンテナに入れた！(合計: ${existingStackableItem.quantity})`
      );
      return true; // スタック成功
    }
  }

  const itemWidth = itemDef.size.width;
  const itemHeight = itemDef.size.height;

  let finalPlacementIndex = -1;

  // targetIndexが指定されている場合、その位置に配置を試みる
  if (targetIndex !== -1) {
    if (checkSpaceAvailability(targetIndex, itemWidth, itemHeight)) {
      finalPlacementIndex = targetIndex;
    } else {
      _displayMessageCallback(
        "指定された場所にアイテムを置くことができません。"
      );
      return false;
    }
  } else {
    // targetIndexが指定されていない場合、最初の空きスペースを探す
    for (let i = 0; i < inventoryData.initialUsableShipContainerSlots; i++) {
      if (checkSpaceAvailability(i, itemWidth, itemHeight)) {
        finalPlacementIndex = i;
        break;
      }
    }
  }

  if (finalPlacementIndex !== -1) {
    // アイテムを最終的な配置インデックスに置く
    inventoryData.shipContainerInventory[finalPlacementIndex] = {
      ...itemDef,
      quantity: quantity,
    };
    // アイテムが占有する他のセルにマーカーを設定
    const startRow = Math.floor(finalPlacementIndex / _totalBagCols);
    const startCol = finalPlacementIndex % _totalBagCols;
    for (let r = 0; r < itemHeight; r++) {
      for (let c = 0; c < itemWidth; c++) {
        if (r === 0 && c === 0) continue; // 左上セルはスキップ

        const occupiedFlatIndex =
          (startRow + r) * _totalBagCols + (startCol + c);
        if (occupiedFlatIndex < inventoryData.maxItemTypesInShipContainer) {
          // このセルが、どのアイテムのどの開始インデックスによって占有されているかを示すマーカー
          inventoryData.shipContainerInventory[
            occupiedFlatIndex
          ] = `__OCCUPIED_BY_${finalPlacementIndex}__`;
        }
      }
    }

    _displayMessageCallback(
      `${itemDef.name}を${quantity}個船体コンテナに入れた！`
    );
    return true;
  } else {
    _displayMessageCallback(
      "船体コンテナに空きがないため、これ以上アイテムを置けない！"
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
      inventoryData.bagInventory[itemIndex] = null; // nullを設定してスロットを空ける
      _displayMessageCallback(`${removedItemName}を使い切った。`);
    }
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
  // アイテムオブジェクトが格納されているインデックスを探す
  const itemIndex = inventoryData.shipContainerInventory.findIndex(
    (item) => item && typeof item === "object" && item.id === itemId
  );
  if (itemIndex !== -1) {
    const itemToRemove = inventoryData.shipContainerInventory[itemIndex];
    const itemDef = allItemDefinitions.find(
      (def) => def && def.id === itemToRemove.id
    ); // defがnullでないことを確認
    if (!itemDef) {
      _displayMessageCallback("アイテム定義が見つかりません。");
      return false;
    }

    if (itemToRemove.quantity > quantity) {
      itemToRemove.quantity -= quantity;
      _displayMessageCallback(
        `${itemToRemove.name}を${quantity}個取り出した。`
      );
    } else {
      const removedItemName = itemToRemove.name;
      // アイテムが占有していた全てのセルをクリア
      const startRow = Math.floor(itemIndex / _totalBagCols);
      const startCol = itemIndex % _totalBagCols;
      for (let r = 0; r < itemDef.size.height; r++) {
        for (let c = 0; c < itemDef.size.width; c++) {
          const occupiedFlatIndex =
            (startRow + r) * _totalBagCols + (startCol + c);
          if (occupiedFlatIndex < inventoryData.maxItemTypesInShipContainer) {
            inventoryData.shipContainerInventory[occupiedFlatIndex] = null; // 全てnullにする
          }
        }
      }
      _displayMessageCallback(`${removedItemName}を全て取り出した。`);
    }
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
 * インベントリグリッド（船体コンテナ）を描画する
 */
function renderInventoryGrid() {
  if (!_inventoryGridElement) {
    console.error("Inventory grid element not found.");
    return;
  }
  _inventoryGridElement.innerHTML = ""; // 既存のセルをクリア

  // グリッドの列数を設定
  _inventoryGridElement.style.gridTemplateColumns = `repeat(${_totalBagCols}, 1fr)`;

  // 船体コンテナの全てのセルを走査して描画
  for (let i = 0; i < inventoryData.maxItemTypesInShipContainer; i++) {
    const item = inventoryData.shipContainerInventory[i];
    const row = Math.floor(i / _totalBagCols);
    const col = i % _totalBagCols;

    const cell = document.createElement("div");
    cell.classList.add("inventory-cell");
    cell.dataset.itemIndex = i; // セル自身のインデックスをデータ属性として保存

    // 使用可能/使用不可のスタイルを適用 (4x4の制約)
    if (row < 4 && col < 4) {
      cell.dataset.usable = "true";
    } else {
      cell.classList.add("unusable-cell");
      cell.dataset.usable = "false";
    }

    if (item && typeof item === "object") {
      // アイテムオブジェクトが格納されている場合（アイテムの左上セル）
      const itemDef = allItemDefinitions.find(
        (def) => def && def.id === item.id
      ); // defがnullでないことを確認
      if (!itemDef) {
        console.error(`アイテム定義が見つかりません: ${item.id}`);
        continue;
      }

      // アイテムのサイズに合わせてグリッドセルを結合
      cell.style.gridColumn = `${col + 1} / span ${itemDef.size.width}`;
      cell.style.gridRow = `${row + 1} / span ${itemDef.size.height}`;

      // ドラッグ可能に設定
      cell.draggable = true;
      cell.dataset.itemId = item.id;
      cell.dataset.itemQuantity = item.quantity;
      cell.dataset.itemType = item.type;
      cell.dataset.sourceInventory = "shipContainer";
      cell.dataset.itemIndex = i; // アイテムの開始インデックスを保存

      cell.addEventListener("dragstart", handleDragStart);

      // アイテム名を表示 (画像の上に配置)
      const nameText = document.createElement("span");
      nameText.textContent = `${item.name}`; // サイズ情報を削除
      nameText.classList.add("item-name");
      cell.appendChild(nameText); // 名前を最初に追加

      // アイテムの画像を表示
      if (item.imageUrl) {
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.name;
        img.classList.add("item-image");
        cell.appendChild(img); // 画像を名前の次に追加
      }

      // 数量を表示
      const quantityText = document.createElement("span");
      quantityText.textContent = `x${item.quantity}`;
      quantityText.classList.add("item-quantity");
      cell.appendChild(quantityText);
    } else if (typeof item === "string" && item.startsWith("__OCCUPIED_BY_")) {
      // このセルが他のアイテムによって占有されている場合、非表示にする
      cell.style.display = "none";
      cell.draggable = false; // ドラッグ不可
      cell.dataset.usable = "false"; // ドロップ不可
    } else {
      // 空のセル
      cell.textContent = "";
      cell.dataset.itemId = "";
      cell.dataset.itemQuantity = 0;
      cell.dataset.itemType = "";
      cell.draggable = false; // ドラッグ不可
    }

    // 全てのセルにドロップイベントリスナーを追加（空のセルもドロップターゲットになり得るため）
    cell.addEventListener("dragover", handleDragOver);
    cell.addEventListener("dragleave", handleDragLeave);
    cell.addEventListener("drop", handleDrop);
    // ここにイベント伝播を停止する処理を追加
    cell.addEventListener("drop", (e) => {
      e.stopPropagation(); // 親要素へのイベント伝播を停止
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
  inventoryData.bagInventory.forEach((item, index) => {
    // bagInventoryを参照
    if (item) {
      // nullやundefinedの要素はスキップ
      const listItem = document.createElement("li");
      listItem.classList.add("inventory-list-item"); // スタイル用のクラスを追加
      listItem.draggable = true; // アイテムがある場合はドラッグ可能にする
      listItem.dataset.itemId = item.id;
      listItem.dataset.itemQuantity = item.quantity;
      listItem.dataset.itemType = item.type;
      listItem.dataset.sourceInventory = "bag"; // ドラッグ元を示す
      listItem.dataset.itemIndex = index; // アイテムのインデックスを保存

      // ドラッグ開始イベントリスナー
      listItem.addEventListener("dragstart", handleDragStart);

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

/**
 * ドラッグ開始時の処理
 * @param {Event} event - DragEventオブジェクト
 */
function handleDragStart(event) {
  const cellElement = event.target.closest(".inventory-cell"); // 親のセル要素を取得
  if (!cellElement) {
    // カバンからのドラッグの場合、listItem自体がターゲットになる
    const listItemElement = event.target.closest(".inventory-list-item");
    if (!listItemElement) {
      console.error(
        "Drag started on an element not within an inventory cell or list item."
      );
      return;
    }
    // カバンからのドラッグ情報
    draggedItemInfo = {
      itemId: listItemElement.dataset.itemId,
      quantity: parseInt(listItemElement.dataset.itemQuantity, 10),
      sourceInventory: listItemElement.dataset.sourceInventory,
      itemIndex: parseInt(listItemElement.dataset.itemIndex, 10),
    };
  } else {
    // 船体コンテナからのドラッグ情報
    draggedItemInfo = {
      itemId: cellElement.dataset.itemId,
      quantity: parseInt(cellElement.dataset.itemQuantity, 10),
      sourceInventory: cellElement.dataset.sourceInventory,
      itemIndex: parseInt(cellElement.dataset.itemIndex, 10),
    };
  }

  event.dataTransfer.setData(
    "application/json",
    JSON.stringify(draggedItemInfo)
  );
  event.dataTransfer.effectAllowed = "move"; // 移動を許可する
}

/**
 * ヘルパー関数: 指定された開始インデックスからアイテムを配置できるかチェックする
 * @param {number} startIndex - チェックを開始するフラットインデックス
 * @param {number} itemWidth - アイテムの幅
 * @param {number} itemHeight - アイテムの高さ
 * @param {number} [excludeIndex = -1] - チェックから除外するインデックス（D&Dでの移動元など）
 * @returns {boolean} - 配置可能であればtrue
 */
const checkSpaceAvailability = (
  startIndex,
  itemWidth,
  itemHeight,
  excludeIndex = -1
) => {
  const startRow = Math.floor(startIndex / _totalBagCols);
  const startCol = startIndex % _totalBagCols;

  // アイテムが4x4の使用可能エリアの境界を越えないかチェック
  if (startRow + itemHeight > 4 || startCol + itemWidth > 4) {
    return false;
  }

  for (let r = 0; r < itemHeight; r++) {
    for (let c = 0; c < itemWidth; c++) {
      const checkRow = startRow + r;
      const checkCol = startCol + c;
      const checkFlatIndex = checkRow * _totalBagCols + checkCol;

      // 全体グリッドの範囲外の場合
      if (checkRow >= _totalBagRows || checkCol >= _totalBagCols) {
        return false;
      }

      const cellContent = inventoryData.shipContainerInventory[checkFlatIndex];
      if (cellContent !== null && cellContent !== undefined) {
        // チェック中のセルが、除外インデックス（移動元）自身、またはその占有マーカーであればOK
        if (
          checkFlatIndex === excludeIndex ||
          (typeof cellContent === "string" &&
            cellContent.startsWith("__OCCUPIED_BY_") &&
            parseInt(cellContent.split("_")[2]) === excludeIndex)
        ) {
          continue;
        }
        return false; // 他のアイテムまたは占有マーカーが存在する
      }
    }
  }
  return true; // 全てのチェックをパス
};

/**
 * ドラッグ中の要素がドロップターゲットの上にあるときの処理
 * @param {Event} event - DragEventオブジェクト
 */
function handleDragOver(event) {
  event.preventDefault(); // デフォルトの処理（ドロップを許可しない）をキャンセル
  event.dataTransfer.dropEffect = "move"; // カーソルを移動アイコンにする

  // 全てのハイライトを一度クリア
  document.querySelectorAll(".highlight-cell").forEach((cell) => {
    cell.classList.remove("highlight-cell");
  });
  document.querySelectorAll(".cannot-drop-highlight").forEach((cell) => {
    cell.classList.remove("cannot-drop-highlight");
  });

  const targetElement =
    event.target.closest(".inventory-cell") || event.currentTarget;

  if (
    draggedItemInfo &&
    targetElement &&
    (targetElement.id === "inventoryGrid" ||
      targetElement.classList.contains("inventory-cell"))
  ) {
    const itemDef = allItemDefinitions.find(
      (def) => def && def.id === draggedItemInfo.itemId
    ); // defがnullでないことを確認
    if (!itemDef) return;

    let potentialTargetIndex = parseInt(targetElement.dataset.itemIndex, 10);
    if (isNaN(potentialTargetIndex)) {
      // グリッドの隙間にドロップされた場合
      // ドロップされた座標から最も近いセルを特定するロジックが必要だが、
      // 今回は簡略化のため、イベントターゲットがセルでなければハイライトしない
      return;
    }

    const excludeIndex =
      draggedItemInfo.sourceInventory === "shipContainer"
        ? draggedItemInfo.itemIndex
        : -1;

    if (
      checkSpaceAvailability(
        potentialTargetIndex,
        itemDef.size.width,
        itemDef.size.height,
        excludeIndex
      )
    ) {
      // 配置可能な場合、該当するセルをハイライト
      const startRow = Math.floor(potentialTargetIndex / _totalBagCols);
      const startCol = potentialTargetIndex % _totalBagCols;

      for (let r = 0; r < itemDef.size.height; r++) {
        for (let c = 0; c < itemDef.size.width; c++) {
          const highlightIndex =
            (startRow + r) * _totalBagCols + (startCol + c);
          const cellToHighlight = _inventoryGridElement.querySelector(
            `[data-item-index="${highlightIndex}"]`
          );
          if (cellToHighlight) {
            cellToHighlight.classList.add("highlight-cell");
          }
        }
      }
    } else {
      // 配置できない場合、赤くハイライト
      const startRow = Math.floor(potentialTargetIndex / _totalBagCols);
      const startCol = potentialTargetIndex % _totalBagCols;

      for (let r = 0; r < itemDef.size.height; r++) {
        for (let c = 0; c < itemDef.size.width; c++) {
          const highlightIndex =
            (startRow + r) * _totalBagCols + (startCol + c);
          const cellToHighlight = _inventoryGridElement.querySelector(
            `[data-item-index="${highlightIndex}"]`
          );
          if (cellToHighlight) {
            cellToHighlight.classList.add("cannot-drop-highlight");
          }
        }
      }
    }
  } else if (
    draggedItemInfo &&
    event.currentTarget.id === "availableItemsList"
  ) {
    // カバンへのドラッグオーバー（単一セルなので、リスト全体をハイライト）
    event.currentTarget.classList.add("highlight-cell");
  }
}

/**
 * ドラッグ中の要素がドロップターゲットから離れたときの処理
 * @param {Event} event - DragEventオブジェクト
 */
function handleDragLeave(event) {
  // 全てのハイライトをクリア
  document.querySelectorAll(".highlight-cell").forEach((cell) => {
    cell.classList.remove("highlight-cell");
  });
  document.querySelectorAll(".cannot-drop-highlight").forEach((cell) => {
    cell.classList.remove("cannot-drop-highlight");
  });
}

/**
 * 要素がドロップされたときの処理
 * @param {Event} event - DragEventオブジェクト
 */
function handleDrop(event) {
  event.preventDefault();

  // ドロップ時に全てのハイライトをクリア
  document.querySelectorAll(".highlight-cell").forEach((cell) => {
    cell.classList.remove("highlight-cell");
  });
  document.querySelectorAll(".cannot-drop-highlight").forEach((cell) => {
    cell.classList.remove("cannot-drop-highlight");
  });

  const data = event.dataTransfer.getData("application/json");
  if (!data) return;

  let droppedItem;
  try {
    droppedItem = JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse dropped item data:", e);
    _displayMessageCallback("アイテムデータの読み込みに失敗しました。");
    return;
  }

  // droppedItemがnullまたはitemIdがない場合のチェック
  if (!droppedItem || !droppedItem.itemId) {
    _displayMessageCallback("無効なアイテムデータです。");
    return;
  }

  const itemDef = allItemDefinitions.find(
    (def) => def && def.id === droppedItem.itemId
  ); // defがnullでないことを確認
  if (!itemDef) {
    _displayMessageCallback("不明なアイテムです。");
    return;
  }

  let targetInventoryType;
  let targetIndex = -1; // ドロップ先のインデックス
  const targetElement =
    event.target.closest(".inventory-cell") || event.currentTarget;

  // ドロップ先のインベントリタイプとインデックスを特定
  if (
    targetElement &&
    (targetElement.id === "inventoryGrid" ||
      targetElement.classList.contains("inventory-cell"))
  ) {
    targetInventoryType = "shipContainer";
    if (targetElement.classList.contains("inventory-cell")) {
      targetIndex = parseInt(targetElement.dataset.itemIndex, 10);

      // ドロップ先が使用不可セルならエラー
      if (targetElement.dataset.usable === "false") {
        _displayMessageCallback("このスロットはロックされています。");
        return;
      }
    } else {
      // グリッドの空きスペースにドロップされた場合（特定のセルにドロップされていない）
      _displayMessageCallback(
        "アイテムをグリッドの隙間にはドロップできません。特定のセルにドロップしてください。"
      );
      return;
    }
  } else if (
    targetElement &&
    (targetElement.id === "availableItemsList" ||
      targetElement.classList.contains("inventory-list-item"))
  ) {
    targetInventoryType = "bag";
    // カバンへのドロップは、最初の空きスロットを探す
    for (let i = 0; i < _initialUsableBagSlots; i++) {
      if (!inventoryData.bagInventory[i]) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) {
      _displayMessageCallback("カバンに空きがないため、アイテムを置けません。");
      return;
    }
  } else {
    _displayMessageCallback("アイテムをここにドロップすることはできません。");
    return;
  }

  let success = false;

  // 同じインベントリ内での移動（船体コンテナ内）
  if (
    droppedItem.sourceInventory === targetInventoryType &&
    targetInventoryType === "shipContainer"
  ) {
    const sourceIndex = droppedItem.itemIndex;
    const destinationIndex = targetIndex;

    if (sourceIndex === destinationIndex) {
      _displayMessageCallback("同じスロットへの移動です。");
      return;
    }

    const sourceItem = inventoryData.shipContainerInventory[sourceIndex];
    // ここに防御的なチェックを追加
    if (
      !sourceItem ||
      typeof sourceItem !== "object" ||
      sourceItem.id === undefined
    ) {
      _displayMessageCallback(
        "エラー: 移動元のアイテムが見つからないか、無効です。"
      );
      renderInventoryGrid(); // UIを最新の状態に再描画
      renderAvailableItems();
      return;
    }

    const sourceItemDef = allItemDefinitions.find(
      (def) => def && def.id === sourceItem.id
    ); // defがnullでないことを確認
    if (!sourceItemDef) {
      // defensive check
      _displayMessageCallback("移動元のアイテム定義が見つかりません。");
      return;
    }

    // 移動先の領域が、ドラッグされたアイテムのサイズに対して空いているかチェック
    if (
      checkSpaceAvailability(
        destinationIndex,
        sourceItemDef.size.width,
        sourceItemDef.size.height,
        sourceIndex
      )
    ) {
      // 元の場所のアイテムと占有マーカーをクリア
      const oldStartRow = Math.floor(sourceIndex / _totalBagCols);
      const oldStartCol = sourceIndex % _totalBagCols;
      for (let r = 0; r < sourceItemDef.size.height; r++) {
        for (let c = 0; c < sourceItemDef.size.width; c++) {
          const flatIdxToClear =
            (oldStartRow + r) * _totalBagCols + (oldStartCol + c);
          if (flatIdxToClear < inventoryData.maxItemTypesInShipContainer) {
            inventoryData.shipContainerInventory[flatIdxToClear] = null;
          }
        }
      }

      // 新しい場所にアイテムを配置
      inventoryData.shipContainerInventory[destinationIndex] = sourceItem;

      // 新しい場所の占有マーカーを設定
      const newStartRow = Math.floor(destinationIndex / _totalBagCols);
      const newStartCol = destinationIndex % _totalBagCols;
      for (let r = 0; r < sourceItemDef.size.height; r++) {
        for (let c = 0; c < sourceItemDef.size.width; c++) {
          if (r === 0 && c === 0) continue; // 左上セルはスキップ
          const occupiedFlatIndex =
            (newStartRow + r) * _totalBagCols + (newStartCol + c);
          if (occupiedFlatIndex < inventoryData.maxItemTypesInShipContainer) {
            inventoryData.shipContainerInventory[
              occupiedFlatIndex
            ] = `__OCCUPIED_BY_${destinationIndex}__`;
          }
        }
      }
      _displayMessageCallback(
        `${sourceItem.name}を船体コンテナ内で移動しました。`
      );
      success = true;
    } else {
      _displayMessageCallback("船体コンテナのその場所には移動できません。");
    }
  }
  // 異なるインベントリ間での移動
  else {
    if (
      droppedItem.sourceInventory === "bag" &&
      targetInventoryType === "shipContainer"
    ) {
      // カバンから船体コンテナへ
      const itemWidth = itemDef.size.width;
      const itemHeight = itemDef.size.height;

      // ドロップ先のセルが既にアイテム本体で埋まっているか、占有マーカーがあるかを確認
      const isTargetCellOccupied =
        inventoryData.shipContainerInventory[targetIndex] !== null &&
        typeof inventoryData.shipContainerInventory[targetIndex] === "object";
      const isTargetCellOccupiedByMarker =
        inventoryData.shipContainerInventory[targetIndex] !== null &&
        typeof inventoryData.shipContainerInventory[targetIndex] === "string" &&
        inventoryData.shipContainerInventory[targetIndex].startsWith(
          "__OCCUPIED_BY_"
        );

      if (isTargetCellOccupied || isTargetCellOccupiedByMarker) {
        _displayMessageCallback(
          "船体コンテナのその場所にはすでにアイテムがあります。"
        );
        return;
      }

      if (checkSpaceAvailability(targetIndex, itemWidth, itemHeight)) {
        if (removeItemFromBag(droppedItem.itemId, droppedItem.quantity)) {
          // 船体コンテナの指定位置にアイテムを追加
          inventoryData.shipContainerInventory[targetIndex] = {
            ...itemDef,
            quantity: droppedItem.quantity,
          };

          // 占有マーカーを設定
          const startRow = Math.floor(targetIndex / _totalBagCols);
          const startCol = targetIndex % _totalBagCols;
          for (let r = 0; r < itemDef.size.height; r++) {
            for (let c = 0; c < itemDef.size.width; c++) {
              if (r === 0 && c === 0) continue;
              const occupiedFlatIndex =
                (startRow + r) * _totalBagCols + (startCol + c);
              if (
                occupiedFlatIndex < inventoryData.maxItemTypesInShipContainer
              ) {
                inventoryData.shipContainerInventory[
                  occupiedFlatIndex
                ] = `__OCCUPIED_BY_${targetIndex}__`;
              }
            }
          }
          success = true;
          _displayMessageCallback(
            `${itemDef.name}をカバンから船体コンテナへ移動しました。`
          );
        }
      } else {
        _displayMessageCallback(
          "船体コンテナのその場所にはアイテムを置けません。"
        );
      }
    } else if (
      droppedItem.sourceInventory === "shipContainer" &&
      targetInventoryType === "bag"
    ) {
      // 船体コンテナからカバンへ
      // 船体コンテナからアイテムを削除（これによって占有マーカーもクリアされる）
      if (
        removeItemFromShipContainer(droppedItem.itemId, droppedItem.quantity)
      ) {
        // カバンにアイテムを追加
        if (addItemToBag(itemDef, droppedItem.quantity)) {
          success = true;
          _displayMessageCallback(
            `${itemDef.name}を船体コンテナからカバンへ移動しました。`
          );
        } else {
          // カバンに空きがない場合、船体コンテナに戻す（ロールバック）
          addItemToShipContainer(
            itemDef,
            droppedItem.quantity,
            droppedItem.itemIndex
          ); // 元のインデックスに戻す
          _displayMessageCallback(
            "カバンに空きがないため、移動できませんでした。"
          );
        }
      }
    }
  }

  // UIを更新
  if (success) {
    renderInventoryGrid();
    renderAvailableItems();
  }
  draggedItemInfo = null; // ドラッグ情報をクリア
}
