# Contributing

このリポジトリへのIssue/PRによる改善提案を歓迎します。新しいコード・運用フローを導入する前に、まず [README](./README.md)、[AGENTS.md](./AGENTS.md)、[AI-Native運用設計](./docs/ai-native/README.md) を確認してください。

## 開発の基本手順

1. Issueで目的・再現手順・期待値を明確化する（機密情報や生の相談内容は記載しない）。
2. 既存のDomain ContractとSafety / Human Gateを確認する。新規機能はテストを先行する。
3. Nodeは`.nvmrc`、依存導入は`npm ci`、ローカル検証は`npm run verify`、本番と同等のビルドは`npm run build`を使う。
4. PRには目的、仕様リンク、変更点、影響範囲、テスト証跡、ロールバック方法、UI変更ならスクリーンショットを記載する。
5. GitHub CIのlint、typecheck、unit test、AI contracts、PostgreSQL integration、buildを確認し、重要な変更は複数視点でレビューする。

## Privacy / Safety / Secrets

- APIキー、接続文字列、未公開個人情報、ユーザー相談全文をGit/Issue/PR/ログに貼らない。
- 禁止された断定的な未来予測・健康/法律/金融上の助言・恐怖訴求を追加しない。
- Product価値の判断、対外公開、価格・課金・Human-owned Accepted Learningは人間が決定する。
- 脆弱性を見つけた場合は公開Issueに詳細を書かず、[SECURITY.md](./SECURITY.md)の手順を使う。

## Dependabot / 依存更新

`package.json`の`overrides`は既知の依存リスクへの対応を含むため、Dependabot PRは自動マージしません。依存追加・更新は`package-lock.json`を同期し、全CIと差分レビューを必須にします。
