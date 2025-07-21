// resources/domLoader.js

import { airshipSvgString } from "./airship.svg.js";
import { bagSvgString } from "./bag.svg.js";
// weatherIconsSvgの挿入はweatherManager.jsで行うため、ここでは不要です。

document.addEventListener("DOMContentLoaded", () => {
  // 飛行船SVGを挿入
  const airshipContainer = document.getElementById("airshipContainer");
  if (airshipContainer) {
    airshipContainer.innerHTML = airshipSvgString;
  }

  // バッグアイコンSVGを挿入
  const bagIconContainer = document.getElementById("bagIcon");
  if (bagIconContainer) {
    bagIconContainer.innerHTML = bagSvgString;
  }
});
