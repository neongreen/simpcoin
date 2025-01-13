import * as Comlink from 'comlink'
import crypto from 'crypto'

const highlightLongestRun = (hash: string) => {
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

const incrementText = (text: string, maxRunLength: number) => {
  let newText = text
  let newMaxRunLength = maxRunLength

  while (newMaxRunLength <= maxRunLength) {
    const match = newText.match(/( \d+)$/)
    if (match) {
      const number = parseInt(match[1].trim(), 10) + 1
      newText = newText.replace(/ \d+$/, ` ${number}`)
    } else {
      newText += ' 1'
    }

    const newHash = crypto.createHash('sha256').update(newText).digest('hex')
    newMaxRunLength = highlightLongestRun(newHash).maxRunLength
  }

  return { newText }
}

const worker = {
  incrementText,
}

Comlink.expose(worker)
