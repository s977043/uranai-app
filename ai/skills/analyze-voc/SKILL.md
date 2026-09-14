# Skill: analyze-voc

## Goal

匿名化・仮名化済みVoCを、Evidence付きの改善Insight候補へ変換する。

## Preconditions

- 分析目的が明確
- 入力sourceを識別可能
- 不要なPIIが除去済み
- Raw dataをGitへ保存しない

満たさない場合は処理を停止する。

## Input contract

```yaml
analysis_goal: string
period: string
sources:
  - id: string
    channel: review | support | survey | other
    segment: string | null
    text: string
```

## Process

1. 入力健全性確認
2. 不要PIIの検出・マスキング確認
3. Observationを抽出
4. 以下へ分類
   - Pain
   - Trigger
   - Desired Outcome
   - Objection
   - Language
   - Sentiment
5. 類似Observationをcluster
6. Evidence数・Segment・例外を確認
7. Insight候補を生成
8. Product / Content / CRMへのImplication候補を作る
9. LimitationsとConfidenceを付ける

## Output contract

```yaml
summary:
  source_count: number
  usable_source_count: number
  excluded_source_count: number

insights:
  - id: string
    theme: string
    category: pain | trigger | desired_outcome | objection | language | sentiment
    evidence_count: number
    evidence_refs:
      - string
    segments:
      - string
    confidence: low | medium | high
    limitations:
      - string
    implications:
      product:
        - string
      content:
        - string
      crm:
        - string
    status: candidate
```

## Evidence rules

- Evidence refのないInsightは禁止
- 原文引用は必要最小限
- 単一sourceを一般化しない
- 発言頻度と重要度を同一視しない
- Agent解釈は原文の意味として偽装しない

## Safety rules

- 不安・依存を高単価課金へ誘導するImplicationは禁止
- 医療/法律/投資等の高リスク助言へ変換しない
- センシティブ属性を推測で付与しない
- Raw VoC / PIIをKnowledgeへコミットしない

## Review checklist

- [ ] analysis goalと出力が一致している
- [ ] evidence_refsが全Insightにある
- [ ] source数が示されている
- [ ] 少数サンプルを過度に一般化していない
- [ ] Fact / interpretationが区別されている
- [ ] PIIを出力へ持ち出していない
- [ ] Safety Policyに違反していない

## Promotion to Accepted Learning

このSkillは `candidate` までしか作りません。

Accepted Learningへの昇格には、人間または独立Review Gateが次を確認します。

1. Evidence妥当性
2. 再現性
3. Sample bias
4. 実験結果（必要な場合）
5. Safety / Brand整合
