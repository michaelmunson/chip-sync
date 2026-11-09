type Variables = Record<string, unknown>;
type Execute = (query: string, variables: Variables) => Promise<any>;

const optionalFields: Record<string, readonly string[]> = {
  Marker: ["kind", "startDate", "endDate"],
  User: ["notificationSettings"],
};

/**
 * Profile/organization reads also support the preserved schema during migration.
 * Only omit optional scalar fields explicitly rejected by AppSync validation.
 * Never use this for mutations: silently dropping write fields would lose data.
 */
export function createProfileReader(execute: Execute): Execute {
  const unsupported = new Set<string>();
  const omitUnsupported = (query: string) => query.replace(
    /^[\t ]*(\w+)[\t ]*\r?\n/gm,
    (line, field: string) => unsupported.has(field) ? "" : line,
  );

  return async (query, variables) => {
    const selection = omitUnsupported(query);
    try {
      return await execute(selection, variables);
    } catch (error) {
      const errors = (error as { errors?: { message?: string }[] } | null)?.errors;
      if (!Array.isArray(errors) || errors.length === 0) throw error;
      const missing = errors.map(({ message }) => {
        const match = message?.match(
          /^Validation error of type FieldUndefined: Field '(\w+)' in type '(\w+)' is undefined(?: @ .*)?$/,
        );
        return match && optionalFields[match[2]]?.includes(match[1]) ? match[1] : undefined;
      });
      // Authorization, transport, resolver and unknown schema errors must surface.
      if (missing.some(field => !field)) throw error;
      for (const field of missing) unsupported.add(field!);
      const compatible = omitUnsupported(selection);
      if (compatible === selection) throw error;
      return execute(compatible, variables);
    }
  };
}
