// game.js

// ロケーションモジュールをインポート
import * as SmallTown from "./location/smallTown.js";
import * as LargeTown from "./location/largeTown.js";
import * as Airship from "./location/airship.js";
import * as Island from "./location/island.js";
// インベントリマネージャーモジュールをインポート
import * as InventoryManager from "./features/inventory/inventoryManager.js";
// 天候マネージャーモジュールをインポート
import * as WeatherManager from "./features/weather/weatherManager.js";
import { weatherIconsSvg } from "./resources/weathers.svg.js"; // weatherManagerに渡すためにインポート

// DOM要素の変数を宣言（初期値はnull）
let inventoryContainer; // グローバルで宣言
let inventoryGrid; // グローバルで宣言
let modalOverlay;
let inventoryModalContentWrapper; // グローバルで宣言
let itemListArea;
let availableItemsList; // グローバルで宣言
let itemListTitle; // グローバルで宣言
let infoModalContentWrapper;
let infoModalTitle;
let infoModalText;
let infoModalPrices; // 新しく追加：価格表示用の要素
let gameTimeDisplay;
let weatherDisplay;
let weatherIconContainer;
let weatherIcons; // オブジェクトとして後で初期化 (WeatherManagerで管理される)
let healthValueDisplay;
let healthBar;
let fuelValueDisplay;
let fuelBar;
let moneyDisplay;
let messageLog;
let bagIcon;
let shipStateDisplay;
let mainContentText;
let choicesContainer;
let mainContentTitle;

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
      WeatherManager.setRandomWeather(displayMessage); // 日が変わったら天候もランダムに更新
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
  // 新しいメッセージをログの末尾に追加
  messageLog.appendChild(messageElement);
  // スクロールを一番下にする
  messageLog.scrollTop = messageLog.scrollHeight;
}

/**
 * モーダルの表示/非表示を切り替える共通関数
 * @param {string|null} modalType - 表示するモーダルの種類 ('inventory', 'info')。nullの場合は全てのモーダルを閉じる。
 * @param {Object|null} [moduleInfo=null] - infoモーダル表示時に渡すモジュール情報
 */
function toggleModal(modalType, moduleInfo = null) {
  // まず、全てのモーダルを閉じるための準備をする
  // InventoryManagerにインベントリを閉じるよう指示
  if (InventoryManager.isInventoryOpen()) {
    // InventoryManagerに状態を問い合わせる
    InventoryManager.toggleInventoryModal(false); // 強制的に閉じる
  }
  // 情報モーダルを閉じる
  if (
    infoModalContentWrapper &&
    infoModalContentWrapper.classList.contains("is-open")
  ) {
    infoModalContentWrapper.classList.remove("is-open");
  }
  // オーバーレイを一旦閉じる (後で開く必要がある場合のみ開く)
  if (modalOverlay) {
    modalOverlay.style.display = "none";
  }

  if (modalType === "inventory") {
    // インベントリモーダルを開く
    InventoryManager.toggleInventoryModal(true); // InventoryManagerに開くよう指示
    if (InventoryManager.isInventoryOpen()) {
      // 開いたか確認
      if (modalOverlay) modalOverlay.style.display = "block";
    }
  } else if (modalType === "info" && moduleInfo) {
    // 情報モーダルを開く
    if (modalOverlay) modalOverlay.style.display = "block";
    if (infoModalContentWrapper)
      infoModalContentWrapper.classList.add("is-open");

    // 街の説明文を設定
    if (infoModalTitle) infoModalTitle.textContent = moduleInfo.getTitle();
    if (infoModalText) infoModalText.textContent = moduleInfo.getInfo();

    // 価格情報を設定 (getPricesInfo関数が存在する場合のみ)
    if (infoModalPrices && typeof moduleInfo.getPricesInfo === "function") {
      infoModalPrices.textContent = moduleInfo.getPricesInfo();
      infoModalPrices.style.display = "block"; // 表示を有効にする
    } else if (infoModalPrices) {
      infoModalPrices.style.display = "none"; // 価格情報がない場合は非表示にする
    }
  }
  // modalType === null の場合は、既に上で全てのモーダルを閉じる処理が行われているため、追加の処理は不要
}

