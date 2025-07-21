// smallTown.test.js

// テスト対象のモジュールをインポート
import * as SmallTown from "../location/smallTown.js";

/**
 * テストユーティリティ関数
 * @param {string} name - テストの名前
 * @param {function} testFunction - 実行するテスト関数
 */
function test(name, testFunction) {
  try {
    testFunction();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(error);
  }
}

// テストスイートの開始
console.log("--- SmallTown.js Actions Tests ---");

test("getActions() は正しい数のセクションを返すこと", () => {
  const actions = SmallTown.getActions();
  // 新しい構成に合わせてセクション数を調整
  console.assert(actions.length === 3, `期待値: 3, 実際: ${actions.length}`);
});

test("getActions() は正しいサブタイトルとボタンを持つこと", () => {
  const actions = SmallTown.getActions();

  // 1番目のセクション: 行動
  console.assert(
    actions[0].subtitle === "行動",
    `1番目のサブタイトル: 期待値 '行動', 実際 '${actions[0].subtitle}'`
  );
  console.assert(
    actions[0].buttons.length === 2,
    `1番目のボタン数: 期待値 2, 実際 ${actions[0].buttons.length}`
  );
  console.assert(
    actions[0].buttons[0].text === "街を散策する (30分)",
    `1番目のボタンテキスト: 期待値 '街を散策する (30分)', 実際 '${actions[0].buttons[0].text}'`
  );
  console.assert(
    actions[0].buttons[1].text === "お店に行く",
    `2番目のボタンテキスト: 期待値 'お店に行く', 実際 '${actions[0].buttons[1].text}'`
  );

  // 2番目のセクション: 飛行船
  console.assert(
    actions[1].subtitle === "飛行船",
    `2番目のサブタイトル: 期待値 '飛行船', 実際 '${actions[1].subtitle}'`
  );
  console.assert(
    actions[1].buttons.length === 2,
    `2番目のボタン数: 期待値 2, 実際 ${actions[1].buttons.length}`
  ); // 期待値を3から2に変更したわ！
  console.assert(
    actions[1].buttons[0].text === "修理する",
    `3番目のボタンテキスト: 期待値 '修理する', 実際 '${actions[1].buttons[0].text}'`
  );
  console.assert(
    actions[1].buttons[1].text === "燃料補給する",
    `4番目のボタンテキスト: 期待値 '燃料補給する', 実際 '${actions[1].buttons[1].text}'`
  );
  // 「改造する」ボタンのテストは削除したわ！

  // 3番目のセクション: サブタイトルなし (移動)
  console.assert(
    actions[2].subtitle === null,
    `3番目のサブタイトル: 期待値 null, 実際 '${actions[2].subtitle}'`
  );
  console.assert(
    actions[2].buttons.length === 1,
    `3番目のボタン数: 期待値 1, 実際 ${actions[2].buttons.length}`
  );
  console.assert(
    actions[2].buttons[0].text === "飛行船に戻る",
    `6番目のボタンテキスト: 期待値 '飛行船に戻る', 実際 '${actions[2].buttons[0].text}'`
  );
});

console.log("--- End SmallTown.js Actions Tests ---");
