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
  console.assert(actions.length === 2, `期待値: 2, 実際: ${actions.length}`);
});

test("getActions() は正しいサブタイトルとボタンを持つこと", () => {
  const actions = SmallTown.getActions();

  // 1番目のセクション: 行動
  console.assert(
    actions[0].subtitle === "行動",
    `1番目のサブタイトル: 期待値 '行動', 実際 '${actions[0].subtitle}'`
  );
  console.assert(
    actions[0].buttons.length === 3,
    `1番目のボタン数: 期待値 3, 実際 ${actions[0].buttons.length}`
  );
  console.assert(
    actions[0].buttons[0].text === "街を散策する (30分)",
    `1番目のボタンテキスト: 期待値 '街を散策する (30分)', 実際 '${actions[0].buttons[0].text}'`
  );
  console.assert(
    actions[0].buttons[1].text === "お店に行く (10分)",
    `2番目のボタンテキスト: 期待値 'お店に行く (10分)', 実際 '${actions[0].buttons[1].text}'`
  );
  console.assert(
    actions[0].buttons[2].text === "造船所に行く (10分)",
    `3番目のボタンテキスト: 期待値 '造船所に行く (10分)', 実際 '${actions[0].buttons[2].text}'`
  );

  // 2番目のセクション: サブタイトルなし
  console.assert(
    actions[1].subtitle === null,
    `2番目のサブタイトル: 期待値 null, 実際 '${actions[1].subtitle}'`
  );
  console.assert(
    actions[1].buttons.length === 1,
    `2番目のボタン数: 期待値 1, 実際 ${actions[1].buttons.length}`
  );
  console.assert(
    actions[1].buttons[0].text === "飛行船に戻る",
    `3番目のボタンテキスト: 期待値 '飛行船に戻る', 実際 '${actions[1].buttons[0].text}'`
  );
});

test("calculatePricesForVisit() は価格を正しく設定すること", () => {
  // calculatePricesForVisitを明示的に呼び出してテスト
  SmallTown.calculatePricesForVisit(1.0); // 固定倍率でテスト
  const pricesInfo = SmallTown.getPricesInfo();
  console.assert(
    pricesInfo.includes("現在の修理費用: 体力1あたり 50 バルク"),
    `修理費用情報: ${pricesInfo}`
  );
  console.assert(
    pricesInfo.includes("現在の燃料費用: 燃料1ユニットあたり 20 バルク"),
    `燃料費用情報: ${pricesInfo}`
  );
});

test("getCurrentVisitPrices() は現在の訪問価格を返すこと", () => {
  SmallTown.calculatePricesForVisit(1.0); // 価格を一度設定
  const prices = SmallTown.getCurrentVisitPrices();
  console.assert(
    prices.repairCostPerHealth === 50,
    `修理費用: 期待値 50, 実際 ${prices.repairCostPerHealth}`
  );
  console.assert(
    prices.fuelCostPerUnit === 20,
    `燃料費用: 期待値 20, 実際 ${prices.fuelCostPerUnit}`
  );
});

console.log("--- End SmallTown.js Actions Tests ---");
