// Joins truthy class names with a space, dropping falsy ones (false, null,
// undefined, '') — the one shared building block for conditional
// className strings, instead of each component hand-rolling its own
// array-filter-join or template-string ternary.
export function cx(...classNames) {
  return classNames.filter(Boolean).join(' ');
}
