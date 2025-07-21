// features/inventory/item.js

// アイテムの画像URLを生成するヘルパー関数
function generateItemImageUrl(item) {
  const baseUrl = "https://placehold.co/";
  const width = item.size.width * 60; // 1セル60pxと仮定
  const height = item.size.height * 60; // 1セル60pxと仮定
  const bgColor = item.color.replace("#", ""); // #を削除
  const textColor = "FFFFFF"; // テキスト色は白に固定
  const itemText = encodeURIComponent(item.name.replace(/ /g, "+")); // アイテム名をURLエンコードし、スペースを+に置換

  return `${baseUrl}${width}x${height}/${bgColor}/${textColor}?text=${itemText}`;
}

/**
 * ゲーム内の全てのアイテム定義
 */
export const allItemDefinitions = [
  {
    id: "fuel_tank",
    name: "燃料タンク",
    description: "飛行船の燃料を補給する。",
    type: "consumable",
    size: { width: 1, height: 2 },
    stackLimit: 10,
    color: "#FF6347",
  }, // Tomato
  {
    id: "repair_kit",
    name: "修理キット",
    description: "飛行船の損傷を修理する。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 5,
    color: "#8A2BE2",
  }, // BlueViolet
  {
    id: "scrap_metal",
    name: "スクラップ金属",
    description: "ガラクタの金属。何かに使えるかも？",
    type: "material",
    size: { width: 1, height: 1 },
    stackLimit: 20,
    color: "#A9A9A9",
  }, // DarkGray
  {
    id: "rare_gem",
    name: "レアな宝石",
    description: "非常に珍しい輝く宝石。高値で売れる。",
    type: "valuable",
    size: { width: 1, height: 1 },
    stackLimit: 3,
    color: "#00CED1",
  }, // DarkTurquoise
  {
    id: "compass",
    name: "方位磁石",
    description: "方角を示す。",
    type: "tool",
    size: { width: 1, height: 1 },
    stackLimit: 1,
    color: "#D2B48C",
  }, // Tan
  {
    id: "map",
    name: "地図",
    description: "周辺の地形が描かれた地図。",
    type: "tool",
    size: { width: 2, height: 2 },
    stackLimit: 1,
    color: "#CD853F",
  }, // Peru
  {
    id: "old_book",
    name: "古びた本",
    description: "読めない文字で書かれている。",
    type: "misc",
    size: { width: 1, height: 1 },
    stackLimit: 5,
    color: "#8B4513",
  }, // SaddleBrown
  {
    id: "empty_bottle",
    name: "空き瓶",
    description: "何かに使えるかもしれない空の瓶。",
    type: "misc",
    size: { width: 1, height: 1 },
    stackLimit: 10,
    color: "#ADD8E6",
  }, // LightBlue
  {
    id: "rope",
    name: "ロープ",
    description: "丈夫なロープ。",
    type: "material",
    size: { width: 1, height: 1 },
    stackLimit: 15,
    color: "#BDB76B",
  }, // DarkKhaki
  {
    id: "cloth",
    name: "布",
    description: "使い古された布。",
    type: "material",
    size: { width: 1, height: 1 },
    stackLimit: 20,
    color: "#F0E68C",
  }, // Khaki
  {
    id: "gear",
    name: "歯車",
    description: "機械の部品。",
    type: "material",
    size: { width: 1, height: 1 },
    stackLimit: 10,
    color: "#696969",
  }, // DimGray
  {
    id: "spring",
    name: "バネ",
    description: "弾力性のあるバネ。",
    type: "material",
    size: { width: 1, height: 1 },
    stackLimit: 10,
    color: "#FFD700",
  }, // Gold
  {
    id: "wire",
    name: "ワイヤー",
    description: "細い金属線。",
    type: "material",
    size: { width: 1, height: 1 },
    stackLimit: 25,
    color: "#B0C4DE",
  }, // LightSteelBlue
  {
    id: "battery",
    name: "バッテリー",
    description: "電力を供給する。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 8,
    color: "#32CD32",
  }, // LimeGreen
  {
    id: "medicine",
    name: "薬",
    description: "体力を回復する。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 10,
    color: "#FF69B4",
  }, // HotPink
  {
    id: "food_ration",
    name: "食料",
    description: "空腹を満たす。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 15,
    color: "#DAA520",
  }, // Goldenrod
  {
    id: "water_bottle",
    name: "水筒",
    description: "水を運ぶための容器。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 5,
    color: "#4682B4",
  }, // SteelBlue
].map((item) => ({
  ...item,
  imageUrl: generateItemImageUrl(item), // 各アイテムにimageUrlを追加
}));

/**
 * アイテムIDからアイテム定義を取得する
 * @param {string} itemId - アイテムのID
 * @returns {Object|undefined} アイテム定義、または見つからない場合はundefined
 */
export function getItemDefinition(itemId) {
  return allItemDefinitions.find((item) => item.id === itemId);
}

/**
 * アイテムを使用する際のロジック (プレースホルダー)
 * @param {Object} item - 使用するアイテムオブジェクト
 * @param {Object} gameContext - ゲームのコンテキスト（状態と関数）
 */
export function useItem(item, gameContext) {
  switch (item.id) {
    case "fuel_tank":
      // 燃料タンク使用時のロジック
      gameContext.displayMessage("燃料タンクを使った！");
      // ここに燃料回復のロジックを追加
      break;
    case "repair_kit":
      // 修理キット使用時のロジック
      gameContext.displayMessage("修理キットを使った！");
      // ここに船体修理のロジックを追加
      break;
    // 他のアイテムのケースを追加
    default:
      gameContext.displayMessage(`${item.name}はまだ使えないようだ...`);
      break;
  }
}
