export default function AreTheseTwoArraysEqualUnordered<T>(
  arr1: Array<T>,
  arr2: Array<T>
) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((value, index) => value === sorted2[index]);
}
