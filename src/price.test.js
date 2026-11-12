import { test } from "node:test";
import assert from "node:assert/strict";
import { discounted } from "./price.js";

test("applies a discount", () => assert.equal(discounted(1000, 25), 750));
test("rounds to the penny", () => assert.equal(discounted(999, 10), 899));
test("refuses bad input", () => assert.throws(() => discounted(-1, 10), RangeError));
