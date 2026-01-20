export function buildCategoryTree(items) {
  const map = new Map();
  items.forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots = [];
  for (const item of items) {
    const node = map.get(item.id);
    if (item.parent_id == null) {
      roots.push(node);
    } else {
      const parent = map.get(item.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }
  return roots;
}
