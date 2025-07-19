// game.js

// インベントリコンテナとグリッド要素を取得
const inventoryContainer = document.getElementById('inventoryContainer');
const inventoryGrid = document.getElementById('inventoryGrid');
const inventoryRows = 6;
const inventoryCols = 6;

// モーダルオーバーレイとアイテム一覧エリア、モーダルコンテンツラッパーを取得
const modalOverlay = document.getElementById('modalOverlay');
const itemListArea = document.getElementById('itemListArea');
const availableItemsList = document.getElementById('availableItemsList');
const modalContentWrapper = document.getElementById('modalContentWrapper'); // 新しく追加

// ゲーム情報要素を取得
const gameTimeDisplay = document.getElementById('gameTimeDisplay'); // 新しく追加: ゲーム時間表示要素を取得
const weatherDisplay = document.getElementById('weatherDisplay');
const weatherIconContainer = document.querySelector('.weather-icon-container'); // 天候アイコンコンテナ
const weatherIcons = { // 各天候アイコンの要素をIDで取得
    sunny: document.getElementById('icon-sunny'),
    cloudy: document.getElementById('icon-cloudy'),
    rainy: document.getElementById('icon-rainy'),
    stormy: document.getElementById('icon-stormy'),
    snowy: document.getElementById('icon-snowy')
};

const healthValueDisplay = document.getElementById('healthValue');
const healthBar = document.getElementById('healthBar');
const fuelValueDisplay = document.getElementById('fuelValue'); // 新しく追加: 燃料数値表示要素を取得
const fuelBar = document.getElementById('fuelBar'); // 新しく追加: 燃料バー要素を取得
const moneyDisplay = document.getElementById('moneyDisplay'); // お金表示要素を取得
const messageLog = document.getElementById('messageLog'); // メッセージログ要素を取得
const bagIcon = document.getElementById('bagIcon'); // 新しく追加: バッグアイコン要素を取得
const shipStateDisplay = document.getElementById('shipStateDisplay'); // 新しく追加: 船の状態表示要素を取得

// メインコンテンツエリアの要素を取得
const mainContentText = document.getElementById('mainContentText');
const choicesContainer = document.getElementById('choicesContainer');
const mainContentTitle = document.querySelector('.main-content-title'); // メインコンテンツタイトル要素を取得

// ショートカットモーダル要素は削除されたため、関連する行も削除

// ゲームの状態変数
const maxHealth = 20;
let currentHealth = maxHealth;
const maxFuel = 100; // 新しく追加: 燃料の最大値
let currentFuel = maxFuel; // 新しく追加: 燃料の初期値を最大値に設定
let currentMoney = 100000; // お金の初期値を10万に変更
let shipState = '停泊中'; // 新しく追加: 船の初期状態を停泊中に設定
let currentLocation = '街'; // 新しく追加: 現在の場所を管理。初期値は「街」

// ゲーム内時間変数
let gameHour = 8; // 初期時間: 午前8時
let gameMinute = 0; // 新しく追加: 分単位
let gameDay = 1; // 初期日: 1日目

// 天候パターンと対応するアイコンID
const weatherPatterns = [
    { name: "晴れ", iconId: "sunny" },
    { name: "曇り", iconId: "cloudy" },
    { name: "雨", "iconId": "rainy" },
    { name: "嵐", iconId: "stormy" },
    { name: "雪", iconId: "snowy" }
];

// インベントリに追加可能なアイテムのリスト（仮データ）
// 各アイテムに内部的なサイズプロパティを追加しました。
const availableItems = [
    { name: "修理キット", quantity: 3, size: { width: 3, height: 3 } },
    { name: "食料パック", quantity: 5, size: { width: 3, height: 3 } },
    { name: "燃料タンク", quantity: 2, size: { width: 3, height: 3 } },
    { name: "地図", quantity: 1, size: { width: 3, height: 3 } },
    { name: "望遠鏡", quantity: 1, size: { width: 3, height: 3 } },
    { name: "ロープ", quantity: 10, size: { width: 3, height: 3 } },
    { name: "懐中電灯", quantity: 1, size: { width: 3, height: 3 } },
    { name: "水筒", quantity: 4, size: { width: 3, height: 3 } },
    { name: "予備の部品", quantity: 7, size: { width: 3, height: 3 } },
    { name: "コンパス", quantity: 1, size: { width: 3, height: 3 } }
];


