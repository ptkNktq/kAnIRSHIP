// features/inventory/item.js

// アイテムの画像URLを生成するヘルパー関数
function generateItemImageUrl(item) {
  const baseUrl = "https://placehold.co/";
  const width = item.size.width * 60; // 1セル60pxと仮定
  const height = item.size.height * 60; // 1セル60pxと仮定
  const bgColor = item.color.replace("#", ""); // #を削除
  const textColor = "FFFFFF"; // テキスト色は白に固定
  // アイテム名をURLに含めないように修正
  // const itemText = encodeURIComponent(item.name.replace(/ /g, "+")); // アイテム名をURLエンコードし、スペースを+に置換

  return `${baseUrl}${width}x${height}/${bgColor}/${textColor}`; // itemTextを削除
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
    description: "飛行船の損傷を修理する。体力を回復する。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 10,
    color: "#FF69B4",
  }, // HotPink
  {
    id: "food_ration",
    name: "食料",
    description: "空腹を満たす。体力を回復する。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 15,
    color: "#DAA520",
  }, // Goldenrod
  {
    id: "water_bottle",
    name: "水筒",
    description: "水を運ぶための容器。体力を回復する。",
    type: "consumable",
    size: { width: 1, height: 1 },
    stackLimit: 5,
    color: "#4682B4",
  }, // SteelBlue
  {
    id: "map",
    name: "地図",
    description: "現在の場所と周辺の地図。使用してもなくならない。",
    type: "tool", // 新しいタイプ: tool
    size: { width: 2, height: 2 }, // ここを2x2に変更
    stackLimit: 1,
    color: "#8B4513", // SaddleBrown
  },
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
 * @param {string} itemId - 使用するアイテムのID
 * @param {Object} gameContext - ゲームのコンテキストオブジェクト
 * @returns {boolean} - アイテムの使用に成功したかどうか
 */
export function useItem(itemId, gameContext) {
  // TODO: アイテム使用ロジックをここに実装
  gameContext.displayMessage(`${itemId}を使用しようとしました。`);
  return false;
}
