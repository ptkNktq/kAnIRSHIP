// location/shipyard.js

import {
  minPriceMultiplierSmallTown,
  maxPriceMultiplierSmallTown,
  getCurrentVisitPrices, // 新しく追加: smallTownの現在の価格を取得する関数
} from "./smallTown.js"; // 小さな街の価格倍率と現在の価格をインポート

const baseRepairCostPerDurability = 40; // 体力から耐久に変更 // 小さな街より少し安く設定
const baseFuelCostPerUnit = 15; // 小さな街より少し安く設定
const baseModificationCost = 5000; // 改造の基本費用

const minPriceMultiplierShipyard = 0.8;
const maxPriceMultiplierShipyard = 1.1;

// 現在の訪問での価格を保持する変数
let currentVisitPrices = {
  repairCostPerDurability: 0, // 体力から耐久に変更
  fuelCostPerUnit: 0,
  modificationCost: 0,
};

export function getTitle() {
  return "造船所";
}

/**
 * 造船所のメッセージを返す関数
 * @param {Object} gameContext - ゲームのコンテキスト
 * @returns {string} メッセージ
 */
export function getMessage(gameContext) {
  let message =
    "巨大なドックと職人の活気に満ちた造船所に到着しました。ここでは船の修理、燃料補給";
  if (gameContext && gameContext.previousLocation !== "小さな街") {
    message += "、そして改造";
  }
  message += "が可能です。";
  return message;
}

/**
 * 造船所の情報を返す関数
 * @param {Object} gameContext - ゲームのコンテキスト
 * @returns {string} 情報
 */
export function getInfo(gameContext) {
  let info =
    "造船所は、あなたの飛行船を最高の状態に保つための場所です。経験豊富な職人たちが常駐しており、修理や燃料補給はもちろん";
  if (gameContext && gameContext.previousLocation !== "小さな街") {
    info += "、船の性能を向上させる改造も請け負っています。";
  } else {
    info += "可能です。";
  }
  info += "価格は他の街よりもお得なことが多いでしょう。";
  return info;
}

/**
 * 現在の造船所の価格情報を整形して返す関数
 * @param {Object} gameContext - ゲームのコンテキスト
 * @returns {string} フォーマットされた価格情報
 */
export function getPricesInfo(gameContext) {
  let prices =
    `現在の修理費用: 耐久1あたり ${currentVisitPrices.repairCostPerDurability.toLocaleString()} バルク\n` + // 体力から耐久に変更
    `現在の燃料費用: 燃料1ユニットあたり ${currentVisitPrices.fuelCostPerUnit.toLocaleString()} バルク`;
  if (gameContext && gameContext.previousLocation !== "小さな街") {
    prices += `\n改造費用: ${currentVisitPrices.modificationCost.toLocaleString()} バルク`;
  }
  return prices;
}

/**
 * 造船所に到着した時点で価格を計算し、設定する関数
 * この関数はgame.jsから呼び出されることを想定しています。
 * @param {number|null} fixedMultiplier - 固定の価格倍率。指定されない場合はランダムな倍率を使用。
 * @param {Object} gameContext - ゲームのコンテキスト
 * @param {Object|null} smallTownCurrentPrices - 小さな街の現在の価格情報（オプション）
 */
export function calculatePricesForVisit(
  fixedMultiplier = null,
  gameContext,
  smallTownCurrentPrices = null
) {
  let priceMultiplier;

  if (
    gameContext &&
    gameContext.previousLocation === "小さな街" &&
    smallTownCurrentPrices
  ) {
    console.log(`${smallTownCurrentPrices}`);
    // 小さな街から来た場合、小さな街の現在の価格をそのまま使う
    currentVisitPrices.repairCostPerDurability =
      smallTownCurrentPrices.repairCostPerDurability; // 体力から耐久に変更
    currentVisitPrices.fuelCostPerUnit = smallTownCurrentPrices.fuelCostPerUnit;

    // 改造費用は造船所の基本料金を基準に、造船所独自の倍率を適用
    priceMultiplier =
      fixedMultiplier !== null
        ? fixedMultiplier
        : minPriceMultiplierShipyard +
          Math.random() *
            (maxPriceMultiplierShipyard - minPriceMultiplierShipyard);
    currentVisitPrices.modificationCost = Math.round(
      baseModificationCost * priceMultiplier
    );
  } else {
    // 通常の造船所価格計算
    priceMultiplier =
      fixedMultiplier !== null
        ? fixedMultiplier
        : minPriceMultiplierShipyard +
          Math.random() *
            (maxPriceMultiplierShipyard - minPriceMultiplierShipyard);

    currentVisitPrices.repairCostPerDurability = Math.round(
      baseRepairCostPerDurability * priceMultiplier
    ); // 体力から耐久に変更
    currentVisitPrices.fuelCostPerUnit = Math.round(
      baseFuelCostPerUnit * priceMultiplier
    );
    currentVisitPrices.modificationCost = Math.round(
      baseModificationCost * priceMultiplier
    );
  }
  console.log(
    `Shipyard Prices calculated: Repair=${
      currentVisitPrices.repairCostPerDurability
    }, Fuel=${currentVisitPrices.fuelCostPerUnit}, Modification=${
      currentVisitPrices.modificationCost
    } (Multiplier: ${priceMultiplier.toFixed(2)})`
  );
}

