// location/smallTown.js

const baseRepairCostPerHealth = 50; // 体力1あたりの修理基本コスト
const baseFuelCostPerUnit = 20; // 燃料1ユニットあたりの基本コスト

// 小さな街の価格変動範囲
const minPriceMultiplierSmallTown = 0.95;
const maxPriceMultiplierSmallTown = 1.3;

// 現在の訪問での価格を保持する変数
let currentVisitPrices = {
  repairCostPerHealth: 0,
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
    `現在の修理費用: 体力1あたり ${currentVisitPrices.repairCostPerHealth.toLocaleString()} バルク\n` +
    `現在の燃料費用: 燃料1ユニットあたり ${currentVisitPrices.fuelCostPerUnit.toLocaleString()} バルク`
  );
}

/**
 * 街に到着した時点で価格を計算し、設定する関数
 * この関数はgame.jsから呼び出されることを想定しています。
 * @param {number|null} fixedMultiplier - 固定の価格倍率。指定されない場合はランダムな倍率を使用。
 */
export function calculatePricesForVisit(fixedMultiplier = null) {
  let priceMultiplier;
  if (fixedMultiplier !== null) {
    priceMultiplier = fixedMultiplier; // 固定倍率を使用
  } else {
    priceMultiplier =
      minPriceMultiplierSmallTown +
      Math.random() *
        (maxPriceMultiplierSmallTown - minPriceMultiplierSmallTown); // ランダムな倍率を使用
  }

  currentVisitPrices.repairCostPerHealth = Math.round(
    baseRepairCostPerHealth * priceMultiplier
  );
  currentVisitPrices.fuelCostPerUnit = Math.round(
    baseFuelCostPerUnit * priceMultiplier
  );
  console.log(
    `Small Town Prices calculated: Repair=${
      currentVisitPrices.repairCostPerHealth
    }, Fuel=${
      currentVisitPrices.fuelCostPerUnit
    } (Multiplier: ${priceMultiplier.toFixed(2)})`
  );
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
        }, // 所要時間を追加したわ！
        {
          text: "お店に行く",
          actionName: "goToShop",
          className: "choice-button-default",
        },
      ],
    },
    {
      subtitle: "飛行船",
      buttons: [
        {
          text: "船を修理する",
          actionName: "repairShip",
          className: "choice-button-default",
          disabledCondition: (context) =>
            context.currentHealth === context.maxHealth,
        },
        {
          text: "燃料を補給する",
          actionName: "refuel",
          className: "choice-button-default",
          disabledCondition: (context) =>
            context.currentFuel === context.maxFuel,
        },
        {
          text: "飛行船を改造する",
          actionName: "customize",
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
    case "customize":
      customize(gameContext);
      break;
    case "strollTown":
      strollTown(gameContext);
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
  const healthNeeded = gameContext.maxHealth - gameContext.currentHealth;
  if (healthNeeded <= 0) {
    gameContext.displayMessage("船は最大まで修理されています。");
    return;
  }

  const costPerHealth = currentVisitPrices.repairCostPerHealth; // 事前に計算された価格を使用
  const totalCost = healthNeeded * costPerHealth;

  if (gameContext.currentMoney >= totalCost) {
    gameContext.currentMoney -= totalCost;
    gameContext.currentHealth = gameContext.maxHealth;
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

  const costPerUnit = currentVisitPrices.fuelCostPerUnit; // 事前に計算された価格を使用
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
 * お店に行く（仮の処理）
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function goToShop(gameContext) {
  gameContext.displayMessage(
    "お店に入りました。何を買いますか？（この機能はまだ開発中です）"
  );
  // 将来的にアイテム購入などのロジックを追加
}

/**
 * 改造する（仮の処理）
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function customize(gameContext) {
  gameContext.displayMessage(
    "飛行船の改造工房に来ました。（この機能はまだ開発中です）"
  );
  // 将来的に飛行船のアップグレードなどのロジックを追加
}

/**
 * 街を散策する
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function strollTown(gameContext) {
  gameContext.startStrollExploration(30); // 30分間の散策を開始
}

/**
 * 飛行船に戻る
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function returnToAirship(gameContext) {
  gameContext.displayMessage("飛行船に戻りました。");
  gameContext.currentLocation = "飛行船";
}
