## 目的
<!-- なぜ変更するのか。User Value / Bug / Contract / Issue -->

## 仕様・Issueリンク
<!-- 対象Issue、ADR、Experience Hypothesis等 -->

## 変更点
<!-- コード/設定/ドキュメントの具体的差分 -->

## 影響範囲・Privacy / Safety
<!-- データ、UI/API、費用、運用、Human Gate、外部副作用 -->

## 検証証跡
- [ ] `npm run verify` がGreen
- [ ] `npm run build` がGreen
- [ ] CI（PostgreSQL integration含む）がGreen
- [ ] 重要な変更は複数視点レビューし、指摘を修正した
<!-- テスト結果・CI URL・HEAD SHAを記載 -->

## ロールバック手順
<!-- revertだけで戻せるか、DB/外部副作用への対処 -->

## スクリーンショット（UI変更時）
<!-- UI変更なしの場合は「該当なし」 -->

## 追加確認
- [ ] 秘密情報・PII・相談全文を含まない
- [ ] `AGENTS.md`とSafety/Human Gateの正本に整合
- [ ] 外部リソース作成、公開、課金開始は別途Human承認
