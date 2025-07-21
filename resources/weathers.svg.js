// resources/weathers.svg.js

export const weatherIconsSvg = {
  sunny: `
        <svg id="icon-sunny" class="weather-icon-svg" viewBox="0 0 16 16">
            <rect x="7" y="0" width="2" height="2" fill="#FFD700" />
            <rect x="7" y="14" width="2" height="2" fill="#FFD700" />
            <rect x="0" y="7" width="2" height="2" fill="#FFD700" />
            <rect x="14" y="7" width="2" height="2" fill="#FFD700" />
            <rect x="3" y="3" width="2" height="2" fill="#FFD700" />
            <rect x="11" y="3" width="2" height="2" fill="#FFD700" />
            <rect x="3" y="11" width="2" height="2" fill="#FFD700" />
            <rect x="11" y="11" width="2" height="2" fill="#FFD700" />
            <rect x="6" y="6" width="4" height="4" fill="#FFD700" />
        </svg>
    `,
  cloudy: `
        <svg id="icon-cloudy" class="weather-icon-svg" viewBox="0 0 16 16">
            <rect x="2" y="8" width="12" height="4" fill="#CCCCCC" />
            <rect x="4" y="6" width="8" height="2" fill="#CCCCCC" />
            <rect x="3" y="7" width="10" height="1" fill="#CCCCCC" />
            <rect x="5" y="5" width="6" height="1" fill="#CCCCCC" />
        </svg>
    `,
  rainy: `
        <svg id="icon-rainy" class="weather-icon-svg" viewBox="0 0 16 16">
            <rect x="2" y="8" width="12" height="4" fill="#CCCCCC" />
            <rect x="4" y="6" width="8" height="2" fill="#CCCCCC" />
            <rect x="3" y="7" width="10" height="1" fill="#CCCCCC" />
            <rect x="5" y="5" width="6" height="1" fill="#CCCCCC" />
            <rect x="4" y="13" width="1" height="2" fill="#66B2FF" />
            <rect x="7" y="12" width="1" height="2" fill="#66B2FF" />
            <rect x="10" y="13" width="1" height="2" fill="#66B2FF" />
        </svg>
    `,
  stormy: `
        <svg id="icon-stormy" class="weather-icon-svg" viewBox="0 0 16 16">
            <rect x="2" y="8" width="12" height="4" fill="#999999" />
            <rect x="4" y="6" width="8" height="2" fill="#999999" />
            <rect x="3" y="7" width="10" height="1" fill="#999999" />
            <rect x="5" y="5" width="6" height="1" fill="#999999" />
            <polygon
                points="6,12 8,12 7,15 9,15 8,13 10,13 9,16 6,16"
                fill="#FFD700"
            />
        </svg>
    `,
  snowy: `
        <svg id="icon-snowy" class="weather-icon-svg" viewBox="0 0 16 16">
            <!-- 下の体 -->
            <rect x="4" y="9" width="8" height="6" fill="#FFFFFF" />
            <rect x="3" y="10" width="10" height="4" fill="#FFFFFF" />
            <!-- 中の体 -->
            <rect x="5" y="5" width="6" height="5" fill="#FFFFFF" />
            <rect x="4" y="6" width="8" height="3" fill="#FFFFFF" />
            <!-- 頭 -->
            <rect x="6" y="2" width="4" height="4" fill="#FFFFFF" />
            <rect x="7" y="1" width="2" height="1" fill="#FFFFFF" />
            <!-- 目 -->
            <rect x="7" y="3" width="1" height="1" fill="#000000" />
            <rect x="9" y="3" width="1" height="1" fill="#000000" />
            <!-- 鼻 (ニンジン) -->
            <rect x="8" y="4" width="1" height="1" fill="#FFA500" />
            <!-- ボタン -->
            <rect x="7" y="6" width="1" height="1" fill="#000000" />
            <rect x="7" y="8" width="1" height="1" fill="#000000" />
            <rect x="7" y="10" width="1" height="1" fill="#000000" />
        </svg>
    `,
};
