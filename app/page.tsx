/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import * as Comlink from 'comlink'
import crypto from 'crypto'
import { useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

export default function Home() {
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')
  const [nonce, setNonce] = useState('')
  const [searchTime, setSearchTime] = useState(0)
  const [searchedNonce, setSearchedNonce] = useState(0)
  const [isWorkerBusy, setIsWorkerBusy] = useState(false)
  const prefix = `${text}\n\n${message}${message ? ' ' : ''}`
  const hash = crypto.createHash('sha256').update(`${prefix}${nonce}`).digest('hex')

  const workerRef = useRef<Comlink.Remote<any>>(null)

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

  const { highlightedHash, maxRunLength: difficulty } = highlightLongestRun(hash)
  const [highestDifficulty, setHighestDifficulty] = useState(difficulty)

  useEffect(() => {
    if (difficulty > highestDifficulty) {
      setHighestDifficulty(difficulty)
    }
  }, [difficulty, highestDifficulty])

  useEffect(() => {
    const loadWorker = async () => {
      workerRef.current = Comlink.wrap(new Worker(new URL('./worker.ts', import.meta.url)))
      console.log('Worker loaded')
    }
    loadWorker()
  }, [])

  const startCheckingTimer = () => {
    const interval = setInterval(async () => {
      if (workerRef.current) {
        const isRunning = await workerRef.current.getIsRunning()
        setIsWorkerBusy(isRunning)
        const currentNonce = await workerRef.current.getCurrentNonce()
        setSearchedNonce(currentNonce)
        if (!isRunning) {
          const searchTime = await workerRef.current.getSearchTime()
          setSearchTime(searchTime)
          setNonce(`${currentNonce}`)
          setSearchedNonce(0) // Reset current number when search is done
          console.log('The worker is done')
          clearInterval(interval)
        }
      }
    }, 50)
  }

  const resetHighestDifficulty = () => {
    setHighestDifficulty(difficulty)
  }

  const incrementText = async () => {
    if (!workerRef.current || isWorkerBusy) {
      console.error('Worker is not loaded yet or is busy.')
      return
    }
    console.log('Starting worker to increment text')
    console.log('Starting search with', { text, message, nonce, difficulty })
    workerRef.current.startSearch(prefix, parseInt(nonce, 10) || 0, difficulty)
    startCheckingTimer()
  }

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-4 sm:gap-8 sm:p-20 font-[family-name:var(--font-kode-mono)]'>
      <main className='flex flex-col gap-4 row-start-2 items-center sm:items-start w-full'>
        <h1 className='text-4xl font-bold'>simpcoin</h1>
        <h2 className='text-xl -mt-4'>mining tool</h2>
        <TextareaAutosize
          className='w-full max-w-[800px] p-2 mt-4 border rounded text-sm bg-gray-800 text-white'
          placeholder='previous block'
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          minRows={10}
        />
        <div className='w-full max-w-[800px] flex gap-4'>
          <TextareaAutosize
            className='flex-grow p-2 border rounded text-sm bg-gray-800 text-white'
            placeholder='message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={1}
            minRows={1}
            style={{ resize: 'none' }}
          />
          <input
            className='w-[12ch] p-2 border rounded text-sm bg-gray-800 text-white self-start'
            placeholder='nonce'
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
          />
        </div>
        <p
          className='mt-0 mb-2 w-full break-all text-xs sm:text-sm font-bold'
          dangerouslySetInnerHTML={{ __html: highlightedHash }}
        >
        </p>
        <p className='mt-1 w-full break-all text-xs sm:text-sm'>
          difficulty: {difficulty}
          <br />
          {'+'.repeat(difficulty)}
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
            disabled={isWorkerBusy}
          >
            more difficulty
          </button>
          <p className='mt-1 break-all text-[10px] sm:text-[12px]'>
            search time: {searchTime.toFixed(2)} s
            <br />
            {isWorkerBusy && searchedNonce !== 0
              ? <>current number: {searchedNonce}</>
              : <>&nbsp;</>}
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
