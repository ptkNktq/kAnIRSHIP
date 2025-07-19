// game.js

// ロケーションモジュールをインポート
import * as SmallTown from "./location/smallTown.js";
import * as LargeTown from "./location/largeTown.js";
import * as Airship from "./location/airship.js";
import * as Island from "./location/island.js";

// インベントリコンテナとグリッド要素を取得
const inventoryContainer = document.getElementById("inventoryContainer");
const inventoryGrid = document.getElementById("inventoryGrid");
// 船体コンテナのサイズを4x4に変更
const inventoryRows = 4;
const inventoryCols = 4;

// モーダルオーバーレイとアイテム一覧エリア、モーダルコンテンツラッパーを取得
const modalOverlay = document.getElementById("modalOverlay");
const itemListArea = document.getElementById("itemListArea"); // このエリアがカバンを表示する
const availableItemsList = document.getElementById("availableItemsList"); // カバンの中身を表示するUL
const modalContentWrapper = document.getElementById("modalContentWrapper");
const itemListTitle = document.querySelector("#itemListArea .item-list-title"); // カバンエリアのタイトル要素を取得

// ゲーム情報要素を取得
const gameTimeDisplay = document.getElementById("gameTimeDisplay"); // 新しく追加: ゲーム時間表示要素を取得
const weatherDisplay = document.getElementById("weatherDisplay");
const weatherIconContainer = document.querySelector(".weather-icon-container"); // 天候アイコンコンテナ
const weatherIcons = {
  // 各天候アイコンの要素をIDで取得
  sunny: document.getElementById("icon-sunny"),
  cloudy: document.getElementById("icon-cloudy"),
  rainy: document.getElementById("icon-rainy"),
  stormy: document.getElementById("icon-stormy"),
  snowy: document.getElementById("icon-snowy"),
};

const healthValueDisplay = document.getElementById("healthValue");
const healthBar = document.getElementById("healthBar");
const fuelValueDisplay = document.getElementById("fuelValue"); // 新しく追加: 燃料数値表示要素を取得
const fuelBar = document.getElementById("fuelBar"); // 新しく追加: 燃料バー要素を取得
const moneyDisplay = document.getElementById("moneyDisplay"); // お金表示要素を取得
const messageLog = document.getElementById("messageLog"); // メッセージログ要素を取得
const bagIcon = document.getElementById("bagIcon"); // 新しく追加: バッグアイコン要素を取得
const shipStateDisplay = document.getElementById("shipStateDisplay"); // 新しく追加: 船の状態表示要素を取得

// メインコンテンツエリアの要素を取得
const mainContentText = document.getElementById("mainContentText");
const choicesContainer = document.getElementById("choicesContainer");
const mainContentTitle = document.querySelector(".main-content-title"); // メインコンテンツタイトル要素を取得

// ゲームの状態変数
const maxHealth = 20;
let currentHealth = maxHealth;
const maxFuel = 100; // 新しく追加: 燃料の最大値
let currentFuel = maxFuel; // 新しく追加: 燃料の初期値を最大値に設定
let currentMoney = 100000; // お金の初期値を10万に変更
let shipState = "離船中"; // 初期状態を「離船中」に設定
let currentLocation = "小さな街"; // 現在の場所を管理。初期値は「小さな街」に固定

// ゲーム内時間変数
let gameHour = 8; // 初期時間: 午前8時
let gameMinute = 0; // 新しく追加: 分単位
let gameDay = 1; // 初期日: 1日目

// 天候パターンと対応するアイコンID
const weatherPatterns = [
  { name: "晴れ", iconId: "sunny" },
  { name: "曇り", iconId: "cloudy" },
  { name: "雨", iconId: "rainy" },
  { name: "嵐", iconId: "stormy" },
  { name: "雪", iconId: "snowy" },
];

// 全てのアイテム定義のリスト（ショップなどで入手可能なアイテムのマスターリスト）
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

// プレイヤーがカバンに所持しているアイテムのリスト
// 各アイテムは { name: string, quantity: number, stackLimit: number, size: object } の形式
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

