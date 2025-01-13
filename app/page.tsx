'use client'

import crypto from 'crypto'
import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const hash = crypto.createHash('sha256').update(text).digest('hex')

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

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-4 row-start-2 items-center sm:items-start w-full'>
        <h1 className='text-4xl font-bold'>Simpcoin</h1>
        <h2 className='text-xl -mt-4'>Mining Tool</h2>
        <textarea
          className='w-full h-32 p-2 mt-4 border rounded font-[family-name:var(--font-kode-mono)] text-sm bg-gray-800 text-white'
          placeholder='Block goes here...'
          value={text}
          onChange={(e) => setText(e.target.value)}
        >
        </textarea>
        <p
          className='mt-2 font-[family-name:var(--font-kode-mono)] w-full break-all text-xs'
          dangerouslySetInnerHTML={{ __html: highlightedHash }}
        >
        </p>
        <p className='mt-1 font-[family-name:var(--font-kode-mono)] w-full break-all text-xs'>
          Difficulty: {maxRunLength}
        </p>
      </main>
    </div>
  )
}
