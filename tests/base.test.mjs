// A base de verdade precisa passar no próprio validador (o CI também roda npm run validar).
import assert from "node:assert/strict";
import { it } from "node:test";
import { REPOSITORY_ROOT, todayIso } from "../utils/cli.mjs";
import { formatProblem, loadRepository, validateRepository } from "../utils/validation.mjs";

it("a base claude-works passa no validador", async () => {
  const problems = validateRepository(await loadRepository(REPOSITORY_ROOT), { today: todayIso() });
  assert.deepEqual(problems.map(formatProblem), []);
});
