# Skill: analyze-funnel

## Goal

ファネル指標から、どこでユーザー価値の流れが滞っているかをEvidence付きで特定し、検証可能な仮説候補を作る。

## Preconditions

- 指標定義が明確
- 比較期間が妥当
- 集約データで分析可能
- Segment定義が既知

不明な場合は数値を推測しない。

## Default funnel

初期の論理ファネル:

```text
Acquisition
  ↓
Signup / Start
  ↓
First Reading
  ↓
Return
  ↓
Paid Conversion
  ↓
Repeat / Continued Value
```

実装済みイベントに合わせて名称は変更可能。ただし指標定義を同時に記録する。

## Input contract

```yaml
analysis_goal: string
metric_definitions:
  - name: string
    definition: string
periods:
  current: string
  comparison: string | null
segments:
  - string
stages:
  - name: string
    entrants: number
    completions: number
```

## Process

1. Metric definitionを検証
2. ファネル各段階のconversion / drop-offを算出
3. 前期間/Segmentと比較
4. 変化量と母数を確認
5. ObservationをFactとして記録
6. 原因候補をHypothesisとして別に生成
7. User Value / Safety / Trustへの影響を確認
8. Experiment候補を作る

## Output contract

```yaml
findings:
  - id: string
    stage: string
    statement: string
    type: fact
    metrics:
      conversion: number | null
      drop_off: number | null
      sample_size: number
    evidence_refs:
      - string
    confidence: low | medium | high

hypotheses:
  - id: string
    statement: string
    evidence_refs:
      - string
    confidence: low | medium | high

experiment_candidates:
  - hypothesis_ref: string
    metric: string
    expected_direction: up | down | unchanged
    risk: low | medium | high
    reversibility: easy | moderate | hard
    safety_notes:
      - string
```

## Analysis rules

- 相関を因果として書かない
- conversionの改善だけを目的化しない
- sample sizeを必ず併記する
- Segment間の差を属性の本質差と断定しない
- 外部要因が不明ならlimitationsへ書く
- 「鑑定回数が増えた = ユーザー価値が増えた」と自動解釈しない

## Safety / product rules

以下のExperiment候補を生成しない。

- 不安を煽る再訪促進
- 架空の緊急性
- 依存的利用を増やすことだけを狙う施策
- 高リスク相談を課金へ直接結びつける施策
- Safety Policyを迂回する導線

## Review checklist

- [ ] 指標定義が明示されている
- [ ] sample sizeがある
- [ ] FactとHypothesisが分離されている
- [ ] 比較期間が妥当
- [ ] 因果を断定していない
- [ ] User Valueへの意味が説明されている
- [ ] Safety/Trustの副作用が確認されている
