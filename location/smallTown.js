// location/smallTown.js

/**
 * 小さな街のタイトルを返す
 * @returns {string}
 */
export function getTitle() {
  return "小さな街";
}

/**
 * 小さな街のメッセージを返す
 * @returns {string}
 */
export function getMessage() {
  return `
        <p>船は現在、小さな街の港に停泊しています。次の行動を選択してください。</p>
        <p>ここでは、物資の補給や船の修理、情報収集などができます。</p>
    `;
}

/**
 * 小さな街の情報を返す
 * @returns {string}
 */
export function getInfo() {
  return "この小さな街は、静かで穏やかな場所です。主要な産業はありませんが、旅人にとっては良い休憩所となるでしょう。";
}

/**
 * 小さな街での行動リストを返す
 * @returns {Array<Object>}
 */
export function getActions() {
  return [
    {
      subtitle: "行動",
      buttons: [
        { text: "物資を補給する", actionName: "supply" },
        { text: "散策する", actionName: "stroll" },
      ],
    },
    {
      subtitle: "飛行船",
      buttons: [
        {
          text: "船を修理する",
          actionName: "repairShip",
          disabledCondition: (context) =>
            context.currentHealth === context.maxHealth,
        },
        {
          text: "燃料を補給する",
          actionName: "refuel",
          disabledCondition: (context) =>
            context.currentFuel === context.maxFuel,
        },
      ],
    },
    {
      subtitle: "", // サブタイトルなし（横線のみ）
      buttons: [
        {
          text: "飛行船に戻る",
          actionName: "depart",
          className: "choice-button-primary",
        }, // テキストを変更
      ],
    },
  ];
}

/**
 * 小さな街での行動を実行する
 * @param {string} actionName - 実行する行動の名前
 * @param {Object} gameContext - ゲームのコンテキスト（状態と関数）
 */
export function executeAction(actionName, gameContext) {
  switch (actionName) {
    case "supply":
      gameContext.displayMessage("お店は閉まっているようです...");
      gameContext.updateMainContent(); // 行動後、メインコンテンツを更新
      break;
    case "stroll":
      gameContext.startStrollExploration(15); // 15分散策
      break;
    case "repairShip":
      gameContext.displayMessage("船を修理しました。");
      gameContext.currentHealth = gameContext.maxHealth; // 体力を全回復
      gameContext.advanceGameTime(60); // 1時間進める
      gameContext.updateMainContent(); // 行動後、メインコンテンツを更新
      break;
    case "refuel":
      const fuelCost = (gameContext.maxFuel - gameContext.currentFuel) * 2; // 1燃料あたり2バルク
      if (gameContext.currentMoney >= fuelCost) {
        gameContext.currentMoney = Math.max(
          0,
          gameContext.currentMoney - fuelCost
        ); // お金がマイナスにならないように
        gameContext.currentFuel = gameContext.maxFuel;
        gameContext.displayMessage(
          `燃料を${gameContext.maxFuel}まで満タンにしました。${fuelCost}バルク消費しました。`
        );
        gameContext.advanceGameTime(30); // 30分進める
      } else {
        gameContext.displayMessage("燃料を補給するお金が足りません。");
      }
      gameContext.updateMainContent(); // 行動後、メインコンテンツを更新
      break;
    case "depart":
      gameContext.shipState = "停泊中"; // 飛行船に戻ったら停泊中に変更
      gameContext.currentLocation = "飛行船"; // 現在地を飛行船に変更
      gameContext.displayMessage("飛行船に戻りました！"); // メッセージを変更
      gameContext.advanceGameTime(10); // 10分進める (出発にかかる時間)
      gameContext.updateMainContent(); // 行動後、メインコンテンツを更新
      break;
    default:
      gameContext.displayMessage("不明な行動です。");
      gameContext.updateMainContent(); // 不明な行動の場合も更新
      break;
  }
}
