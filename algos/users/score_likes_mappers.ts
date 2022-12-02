const SCORE_MAPPING_BREAKPOINT = 0.5;

export const mapScoreToLike = (score?: number): boolean | null => {
  if (!score) {
    return null;
  }

  if (score < SCORE_MAPPING_BREAKPOINT) {
    return false;
  }

  return true;
};

export const mapLikeToScore = (like: boolean): number => (like ? 1.0 : 0.0);