/**
 * インベントリセルを動的に生成する関数
 * インベントリの行数と列数に基づいて、必要な数のセルを作成し、グリッドに追加します。
 */
function createInventoryCells() {
    // 既存のセルをクリア（複数回呼ばれる可能性を考慮）
    inventoryGrid.innerHTML = '';
    for (let i = 0; i < inventoryRows * inventoryCols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('inventory-cell');
        inventoryGrid.appendChild(cell);
    }
}

/**
 * アイテム一覧を動的に生成する関数
 */
function populateAvailableItemsList() {
    availableItemsList.innerHTML = ''; // 既存のリストをクリア
    availableItems.forEach(item => {
        const listItem = document.createElement('li');
        // アイテム名と数量に加えて、サイズ情報も表示に含めるように変更しました。
        listItem.innerHTML = `<span>${item.name} (${item.size.width}x${item.size.height})</span><span class="item-quantity">x${item.quantity}</span>`;

        // クリックでインベントリに追加するなどのロジックをここに追加できる
        listItem.addEventListener('click', () => {
            console.log(`${item.name} を選択しました！`);
            console.log(`サイズ: ${item.size.width}x${item.size.height}`); // サイズ情報をコンソールに表示
            displayMessage(`${item.name} を選択しました。`); // メッセージログに表示
            // ここにインベントリ追加ロジックを実装
        });
        availableItemsList.appendChild(listItem);
    });
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
        if (weatherIcons[key]) { // 要素が存在するか確認
            weatherIcons[key].style.display = 'none';
        }
    }

    // 選択されたアイコンを表示する
    if (weatherIcons[selectedWeather.iconId]) { // 要素が存在するか確認
        weatherIcons[selectedWeather.iconId].style.display = 'block';
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
        healthBar.style.backgroundColor = '#27ae60'; // 緑
    } else if (healthPercentage > 30) {
        healthBar.style.backgroundColor = '#f39c12'; // オレンジ
    } else {
        healthBar.style.backgroundColor = '#e74c3c'; // 赤
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
        fuelBar.style.backgroundColor = '#3498db'; // 青
    } else if (fuelPercentage > 20) {
        fuelBar.style.backgroundColor = '#f1c40f'; // 黄色
    } else {
        fuelBar.style.backgroundColor = '#e74c3c'; // 赤
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
    const formatTime = (num) => String(num).padStart(2, '0');
    gameTimeDisplay.textContent = `Day ${gameDay} ${formatTime(gameHour)}:${formatTime(gameMinute)}`;
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
    const messageElement = document.createElement('p');
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
    const isVisible = modalContentWrapper.classList.toggle('is-open'); // 'is-open'クラスをトグル

    if (isVisible) {
        modalOverlay.style.display = 'block';
        // インベントリが初めて開かれたときに一度だけセルとアイテムリストを作成
        if (inventoryGrid.children.length === 0) {
            createInventoryCells();
        }
        if (availableItemsList.children.length === 0 || availableItems.length > 0 && availableItemsList.children.length !== availableItems.length) { // アイテムリストの数が合わない場合も再生成
            populateAvailableItemsList();
        }
    } else {
        modalOverlay.style.display = 'none';
    }
}

// キーが押された時のイベントリスナーを設定
document.addEventListener('keydown', (event) => {
    // 'e'キーが押されたかチェック
    if (event.key === 'e') {
        event.preventDefault(); // ブラウザのデフォルトの動作を無効にする
        toggleInventory(); // インベントリの表示/非表示を切り替える
    }
});

// バッグアイコンがクリックされた時のイベントを追加
bagIcon.addEventListener('click', () => {
    toggleInventory(); // インベントリの表示/非表示を切り替える
});


// モーダルオーバーレイがクリックされた時のイベントを追加
modalOverlay.addEventListener('click', () => {
    modalContentWrapper.classList.remove('is-open'); // モーダルコンテンツラッパーを非表示にする
    modalOverlay.style.display = 'none'; // モーダルオーバーレイを非表示にする
});

