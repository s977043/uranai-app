# 開発用 Dockerfile（本番ビルドは未対応。開発サーバ起動専用）
# Alpine では Next.js の SWC バイナリ読み込みに失敗することがあるため
# glibc ベースの slim イメージを使う。
FROM node:22-slim

WORKDIR /app

# 依存だけ先にコピーしてレイヤキャッシュを効かせる
COPY package.json package-lock.json ./

# ロックファイルどおりに再現インストールする
RUN npm ci

COPY . .

EXPOSE 3000

# コンテナ外からアクセスできるよう 0.0.0.0 で待ち受ける
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
