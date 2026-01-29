'use client'

import { useEffect, useRef } from 'react'
import { incrementAdView } from '@/actions/increment-view'

export function ViewCounter({ adId }: { adId: string }) {
    const hasCounted = useRef(false)

    useEffect(() => {
        if (!hasCounted.current) {
            incrementAdView(adId)
            hasCounted.current = true
        }
    }, [adId])

    return null
}