// ショートカットモーダル関連の関数とイベントリスナーは削除

/**
 * 無人島での探索を開始する関数
 * @param {number} durationMinutes - 探索にかかるゲーム分数
 */
function startIslandExploration(durationMinutes) {
    displayMessage('無人島での探索を開始しました。');

    // すべてのボタンを無効にする
    const allButtons = choicesContainer.querySelectorAll('button');
    allButtons.forEach(button => button.disabled = true);

    let explorationMinutesPassed = 0;
    const realTimeInterval = 1000; // 1リアルタイム秒 = 1000ミリ秒 (1ゲーム分に相当)

    const explorationInterval = setInterval(() => {
        explorationMinutesPassed++;
        advanceGameTime(1); // 1ゲーム分だけ時間を進める

        if (explorationMinutesPassed >= durationMinutes) {
            clearInterval(explorationInterval);
            displayMessage('無人島での探索が完了しました。');

            // アイテム入手ロジック
            const itemsToFind = availableItems.filter(item => item.name !== "燃料タンク" && item.name !== "修理キット"); // 例: 燃料や修理キットはここでは見つからない
            if (Math.random() < 0.7) { // 70%の確率で何かを見つける
                const foundItem = itemsToFind[Math.floor(Math.random() * itemsToFind.length)];
                const quantityFound = Math.floor(Math.random() * 3) + 1; // 1から3個見つける
                displayMessage(`${foundItem.name}を${quantityFound}個見つけました！`);
                // ここで、見つけたアイテムをプレイヤーのインベントリに追加するロジックを実装する
                // 現状はメッセージ表示のみ
            } else {
                displayMessage('何も見つかりませんでした...');
            }

            allButtons.forEach(button => button.disabled = false); // ボタンを有効に戻す
            updateMainContent(); // 選択肢を再描画
        }
    }, realTimeInterval);
}

/**
 * 飛行船での探索を開始する関数
 * @param {number} durationMinutes - 探索にかかるゲーム分数
 * @param {number} fuelConsumptionRate - 1ゲーム分あたりの燃料消費量 (例: 0.1は10分で1消費)
 * @param {number} initialFuelCost - 探索開始時に消費する初期燃料
 */
function startAirshipExploration(durationMinutes, fuelConsumptionRate, initialFuelCost) {
    // 探索に必要な初期燃料をチェック
    if (currentFuel < initialFuelCost) {
        displayMessage('燃料が足りません！探索を開始できません。');
        return;
    }

    displayMessage('飛行船での探索を開始しました。');
    currentFuel -= initialFuelCost; // 初期燃料を消費
    updateFuelDisplay();

    // すべてのボタンを無効にする
    const allButtons = choicesContainer.querySelectorAll('button');
    allButtons.forEach(button => button.disabled = true);

    let explorationMinutesPassed = 0;
    const realTimeInterval = 1000; // 1リアルタイム秒 = 1000ミリ秒 (1ゲーム分に相当)

    const explorationInterval = setInterval(() => {
        explorationMinutesPassed++;
        advanceGameTime(1); // 1ゲーム分だけ時間を進める

        // 探索中の燃料消費
        if (fuelConsumptionRate > 0 && explorationMinutesPassed % (1 / fuelConsumptionRate) === 0) {
            if (currentFuel > 0) {
                currentFuel--;
                updateFuelDisplay();
            }
        }

        if (currentFuel <= 0) {
            displayMessage('燃料がなくなりました！探索を中断します。');
            clearInterval(explorationInterval);
            allButtons.forEach(button => button.disabled = false); // ボタンを有効に戻す
            updateMainContent(); // 選択肢を再描画
            return;
        }

        if (explorationMinutesPassed >= durationMinutes) {
            clearInterval(explorationInterval);
            displayMessage('飛行船での航行探索が完了しました。');
            allButtons.forEach(button => button.disabled = false); // ボタンを有効に戻す
            updateMainContent(); // 選択肢を再描画
            // ここに飛行船探索結果のロジックを追加 (例: イベント発生)
        }
    }, realTimeInterval);
}

/**
 * ランダムな街のタイプを返す関数
 */
