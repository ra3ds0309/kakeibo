# かけいぼ | みんなの家計簿

口座（ジャンル）を切り替えながら使う、複数人向けの家計簿 PWA です。
Google アカウントでログインし、データは Firebase（Firestore）にあなた専用に保存されます。ブラウザのストレージには依存しないので、スマホを買い替えても Google アカウントでログインすればそのまま続きが使えます。

## できること

- **ダッシュボード**：口座タブの切り替え、選択中口座の残高（収入−支出±振替）、直近5件の明細、今月の支出カテゴリ円グラフ
- **入力**：支出／収入／振替をワンタップで切り替え、大きな数字キーパッドで片手入力、口座間の振替にも対応
- **履歴**：月別・口座別フィルター、明細の編集・削除
- **口座（ジャンル）の追加**：「娯楽・お小遣い」「貯金」のように自由に口座を増やせる
- **Google ログイン**：Firebase Authentication によるログイン。データは Firestore のセキュリティルールでユーザー本人だけがアクセス可能

---

## 1. 必要なもの

- Node.js 18 以上
- Google アカウント（Firebase 用）
- GitHub アカウント

---

## 2. Firebase プロジェクトを作る

1. [Firebase コンソール](https://console.firebase.google.com/) にアクセスし、「プロジェクトを追加」
2. プロジェクト名を入力して作成（Google アナリティクスは任意）
3. 左メニュー → **Authentication** → 「始める」→ 「Sign-in method」タブ → **Google** を有効化
4. 左メニュー → **Firestore Database** → 「データベースの作成」→ 本番環境モードで開始（リージョンは `asia-northeast1` など任意）
5. 左メニュー → プロジェクトの設定（歯車アイコン）→ 「全般」タブ → 「マイアプリ」で **ウェブアプリ（`</>`）を追加**
6. 表示された `firebaseConfig` の値（apiKey, authDomain, projectId など）を控えておく

### Firestore セキュリティルールを反映する

このリポジトリの `firestore.rules` を Firebase コンソールの Firestore →「ルール」タブに貼り付けて公開してください（本人のデータしか読み書きできないルールです）。

### 複合インデックスについて

明細一覧は「日付順→登録順」で並び替えるため、Firestore の複合インデックスが必要です。`firebase deploy --only firestore:indexes`（`firebase-tools` が必要）で `firestore.indexes.json` の内容を反映できます。デプロイしなくても、初回アクセス時にブラウザのコンソールに Firebase からインデックス作成用リンクが表示されるので、そこをクリックして作成することもできます。

---

## 3. ローカルで動かす

```bash
npm install
cp .env.example .env.local
```

`.env.local` に、Firebase コンソールで控えた値を入力：

```
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx
```

起動：

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開き、Google でログインすると自動的にデフォルトの口座（生活費／娯楽・お小遣い／貯金）とカテゴリが作成されます。

> ローカルの `localhost` は Firebase Authentication で最初から許可されています。本番ドメインを使う場合は Firebase コンソール → Authentication → Settings → 承認済みドメイン に追加してください。

---

## 4. GitHub リポジトリを作る

```bash
git init
git add .
git commit -m "Initial commit: かけいぼアプリ"
gh repo create your-name/kakeibo-app --private --source=. --push
```

（`gh` コマンドがない場合は GitHub 上で新規リポジトリを作成し、表示される手順で `git remote add origin ...` → `git push` してください）

---

## 5. GitHub Actions で Firebase Hosting に自動デプロイする

1. Firebase コンソール → プロジェクトの設定 → サービスアカウント → 「新しい秘密鍵を生成」して JSON をダウンロード
2. GitHub リポジトリ → Settings → Secrets and variables → Actions → 「New repository secret」で以下を登録：
   - `FIREBASE_SERVICE_ACCOUNT` … ダウンロードした JSON の中身をそのまま貼り付け
   - `VITE_FIREBASE_API_KEY` / `VITE_FIREBASE_AUTH_DOMAIN` / `VITE_FIREBASE_PROJECT_ID` / `VITE_FIREBASE_STORAGE_BUCKET` / `VITE_FIREBASE_MESSAGING_SENDER_ID` / `VITE_FIREBASE_APP_ID` … `.env.local` と同じ値
3. `.github/workflows/deploy.yml` の `projectId: your-firebase-project-id` を実際の Firebase プロジェクト ID に書き換える
4. `.firebaserc` の `YOUR_FIREBASE_PROJECT_ID` も同様に書き換える
5. `main` ブランチに push すると自動的にビルド＆ Firebase Hosting へのデプロイが実行されます

デプロイ後の URL（`https://your-project-id.web.app`）を Firebase Authentication の承認済みドメインに追加するのを忘れずに。

手動でデプロイしたい場合：

```bash
npm install -g firebase-tools
firebase login
npm run deploy
```

---

## 6. データ構造（Firestore）

```
users/{uid}/accounts/{accountId}      … 口座（ジャンル）: name, color, order
users/{uid}/categories/{categoryId}   … カテゴリ: name, type(expense|income), order
users/{uid}/transactions/{txId}       … 明細:
    type: 'expense' | 'income' | 'transfer'
    amount: number
    accountId: string          … 支出/収入の口座、振替の「出す側」
    toAccountId: string|null   … 振替の「受け取る側」（振替のみ）
    categoryId: string|null    … カテゴリ（振替は null）
    date: 'YYYY-MM-DD'
    memo: string
```

口座ごとの残高は `income − expense ± 振替` で毎回計算しており、別途「残高」フィールドを保持しない設計です（明細を編集・削除しても整合性が崩れません）。

---

## 7. カスタマイズのヒント

- 色やフォントは `src/index.css` の先頭の CSS 変数（`:root`）にまとまっています
- デフォルトの口座・カテゴリは `src/contexts/DataContext.jsx` の `DEFAULT_ACCOUNTS` / `DEFAULT_CATEGORIES` を編集
- アイコンは `public/icons/` を差し替えれば OK（192×192 と 512×512 の PNG）

## ライセンス

このコードは自由に改変・利用して構いません。
