// shipyard.test.js

// テスト対象のモジュールをインポート
import * as Shipyard from "../location/shipyard.js";
import * as SmallTown from "../location/smallTown.js"; // SmallTownをインポート

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
console.log("--- Shipyard.js Actions Tests ---");

test("getTitle() は正しいタイトルを返すこと", () => {
  console.assert(
    Shipyard.getTitle() === "造船所",
    `タイトル: 期待値 '造船所', 実際 '${Shipyard.getTitle()}'`
  );
});

test("getMessage() は正しいメッセージを返すこと (通常時)", () => {
  const dummyGameContext = {
    previousLocation: "大きな街",
  };
  const expectedMessage =
    "巨大なドックと職人の活気に満ちた造船所に到着しました。ここでは船の修理、燃料補給、そして改造が可能です。";
  console.assert(
    Shipyard.getMessage(dummyGameContext) === expectedMessage,
    `メッセージ (通常時): 期待値 '${expectedMessage}', 実際 '${Shipyard.getMessage(
      dummyGameContext
    )}'`
  );
});

test("getMessage() は正しいメッセージを返すこと (小さな街からの場合)", () => {
  const dummyGameContext = {
    previousLocation: "小さな街",
  };
  const expectedMessage =
    "巨大なドックと職人の活気に満ちた造船所に到着しました。ここでは船の修理、燃料補給が可能です。";
  console.assert(
    Shipyard.getMessage(dummyGameContext) === expectedMessage,
    `メッセージ (小さな街からの場合): 期待値 '${expectedMessage}', 実際 '${Shipyard.getMessage(
      dummyGameContext
    )}'`
  );
});

test("getInfo() は正しい情報を返すこと (通常時)", () => {
  const dummyGameContext = {
    previousLocation: "大きな街",
  };
  const expectedInfo =
    "造船所は、あなたの飛行船を最高の状態に保つための場所です。経験豊富な職人たちが常駐しており、修理や燃料補給はもちろん、船の性能を向上させる改造も請け負っています。価格は他の街よりもお得なことが多いでしょう。";
  console.assert(
    Shipyard.getInfo(dummyGameContext) === expectedInfo,
    `情報 (通常時): 期待値 '${expectedInfo}', 実際 '${Shipyard.getInfo(
      dummyGameContext
    )}'`
  );
});

test("getInfo() は正しい情報を返すこと (小さな街からの場合)", () => {
  const dummyGameContext = {
    previousLocation: "小さな街",
  };
  const expectedInfo =
    "造船所は、あなたの飛行船を最高の状態に保つための場所です。経験豊富な職人たちが常駐しており、修理や燃料補給はもちろん可能です。価格は他の街よりもお得なことが多いでしょう。";
  console.assert(
    Shipyard.getInfo(dummyGameContext) === expectedInfo,
    `情報 (小さな街からの場合): 期待値 '${expectedInfo}', 実際 '${Shipyard.getInfo(
      dummyGameContext
    )}'`
  );
});

test("getActions() は正しい数のセクションを返すこと (通常時)", () => {
  // ダミーのgameContextを渡す (previousLocationが小さな街ではない場合)
  const dummyGameContext = {
    previousLocation: "大きな街",
  };
  const actions = Shipyard.getActions(dummyGameContext);
  console.assert(actions.length === 2, `期待値: 2, 実際: ${actions.length}`);
});

test("getActions() は正しいサブタイトルとボタンを持つこと (通常時)", () => {
  // ダミーのgameContextを渡す (previousLocationが小さな街ではない場合)
  const dummyGameContext = {
    previousLocation: "大きな街",
  };
  const actions = Shipyard.getActions(dummyGameContext);

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
    actions[0].buttons[0].text === "修理する",
    `1番目のボタンテキスト: 期待値 '修理する', 実際 '${actions[0].buttons[0].text}'`
  );
  console.assert(
    actions[0].buttons[1].text === "燃料補給する",
    `2番目のボタンテキスト: 期待値 '燃料補給する', 実際 '${actions[0].buttons[1].text}'`
  );
  console.assert(
    actions[0].buttons[2].text === "改造する",
    `3番目のボタンテキスト: 期待値 '改造する', 実際 '${actions[0].buttons[2].text}'`
  );

  // 2番目のセクション: サブタイトルなし (移動)
  console.assert(
    actions[1].subtitle === null,
    `2番目のサブタイトル: 期待値 null, 実際 '${actions[1].subtitle}'`
  );
  console.assert(
    actions[1].buttons.length === 1,
    `2番目のボタン数: 期待値 1, 実際 ${actions[1].buttons.length}`
  );
  console.assert(
    actions[1].buttons[0].text === "造船所を出る",
    `4番目のボタンテキスト: 期待値 '造船所を出る', 実際 '${actions[1].buttons[0].text}'`
  );
});