// ページロード時に初期設定を行う
window.onload = () => {
  // DOM要素への参照をここで取得 (constを削除して、グローバル変数に代入する)
  inventoryContainer = document.getElementById("inventoryContainer");
  inventoryGrid = document.getElementById("inventoryGrid");
  availableItemsList = document.getElementById("availableItemsList");
  itemListTitle = document.querySelector("#itemListArea .item-list-title");
  inventoryModalContentWrapper = document.getElementById(
    "inventoryModalContentWrapper"
  );

  modalOverlay = document.getElementById("modalOverlay");
  infoModalContentWrapper = document.getElementById("infoModalContentWrapper");
  infoModalTitle = document.getElementById("infoModalTitle");
  infoModalText = document.getElementById("infoModalText");
  infoModalPrices = document.getElementById("infoModalPrices"); // 新しく取得
  gameTimeDisplay = document.getElementById("gameTimeDisplay");
  weatherDisplay = document.getElementById("weatherDisplay");
  weatherIconContainer = document.querySelector(".weather-icon-container");

  // WeatherManagerを初期化し、必要なDOM要素とSVGアイコンを渡す
  WeatherManager.initWeather(
    {
      weatherDisplay,
      weatherIconContainer,
    },
    weatherIconsSvg // SVGアイコンオブジェクトを渡す
  );

  // WeatherManagerからweatherIconsの参照を取得
  // weatherIcons = WeatherManager.getWeatherIcons(); // WeatherManagerで管理されるため、直接アクセスしない

  healthValueDisplay = document.getElementById("healthValue");
  healthBar = document.getElementById("healthBar");
  fuelValueDisplay = document.getElementById("fuelValue");
  fuelBar = document.getElementById("fuelBar");
  moneyDisplay = document.getElementById("moneyDisplay");
  messageLog = document.getElementById("messageLog");
  bagIcon = document.getElementById("bagIcon");
  shipStateDisplay = document.getElementById("shipStateDisplay");
  mainContentText = document.getElementById("mainContentText");
  choicesContainer = document.getElementById("choicesContainer");
  mainContentTitle = document.getElementById("mainContentTitle");

  // InventoryManagerを初期化し、必要なDOM要素とコールバックを渡す
  // 引数に初期で使えるカバンのスロット数と、表示するグリッドの総行数・列数を追加したわ！
  InventoryManager.initInventory(
    {
      inventoryGrid,
      availableItemsList,
      itemListTitle,
      inventoryModalContentWrapper,
    },
    displayMessage,
    16,
    7,
    7
  ); // 4x4=16スロットが初期で使える、表示は7x7グリッド

  // ゲーム開始メッセージを最初に表示
  displayMessage("ゲームが開始されました！");

  // weatherIconsの初期化後にsetRandomWeatherを呼び出す
  WeatherManager.setRandomWeather(displayMessage); // 天候を設定

  updateHealthDisplay(); // 体力表示を更新
  updateFuelDisplay(); // 燃料表示を更新
  updateMoneyDisplay(); // お金表示を更新
  updateGameTimeDisplay(); // 新しく追加: ゲーム時間表示を更新

  // 初回起動時の「小さな街」の価格を固定で設定する
  // calculatePricesForVisitに1.0を渡すことで、ランダムではなくベース価格が設定される
  SmallTown.calculatePricesForVisit(1.0);

  updateShipStateDisplay(); // 船の状態表示を更新（メインコンテンツも更新される）
  console.log("ゲームがロードされました！");

  // キーが押された時のイベントリスナーを設定
  document.addEventListener("keydown", (event) => {
    const isInventoryCurrentlyOpen = InventoryManager.isInventoryOpen(); // InventoryManagerから状態を取得
    const isInfoModalCurrentlyOpen =
      infoModalContentWrapper.classList.contains("is-open");

    if (isInventoryCurrentlyOpen || isInfoModalCurrentlyOpen) {
      // 何らかのモーダルが開いている場合
      if (event.key === "e") {
        if (isInventoryCurrentlyOpen) {
          // インベントリが開いている場合はEで閉じる
          event.preventDefault();
          toggleModal(null); // 全てのモーダルを閉じる
        } else if (isInfoModalCurrentlyOpen) {
          // 情報モーダルが開いている場合はEを押しても何もしない（ショートカット無効）
          event.preventDefault();
        }
      } else if (event.key === "i") {
        // 'i'キーが押された場合
        if (isInfoModalCurrentlyOpen) {
          // 情報モーダルが開いている場合はiで閉じる
          event.preventDefault();
          toggleModal(null); // 全てのモーダルを閉じる
        } else {
          // 他のモーダルが開いていて、情報モーダルが開いていない場合は何もしない
          event.preventDefault();
        }
      } else {
        // E, I以外のキーが押された場合は、全てのショートカットを無効にする
        event.preventDefault();
      }
    } else {
      // モーダルが何も開いていない場合
      if (event.key === "e") {
        event.preventDefault();
        toggleModal("inventory"); // インベントリを開く
      } else if (event.key === "i") {
        // 'i'キーが押された場合
        event.preventDefault();
        // 現在の場所に基づいて適切なロケーションモジュールを選択
        let currentModule;
        if (currentLocation === "飛行船") {
          currentModule = Airship;
        } else if (currentLocation === "大きな街") {
          currentModule = LargeTown;
        } else if (currentLocation === "小さな街") {
          currentModule = SmallTown;
        } else if (currentLocation === "無人島") {
          currentModule = Island;
        }
        // 飛行船の場所では情報モーダルを表示しない
        if (currentLocation !== "飛行船" && currentModule) {
          toggleModal("info", currentModule); // 情報モーダルを開く
        }
      }
      // 他のキーは通常通り動作させる（event.preventDefault()を呼ばない）
    }
  });

  // バッグアイコンがクリックされた時のイベントを追加
  bagIcon.addEventListener("click", () => {
    toggleModal("inventory"); // インベントリの表示/非表示を切り替える
  });

  // モーダルオーバーレイがクリックされた時のイベントを追加
  modalOverlay.addEventListener("click", (event) => {
    // モーダルコンテンツ自体がクリックされた場合は閉じないようにする
    // InventoryManager.isInventoryOpen() を使って、現在インベントリが開いているか確認
    const isInventoryCurrentlyOpen = InventoryManager.isInventoryOpen();
    const isInfoModalCurrentlyOpen =
      infoModalContentWrapper.classList.contains("is-open");

    if (event.target === modalOverlay) {
      // インベントリまたは情報モーダルが開いている場合のみ閉じる
      if (isInventoryCurrentlyOpen || isInfoModalCurrentlyOpen) {
        toggleModal(null); // 全てのモーダルを閉じる
      }
    }
  });
};

