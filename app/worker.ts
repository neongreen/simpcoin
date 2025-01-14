import * as Comlink from 'comlink'
import { createSHA256 } from 'hash-wasm'

// This function counts the longest run of a single hex character (nibble) in the hash
function longestRun(hash: Uint8Array): number {
  if (hash.length === 0) return 0

  let maxRunLength = 0
  let currentLength = 1

  // Process the first byte explicitly
  let previousNibble = (hash[0] >> 4) & 0xF // high nibble of the first byte
  const lowNibble = hash[0] & 0xF // low nibble of the first byte

  if (lowNibble === previousNibble) {
    currentLength++
  } else {
    currentLength = 1
  }
  previousNibble = lowNibble

  // Process the remaining bytes
  for (let i = 1; i < hash.length; i++) {
    const highNibble = (hash[i] >> 4) & 0xF
    if (highNibble === previousNibble) {
      currentLength++
    } else {
      if (currentLength > maxRunLength) {
        maxRunLength = currentLength
      }
      currentLength = 1
      previousNibble = highNibble
    }

    const lowNibble = hash[i] & 0xF
    if (lowNibble === previousNibble) {
      currentLength++
    } else {
      if (currentLength > maxRunLength) {
        maxRunLength = currentLength
      }
      currentLength = 1
      previousNibble = lowNibble
    }
  }

  if (currentLength > maxRunLength) {
    maxRunLength = currentLength
  }

  return maxRunLength
}

// - currentNumber: the current number being appended to the text
// - isRunning: true if the worker is currently processing, false otherwise
// - startTime: the time when the current processing started
// - endTime: the time when the current processing ended
let nonce = 0
let isRunning = false
let startTime = 0
let endTime = 0

// This function increments the text until a hash with a longer run is found
async function startSearch(prefix: string, startingNonce: number, currentDifficulty: number): Promise<void> {
  isRunning = true
  startTime = performance.now()
  nonce = startingNonce
  let runLength = currentDifficulty

  const hasher = await createSHA256()
  hasher.init()
  hasher.update(prefix)
  const state = hasher.save()

  const newHasher = await createSHA256()

  while (runLength <= currentDifficulty) {
    nonce++
    newHasher.load(state)
    newHasher.update(`${nonce}`)
    runLength = longestRun(newHasher.digest('binary'))

    // Yield control sometimes to keep the worker responsive
    if (nonce % 50000 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  endTime = performance.now()
  isRunning = false
}

// This function returns the current number being appended to the text
function getCurrentNonce(): number {
  return nonce
}

// This function returns whether the worker is currently processing
function getIsRunning(): boolean {
  return isRunning
}

// This function returns the time taken for the current processing in seconds
function getSearchTime(): number {
  return (endTime - startTime) / 1000
}

const worker = {
  startSearch,
  getCurrentNonce,
  getIsRunning,
  getSearchTime,
}

Comlink.expose(worker)
