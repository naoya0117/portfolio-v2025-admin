# Portfolio Admin Dashboard

管理用のNext.jsアプリケーションです。Go APIと連携して認証機能を持っています。

## 機能

- JWT認証によるセキュアなログイン
- Go APIとの連携
- GraphQLクエリサポート
- 認証状態管理
- 保護されたルート

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして設定：

```bash
cp .env.local.example .env.local
```

### 3. Go APIの起動

先にGo APIサーバーが起動している必要があります。
`../api`ディレクトリでGo APIを起動してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 環境変数

- `NEXT_PUBLIC_API_URL`: Go APIのURL（デフォルト: http://localhost:8080）

## 認証

Go API側で設定された以下の環境変数でログインできます：
- `ADMIN_USERNAME`: 管理者ユーザー名
- `ADMIN_PASSWORD`: 管理者パスワード

## ページ構成

- `/`: ルートページ（認証状態に応じてリダイレクト）
- `/login`: ログインページ
- `/dashboard`: 管理ダッシュボード（要認証）

## API連携

`lib/api-client.ts`を使用してGo APIと連携します：

```typescript
import { ApiClient } from '@/lib/api-client';

// GraphQLクエリ実行
const result = await ApiClient.graphql(query, variables);

// REST APIアクセス
const data = await ApiClient.get('/endpoint');
```

## 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint
```