function getRandomTownType() {
    const townTypes = ['大きな街', '小さな街'];
    return townTypes[Math.floor(Math.random() * townTypes.length)];
}


/**
 * メインコンテンツエリアのテキストと選択肢を更新する関数
 */
function updateMainContent() {
    choicesContainer.innerHTML = ''; // 既存の選択肢をクリア

    // 各セクションのタイトルとラッパーを作成
    const actionSectionTitle = document.createElement('h4');
    actionSectionTitle.textContent = '行動'; // デフォルトは「行動」
    actionSectionTitle.classList.add('action-section-title');
    const actionButtonsWrapper = document.createElement('div');
    actionButtonsWrapper.classList.add('action-buttons-wrapper');

    const shipSectionTitle = document.createElement('h4');
    shipSectionTitle.textContent = '飛行船';
    shipSectionTitle.classList.add('ship-section-title');
    const shipButtonsWrapper = document.createElement('div');
    shipButtonsWrapper.classList.add('ship-buttons-wrapper');

    const departureButtonsWrapper = document.createElement('div'); // 無名サブタイトル（横線のみ）
    departureButtonsWrapper.classList.add('departure-buttons-wrapper');


    if (shipState === '停泊中') {
        if (currentLocation === '大きな街') {
            mainContentTitle.textContent = '大きな街'; // タイトルを「大きな街」に更新
            mainContentText.innerHTML = `
                <p>船は現在、大きな街の港に停泊しています。次の行動を選択してください。</p>
                <p>ここでは、物資の補給や船の修理、情報収集などができます。</p>
            `;
            // 行動セクション
            choicesContainer.appendChild(actionSectionTitle);
            choicesContainer.appendChild(actionButtonsWrapper);
            createChoiceButton('物資を補給する', () => {
                displayMessage('物資を補給しました。');
                currentMoney -= 100; // 例としてお金を減らす
                updateMoneyDisplay();
                advanceGameTime(30); // 30分進める
            }, 'choice-button-default', actionButtonsWrapper);
            createChoiceButton('散策する', () => {
                displayMessage('街を散策しています。何か新しい発見があるかもしれません...');
                advanceGameTime(15); // 15分進める
            }, 'choice-button-default', actionButtonsWrapper);
            
            // 飛行船セクション
            choicesContainer.appendChild(shipSectionTitle);
            choicesContainer.appendChild(shipButtonsWrapper);
            createChoiceButton('船を修理する', () => {
                displayMessage('船を修理しました。');
                currentHealth = maxHealth; // 体力を全回復
                updateHealthDisplay();
                advanceGameTime(60); // 1時間進める
            }, 'choice-button-default', shipButtonsWrapper, currentHealth === maxHealth); // 体力が満タンなら無効化
            createChoiceButton('燃料を補給する', () => {
                const fuelCost = (maxFuel - currentFuel) * 2; // 1燃料あたり2バルク
                if (currentMoney >= fuelCost) {
                    currentMoney = Math.max(0, currentMoney - fuelCost); // お金がマイナスにならないように
                    currentFuel = maxFuel;
                    updateMoneyDisplay();
                    updateFuelDisplay();
                    displayMessage(`燃料を${maxFuel}まで満タンにしました。${fuelCost}バルク消費しました。`);
                    advanceGameTime(30); // 30分進める
                } else {
                    displayMessage('燃料を補給するお金が足りません。');
                }
            }, 'choice-button-default', shipButtonsWrapper, currentFuel === maxFuel); // 燃料が満タンなら無効化
            createChoiceButton('改造する', () => { // 新しい改造ボタン
                displayMessage('船を改造しました！何かが変わったかもしれません...？');
                advanceGameTime(60); // 1時間進める
            }, 'choice-button-default', shipButtonsWrapper);

            // 出航セクション
            choicesContainer.appendChild(departureButtonsWrapper);
            createChoiceButton('出発する', () => {
                if (currentFuel > 0) { // 燃料があるかチェック
                    shipState = '航行中';
                    updateShipStateDisplay();
                    displayMessage('航行に出発しました！');
                    currentFuel -= 10; // 航海に出るたびに燃料を消費
                    updateFuelDisplay();
                    advanceGameTime(10); // 10分進める (出発にかかる時間)
                } else {
                    displayMessage('燃料が足りません！燃料を補給してください。');
                }
            }, 'choice-button-primary', departureButtonsWrapper);

        } else if (currentLocation === '小さな街') {
            mainContentTitle.textContent = '小さな街'; // タイトルを「小さな街」に更新
            mainContentText.innerHTML = `
                <p>船は現在、小さな街の港に停泊しています。次の行動を選択してください。</p>
                <p>ここでは、物資の補給や船の修理、情報収集などができます。</p>
            `;
            // 行動セクション
            choicesContainer.appendChild(actionSectionTitle);
            choicesContainer.appendChild(actionButtonsWrapper);
            createChoiceButton('物資を補給する', () => {
                displayMessage('物資を補給しました。');
                currentMoney -= 100; // 例としてお金を減らす
                updateMoneyDisplay();
                advanceGameTime(30); // 30分進める
            }, 'choice-button-default', actionButtonsWrapper);
            createChoiceButton('散策する', () => {
                displayMessage('街を散策しています。何か新しい発見があるかもしれません...');
                advanceGameTime(15); // 15分進める
            }, 'choice-button-default', actionButtonsWrapper);
            
            // 飛行船セクション
            choicesContainer.appendChild(shipSectionTitle);
            choicesContainer.appendChild(shipButtonsWrapper);
            createChoiceButton('船を修理する', () => {
                displayMessage('船を修理しました。');
                currentHealth = maxHealth; // 体力を全回復
                updateHealthDisplay();
                advanceGameTime(60); // 1時間進める
            }, 'choice-button-default', shipButtonsWrapper, currentHealth === maxHealth); // 体力が満タンなら無効化
            createChoiceButton('燃料を補給する', () => {
                const fuelCost = (maxFuel - currentFuel) * 2; // 1燃料あたり2バルク
                if (currentMoney >= fuelCost) {
                    currentMoney = Math.max(0, currentMoney - fuelCost); // お金がマイナスにならないように
                    currentFuel = maxFuel;
                    updateMoneyDisplay();
                    updateFuelDisplay();
                    displayMessage(`燃料を${maxFuel}まで満タンにしました。${fuelCost}バルク消費しました。`);
                    advanceGameTime(30); // 30分進める
                } else {
                    displayMessage('燃料を補給するお金が足りません。');
                }
            }, 'choice-button-default', shipButtonsWrapper, currentFuel === maxFuel); // 燃料が満タンなら無効化
            createChoiceButton('改造する', () => { // 新しい改造ボタン
                displayMessage('船を改造しました！何かが変わったかもしれません...？');
                advanceGameTime(60); // 1時間進める
            }, 'choice-button-default', shipButtonsWrapper);

            // 出航セクション
            choicesContainer.appendChild(departureButtonsWrapper);
            createChoiceButton('出発する', () => {
                if (currentFuel > 0) { // 燃料があるかチェック
                    shipState = '航行中';
                    updateShipStateDisplay();
                    displayMessage('航行に出発しました！');
                    currentFuel -= 10; // 航海に出るたびに燃料を消費
                    updateFuelDisplay();
                    advanceGameTime(10); // 10分進める (出発にかかる時間)
                } else {
                    displayMessage('燃料が足りません！燃料を補給してください。');
                }
            }, 'choice-button-primary', departureButtonsWrapper);

        } else if (currentLocation === '島') {
            mainContentTitle.textContent = '無人島'; // タイトルを「無人島」に更新
            mainContentText.innerHTML = `
                <p>船は現在、無人島に停泊しています。次の行動を選択してください。</p>
                <p>ここでは、探索や資源の収集ができます。</p>
            `;
            // 行動セクション
            choicesContainer.appendChild(actionSectionTitle);
            choicesContainer.appendChild(actionButtonsWrapper);
            createChoiceButton('探索する', () => {
                startIslandExploration(15); // 無人島探索を開始 (15分経過、燃料消費なし)
            }, 'choice-button-default', actionButtonsWrapper);
            
            // 飛行船セクションと関連ボタンは表示しない

            // 出航セクション
            choicesContainer.appendChild(departureButtonsWrapper);
            createChoiceButton('出発する', () => {
                if (currentFuel > 0) { // 燃料があるかチェック
                    shipState = '航行中';
                    updateShipStateDisplay();
                    displayMessage('航行に出発しました！');
                    currentFuel -= 10; // 航海に出るたびに燃料を消費
                    updateFuelDisplay();
                    advanceGameTime(10); // 10分進める (出発にかかる時間)
                } else {
                    displayMessage('燃料が足りません！燃料を補給してください。');
                }
            }, 'choice-button-primary', departureButtonsWrapper);
        }
    } else if (shipState === '航行中') {
        mainContentTitle.textContent = '飛行船'; // タイトルを「飛行船」に更新
        mainContentText.innerHTML = `
            <p>船は現在、広大な空を航行中です。どこへ向かいますか？</p>
            <p>航行中は、様々なイベントが発生する可能性があります。</p>
        `;
        // 行動セクションのサブタイトルを「操縦」に変更
        actionSectionTitle.textContent = '操縦'; // ここを変更
        choicesContainer.appendChild(actionSectionTitle);
        choicesContainer.appendChild(actionButtonsWrapper);
        createChoiceButton('探索する', () => {
            startAirshipExploration(60, 1/10, 5); // 飛行船探索を開始 (60分経過、10分で1燃料消費、初期燃料5)
        }, 'choice-button-default', actionButtonsWrapper);
        createChoiceButton('加速する', () => {
            if (currentFuel >= 10) { // 加速には燃料が必要
                displayMessage('船を加速させました！');
                currentFuel -= 10;
                updateFuelDisplay();
                advanceGameTime(30); // 30分進める
            } else {
                displayMessage('燃料が足りないので加速できません。');
            }
        }, 'choice-button-default', actionButtonsWrapper);

        // 飛行船セクションと関連ボタンは表示しない

        // 出航セクション
        choicesContainer.appendChild(departureButtonsWrapper);
        createChoiceButton('停泊する', () => {
            shipState = '停泊中';
            const locations = ['大きな街', '小さな街', '島']; // 停泊先を明示的に設定
            let newLocation = locations[Math.floor(Math.random() * locations.length)];
            currentLocation = newLocation; // 新しい場所をセット
            updateShipStateDisplay();
            displayMessage(`${currentLocation}に停泊しました。`); // 停泊した場所をメッセージに表示
            advanceGameTime(10); // 10分進める (停泊にかかる時間)
        }, 'choice-button-primary', departureButtonsWrapper);
    }
}

