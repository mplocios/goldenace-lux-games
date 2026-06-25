



export default function getRandomDurations(count, minValue, maxValue, totalSum) {
  if (count <= 0) {
      throw new Error("Count must be greater than 0.");
  }
  if (minValue * count > totalSum || maxValue * count < totalSum) {
      throw new Error("It is not possible to generate numbers with the given parameters.");
  }

  let numbers = [];
  let remainingSum = totalSum;

  for (let i = 0; i < count - 1; i++) {
      const maxAllowed = Math.min(maxValue, remainingSum - (count - i - 1) * minValue);
      const num = (Math.random() * (maxAllowed - minValue) + minValue).toFixed(10); // Higher precision to avoid rounding issues
      numbers.push(parseFloat(num));
      remainingSum -= parseFloat(num);
  }

  // The last number must exactly meet the total sum
  let lastNum = remainingSum.toFixed(10);
  if (lastNum < minValue) {
      lastNum = minValue.toFixed(10);
  } else if (lastNum > maxValue) {
      lastNum = maxValue.toFixed(10);
  }
  numbers.push(parseFloat(lastNum));

  // Round numbers and ensure the total sum is exactly as required
  let currentSum = numbers.reduce((acc, num) => acc + num, 0);
  const adjustment = totalSum - currentSum;

  // Apply the adjustment to the last element
  numbers[numbers.length - 1] += adjustment;

  // Final rounding and bound checking
  numbers = numbers.map(num => parseFloat(num.toFixed(10)));
  let adjustedSum = numbers.reduce((acc, num) => acc + num, 0);
  if (Math.abs(totalSum - adjustedSum) > 1e-10) {
      throw new Error("The final sum could not be adjusted to match the exact total sum.");
  }

  return numbers;
}

