import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..", "..");
const contract = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "ai", "contracts", "operational-evidence-source.json"),
    "utf8",
  ),
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function repositoryFileExists(ref) {
  return (
    typeof ref === "string" &&
    ref.length > 0 &&
    !ref.includes("..") &&
    fs.existsSync(path.join(repoRoot, ref))
  );
}

const ingestion = contract.ingestion;
assert(
  ingestion?.server_core_implemented === true,
  "server ingestion core: implementation must be recorded",
);
assert(
  repositoryFileExists(ingestion.server_core_ref),
  "server ingestion core: server_core_ref must resolve to a repository file",
);
assert(
  repositoryFileExists(ingestion.repository_port_ref),
  "server ingestion core: repository_port_ref must resolve to a repository file",
);
assert(
  ingestion.operational === false,
  "server ingestion core: core implementation alone must not mark ingestion operational",
);
assert(
  contract.operational_gate?.status === "blocked",
  "server ingestion core: Operational Evidence gate must remain blocked before persistence and E2E",
);

console.log(
  `✓ server ingestion core contract: core=${ingestion.server_core_ref}, repository=${ingestion.repository_port_ref}`,
);