/**
 * 無人島での探索を開始する関数
 * @param {number} durationMinutes - 探索にかかるゲーム分数
 */
function startIslandExploration(durationMinutes) {
  displayMessage(`無人島を探索しています... (${durationMinutes}分)`); // メッセージに時間を追加したわ！

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
        const itemsToFind =
          InventoryManager.inventoryData.allItemDefinitions.filter(
            (item) => item.name !== "燃料タンク" && item.name !== "修理キット"
          );
        if (itemsToFind.length > 0) {
          const foundItemDef =
            itemsToFind[Math.floor(Math.random() * itemsToFind.length)];
          const quantityFound = Math.floor(Math.random() * 2) + 1; // 1から2個見つける

          const addedSuccessfully = InventoryManager.addItemToBag(
            foundItemDef,
            quantityFound
          );
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
        displayMessage("特に何もありませんでした。"); // メッセージを修正
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

  displayMessage(
    `飛行船での探索を開始しました。(${durationMinutes}分間の航行)`
  ); // メッセージに時間を追加したわ！
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
  displayMessage(
    `街を散策しています。何か新しい発見があるかもしれません... (${durationMinutes}分)`
  ); // メッセージに時間を追加したわ！

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
    updateMainContent(); // 場所が変わったらメインコンテンツを更新

    // 新しい場所が街または島の場合、船の状態を「離船中」に設定
    if (
      currentLocation === "小さな街" ||
      currentLocation === "大きな街" ||
      currentLocation === "無人島"
    ) {
      gameContext.shipState = "離船中"; // ここで船の状態を「離船中」に設定
    }

    // 街のモジュールにcalculatePricesForVisit関数があれば呼び出す
    let currentModule;
    if (currentLocation === "小さな街") {
      currentModule = SmallTown;
    } else if (currentLocation === "大きな街") {
      currentModule = LargeTown;
    }

    if (
      currentModule &&
      typeof currentModule.calculatePricesForVisit === "function"
    ) {
      currentModule.calculatePricesForVisit(); // 引数なしで呼び出し、ランダムな倍率を適用
    }
  },
  get bagInventory() {
    return InventoryManager.inventoryData.bagInventory;
  },
  get shipContainerInventory() {
    return InventoryManager.inventoryData.shipContainerInventory;
  },
  get maxItemTypesInBag() {
    return InventoryManager.inventoryData.maxItemTypesInBag;
  },

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
  // InventoryManagerからアイテム追加関数を公開
  addItemToBag: InventoryManager.addItemToBag,
  addItemToShipContainer: InventoryManager.addItemToShipContainer,
  getUniqueItemTypesCountInBag: InventoryManager.getUniqueItemTypesCountInBag,
  // 新しく追加: 場所の情報を表示する関数 (モーダル表示に切り替え)
  displayLocationInfo: (module) => {
    toggleModal("info", module);
  },
};

