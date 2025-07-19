// location/island.js

/**
 * 無人島のタイトルを返す
 * @returns {string}
 */
export function getTitle() {
  return "無人島";
}

/**
 * 無人島のメッセージを返す
 * @returns {string}
 */
export function getMessage() {
  return `
        <p>船は現在、無人島の海岸に停泊しています。次の行動を選択してください。</p>
        <p>ここでは、探索して物資を見つけたり、再び航海に出たりできます。</p>
    `;
}

/**
 * 無人島での行動リストを返す
 * @returns {Array<Object>}
 */
export function getActions() {
  return [
    {
      subtitle: "行動",
      buttons: [{ text: "探索する", actionName: "explore" }],
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
 * 無人島での行動を実行する
 * @param {string} actionName - 実行する行動の名前
 * @param {Object} gameContext - ゲームのコンテキスト（状態と関数）
 */
export function executeAction(actionName, gameContext) {
  switch (actionName) {
    case "explore":
      gameContext.displayMessage("無人島を探索しています...");
      gameContext.startIslandExploration(60); // 60分探索
      break;
    case "depart":
      gameContext.shipState = "停泊中"; // 飛行船に戻ったら停泊中に変更
      gameContext.currentLocation = "飛行船"; // 現在地を飛行船に変更
      gameContext.displayMessage("飛行船に戻りました！"); // メッセージを変更
      gameContext.advanceGameTime(10); // 10分進める (出発にかかる時間)
      gameContext.updateMainContent(); // 出発後にメインコンテンツを更新
      break;
    default:
      gameContext.displayMessage("不明な行動です。");
      gameContext.updateMainContent(); // 不明な行動の場合も更新
      break;
  }
}
