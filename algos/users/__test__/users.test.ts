import { test } from 'tap';
import { getHexCodeForScore } from '../hex_code_for_score';

test('returns the correct hex code for scores less than 0.45', t => {
  const score = 0.44;
  const expectedHexCode = '#EA1D3B';

  const result = getHexCodeForScore(score);

  t.equal(result, expectedHexCode);
  t.end();
});

test('returns the correct hex code for scores between 0.45 and 0.65', t => {
  const score = 0.55;
  const expectedHexCode = '#EA7F1D';

  const result = getHexCodeForScore(score);

  t.equal(result, expectedHexCode);
  t.end();
});

test('returns the correct hex code for scores between 0.65 and 100', t => {
  const score = 0.75;
  const expectedHexCode = '#EAD51D';

  const result = getHexCodeForScore(score);

  t.equal(result, expectedHexCode);
  t.end();
});

test('returns the correct hex code for scores greater than 100', t => {
  const score = 101;
  const expectedHexCode = '#000000';

  const result = getHexCodeForScore(score);

  t.equal(result, expectedHexCode);
  t.end();
});