/**
 * メインコンテンツエリアのテキストと選択肢を更新する関数
 */
function updateMainContent() {
  choicesContainer.innerHTML = ""; // 既存の選択肢をクリア

  // 現在の場所に基づいて適切なロケーションモジュールを選択
  let currentModule;
  if (currentLocation === "飛行船") {
    // 現在地が「飛行船」の場合
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
  mainContentTitle.innerHTML = ""; // タイトル要素をクリア
  const titleTextSpan = document.createElement("span");
  titleTextSpan.textContent = currentModule.getTitle();
  mainContentTitle.appendChild(titleTextSpan);

  // 「i」ボタンを作成して追加
  const infoButton = document.createElement("button");
  infoButton.classList.add("info-button");
  infoButton.innerHTML = `
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    `;
  infoButton.addEventListener("click", () => {
    gameContext.displayLocationInfo(currentModule); // 街の情報を表示
  });
  // 飛行船の場所では情報ボタンを表示しない
  if (currentLocation !== "飛行船") {
    mainContentTitle.appendChild(infoButton);
  }

  mainContentText.innerHTML = currentModule.getMessage();

  // 行動セクションを動的に生成
  const actions = currentModule.getActions();
  actions.forEach((section) => {
    // サブタイトルがnullでない場合のみh4要素を作成
    if (section.subtitle !== null) {
      const sectionTitle = document.createElement("h4");
      sectionTitle.textContent = section.subtitle;
      sectionTitle.classList.add("action-section-title"); // クラスは既存のものを流用
      choicesContainer.appendChild(sectionTitle);
    }

    const buttonsWrapper = document.createElement("div");
    // サブタイトルがnullの場合は、特殊なクラスを追加してスタイル調整できるようにする
    if (section.subtitle === null) {
      buttonsWrapper.classList.add("no-subtitle-buttons-wrapper");
    } else {
      buttonsWrapper.classList.add("action-buttons-wrapper"); // クラスは既存のものを流用
    }

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
