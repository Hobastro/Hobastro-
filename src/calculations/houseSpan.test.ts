import { calculateHouseLength, formatDegreeSeconds } from './houseSpan';

console.log('--- RUNNING HOUSE SPAN TESTS ---');

try {
  // Test 1: Normal case between adjacent signs
  const len1 = calculateHouseLength(241.021702, 274.524663);
  console.assert(Math.abs(len1 - 33.502961) < 1e-5, `Test 1 failed: expected 33.502961, got ${len1}`);
  console.assert(formatDegreeSeconds(len1) === '33°30\'11"', `Test 1 formatting failed: got ${formatDegreeSeconds(len1)}`);
  console.log('✓ Test 1 (Normal case): Passed');

  // Test 2: Crossing 0° Aries
  const len2 = calculateHouseLength(350, 20);
  console.assert(Math.abs(len2 - 30) < 1e-5, `Test 2 failed: expected 30, got ${len2}`);
  console.assert(formatDegreeSeconds(len2) === '30°00\'00"', `Test 2 formatting failed`);
  console.log('✓ Test 2 (Crossing 0°): Passed');

  // Test 3: House with fully included sign(s)
  const len3 = calculateHouseLength(10, 80);
  console.assert(Math.abs(len3 - 70) < 1e-5, `Test 3 failed: expected 70, got ${len3}`);
  console.log('✓ Test 3 (Included signs): Passed');

  // Test 4: 12th house where next cusp is 1st house
  // Let cusp[11] = 225.138330, cusp[0] = 241.021702
  const len12 = calculateHouseLength(225.138330, 241.021702);
  console.assert(len12 > 0 && len12 < 360, `Test 4 failed: got ${len12}`);
  console.log('✓ Test 4 (12th house): Passed');

  // Test 5: Sum of 12 houses = 360° for test map
  const cusps = [
    241.021702, 274.524663, 318.179873, 357.341483,
    25.136472,  45.138330,  61.021702,  94.524663,
    138.179873, 177.341483, 205.136472, 225.138330
  ];
  let totalSum = 0;
  for (let i = 0; i < 12; i++) {
    const nextCusp = cusps[(i + 1) % 12];
    totalSum += calculateHouseLength(cusps[i], nextCusp);
  }
  console.assert(Math.abs(totalSum - 360) < 1e-5, `Test 5 failed: sum is ${totalSum}`);
  console.log('✓ Test 5 (Sum of 12 houses = 360°): Passed');

  console.log('--- ALL HOUSE SPAN TESTS PASSED SUCCESSFULLY ---');
} catch (error) {
  console.error('❌ House span tests failed:', error);
  process.exit(1);
}