/**
 * 選択肢ボタンを作成し、指定されたコンテナに追加するヘルパー関数
 * @param {string} text - ボタンのテキスト
 * @param {function} onClickHandler - ボタンがクリックされた時の処理
 * @param {string} [className='choice-button-default'] - 追加するCSSクラス名
 * @param {HTMLElement} [container=choicesContainer] - ボタンを追加するコンテナ要素
 * @param {boolean} [disabled=false] - ボタンを無効にするかどうか
 */
function createChoiceButton(text, onClickHandler, className = 'choice-button-default', container = choicesContainer, disabled = false) {
    const button = document.createElement('button');
    button.classList.add('choice-button', className); // 基本クラスと指定されたクラスを追加
    button.textContent = text;
    button.addEventListener('click', onClickHandler);
    button.disabled = disabled; // disabled属性を設定
    container.appendChild(button); // 指定されたコンテナに追加
}


// ページロード時に初期設定を行う
window.onload = () => {
    // ゲーム開始メッセージを最初に表示
    displayMessage('ゲームが開始されました！'); // ここに移動

    currentLocation = '小さな街'; // ゲーム起動時は小さな街に固定

    setRandomWeather(); // 天候を設定
    updateHealthDisplay(); // 体力表示を更新
    updateFuelDisplay(); // 燃料表示を更新
    updateMoneyDisplay(); // お金表示を更新
    updateGameTimeDisplay(); // 新しく追加: ゲーム時間表示を更新
    updateShipStateDisplay(); // 船の状態表示を更新（メインコンテンツも更新される）
    console.log('ゲームがロードされました！');


    // インベントリとアイテムリストの初期生成（モーダルが開いていなくても実行しておく）
    createInventoryCells();
    populateAvailableItemsList();
};
