export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "sqlState" in error &&
    error.sqlState === "23505"
  );
}
