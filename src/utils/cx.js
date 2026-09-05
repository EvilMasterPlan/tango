// Joins truthy class names with a space, dropping falsy ones (false, null,
// undefined, '') — the one shared building block for conditional
// className strings.
export function cx(...classNames) {
  return classNames.filter(Boolean).join(' ');
}
