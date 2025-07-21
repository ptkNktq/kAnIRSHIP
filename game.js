// game.js

// ロケーションモジュールをインポート
import * as SmallTown from "./location/smallTown.js";
import * as LargeTown from "./location/largeTown.js";
import * as Airship from "./location/airship.js";
import * as Island from "./location/island.js";
import * as Shipyard from "./location/shipyard.js"; // 新しく追加: 造船所モジュール
import * as Shop from "./location/shop.js"; // 新しく追加: お店モジュール

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
let durabilityValueDisplay; // 体力から耐久に変更
let durabilityBar; // 体力バーから耐久バーに変更
let fuelValueDisplay;
let fuelBar;
let moneyDisplay;
let messageLog;
let bagIcon;
let mainContentText;
let choicesContainer;
let mainContentTitle;

// ゲームの状態変数 (初期値はinitializeGameで設定されるため、ここでは宣言のみ)
let maxDurability; // 体力から耐久に変更
let currentDurability; // 体力から耐久に変更
let maxFuel;
let currentFuel;
let currentMoney;
let shipState;
let currentLocation;
let previousLocation;

// ゲーム内時間変数
let gameHour;
let gameMinute;
let gameDay;

/**
 * 耐久表示を更新する関数
 */
function updateDurabilityDisplay() {
  durabilityValueDisplay.textContent = `${currentDurability} / ${maxDurability}`; // 数値表示を追加
  const durabilityPercentage = (currentDurability / maxDurability) * 100;
  durabilityBar.style.width = `${durabilityPercentage}%`;

  // 耐久バーの色を変化させる
  if (durabilityPercentage > 60) {
    durabilityBar.style.backgroundColor = "#27ae60"; // 緑
  } else if (durabilityPercentage > 30) {
    durabilityBar.style.backgroundColor = "#f39c12"; // オレンジ
  } else {
    durabilityBar.style.backgroundColor = "#e74c3c"; // 赤
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
    modalOverlay.classList.remove("is-open"); // オーバーレイのis-openクラスも削除
  }

  if (modalType === "inventory") {
    // インベントリモーダルを開く
    InventoryManager.toggleInventoryModal(true); // InventoryManagerに開くよう指示
    if (InventoryManager.isInventoryOpen()) {
      // 開いたか確認
      if (modalOverlay) modalOverlay.style.display = "block";
      if (modalOverlay) modalOverlay.classList.add("is-open"); // オーバーレイにis-openクラスを追加
    }
  } else if (modalType === "info" && moduleInfo) {
    // 情報モーダルを開く
    if (modalOverlay) modalOverlay.style.display = "block";
    if (modalOverlay) modalOverlay.classList.add("is-open"); // オーバーレイにis-openクラスを追加
    if (infoModalContentWrapper)
      infoModalContentWrapper.classList.add("is-open");

    // 街の説明文を設定
    if (infoModalTitle) infoModalTitle.textContent = moduleInfo.getTitle();
    // ここで gameContext を渡すように修正
    if (infoModalText)
      infoModalText.innerHTML = moduleInfo.getMessage(gameContext); // innerHTMLに変更してHTMLタグを解釈

    // 価格情報を設定 (getPricesInfo関数が存在する場合のみ)
    // ここで gameContext を渡すように修正
    if (infoModalPrices && typeof moduleInfo.getPricesInfo === "function") {
      infoModalPrices.textContent = moduleInfo.getPricesInfo(gameContext);
      infoModalPrices.style.display = "block"; // 表示を有効にする
    } else if (infoModalPrices) {
      infoModalPrices.style.display = "none"; // 価格情報がない場合は非表示にする
    }
  }
  // modalType === null の場合は、既に上で全てのモーダルを閉じる処理が行われているため、追加の処理は不要
}

