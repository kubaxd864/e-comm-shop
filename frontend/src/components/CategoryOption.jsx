const CategoryOption = ({ node, depth }) => (
  <>
    <option
      value={String(node.id)}
      className="bg-bg-secondary text-text-secondary"
    >
      {depth > 0 && `${"\u00A0".repeat(depth * 2)}↳ `}
      {node.name}
    </option>

    {node.children?.map((child) => (
      <CategoryOption key={child.id} node={child} depth={depth + 1} />
    ))}
  </>
);

export default CategoryOption;
