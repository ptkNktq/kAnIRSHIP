// location/airship.js

/**
 * 飛行船のタイトルを返す
 * @returns {string}
 */
export function getTitle() {
  return "飛行船";
}

/**
 * 飛行船のメッセージを返す
 * @returns {string}
 */
export function getMessage() {
  return `
        <p>飛行船は現在、空を航行しています。次の行動を選択してください。</p>
        <p>燃料を消費しながら目的地を目指します。</p>
    `;
}

/**
 * 飛行船での行動リストを返す
 * @returns {Array<Object>}
 */
export function getActions() {
  return [
    {
      subtitle: "操縦",
      buttons: [{ text: "風に身を任せる", actionName: "explore" }],
    },
    {
      subtitle: "", // サブタイトルなし（横線のみ）
      buttons: [
        {
          text: "停泊する",
          actionName: "anchor",
          className: "choice-button-primary",
        },
      ],
    },
  ];
}

/**
 * 飛行船での行動を実行する
 * @param {string} actionName - 実行する行動の名前
 * @param {Object} gameContext - ゲームのコンテキスト（状態と関数）
 */
export function executeAction(actionName, gameContext) {
  switch (actionName) {
    case "explore":
      gameContext.displayMessage("風に身を任せて航行しています...");
      // shipStateはgame.jsのstartAirshipExploration内で「操縦中」に設定される
      gameContext.startAirshipExploration(60, 0.1, 5); // 60分探索、10分で1燃料消費、初期燃料消費5
      break;
    case "anchor":
      gameContext.displayMessage("飛行船を停泊させました。(30分経過)"); // メッセージに時間を追加したわ！
      gameContext.shipState = "離船中"; // ここを「離船中」に変更
      gameContext.currentLocation = gameContext.getRandomTownType(); // ランダムな街に到着
      gameContext.advanceGameTime(30); // 30分進める
      gameContext.updateMainContent(); // 停泊完了後にメインコンテンツを更新
      break;
    default: // 不明な行動の場合も更新
      gameContext.updateMainContent(); // 不明な行動の場合も更新
      break;
  }
}
