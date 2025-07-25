# インベントリシステム
- インベはカバンと船体コンテナの2種類ある
- カバンはPCのもの
- 船体コンテナは飛行船のもの
- アイテムについての処理は item.js に任せる
- カバン/船体コンテナ間はD&Dでアイテム移動可能

### UI
- モーダルで表示する
- 表示/非表示のショートカットはE
  - モーダルクリックでも閉じれる
- カバンは左、船体コンテナは右側に表示する

### カバン
- 初期アイテムは、修理キットx2/燃料タンクx2/地図x1
- 上限はアイテム6種類まで
  - それぞれのアイテム数はアイテムのスタック上限に依存

### 船体コンテナ
- 最小4x4、最大7x7で
  - 例えば4x4のとき、16マスが有効ではなく、縦横4x4の範囲が有効になるようにする
