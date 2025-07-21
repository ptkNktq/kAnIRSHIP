// location/smallTown.js

export const minPriceMultiplierSmallTown = 0.95; // exportを追加
export const maxPriceMultiplierSmallTown = 1.3; // exportを追加

const baseRepairCostPerDurability = 50; // 体力から耐久に変更
const baseFuelCostPerUnit = 20;

// 現在の訪問での価格を保持する変数
let currentVisitPrices = {
  repairCostPerDurability: 0, // 体力から耐久に変更
  fuelCostPerUnit: 0,
};

export function getTitle() {
  return "小さな街";
}

export function getMessage() {
  return "小さな港町に到着しました。活気はありませんが、必要なものは手に入るでしょう。";
}

export function getInfo() {
  return "小さな街は、静かで穏やかな港町です。ここでは、基本的な物資の補給や船の修理が可能です。価格は少し高めですが、緊急時には頼りになります。";
}

/**
 * 現在の街の価格情報を整形して返す関数
 * @returns {string} フォーマットされた価格情報
 */
export function getPricesInfo() {
  return (
    `現在の修理費用: 耐久1あたり ${currentVisitPrices.repairCostPerDurability.toLocaleString()} バルク\n` + // 体力から耐久に変更
    `現在の燃料費用: 燃料1ユニットあたり ${currentVisitPrices.fuelCostPerUnit.toLocaleString()} バルク`
  );
}

/**
 * 街に到着した時点で価格を計算し、設定する関数
 * この関数はgame.jsから呼び出されることを想定しています。
 * @param {number|null} fixedMultiplier - 固定の価格倍率。指定されない場合はランダムな倍率を使用。
 * @param {Object|null} gameContext - ゲームのコンテキスト (現在は使用しないが、引数として受け取る)
 */
export function calculatePricesForVisit(
  fixedMultiplier = null,
  gameContext = null
) {
  let priceMultiplier;
  if (fixedMultiplier !== null) {
    priceMultiplier = fixedMultiplier;
  } else {
    priceMultiplier =
      minPriceMultiplierSmallTown +
      Math.random() *
        (maxPriceMultiplierSmallTown - minPriceMultiplierSmallTown);
  }

  currentVisitPrices.repairCostPerDurability = Math.round(
    // 体力から耐久に変更
    baseRepairCostPerDurability * priceMultiplier // 体力から耐久に変更
  );
  currentVisitPrices.fuelCostPerUnit = Math.round(
    baseFuelCostPerUnit * priceMultiplier
  );
  console.log(
    `Small Town Prices calculated: Repair=${
      currentVisitPrices.repairCostPerDurability
    }, Fuel=${
      currentVisitPrices.fuelCostPerUnit
    } (Multiplier: ${priceMultiplier.toFixed(2)})`
  );
}

/**
 * 現在の訪問価格を返す関数
 * @returns {Object} currentVisitPricesオブジェクト
 */
export function getCurrentVisitPrices() {
  return currentVisitPrices;
}

export function getActions() {
  return [
    {
      subtitle: "行動",
      buttons: [
        {
          text: "街を散策する (30分)",
          actionName: "strollTown",
          className: "choice-button-default",
        },
        {
          text: "お店に行く (10分)", // 時間を追加
          actionName: "goToShop",
          className: "choice-button-default",
        },
        {
          text: "造船所に行く (10分)", // 時間を追加
          actionName: "goToShipyard",
          className: "choice-button-default",
        },
      ],
    },
    {
      subtitle: null,
      buttons: [
        {
          text: "飛行船に戻る",
          actionName: "returnToAirship",
          className: "choice-button-primary",
        },
      ],
    },
  ];
}

export function executeAction(actionName, gameContext) {
  switch (actionName) {
    case "repairShip":
      repairShip(gameContext);
      break;
    case "refuel":
      refuel(gameContext);
      break;
    case "goToShop":
      goToShop(gameContext);
      break;
    case "strollTown":
      strollTown(gameContext);
      break;
    case "goToShipyard":
      goToShipyard(gameContext);
      break;
    case "returnToAirship":
      returnToAirship(gameContext);
      break;
    default:
      gameContext.displayMessage("不明な行動です。");
      break;
  }
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
 * お店に行く
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function goToShop(gameContext) {
  gameContext.advanceGameTime(10); // 10分経過
  gameContext.previousLocation = gameContext.currentLocation; // お店に行く前に現在の場所を保存
  gameContext.displayMessage("お店に入りました。");
  gameContext.currentLocation = "お店"; // 場所をお店に変更
}

/**
 * 街を散策する
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function strollTown(gameContext) {
  gameContext.startStrollExploration(30);
}

/**
 * 造船所へ行く（仮の処理）
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function goToShipyard(gameContext) {
  gameContext.advanceGameTime(10); // 10分経過
  gameContext.previousLocation = gameContext.currentLocation; // 造船所に行く前に現在の場所を保存
  gameContext.displayMessage("造船所に到着しました。");
  gameContext.currentLocation = "造船所"; // 場所を造船所に変更
}

/**
 * 飛行船に戻る
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function returnToAirship(gameContext) {
  gameContext.displayMessage("飛行船に戻りました。");
  gameContext.currentLocation = "飛行船";
}
