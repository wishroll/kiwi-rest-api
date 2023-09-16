// Max range for postgres int8
export const MAX_BIGINT = 9223372036854775807n;

// Max positive range for neo4j int32
export const MAX_32INT_NEO4J = 2147483647;

// Max score for match result of neo4j
export const MAX_SEARCH_MATCH_SCORE = '100';

export const safeBigIntToNumber = (x: bigint): number => {
  if (x >= Number.MIN_SAFE_INTEGER && x <= Number.MAX_SAFE_INTEGER) {
    return Number(x);
  } else {
    throw new Error(`${x} exceeded the safe integer range`);
  }
};
