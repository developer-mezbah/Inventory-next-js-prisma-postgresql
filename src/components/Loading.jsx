import Image from 'next/image'
import React from 'react'

const Loading = () => {
    return (
        <div className="relative flex justify-center items-center min-h-[50vh]">
            <Image width={200} height={200} src="/loading.svg" alt="Loading..." className='h-28 w-28' />
        </div>
    )
}

export default Loading