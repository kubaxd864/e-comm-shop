import { describe, expect, it } from "@jest/globals";
import { buildCategoryTree } from "../../functions/shop.functions.js";

describe("Shop Functions", () => {
  it("should return an empty array for empty input", () => {
    const result = buildCategoryTree([]);
    expect(result).toEqual([]);
  });
  it("should return all items as roots if no parent_ids are set (null)", () => {
    const items = [
      { id: 1, name: "Electronics", parent_id: null },
      { id: 2, name: "Clothing", parent_id: null },
    ];
    const result = buildCategoryTree(items);
    expect(result).toHaveLength(2);
    expect(result[0].children).toEqual([]);
    expect(result[1].children).toEqual([]);
    expect(result[0]).toMatchObject({ id: 1, name: "Electronics" });
  });
  it("should correctly nest children under a parent", () => {
    const items = [
      { id: 1, name: "Electronics", parent_id: null },
      { id: 2, name: "Laptops", parent_id: 1 },
      { id: 3, name: "Phones", parent_id: 1 },
    ];
    const result = buildCategoryTree(items);
    expect(result).toHaveLength(1);
    const root = result[0];
    expect(root.id).toBe(1);
    expect(root.children).toHaveLength(2);
    const childIds = root.children.map((c) => c.id);
    expect(childIds).toEqual(expect.arrayContaining([2, 3]));
  });
  it("should handle deep nesting (grandparents -> parents -> children)", () => {
    const items = [
      { id: 1, name: "Root", parent_id: null },
      { id: 2, name: "Level 1", parent_id: 1 },
      { id: 3, name: "Level 2", parent_id: 2 },
    ];
    const result = buildCategoryTree(items);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    const level1 = result[0].children[0];
    expect(level1.id).toBe(2);
    const level2 = level1.children[0];
    expect(level2.id).toBe(3);
    expect(level2.children).toEqual([]);
  });

  it("should treat items with non-existent parent_id as roots", () => {
    const items = [
      { id: 1, name: "Orphan", parent_id: 999 },
      { id: 2, name: "Normal Root", parent_id: null },
    ];
    const result = buildCategoryTree(items);
    expect(result).toHaveLength(2);
    const ids = result.map((n) => n.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
  });

  it("should not mutate the original items array structure significantly but extends objects", () => {
    const items = [{ id: 1, parent_id: null }];
    const result = buildCategoryTree(items);
    expect(result[0]).toHaveProperty("children");
    expect(items[0]).not.toHaveProperty("children");
  });
});