// 船体コンテナに所持しているアイテムのリスト
let shipContainerInventory = []; // 初期は空

// カバンに持てるアイテムの種類数の上限
const maxItemTypesInBag = 6;

/**
 * インベントリセルを動的に生成する関数
 * インベントリの行数と列数に基づいて、必要な数のセルを作成し、グリッドに追加します。
 * この関数は、アイテムの配置ロジックは含まず、グリッドの枠のみを作成します。
 */
function createInventoryCells() {
  inventoryGrid.innerHTML = ""; // 既存のセルをクリア
  for (let i = 0; i < inventoryRows * inventoryCols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("inventory-cell");
    inventoryGrid.appendChild(cell);
  }
}

/**
 * プレイヤーのカバンの中身をアイテム一覧エリアに表示する関数
 */
function updateBagDisplay() {
  availableItemsList.innerHTML = ""; // 既存のリストをクリア

  bagInventory.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<span>${item.name}</span><span class="item-quantity">x${item.quantity}</span>`;
    // カバン内のアイテムをクリックした時の処理（例：船体コンテナへ移動など）は後で実装
    listItem.addEventListener("click", () => {
      displayMessage(`${item.name} をカバンから選択しました。`);
      // ここにアイテム使用や移動のロジックを実装
    });
    availableItemsList.appendChild(listItem);
  });

  // カバンタイトルの更新 (所持アイテム種類数/カバン上限)
  const currentUniqueTypes = getUniqueItemTypesCountInBag();
  itemListTitle.innerHTML = `カバン (${currentUniqueTypes}/${maxItemTypesInBag})<span class="inventory-open-key">(E)</span>`; // (E)の位置を移動
}

/**
 * 船体コンテナの中身をグリッドに表示する関数
 * 現状は簡易表示で、アイテムのサイズは考慮せず、最初のセルから順に表示します。
 */
function updateShipContainerDisplay() {
  const cells = inventoryGrid.querySelectorAll(".inventory-cell");
  cells.forEach((cell) => {
    cell.innerHTML = ""; // 各セルの内容をクリア
    cell.style.backgroundColor = "#2c3e50"; // デフォルトの背景色に戻す
  });

  shipContainerInventory.forEach((item, index) => {
    if (cells[index]) {
      // 適切なセルが存在する場合
      cells[
        index
      ].innerHTML = `<span>${item.name}</span><span class="item-quantity">x${item.quantity}</span>`;
      cells[index].style.backgroundColor = "#4a627a"; // アイテムがあるセルの色
      // 船体コンテナ内のアイテムをクリックした時の処理（例：カバンへ移動など）は後で実装
      cells[index].addEventListener("click", () => {
        displayMessage(`${item.name} を船体コンテナから選択しました。`);
        // ここにアイテム使用や移動のロジックを実装
      });
    }
  });
}

/**
 * プレイヤーのカバンにアイテムを追加する関数
 * @param {Object} itemDefinition - 追加するアイテムの定義（name, stackLimit, sizeなど）
 * @param {number} quantityToAdd - 追加する数量
 * @returns {boolean} - 追加に成功したかどうか
 */
function addItemToBag(itemDefinition, quantityToAdd) {
  // 既存のアイテムを探す
  const existingItem = bagInventory.find(
    (item) => item.name === itemDefinition.name
  );

  if (existingItem) {
    // 既存のアイテムがある場合、スタック上限をチェック
    if (existingItem.quantity + quantityToAdd <= existingItem.stackLimit) {
      existingItem.quantity += quantityToAdd;
      return true;
    } else {
      displayMessage(`${itemDefinition.name} のスタック上限に達しています。`);
      return false;
    }
  } else {
    // 新しいアイテムの場合、種類数の上限をチェック
    if (getUniqueItemTypesCountInBag() < maxItemTypesInBag) {
      // 新しいアイテムをbagInventoryに追加（quantityはquantityToAddで初期化）
      bagInventory.push({
        name: itemDefinition.name,
        quantity: quantityToAdd,
        stackLimit: itemDefinition.stackLimit,
        size: itemDefinition.size, // サイズ情報も保持
      });
      return true;
    } else {
      displayMessage("カバンがアイテムの種類数上限に達しています。");
      return false;
    }
  }
}

/**
 * 船体コンテナにアイテムを追加する関数
 * @param {Object} itemDefinition - 追加するアイテムの定義（name, stackLimit, sizeなど）
 * @param {number} quantityToAdd - 追加する数量
 * @returns {boolean} - 追加に成功したかどうか
 */
function addItemToShipContainer(itemDefinition, quantityToAdd) {
  // 既存のアイテムを探す
  const existingItem = shipContainerInventory.find(
    (item) => item.name === itemDefinition.name
  );

  if (existingItem) {
    // 既存のアイテムがある場合、スタック上限をチェック
    if (existingItem.quantity + quantityToAdd <= existingItem.stackLimit) {
      existingItem.quantity += quantityToAdd;
      return true;
    } else {
      displayMessage(
        `${itemDefinition.name} のスタック上限に達しています。（船体コンテナ）`
      );
      return false;
    }
  } else {
    // 新しいアイテムをshipContainerInventoryに追加
    // 船体コンテナには種類数の上限は設けない（現状）
    shipContainerInventory.push({
      name: itemDefinition.name,
      quantity: quantityToAdd,
      stackLimit: itemDefinition.stackLimit,
      size: itemDefinition.size,
    });
    return true;
  }
}

/**
 * プレイヤーのカバン内のユニークなアイテム種類の数を返す
 * @returns {number}
 */
function getUniqueItemTypesCountInBag() {
  return bagInventory.length; // bagInventoryは既にユニークなアイテム種類のみを保持する設計
}

/**
 * 天候をランダムに設定し、表示を更新する関数
 */
function setRandomWeather() {
  const randomIndex = Math.floor(Math.random() * weatherPatterns.length);
  const selectedWeather = weatherPatterns[randomIndex];

  weatherDisplay.textContent = selectedWeather.name;

  // すべてのアイコンを非表示にする
  for (const key in weatherIcons) {
    if (weatherIcons[key]) {
      // 要素が存在するか確認
      weatherIcons[key].style.display = "none";
    }
  }

  // 選択されたアイコンを表示する
  if (weatherIcons[selectedWeather.iconId]) {
    // 要素が存在するか確認
    weatherIcons[selectedWeather.iconId].style.display = "block";
  }
  displayMessage(`天候が「${selectedWeather.name}」になりました。`); // メッセージログに表示
}

/**
 * 体力表示を更新する関数
 */
function updateHealthDisplay() {
  healthValueDisplay.textContent = `${currentHealth} / ${maxHealth}`; // 数値表示を追加
  const healthPercentage = (currentHealth / maxHealth) * 100;
  healthBar.style.width = `${healthPercentage}%`;

  // 体力バーの色を変化させる
  if (healthPercentage > 60) {
    healthBar.style.backgroundColor = "#27ae60"; // 緑
  } else if (healthPercentage > 30) {
    healthBar.style.backgroundColor = "#f39c12"; // オレンジ
  } else {
    healthBar.style.backgroundColor = "#e74c3c"; // 赤
  }
}

/**
 * 燃料表示を更新する関数
 */
function updateFuelDisplay() {
  fuelValueDisplay.textContent = `${currentFuel} / ${maxFuel}`; // 数値表示を追加
  const fuelPercentage = (currentFuel / maxFuel) * 100;
  fuelBar.style.width = `${fuelPercentage}%`;

  // 燃料バーの色を変化させる (例: 青から赤へ)
  if (fuelPercentage > 50) {
    fuelBar.style.backgroundColor = "#3498db"; // 青
  } else if (fuelPercentage > 20) {
    fuelBar.style.backgroundColor = "#f1c40f"; // 黄色
  } else {
    fuelBar.style.backgroundColor = "#e74c3c"; // 赤
  }
}

/**
 * お金表示を更新する関数
 */
function updateMoneyDisplay() {
  // toLocaleString() を使用して3桁区切りにフォーマット
  moneyDisplay.textContent = `${currentMoney.toLocaleString()} バルク`;
}

/**
 * 船の状態表示を更新する関数
 */
function updateShipStateDisplay() {
  shipStateDisplay.textContent = shipState;
  // 船の状態が変わったらメインコンテンツの選択肢も更新
  updateMainContent();
}

/**
 * ゲーム内時間を更新し、表示を更新する関数
 */
function updateGameTimeDisplay() {
  // 時間を2桁表示にするためのヘルパー関数
  const formatTime = (num) => String(num).padStart(2, "0");
  gameTimeDisplay.textContent = `Day ${gameDay} ${formatTime(
    gameHour
  )}:${formatTime(gameMinute)}`;
}

/**
 * ゲーム内時間を進める関数
 * @param {number} minutes - 進める分数 (デフォルトは1分)
 */
function advanceGameTime(minutes = 1) {
  gameMinute += minutes;
  if (gameMinute >= 60) {
    gameHour += Math.floor(gameMinute / 60);
    gameMinute = gameMinute % 60;
    if (gameHour >= 24) {
      gameHour = 0;
      gameDay++;
      setRandomWeather(); // 日が変わったら天候もランダムに更新
      displayMessage(`新しい日になりました！Day ${gameDay}です。`);
    }
  }
  updateGameTimeDisplay();
  // ここではメッセージログには表示しない（探索中の連続ログを避けるため）
}

/**
 * メッセージログに新しいメッセージを追加する関数
 * @param {string} message - 表示するメッセージテキスト
 */
function displayMessage(message) {
  const messageElement = document.createElement("p");
  const timestamp = new Date().toLocaleTimeString(); // 時刻を追加
  messageElement.textContent = `[${timestamp}] ${message}`;
  messageLog.appendChild(messageElement);
  // スクロールを一番下にする
  messageLog.scrollTop = messageLog.scrollHeight;
}

/**
 * インベントリの表示/非表示を切り替える共通関数
 */
function toggleInventory() {
  const isVisible = modalContentWrapper.classList.toggle("is-open"); // 'is-open'クラスをトグル

  if (isVisible) {
    modalOverlay.style.display = "block";
    // インベントリグリッドのセルを初回のみ作成
    if (inventoryGrid.children.length === 0) {
      createInventoryCells();
    }
    // カバンと船体コンテナの表示を更新
    updateBagDisplay(); // カバンの中身を表示
    updateShipContainerDisplay(); // 船体コンテナの中身を表示
  } else {
    modalOverlay.style.display = "none";
  }
}

// キーが押された時のイベントリスナーを設定
document.addEventListener("keydown", (event) => {
  // 'e'キーが押されたかチェック
  if (event.key === "e") {
    event.preventDefault(); // ブラウザのデフォルトの動作を無効にする
    toggleInventory(); // インベントリの表示/非表示を切り替える
  }
});

// バッグアイコンがクリックされた時のイベントを追加
bagIcon.addEventListener("click", () => {
  toggleInventory(); // インベントリの表示/非表示を切り替える
});

// モーダルオーバーレイがクリックされた時のイベントを追加
modalOverlay.addEventListener("click", () => {
  modalContentWrapper.classList.remove("is-open"); // モーダルコンテンツラッパーを非表示にする
  modalOverlay.style.display = "none"; // モーダルオーバーレイを非表示にする
});

/**
 * 無人島での探索を開始する関数
 * @param {number} durationMinutes - 探索にかかるゲーム分数
 */
function startIslandExploration(durationMinutes) {
  displayMessage("無人島を探索しています...");

  gameContext.disableAllButtons(); // すべてのボタンを無効にする

  let explorationMinutesPassed = 0;
  const realTimeInterval = 1000; // 1リアルタイム秒 = 1000ミリ秒 (1ゲーム分に相当)

  const explorationInterval = setInterval(() => {
    explorationMinutesPassed++;
    advanceGameTime(1); // 1ゲーム分だけ時間を進める

    if (explorationMinutesPassed >= durationMinutes) {
      clearInterval(explorationInterval);
      displayMessage("無人島での探索が完了しました。");

      // アイテム入手ロジック
      const rand = Math.random();
      if (rand < 0.3) {
        // 30%の確率でお金を見つける (0.0 - 0.3)
        const foundMoney = Math.floor(Math.random() * 100) + 50; // 50から149バルク見つける
        currentMoney += foundMoney;
        updateMoneyDisplay();
        displayMessage(`${foundMoney}バルク見つけました！`);
      } else if (rand < 0.4) {
        // 10%の確率でアイテムを見つける (0.3 - 0.4)
        const itemsToFind = allItemDefinitions.filter(
          (item) => item.name !== "燃料タンク" && item.name !== "修理キット"
        );
        if (itemsToFind.length > 0) {
          const foundItemDef =
            itemsToFind[Math.floor(Math.random() * itemsToFind.length)];
          const quantityFound = Math.floor(Math.random() * 2) + 1; // 1から2個見つける

          const addedSuccessfully = addItemToBag(foundItemDef, quantityFound);
          if (addedSuccessfully) {
            displayMessage(
              `${foundItemDef.name}を${quantityFound}個見つけました！`
            );
          } else {
            displayMessage(
              `${foundItemDef.name}を見つけましたが、カバンがいっぱいで持ちきれませんでした...`
            );
          }
        } else {
          displayMessage("何も見つかりませんでした..."); // 見つけられるアイテムがない場合
        }
      } else {
        // 残りの60%は何もなし (0.4 - 1.0)
        displayMessage("何も見つかりませんでした...");
      }

      gameContext.enableAllButtons(); // ボタンを有効に戻す
      gameContext.updateMainContent(); // 選択肢を再描画
    }
  }, realTimeInterval);
}

/**
 * 飛行船での探索を開始する関数
 * @param {number} durationMinutes - 探索にかかるゲーム分数
 * @param {number} fuelConsumptionRate - 1ゲーム分あたりの燃料消費量 (例: 0.1は10分で1消費)
 * @param {number} initialFuelCost - 探索開始時に消費する初期燃料
 */
function startAirshipExploration(
  durationMinutes,
  fuelConsumptionRate,
  initialFuelCost
) {
  // 探索に必要な初期燃料をチェック
  if (currentFuel < initialFuelCost) {
    displayMessage("燃料が足りません！探索を開始できません。");
    return;
  }

  displayMessage("飛行船での探索を開始しました。");
  currentFuel -= initialFuelCost; // 初期燃料を消費
  updateFuelDisplay();

  gameContext.shipState = "操縦中"; // 操縦中に変更
  gameContext.disableAllButtons(); // すべてのボタンを無効にする

  let explorationMinutesPassed = 0;
  const realTimeInterval = 1000; // 1リアルタイム秒 = 1000ミリ秒 (1ゲーム分に相当)

  const explorationInterval = setInterval(() => {
    explorationMinutesPassed++;
    advanceGameTime(1); // 1ゲーム分だけ時間を進める

    // 探索中の燃料消費
    if (
      fuelConsumptionRate > 0 &&
      explorationMinutesPassed % (1 / fuelConsumptionRate) === 0
    ) {
      if (currentFuel > 0) {
        currentFuel--;
        updateFuelDisplay();
      }
    }

    if (currentFuel <= 0) {
      displayMessage("燃料がなくなりました！探索を中断します。");
      clearInterval(explorationInterval);
      gameContext.shipState = "停泊中"; // 燃料切れで停止したら停泊中に戻す
      gameContext.enableAllButtons(); // ボタンを有効に戻す
      gameContext.updateMainContent(); // 選択肢を再描画
      return;
    }

    if (explorationMinutesPassed >= durationMinutes) {
      clearInterval(explorationInterval);
      displayMessage("飛行船での航行探索が完了しました。");
      gameContext.shipState = "停泊中"; // 航行完了したら停泊中に戻す
      gameContext.enableAllButtons(); // ボタンを有効に戻す
      gameContext.updateMainContent(); // 選択肢を再描画
      // ここに飛行船探索結果のロジックを追加 (例: イベント発生)
    }
  }, realTimeInterval);
}

/**
 * 街での散策を開始する関数
 * @param {number} durationMinutes - 散策にかかるゲーム分数
 */
function startStrollExploration(durationMinutes) {
  displayMessage("街を散策しています。何か新しい発見があるかもしれません...");

  gameContext.disableAllButtons(); // すべてのボタンを無効にする

  let explorationMinutesPassed = 0;
  const realTimeInterval = 1000; // 1リアルタイム秒 = 1000ミリ秒 (1ゲーム分に相当)

  const explorationInterval = setInterval(() => {
    explorationMinutesPassed++;
    advanceGameTime(1); // 1ゲーム分だけ時間を進める

    if (explorationMinutesPassed >= durationMinutes) {
      clearInterval(explorationInterval);
      displayMessage("散策が完了しました。");

      // ここに散策結果のロジックを追加 (例: お金を見つける、イベント発生など)
      if (Math.random() < 0.3) {
        // 30%の確率でお金を見つける
        const foundMoney = Math.floor(Math.random() * 50) + 10; // 10から59バルク見つける
        currentMoney += foundMoney;
        updateMoneyDisplay();
        displayMessage(`${foundMoney}バルク見つけました！`);
      } else {
        displayMessage("特に何もありませんでした。");
      }

      gameContext.enableAllButtons(); // ボタンを有効に戻す
      gameContext.updateMainContent(); // 選択肢を再描画
    }
  }, realTimeInterval);
}

/**
 * ランダムな街のタイプを返す関数
 */
function getRandomTownType() {
  const townTypes = ["大きな街", "小さな街"];
  return townTypes[Math.floor(Math.random() * townTypes.length)];
}

/**
 * ゲームのコンテキストオブジェクト
 * ロケーションモジュールからアクセスできるように、必要な状態と関数をまとめる
 */
const gameContext = {
  // 状態
  get currentHealth() {
    return currentHealth;
  },
  set currentHealth(value) {
    currentHealth = value;
    updateHealthDisplay();
  },
  get maxHealth() {
    return maxHealth;
  },
  get currentFuel() {
    return currentFuel;
  },
  set currentFuel(value) {
    currentFuel = value;
    updateFuelDisplay();
  },
  get maxFuel() {
    return maxFuel;
  },
  get currentMoney() {
    return currentMoney;
  },
  set currentMoney(value) {
    currentMoney = value;
    updateMoneyDisplay();
  },
  get shipState() {
    return shipState;
  },
  set shipState(value) {
    shipState = value;
    updateShipStateDisplay();
  },
  get currentLocation() {
    return currentLocation;
  },
  set currentLocation(value) {
    currentLocation = value;
    updateMainContent();
  }, // 場所が変わったらメインコンテンツを更新
  get bagInventory() {
    return bagInventory;
  }, // bagInventoryを公開
  get shipContainerInventory() {
    return shipContainerInventory;
  }, // shipContainerInventoryを公開
  get maxItemTypesInBag() {
    return maxItemTypesInBag;
  }, // maxItemTypesInBagを公開

  // 関数
  displayMessage: displayMessage,
  updateHealthDisplay: updateHealthDisplay,
  updateFuelDisplay: updateFuelDisplay,
  updateMoneyDisplay: updateMoneyDisplay,
  updateShipStateDisplay: updateShipStateDisplay,
  advanceGameTime: advanceGameTime,
  startIslandExploration: startIslandExploration,
  startAirshipExploration: startAirshipExploration,
  startStrollExploration: startStrollExploration, // 新しく追加: 散策探索開始関数
  getRandomTownType: getRandomTownType,
  updateMainContent: updateMainContent, // 循環参照になるが、現状は必要
  disableAllButtons: () => {
    const allButtons = choicesContainer.querySelectorAll("button");
    allButtons.forEach((button) => (button.disabled = true));
  },
  enableAllButtons: () => {
    const allButtons = choicesContainer.querySelectorAll("button");
    allButtons.forEach((button) => (button.disabled = false));
  },
  addItemToBag: addItemToBag, // ロケーションからカバンにアイテムを追加できるように公開
  getUniqueItemTypesCountInBag: getUniqueItemTypesCountInBag, // カバンの所持アイテム種類数を公開
};

/**
 * メインコンテンツエリアのテキストと選択肢を更新する関数
 */
function updateMainContent() {
  choicesContainer.innerHTML = ""; // 既存の選択肢をクリア

  // 現在の場所に基づいて適切なロケーションモジュールを選択
  let currentModule;
  if (shipState === "操縦中" || shipState === "停泊中") {
    // 操縦中または停泊中の場合は飛行船のモジュール
    currentModule = Airship;
  } else if (currentLocation === "大きな街") {
    currentModule = LargeTown;
  } else if (currentLocation === "小さな街") {
    currentModule = SmallTown;
  } else if (currentLocation === "無人島") {
    currentModule = Island;
  } else {
    // 未定義の場所の場合のフォールバック
    console.error("Unknown location:", currentLocation);
    mainContentTitle.textContent = "不明な場所";
    mainContentText.innerHTML = "<p>現在地が不明です。</p>";
    return;
  }

  // ロケーションモジュールから情報を取得して表示を更新
  mainContentTitle.textContent = currentModule.getTitle();
  mainContentText.innerHTML = currentModule.getMessage();

  // 行動セクションを動的に生成
  const actions = currentModule.getActions();
  actions.forEach((section) => {
    const sectionTitle = document.createElement("h4");
    sectionTitle.textContent = section.subtitle;
    sectionTitle.classList.add("action-section-title"); // クラスは既存のものを流用
    const buttonsWrapper = document.createElement("div");
    buttonsWrapper.classList.add("action-buttons-wrapper"); // クラスは既存のものを流用

    choicesContainer.appendChild(sectionTitle);
    choicesContainer.appendChild(buttonsWrapper);

    section.buttons.forEach((buttonInfo) => {
      createChoiceButton(
        buttonInfo.text,
        () => currentModule.executeAction(buttonInfo.actionName, gameContext),
        buttonInfo.className,
        buttonsWrapper,
        buttonInfo.disabledCondition
          ? buttonInfo.disabledCondition(gameContext)
          : false // disabledConditionを評価
      );
    });
  });
}

/**
 * 選択肢ボタンを作成し、指定されたコンテナに追加するヘルパー関数
 * @param {string} text - ボタンのテキスト
 * @param {function} onClickHandler - ボタンがクリックされた時の処理
 * @param {string} [className='choice-button-default'] - 追加するCSSクラス名
 * @param {HTMLElement} [container=choicesContainer] - ボタンを追加するコンテナ要素
 * @param {boolean} [disabled=false] - ボタンを無効にするかどうか
 */
function createChoiceButton(
  text,
  onClickHandler,
  className = "choice-button-default",
  container = choicesContainer,
  disabled = false
) {
  const button = document.createElement("button");
  button.classList.add("choice-button", className); // 基本クラスと指定されたクラスを追加
  button.textContent = text;
  button.addEventListener("click", onClickHandler);
  button.disabled = disabled; // disabled属性を設定
  container.appendChild(button); // 指定されたコンテナに追加
}

// ページロード時に初期設定を行う
window.onload = () => {
  // ゲーム開始メッセージを最初に表示
  displayMessage("ゲームが開始されました！"); // ここに移動

  // currentLocationはgame.jsで初期値が設定されているためここでは変更しない

  setRandomWeather(); // 天候を設定
  updateHealthDisplay(); // 体力表示を更新
  updateFuelDisplay(); // 燃料表示を更新
  updateMoneyDisplay(); // お金表示を更新
  updateGameTimeDisplay(); // 新しく追加: ゲーム時間表示を更新
  updateShipStateDisplay(); // 船の状態表示を更新（メインコンテンツも更新される）
  console.log("ゲームがロードされました！");

  // インベントリとアイテムリストの初期生成と表示
  createInventoryCells(); // グリッドのセルを作成
  updateBagDisplay(); // カバンの中身を初期表示
  updateShipContainerDisplay(); // 船体コンテナの中身を初期表示 (空)
};