test("getActions() は「小さな街」からの場合に「改造する」ボタンを含まないこと", () => {
  const dummyGameContext = {
    previousLocation: "小さな街",
  };
  const actions = Shipyard.getActions(dummyGameContext);

  console.assert(actions.length === 2, `期待値: 2, 実際: ${actions.length}`);
  console.assert(
    actions[0].subtitle === "行動",
    `1番目のサブタイトル: 期待値 '行動', 実際 '${actions[0].subtitle}'`
  );
  console.assert(
    actions[0].buttons.length === 2, // 改造するボタンがないため2つ
    `1番目のボタン数: 期待値 2, 実際 ${actions[0].buttons.length}`
  );
  console.assert(
    actions[0].buttons[0].text === "修理する",
    `1番目のボタンテキスト: 期待値 '修理する', 実際 '${actions[0].buttons[0].text}'`
  );
  console.assert(
    actions[0].buttons[1].text === "燃料補給する",
    `2番目のボタンテキスト: 期待値 '燃料補給する', 実際 '${actions[0].buttons[1].text}'`
  );
  // 「改造する」ボタンが存在しないことを確認
  const hasModifyButton = actions[0].buttons.some(
    (button) => button.actionName === "modifyShip"
  );
  console.assert(
    !hasModifyButton,
    "「小さな街」からの場合、「改造する」ボタンは存在しないこと"
  );

  // 2番目のセクションは変わらないことを確認
  console.assert(
    actions[1].subtitle === null,
    `2番目のサブタイトル: 期待値 null, 実際 '${actions[1].subtitle}'`
  );
  console.assert(
    actions[1].buttons.length === 1,
    `2番目のボタン数: 期待値 1, 実際 ${actions[1].buttons.length}`
  );
});

test("calculatePricesForVisit() は価格を正しく設定すること (通常時)", () => {
  const dummyGameContext = {
    previousLocation: "大きな街",
  };
  Shipyard.calculatePricesForVisit(1.0, dummyGameContext); // fixedMultiplierとgameContextを渡す
  const pricesInfo = Shipyard.getPricesInfo(dummyGameContext);
  console.assert(
    pricesInfo.includes("現在の修理費用: 耐久1あたり 40 バルク"), // 体力から耐久に変更
    `修理費用情報: ${pricesInfo}`
  );
  console.assert(
    pricesInfo.includes("現在の燃料費用: 燃料1ユニットあたり 15 バルク"),
    `燃料費用情報: ${pricesInfo}`
  );
  console.assert(
    pricesInfo.includes("改造費用: 5,000 バルク"),
    `改造費用情報: ${pricesInfo}`
  );
});

test("calculatePricesForVisit() は「小さな街」からの場合に小さな街の現在の価格を参照すること", () => {
  const dummyGameContext = {
    previousLocation: "小さな街",
  };
  // smallTownの現在の価格をシミュレート
  const simulatedSmallTownPrices = {
    repairCostPerDurability: 55, // 例: 小さな街で計算された修理費用 (体力から耐久に変更)
    fuelCostPerUnit: 22, // 例: 小さな街で計算された燃料費用
  };

  // calculatePricesForVisitにsmallTownCurrentPricesを渡す
  Shipyard.calculatePricesForVisit(
    1.0,
    dummyGameContext,
    simulatedSmallTownPrices
  );
  const pricesInfo = Shipyard.getPricesInfo(dummyGameContext);

  // 造船所の倍率1.0を適用して、smallTownの価格がそのまま反映されることを期待
  console.assert(
    pricesInfo.includes(
      `現在の修理費用: 耐久1あたり ${simulatedSmallTownPrices.repairCostPerDurability} バルク`
    ), // 体力から耐久に変更
    `修理費用情報: ${pricesInfo}`
  );
  console.assert(
    pricesInfo.includes(
      `現在の燃料費用: 燃料1ユニットあたり ${simulatedSmallTownPrices.fuelCostPerUnit} バルク`
    ),
    `燃料費用情報: ${pricesInfo}`
  );
  console.assert(
    !pricesInfo.includes("改造費用:"), // 改造費用が含まれないことを確認
    `改造費用情報が含まれないこと: ${pricesInfo}`
  );
});

console.log("--- End Shipyard.js Actions Tests ---");
