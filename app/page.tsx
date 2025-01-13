'use client'

import crypto from 'crypto'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [highestDifficulty, setHighestDifficulty] = useState(0)
  const [searchTime, setSearchTime] = useState(0)
  const hash = crypto.createHash('sha256').update(text).digest('hex')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const { highlightedHash, maxRunLength } = highlightLongestRun(hash)

  useEffect(() => {
    if (maxRunLength > highestDifficulty) {
      setHighestDifficulty(maxRunLength)
    }
  }, [maxRunLength, highestDifficulty])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

  const resetHighestDifficulty = () => {
    setHighestDifficulty(maxRunLength)
  }

  const incrementText = () => {
    const startTime = performance.now()
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

    const endTime = performance.now()
    setSearchTime((endTime - startTime) / 1000)
    setText(newText)
  }

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-4 sm:gap-8 sm:p-20 font-[family-name:var(--font-kode-mono)]'>
      <main className='flex flex-col gap-4 row-start-2 items-center sm:items-start w-full'>
        <h1 className='text-4xl font-bold'>simpcoin</h1>
        <h2 className='text-xl -mt-4'>mining tool</h2>
        <textarea
          ref={textareaRef}
          className='w-full max-w-[800px] p-2 mt-4 border rounded text-sm bg-gray-800 text-white'
          placeholder='previous block...'
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ overflow: 'hidden', minHeight: '15em' }}
        >
        </textarea>
        <p
          className='mt-0 mb-2 w-full break-all text-xs sm:text-sm font-bold'
          dangerouslySetInnerHTML={{ __html: highlightedHash }}
        >
        </p>
        <p className='mt-1 w-full break-all text-xs sm:text-sm'>
          difficulty: {maxRunLength}
          <br />
          {'+'.repeat(maxRunLength)}
        </p>
        <p className='mt-1 w-full break-all text-xs sm:text-sm'>
          highest seen: {highestDifficulty}
          &nbsp;&nbsp;&nbsp;&nbsp;
          <a href='#' onClick={resetHighestDifficulty} className='italic text-red-400'>reset</a>
          <br />
          {'='.repeat(highestDifficulty)}
        </p>
        <div>
          <button
            className='mt-4 p-2 bg-blue-500 text-white rounded'
            onClick={incrementText}
          >
            more difficulty
          </button>
          <p className='mt-1 break-all text-[10px] sm:text-[12px]'>
            search time: {searchTime.toFixed(2)} s
          </p>
        </div>
      </main>
      <footer className='row-start-3 mt-16 flex gap-8 flex-wrap items-center justify-center sm:justify-start w-full'>
        <span>
          made by <span className='rainbow-text'>emily</span>
        </span>
        <a
          className='italic flex items-center gap-2 hover:underline hover:underline-offset-4 underline underline-offset-4'
          href='https://github.com/neongreen/simpcoin'
          target='_blank'
          rel='noopener noreferrer'
        >
          source
        </a>
      </footer>
    </div>
  )
}