/**
 * 造船所での行動リストを返す関数
 * @param {Object} gameContext - ゲームのコンテキスト
 * @returns {Array<Object>} 行動セクションの配列
 */
export function getActions(gameContext) {
  const actions = [
    {
      subtitle: "行動",
      buttons: [
        {
          text: "修理する",
          actionName: "repairShip",
          className: "choice-button-default",
          disabledCondition: (context) =>
            context.currentDurability === context.maxDurability, // 体力から耐久に変更
        },
        {
          text: "燃料補給する",
          actionName: "refuel",
          className: "choice-button-default",
          disabledCondition: (context) =>
            context.currentFuel === context.maxFuel,
        },
      ],
    },
    {
      subtitle: null,
      buttons: [
        {
          text: "造船所を出る",
          actionName: "returnToAirship",
          className: "choice-button-primary",
        },
      ], // 空の配列を削除したわ！
    },
  ];

  // 前の場所が「小さな街」でない場合のみ「改造する」ボタンを追加
  if (gameContext.previousLocation !== "小さな街") {
    actions[0].buttons.push({
      text: "改造する",
      actionName: "modifyShip",
      className: "choice-button-default",
    });
  }

  return actions;
}

export function executeAction(actionName, gameContext) {
  switch (actionName) {
    case "repairShip":
      repairShip(gameContext);
      break;
    case "refuel":
      refuel(gameContext);
      break;
    case "modifyShip":
      modifyShip(gameContext);
      break;
    case "returnToAirship":
      returnToAirship(gameContext);
      break;
    default:
      gameContext.displayMessage("不明な行動です。");
      break;
  }
  gameContext.saveGame(); // アクション実行後にデータを保存
}

/**
 * 船を修理する
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function repairShip(gameContext) {
  const durabilityNeeded =
    gameContext.maxDurability - gameContext.currentDurability; // 体力から耐久に変更
  if (durabilityNeeded <= 0) {
    gameContext.displayMessage("船は最大まで修理されています。");
    return;
  }

  const costPerDurability = currentVisitPrices.repairCostPerDurability; // 体力から耐久に変更
  const totalCost = durabilityNeeded * costPerDurability; // 体力から耐久に変更

  if (gameContext.currentMoney >= totalCost) {
    gameContext.currentMoney -= totalCost;
    gameContext.currentDurability = gameContext.maxDurability; // 体力から耐久に変更
    gameContext.displayMessage(
      `船を完全に修理しました。費用: ${totalCost.toLocaleString()} バルク。`
    );
  } else {
    gameContext.displayMessage(
      `修理費用が足りません。（必要: ${totalCost.toLocaleString()} バルク）`
    );
  }
}

/**
 * 燃料を補給する
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function refuel(gameContext) {
  const fuelNeeded = gameContext.maxFuel - gameContext.currentFuel;
  if (fuelNeeded <= 0) {
    gameContext.displayMessage("燃料は満タンです。");
    return;
  }

  const costPerUnit = currentVisitPrices.fuelCostPerUnit;
  const totalCost = fuelNeeded * costPerUnit;

  if (gameContext.currentMoney >= totalCost) {
    gameContext.currentMoney -= totalCost;
    gameContext.currentFuel = gameContext.maxFuel;
    gameContext.displayMessage(
      `燃料を補給しました。費用: ${totalCost.toLocaleString()} バルク。`
    );
  } else {
    gameContext.displayMessage(
      `燃料補給費用が足りません。（必要: ${totalCost.toLocaleString()} バルク）`
    );
  }
}

/**
 * 船を改造する（仮の処理）
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function modifyShip(gameContext) {
  const cost = currentVisitPrices.modificationCost;
  if (gameContext.currentMoney >= cost) {
    gameContext.currentMoney -= cost;
    gameContext.advanceGameTime(30); // 30分経過
    gameContext.displayMessage(
      `船の改造を行いました。費用: ${cost.toLocaleString()} バルク。（この機能はまだ開発中です）`
    );
  } else {
    gameContext.displayMessage(
      `改造費用が足りません。（必要: ${cost.toLocaleString()} バルク）`
    );
  }
}

/**
 * 造船所から前の場所に戻る
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function returnToAirship(gameContext) {
  gameContext.displayMessage(`${gameContext.previousLocation}に戻りました。`); // メッセージを修正
  gameContext.currentLocation = gameContext.previousLocation; // 前の場所に戻す
  // 時間経過はなし
}
