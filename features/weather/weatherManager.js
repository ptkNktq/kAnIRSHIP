// features/weather/weatherManager.js

// 天候パターンと対応するアイコンID
const weatherPatterns = [
  { name: "晴れ", iconId: "sunny" },
  { name: "曇り", iconId: "cloudy" },
  { name: "雨", iconId: "rainy" },
  { name: "嵐", iconId: "stormy" },
  { name: "雪", iconId: "snowy" },
];

// DOM要素の参照を保持する変数
let weatherDisplay;
let weatherIcons = {}; // オブジェクトとして初期化

/**
 * WeatherManagerを初期化する関数
 * @param {Object} elements - 必要なDOM要素の参照を含むオブジェクト
 * @param {Object} svgIcons - 天気アイコンのSVG文字列を含むオブジェクト
 */
export function initWeather(elements, svgIcons) {
  weatherDisplay = elements.weatherDisplay;
  const weatherIconContainer = elements.weatherIconContainer;

  // weatherIconContainerにSVGアイコンを挿入
  if (weatherIconContainer) {
    for (const iconId in svgIcons) {
      weatherIconContainer.innerHTML += svgIcons[iconId];
    }
  }

  // 挿入されたSVGアイコンへの参照を取得
  weatherIcons = {
    sunny: document.getElementById("icon-sunny"),
    cloudy: document.getElementById("icon-cloudy"),
    rainy: document.getElementById("icon-rainy"),
    stormy: document.getElementById("icon-stormy"),
    snowy: document.getElementById("icon-snowy"),
  };
}

/**
 * 天候をランダムに設定し、表示を更新する関数
 * @param {function} displayMessage - メッセージログに表示するためのコールバック関数
 */
export function setRandomWeather(displayMessage) {
  const randomIndex = Math.floor(Math.random() * weatherPatterns.length);
  const selectedWeather = weatherPatterns[randomIndex];

  weatherDisplay.textContent = selectedWeather.name;

  // すべてのアイコンを非表示にする
  for (const key in weatherIcons) {
    if (weatherIcons[key]) {
      // 要素が存在するか確認
      weatherIcons[key].style.display = "none";
    }
  }

  // 選択されたアイコンを表示する
  if (weatherIcons[selectedWeather.iconId]) {
    // 要素が存在するか確認
    weatherIcons[selectedWeather.iconId].style.display = "block";
  }
  displayMessage(`天候が「${selectedWeather.name}」になりました。`); // メッセージログに表示
}
