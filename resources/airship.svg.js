// resources/airshipSvg.js

export const airshipSvgString = `
<svg
    class="airship-svg"
    viewBox="0 0 40 30"
    preserveAspectRatio="xMidYMid meet"
>
    <!-- 飛行船本体 (バルーン部分) - 右向きで先頭が丸く、後ろが少し角丸に、灰色系に -->
    <!-- ベースカラー: #696969 (濃い灰色) -->
    <rect x="6" y="8" width="31" height="10" fill="#696969" />
    <!-- メインボディ (幅+3px) -->
    <!-- 前方 (右) の丸み -->
    <rect x="37" y="9" width="2" height="8" fill="#696969" />
    <!-- x+3px -->
    <rect x="39" y="10" width="1" height="6" fill="#696969" />
    <!-- x+3px -->
    <!-- 後方 (左) の角丸 -->
    <rect x="4" y="9" width="2" height="8" fill="#696969" />
    <rect x="3" y="10" width="1" height="6" fill="#696969" />

    <!-- ハイライトカラー: #778899 (明るい灰色/スレートグレー) -->
    <rect x="7" y="9" width="29" height="8" fill="#778899" />
    <!-- メインハイライト (幅+3px) -->
    <!-- 前方 (右) のハイライト -->
    <rect x="36" y="10" width="2" height="6" fill="#778899" />
    <!-- x+3px -->
    <!-- 後方 (左) のハイライト -->
    <rect x="5" y="10" width="2" height="6" fill="#778899" />

    <!-- ゴンドラ部分 - 半月っぽい木製の船に (上下反転、空気部分より少し離す) -->
    <!-- 木製の色: #8B4513 (濃い木の色), #A0522D (明るい木の色) -->
    <!-- 下から上へ積み重ねて半月（逆さ）を表現 -->
    <rect x="10" y="24" width="20" height="2" fill="#8B4513" />
    <rect x="9" y="23" width="22" height="1" fill="#8B4513" />
    <rect x="8" y="22" width="24" height="1" fill="#8B4513" />
    <rect x="7" y="21" width="26" height="1" fill="#8B4513" />
    <rect x="8" y="22" width="24" height="1" fill="#A0522D" />

    <!-- プロペラ (左側に1つだけ配置) -->
    <rect x="5" y="23" width="2" height="2" fill="#404040" />

    <!-- 紐 (バルーンとゴンドラをつなぐ) - 位置調整 -->
    <!-- バルーンの底 (y=18) から船のトップ (y=21) までを繋ぐ -->
    <rect x="14" y="18" width="1" height="3" fill="#556B2F" />
    <rect x="25" y="18" width="1" height="3" fill="#556B2F" />

    <!-- 舵輪 (後方、船の上、バルーンとの間に配置) -->
    <!-- サイズを小さくし、紐のすぐ後ろに1px開けて、バルーンと接しないように調整 -->
    <!-- 垂直のブレード部分 -->
    <rect x="12" y="19" width="1" height="2" fill="#5C4033" />
    <!-- 水平のハンドル部分 -->
    <rect x="11" y="20" width="2" height="1" fill="#5C4033" />

    <!-- 船首の棒 (前方に追加) -->
    <rect x="33" y="20" width="4" height="1" fill="#5C4033" />
</svg>
`;
