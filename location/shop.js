// location/shop.js

import { getItemDefinition } from "../features/inventory/item.js"; // item.jsからgetItemDefinitionをインポート

// 現在の訪問での価格を保持する変数
let currentVisitPrices = {
  fuelTankPrice: 0,
  repairKitPrice: 0,
  // priceMultiplierはsmallTownから渡されるため、ここでは保持しない
};

export function getTitle() {
  return "お店";
}

export function getMessage() {
  // クエスト情報をメッセージに追加
  return "様々な商品が並ぶお店です。必要なものを探してみましょう。";
}

export function getInfo() {
  return "このお店では、旅に必要な燃料や、船の修理に役立つキットなどを購入できます。品揃えは豊富ではありませんが、困った時には頼りになるでしょう。";
}

/**
 * 受注できるクエストがない場合のメッセージを返す関数
 * @returns {string} クエストがない場合のメッセージテキスト
 */
export function getNoQuestMessage() {
  return "今は受注できるクエストは何もありません。";
}

/**
 * 現在のお店の価格情報を整形して返す関数
 * @returns {string} フォーマットされた価格情報
 */
export function getPricesInfo() {
  return (
    `燃料タンク: ${currentVisitPrices.fuelTankPrice.toLocaleString()} バルク\n` +
    `修理キット: ${currentVisitPrices.repairKitPrice.toLocaleString()} バルク`
  );
}

/**
 * お店に到着した時点で価格を計算し、設定する関数
 * この関数はgame.jsから呼び出されることを想定しています。
 * @param {number} priceMultiplier - 街から渡される固定の価格倍率。
 * @param {Object|null} gameContext - ゲームのコンテキスト (現在は使用しないが、引数として受け取る)
 */
export function calculatePricesForVisit(
  priceMultiplier, // fixedMultiplierではなく、直接priceMultiplierとして受け取る
  gameContext = null
) {
  const fuelTankDef = getItemDefinition("fuel_tank");
  const repairKitDef = getItemDefinition("repair_kit");

  currentVisitPrices.fuelTankPrice = Math.round(
    fuelTankDef.price * priceMultiplier
  );
  currentVisitPrices.repairKitPrice = Math.round(
    repairKitDef.price * priceMultiplier
  );

  console.log(
    `Shop Prices calculated: FuelTank=${
      currentVisitPrices.fuelTankPrice
    }, RepairKit=${
      currentVisitPrices.repairKitPrice
    } (Multiplier: ${priceMultiplier.toFixed(2)})`
  );
}

/**
 * お店での行動リストを返す関数
 * @param {Object} gameContext - ゲームのコンテキスト
 * @returns {Array<Object>} 行動セクションの配列
 */
export function getActions(gameContext) {
  return [
    {
      subtitle: "商品を購入",
      buttons: [
        {
          text: "燃料タンクを購入",
          actionName: "buyFuelTank",
          className: "choice-button-default",
          disabledCondition: (context) =>
            context.currentMoney < currentVisitPrices.fuelTankPrice,
        },
        {
          text: "修理キットを購入",
          actionName: "buyRepairKit",
          className: "choice-button-default",
          disabledCondition: (context) =>
            context.currentMoney < currentVisitPrices.repairKitPrice,
        },
      ],
    },
    {
      subtitle: "クエスト",
      buttons: [], // ボタンは空にする
      message: {
        // 新しく追加: ボタンがない場合に表示するテキスト情報
        text: getNoQuestMessage(), // getNoQuestMessageからテキストを取得
        className: "no-action-message", // 新しいクラス名
      },
    },
    {
      subtitle: null, // サブタイトルなし
      buttons: [
        {
          text: "お店を出る",
          actionName: "exitShop",
          className: "choice-button-primary",
        },
      ],
    },
  ];
}

export function executeAction(actionName, gameContext) {
  switch (actionName) {
    case "buyFuelTank":
      buyFuelTank(gameContext);
      break;
    case "buyRepairKit":
      buyRepairKit(gameContext);
      break;
    case "exitShop":
      exitShop(gameContext);
      break;
    default:
      gameContext.displayMessage("不明な行動です。");
      break;
  }
}

/**
 * 燃料タンクを購入する
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function buyFuelTank(gameContext) {
  const cost = currentVisitPrices.fuelTankPrice;
  if (gameContext.currentMoney >= cost) {
    const fuelTankDef = getItemDefinition("fuel_tank"); // getItemDefinitionで取得
    const addedSuccessfully = gameContext.addItemToBag(fuelTankDef, 1); // 1個購入
    if (addedSuccessfully) {
      gameContext.currentMoney -= cost;
      gameContext.displayMessage(
        `燃料タンクを${cost.toLocaleString()}バルクで購入しました。`
      );
    } else {
      gameContext.displayMessage(
        "カバンがいっぱいで燃料タンクを持ちきれません。"
      );
    }
  } else {
    gameContext.displayMessage(
      `お金が足りません。（必要: ${cost.toLocaleString()} バルク）`
    );
  }
}

/**
 * 修理キットを購入する
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function buyRepairKit(gameContext) {
  const cost = currentVisitPrices.repairKitPrice;
  if (gameContext.currentMoney >= cost) {
    const repairKitDef = getItemDefinition("repair_kit"); // getItemDefinitionで取得
    const addedSuccessfully = gameContext.addItemToBag(repairKitDef, 1); // 1個購入
    if (addedSuccessfully) {
      gameContext.currentMoney -= cost;
      gameContext.displayMessage(
        `修理キットを${cost.toLocaleString()}バルクで購入しました。`
      );
    } else {
      gameContext.displayMessage(
        "カバンがいっぱいで修理キットを持ちきれません。"
      );
    }
  } else {
    gameContext.displayMessage(
      `お金が足りません。（必要: ${cost.toLocaleString()} バルク）`
    );
  }
}

/**
 * お店を出る
 * @param {Object} gameContext - ゲームのコンテキスト
 */
function exitShop(gameContext) {
  gameContext.displayMessage(`${gameContext.previousLocation}に戻りました。`);
  gameContext.currentLocation = gameContext.previousLocation; // 前の場所に戻す
  // 時間経過はなし
}
