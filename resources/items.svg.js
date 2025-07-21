// resources/items.svg.js

export const mapSvgString = `
<svg class="w-40 h-40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="currentColor">
    <rect x="0" y="0" width="100" height="100" fill="#FBF3D4" stroke="#D4B483" stroke-width="2" rx="4" ry="4"/>

    <g fill="#92400E">
        <rect x="10" y="15" width="25" height="20" rx="2" ry="2"/>
        <rect x="25" y="10" width="10" height="10" rx="2" ry="2"/>
        <rect x="15" y="30" width="15" height="10" rx="2" ry="2"/>

        <rect x="40" y="25" width="30" height="35" rx="2" ry="2"/>
        <rect x="35" y="35" width="5" height="10" rx="2" ry="2"/>
        <rect x="70" y="30" width="10" height="15" rx="2" ry="2"/>

        <rect x="60" y="70" width="15" height="10" rx="2" ry="2"/>
        <rect x="75" y="65" width="8" height="8" rx="2" ry="2"/>
        <rect x="55" y="80" width="10" height="5" rx="2" ry="2"/>

        <rect x="5" y="50" width="10" height="30" rx="2" ry="2"/>
    </g>
</svg>
`;

export const repairKitSvgString = `
<svg class="w-40 h-40"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100">
    <!-- Tool body color (a metallic gray) -->
    <!-- Rotate the entire tool group by 45 degrees around its center (50, 50) -->
    <g fill="#78716C" transform="rotate(45 50 50)"> <!-- A muted gray, like aged metal -->
        <!-- Wrench head (left) -->
        <rect x="5" y="30" width="20" height="40" rx="2" ry="2"/>
        <rect x="25" y="35" width="5" height="30" rx="2" ry="2"/>
        <rect x="15" y="25" width="10" height="5" rx="2" ry="2"/>
        <rect x="15" y="70" width="10" height="5" rx="2" ry="2"/>

        <!-- Wrench handle -->
        <rect x="30" y="45" width="60" height="10" rx="2" ry="2"/>

        <!-- Wrench head (right, slightly offset for old look) -->
        <rect x="75" y="35" width="20" height="30" rx="2" ry="2"/>
        <rect x="70" y="40" width="5" height="20" rx="2" ry="2"/>
    </g>
    <!-- Optional: Add a small detail with a different color, like a worn brass screw -->
    <!-- This circle is outside the rotated group to remain unrotated, or could be included if desired to rotate with the tool -->
    <circle cx="50" cy="50" r="4" fill="#D97706"/> <!-- A warm orange/brass color -->
</svg>
`;
