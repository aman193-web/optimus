import test from "node:test";
import assert from "node:assert/strict";
import { chapterAt, chapterPosition } from "./scroll-chapters.js";

test("each clicked chapter resumes from itself with forward viewing room", () => {
  for (let i = 0; i < 4; i++) {
    const progress = chapterPosition(i, 4);
    assert.equal(chapterAt(progress, i, 4), i);
    assert.equal(chapterAt(progress + .08, i, 4), i);
    if (i < 3) assert.equal(chapterAt((i + 1) / 4 + .02, i, 4), i + 1);
  }
});

test("settling at a boundary does not repeatedly reverse the orb morph", () => {
  assert.equal(chapterAt(.251, 0, 4), 0);
  assert.equal(chapterAt(.27, 0, 4), 1);
  assert.equal(chapterAt(.249, 1, 4), 1);
  assert.equal(chapterAt(.23, 1, 4), 0);
});

test("fast travel and reverse scrolling reach the correct chapter", () => {
  assert.equal(chapterAt(1, 0, 4), 3);
  assert.equal(chapterAt(0, 3, 4), 0);
  assert.equal(chapterAt(.6, 3, 4), 2);
  assert.equal(chapterAt(.3, -1, 4), 1);
});
