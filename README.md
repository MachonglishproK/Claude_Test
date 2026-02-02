# Weekly Review Dashboard

週次ふりかえり＆目標管理ダッシュボード（PWA）

## 開発・起動

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # プロダクションビルド
npm run preview  # ビルド結果プレビュー
```

## 画面一覧

| パス | 画面名 | 機能 |
|------|--------|------|
| `/dashboard` | ダッシュボード | 直近8週の気分・運動回数・目標達成率のチャート、未完了目標 |
| `/checkin` | チェックイン | 5ステップウィザードで週次チェックイン（途中保存対応） |
| `/goals` | 目標管理 | 目標のCRUD、今週の達成状況チェック |
| `/reports` | レポート | 週次レポートの表示、印刷/PDF出力 |
| `/data` | データ管理 | JSONエクスポート/インポート、デモデータ投入 |
| `/settings` | 設定 | テーマ（ライト/ダーク）、言語（日本語/英語） |

## データ保存の仕様

- **保存場所**: ブラウザのIndexedDB（`localforage`ライブラリ使用）
- **データベース名**: `weekly-review-dashboard`

### データモデル

```typescript
interface Goal {
  id: string;
  title: string;
  category: 'health' | 'work' | 'learning' | 'personal' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  difficulty: 1 | 2 | 3 | 4 | 5;
  ifThen?: string;
  createdAt: string;
}

interface CheckIn {
  id: string;
  weekStart: string;
  mood: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  mealSummary: string;
  exerciseSummary: string;
  exerciseCount: number;
  obstacles: string;
  notes: string;
  createdAt: string;
}

interface GoalProgress {
  id: string;
  goalId: string;
  weekStart: string;
  done: boolean;
}
```

## Import/Exportの使い方

### エクスポート
1. `/data` 画面で「JSONエクスポート」をクリック
2. `weekly-review-YYYY-MM-DD.json` がダウンロードされる

### インポート
1. `/data` 画面で「ファイルを選択」をクリック
2. JSONファイルを選択すると自動でインポート

### デモデータ
1. `/data` 画面で「デモデータを読み込む」をクリック
2. 過去8週分のサンプルデータが生成される

## 技術スタック

- Vite + React + TypeScript
- React Router
- localforage（IndexedDB）
- react-hook-form + zod
- recharts
- vite-plugin-pwa
