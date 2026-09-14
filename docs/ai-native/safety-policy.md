# Safety Policy

## Purpose

占い体験が、ユーザーの不安・依存・重要な意思決定を不当に利用しないための共通ポリシーです。

このポリシーは Growth / Content / CRM / Reading より上位の制約として扱います。

## Hard blocks

以下はAI単独で生成・配信・実行しません。

### 1. 未来や関係性の断定

禁止例:

- 絶対にこうなる
- 必ず復縁できる
- この人は運命の相手だ
- すぐ別れるべきだ
- 不幸になる

`docs/concept-board.md` のNG表現を最低基準とします。

### 2. High-stakes advice

以下の断定的判断は禁止します。

- 医療
- 法律
- 投資・金融
- 生死
- 妊娠等の重大な健康判断
- 犯罪や安全に関する断定

必要な場合は、占いとして判断を置き換えず、適切な専門家や公的窓口への相談を促します。

### 3. Manipulative monetization

禁止:

- 恐怖を煽って課金を迫る
- 「今払わないと不幸になる」等の因果づけ
- ユーザーの不安状態を検知して高額商品を優先表示する
- 依存的な利用を成功指標として扱う
- 架空の希少性・緊急性を作る

### 4. Misrepresentation

禁止:

- AI鑑定を人間の占い師が直接鑑定したと誤認させる
- 実在しない実績・口コミ・鑑定結果を作る
- Deterministicな占術結果をAIが都合よく改変する

## Human gate required

少なくとも初期段階では、以下は人間の承認を必須にします。

- 本番SNS投稿
- LINE / メール / Push等のユーザー送信
- 価格変更
- 課金導線の大幅変更
- 高額商品の販売設計
- 新しい高リスクカテゴリの鑑定
- Safety Policyの緩和

## Safety architecture

```text
Maker
  ↓
Quality evaluation
  ↓
Safety evaluation
  ↓
Human Gate (required actions)
  ↓
Execute
```

Makerが自分の出力を最終承認してはいけません。

## Relationship with PR #17

PR #17 の文言ガードレールは、将来Safety評価のDeterministicな一層として利用する想定です。

```text
Generated text
  ↓
Deterministic message guardrail
  ↓
Contextual Safety Judge
  ↓
Human Gate / publish
```

文字列ルールだけですべての危険な文脈を検出できるとはみなしません。

## Data safety

生の相談内容・問い合わせ・自由記述にはセンシティブな情報が含まれ得ます。

禁止:

- Raw VoCをそのままGitへコミット
- 氏名、メール、電話番号、住所、認証情報等をKnowledgeへ保存
- 個別相談を本人特定可能な形で長期Knowledgeへ転記

Knowledgeへ入れる場合:

- 匿名化
- 集約
- Evidence参照を必要最小限にする
- 保存目的を明確にする

## Stop conditions

Agentは以下の場合、推測で続行せず停止・エスカレーションします。

- Evidence不足
- Safety Policyとの衝突
- 個人情報が必要以上に含まれる
- irreversible actionが必要
- 価格/課金/外部送信等、権限外の操作が必要
- FactとHypothesisを分離できない

## Review requirement

以下を変更した場合はSafety regressionを必須とします。

- Prompt
- Skill
- Agent Contract
- Reading generation
- Growth / CRM automation
- Message guardrail
- Safety Judge
- Knowledge source
