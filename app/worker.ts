import * as Comlink from 'comlink'
import crypto from 'crypto'

// This function highlights the longest run of a single character in the hash
function highlightLongestRun(hash: string) {
  let maxRunChar = ''
  let maxRunLength = 0
  let currentChar = ''
  let currentLength = 0

  for (let i = 0; i < hash.length; i++) {
    if (hash[i] === currentChar) {
      currentLength++
    } else {
      currentChar = hash[i]
      currentLength = 1
    }

    if (currentLength > maxRunLength) {
      maxRunChar = currentChar
      maxRunLength = currentLength
    }
  }

  const regex = new RegExp(`(${maxRunChar}{${maxRunLength}})`)
  return { highlightedHash: hash.replace(regex, '<span class="highlight">$1</span>'), maxRunLength }
}

// Invariants:
// - currentNumber: the current number being appended to the text
// - isRunning: true if the worker is currently processing, false otherwise
// - startTime: the time when the current processing started
// - endTime: the time when the current processing ended
let currentNumber = 0
let isRunning = false
let startTime = 0
let endTime = 0
let newText = ''

// This function increments the text until a hash with a longer run is found
async function startSearch(prefix: string, currentNum: number, currentDifficulty: number): Promise<void> {
  isRunning = true
  startTime = performance.now()
  newText = prefix
  currentNumber = currentNum
  let newMaxRunLength = currentDifficulty

  while (newMaxRunLength <= currentDifficulty) {
    currentNumber++
    newText = `${prefix} ${currentNumber}`
    const newHash = crypto.createHash('sha256').update(newText).digest('hex')
    newMaxRunLength = highlightLongestRun(newHash).maxRunLength

    // Yield control sometimes to keep the worker responsive
    if (currentNumber % 10000 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  endTime = performance.now()
  isRunning = false
}

// This function returns the current number being appended to the text
function getCurrentNumber(): number {
  return currentNumber
}

// This function returns whether the worker is currently processing
function getIsRunning(): boolean {
  return isRunning
}

// This function returns the time taken for the current processing in seconds
function getSearchTime(): number {
  return (endTime - startTime) / 1000
}

function getNewText(): string {
  return newText
}

const worker = {
  startSearch,
  getCurrentNumber,
  getIsRunning,
  getSearchTime,
  getNewText,
}

Comlink.expose(worker)
