export default function maxSumSubArray(numbers) {
  let current = numbers[0];
  let best = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    current = Math.max(numbers[i], current + numbers[i]);
    best = Math.max(best, current);
  }

  return best;
}
