const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
const teens = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
const scales = ["", "Thousand", "Million", "Billion", "Trillion"]

function convertTriplet(num) {
  let result = ""

  if (Math.floor(num / 100) > 0) {
    result += ones[Math.floor(num / 100)] + " Hundred "
  }

  num %= 100

  if (num >= 20) {
    result += tens[Math.floor(num / 10)]
    if (num % 10 > 0) {
      result += " " + ones[num % 10]
    }
  } else if (num >= 10) {
    result += teens[num - 10]
  } else if (num > 0) {
    result += ones[num]
  }

  return result.trim()
}

export default function numberToWords(num) {
  if (num === 0) return "Zero"

  let result = ""
  let scaleIndex = 0

  while (num > 0) {
    if (num % 1000 > 0) {
      result = convertTriplet(num % 1000) + " " + scales[scaleIndex] + " " + result
    }
    num = Math.floor(num / 1000)
    scaleIndex++
  }

  return result.trim().replace(/\s+/g, " ")
}
