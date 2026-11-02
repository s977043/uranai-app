import test from "node:test";
import assert from "node:assert/strict";
import { getSample, renderSample, samples } from "../public/app.mjs";

const invalidThemes = [
  null, undefined, true, false, 0, 1, NaN, 1n, Symbol("self"),
  "", " self", "self ", "SELF", "__proto__", "constructor", "toString",
  "<script>", ["self"], Object("self"),
  { [Symbol.toPrimitive]() { throw new Error("must not coerce theme"); } },
];

test("invalid themes are rejected before any DOM access or input coercion", () => {
  const forbiddenNodes = new Proxy({}, {
    get() { throw new Error("invalid selection must not access DOM nodes"); },
    set() { throw new Error("invalid selection must not mutate DOM nodes"); },
  });
  for (const theme of invalidThemes) {
    assert.equal(getSample(theme), null);
    assert.equal(renderSample(theme, forbiddenNodes), false);
  }
});

test("every theme renders its exact label, question and action only as text", () => {
  for (const [theme, expected] of Object.entries(samples)) {
    const values = {};
    const writes = [];
    const nodes = Object.fromEntries(["label", "question", "action"].map(name => [name,
      new Proxy({}, {
        set(_target, property, value) {
          assert.equal(property, "textContent");
          values[name] = value;
          writes.push(name);
          return true;
        },
      }),
    ]));
    assert.equal(renderSample(theme, nodes), true);
    assert.deepEqual(values, expected);
    assert.deepEqual(writes, ["label", "question", "action"]);
  }
});