// ゲームのコンテキストオブジェクト
// ロケーションモジュールからアクセスできるように、必要な状態と関数をまとめる
const gameContext = {
  // 状態
  get currentDurability() {
    // 体力から耐久に変更
    return currentDurability;
  },
  set currentDurability(value) {
    // 体力から耐久に変更
    currentDurability = value;
    updateDurabilityDisplay(); // 体力表示から耐久表示に変更
  },
  get maxDurability() {
    // 体力から耐久に変更
    return maxDurability;
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
  },
  get currentLocation() {
    return currentLocation;
  },
  set currentLocation(value) {
    // 場所が変わる前にpreviousLocationを更新
    if (currentLocation !== value) {
      previousLocation = currentLocation;
    }
    currentLocation = value;
    updateMainContent(); // 場所が変わったらメインコンテンツを更新

    // 新しい場所が街または島の場合、船の状態を「離船中」に設定
    if (
      currentLocation === "小さな街" ||
      currentLocation === "大きな街" ||
      currentLocation === "無人島"
    ) {
      gameContext.shipState = "離船中"; // ここで船の状態を「離船中」に設定
    } else if (currentLocation === "造船所") {
      // 造船所の場合
      gameContext.shipState = "停泊中"; // 造船所では停泊中に設定
    } else if (currentLocation === "飛行船") {
      // 飛行船に戻った場合
      gameContext.shipState = "離船中"; // 飛行船では離船中に設定
    } else if (currentLocation === "お店") {
      // お店の場合
      gameContext.shipState = "停泊中"; // お店では停泊中に設定
    }

    // 街のモジュールにcalculatePricesForVisit関数があれば呼び出す
    let currentModule;
    if (currentLocation === "小さな街") {
      currentModule = SmallTown;
    } else if (currentLocation === "大きな街") {
      currentModule = LargeTown;
    } else if (currentLocation === "造船所") {
      currentModule = Shipyard; // 造船所の場合
    } else if (currentLocation === "お店") {
      // お店の場合
      currentModule = Shop;
    }

    if (
      currentModule &&
      typeof currentModule.calculatePricesForVisit === "function"
    ) {
      let smallTownPrices = null;
      // 造船所に行く場合、または造船所から小さな街に戻る場合
      if (currentLocation === "造船所") {
        // 造船所に行く場合は、現在の場所が小さな街ならその価格を渡す
        if (previousLocation === "小さな街") {
          smallTownPrices = SmallTown.getCurrentVisitPrices();
        }
        currentModule.calculatePricesForVisit(
          null,
          gameContext,
          smallTownPrices
        );
      } else if (
        currentLocation === "小さな街" &&
        previousLocation === "飛行船"
      ) {
        // 飛行船から小さな街に停泊した場合のみ、小さな街の価格を再計算
        SmallTown.calculatePricesForVisit(null, gameContext); // gameContextを渡す
      } else if (
        currentLocation === "大きな街" &&
        previousLocation === "飛行船"
      ) {
        // 飛行船から大きな街に停泊した場合のみ、大きな街の価格を再計算
        LargeTown.calculatePricesForVisit(); // LargeTownの価格をランダムに更新
      } else if (
        currentLocation === "お店" &&
        (previousLocation === "小さな街" || previousLocation === "大きな街")
      ) {
        // 街からお店に停泊した場合のみ、お店の価格を再計算
        Shop.calculatePricesForVisit(null, gameContext); // gameContextを渡す
      }
      // その他の場所への移動では価格を更新しない
    }
  },
  // previousLocation のゲッターとセッターを追加
  get previousLocation() {
    return previousLocation;
  },
  set previousLocation(value) {
    previousLocation = value;
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
  updateDurabilityDisplay: updateDurabilityDisplay, // 体力表示から耐久表示に変更
  updateFuelDisplay: updateFuelDisplay,
  updateMoneyDisplay: updateMoneyDisplay,
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
  } else if (currentLocation === "造船所") {
    // 新しく追加: 造船所
    currentModule = Shipyard;
  } else if (currentLocation === "お店") {
    // 新しく追加: お店
    currentModule = Shop;
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

  // currentModule.getMessage() に gameContext を渡すように修正
  // mainContentText.innerHTML = currentModule.getMessage(gameContext); // この行は削除またはコメントアウト

  // メインコンテンツテキストを更新
  const messageContent = currentModule.getMessage(gameContext);
  if (messageContent) {
    mainContentText.innerHTML = messageContent;
  } else {
    mainContentText.innerHTML = ""; // メッセージがない場合はクリア
  }

  // 行動セクションを動的に生成
  // currentModule.getActions() に gameContext を渡すように修正
  const actions = currentModule.getActions(gameContext);
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

    // ボタンがある場合はボタンを生成
    if (section.buttons && section.buttons.length > 0) {
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
    } else if (section.message) {
      // ボタンがなく、メッセージがある場合はテキストを表示
      const messageElement = document.createElement("p");
      messageElement.textContent = section.message.text;
      messageElement.classList.add(
        section.message.className || "no-action-message"
      ); // クラスを追加
      buttonsWrapper.appendChild(messageElement);
    }
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
 * ゲームの初期化処理
 * 保存済みデータがあればそれをロードし、なければデフォルト値で初期化する
 */
function initializeGame() {
  // TODO: 保存済みデータのロード処理をここに実装
  // 例: const savedData = loadGameData();
  const savedData = null; // 今はセーブ機能がないのでnullとする

  if (savedData) {
    // TODO: 保存済みデータでゲーム状態を復元する
    console.log("保存済みデータをロードしました。");
    // currentDurability = savedData.durability;
    // currentFuel = savedData.fuel;
    // ...
  } else {
    // デフォルト値で初期化
    maxDurability = 20; // 体力から耐久に変更
    currentDurability = maxDurability; // 体力から耐久に変更
    maxFuel = 100;
    currentFuel = maxFuel;
    currentMoney = 100000;
    shipState = "離船中";
    currentLocation = "小さな街";
    previousLocation = "飛行船";
    gameHour = 8;
    gameMinute = 0;
    gameDay = 1;

    // 初回起動時の「小さな街」の価格設定
    SmallTown.calculatePricesForVisit(1.0, gameContext); // gameContextを渡す

    console.log("新しいゲームを開始しました。");
  }

  // 初期表示の更新
  // ここでDOM要素が確実に取得されていることを前提とする
  updateDurabilityDisplay(); // 体力表示から耐久表示に変更
  updateFuelDisplay();
  updateMoneyDisplay();
  updateGameTimeDisplay();
  WeatherManager.setRandomWeather(displayMessage, true); // 天候を設定（メッセージ抑制）
  updateMainContent(); // メインコンテンツを初期表示
  gameContext.displayMessage("ゲームを開始しました！小さな街に到着しました。");
}

// ページロード時に初期設定を行う
window.onload = () => {
  // 1. すべてのDOM要素への参照をここで取得
  inventoryContainer = document.getElementById("inventoryContainer");
  inventoryGrid = document.getElementById("inventoryGrid");
  modalOverlay = document.getElementById("modalOverlay");
  inventoryModalContentWrapper = document.getElementById(
    "inventoryModalContentWrapper"
  );
  itemListArea = document.getElementById("itemListArea");
  availableItemsList = document.getElementById("availableItemsList");
  itemListTitle = document.querySelector("#itemListArea .item-list-title");
  infoModalContentWrapper = document.getElementById("infoModalContentWrapper");
  infoModalTitle = document.getElementById("infoModalTitle");
  infoModalText = document.getElementById("infoModalText");
  infoModalPrices = document.getElementById("infoModalPrices");
  gameTimeDisplay = document.getElementById("gameTimeDisplay");
  weatherDisplay = document.getElementById("weatherDisplay");
  weatherIconContainer = document.querySelector(".weather-icon-container");
  durabilityValueDisplay = document.getElementById("durabilityValue");
  durabilityBar = document.getElementById("durabilityBar");
  fuelValueDisplay = document.getElementById("fuelValue");
  fuelBar = document.getElementById("fuelBar");
  moneyDisplay = document.getElementById("moneyDisplay");
  messageLog = document.getElementById("messageLog");
  bagIcon = document.getElementById("bagIcon");
  mainContentText = document.getElementById("mainContentText");
  choicesContainer = document.getElementById("choicesContainer");
  mainContentTitle = document.getElementById("mainContentTitle");

  // 2. 各マネージャーの初期化 (DOM要素が揃った後)
  WeatherManager.initWeather(
    { weatherDisplay, weatherIconContainer },
    weatherIconsSvg
  );
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
    7,
    true
  );

  // 3. ゲーム全体の初期化 (すべての準備が整った後)
  initializeGame();

  // 4. イベントリスナーの設定
  document.addEventListener("keydown", (event) => {
    const isInventoryCurrentlyOpen = InventoryManager.isInventoryOpen();
    const isInfoModalCurrentlyOpen =
      infoModalContentWrapper.classList.contains("is-open");

    if (isInventoryCurrentlyOpen || isInfoModalCurrentlyOpen) {
      if (event.key === "e") {
        if (isInventoryCurrentlyOpen) {
          event.preventDefault();
          toggleModal(null);
        } else if (isInfoModalCurrentlyOpen) {
          event.preventDefault();
        }
      } else if (event.key === "i") {
        if (isInfoModalCurrentlyOpen) {
          event.preventDefault();
          toggleModal(null);
        } else {
          event.preventDefault();
        }
      } else {
        event.preventDefault();
      }
    } else {
      if (event.key === "e") {
        event.preventDefault();
        toggleModal("inventory");
      } else if (event.key === "i") {
        event.preventDefault();
        let currentModule;
        if (currentLocation === "飛行船") {
          currentModule = Airship;
        } else if (currentLocation === "大きな街") {
          currentModule = LargeTown;
        } else if (currentLocation === "小さな街") {
          currentModule = SmallTown;
        } else if (currentLocation === "無人島") {
          currentModule = Island;
        } else if (currentLocation === "造船所") {
          currentModule = Shipyard;
        } else if (currentLocation === "お店") {
          currentModule = Shop;
        }
        if (currentLocation !== "飛行船" && currentModule) {
          toggleModal("info", currentModule);
        }
      }
    }
  });

  bagIcon.addEventListener("click", () => {
    toggleModal("inventory");
  });

  modalOverlay.addEventListener("click", (event) => {
    const isInventoryCurrentlyOpen = InventoryManager.isInventoryOpen();
    const isInfoModalCurrentlyOpen =
      infoModalContentWrapper.classList.contains("is-open");

    if (event.target === modalOverlay) {
      if (isInventoryCurrentlyOpen || isInfoModalCurrentlyOpen) {
        toggleModal(null);
      }
    }
  });
};
