/**
 * Adds a __typename property to an object.
 * @param obj
 * @param typename
 * @returns
 */
export function withTypename<T extends object, TypeName extends string>(
  obj: T,
  typename: TypeName
): T & { __typename: TypeName } {
  return {
    ...obj,
    __typename: typename,
  };
}
