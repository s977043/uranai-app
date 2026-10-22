import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const must = (condition, detail) => {
  if (!condition) throw new Error("Community health contract: " + detail);
};
const required = [
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/documentation.yml",
  ".github/pull_request_template.md",
  ".github/dependabot.yml",
];
for (const p of required) must(fs.existsSync(path.join(root, p)), "missing " + p);
const contributing = read("CONTRIBUTING.md");
must(contributing.includes("AGENTS.md") && contributing.includes("npm run verify"), "contributing instructions drift");
must(contributing.includes("SECURITY.md") && contributing.includes("overrides"), "privacy/dependency review guidance missing");
const security = read("SECURITY.md");
must(security.includes("Report a vulnerability") && security.includes("公開Issue"), "private vulnerability reporting guidance missing");
const pr = read(".github/pull_request_template.md");
for (const section of ["目的", "仕様", "変更点", "影響範囲", "ロールバック", "スクリーンショット", "npm run verify"]) {
  must(pr.includes(section), "PR template is missing AGENTS.md §6 requirement: " + section);
}
for (const f of required.filter((p) => p.startsWith(".github/ISSUE_TEMPLATE/"))) {
  const form = read(f);
  must(form.includes("name:") && form.includes("description:") && form.includes("title:") && form.includes("body:"), "issue form missing required keys: " + f);
  must(form.includes("validations:") && form.includes("required: true"), "issue form needs required field: " + f);
}
const bot = read(".github/dependabot.yml");
must(bot.includes("package-ecosystem: npm") && bot.includes("package-ecosystem: github-actions"), "missing dependency ecosystems");
must((bot.match(/open-pull-requests-limit: 3/g) ?? []).length === 2, "Dependabot must have capped open PRs");
must(!/auto.merge|automerge/i.test(bot), "Dependabot must not auto-merge");
must(read("README.md").includes("CONTRIBUTING.md") && read("README.md").includes("SECURITY.md"), "README references missing");
console.log("✓ Community health file and PR/Issue/Dependabot contract");
