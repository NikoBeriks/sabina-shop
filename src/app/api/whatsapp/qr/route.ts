import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const greenId = process.env.GREEN_API_ID_INSTANCE || '710722771979'
  const greenToken = process.env.GREEN_API_TOKEN || 'aa48741de6874ed8b70834aac4c6297fb2a8b07eee9045f4b0'
  const hostUrl = process.env.GREEN_API_URL || 'https://7107.api.greenapi.com'

  try {
    const res = await fetch(`${hostUrl}/waInstance${greenId}/qr/${greenToken}`, {
      cache: 'no-store',
    })
    const data = await res.json()

    if (data.type === 'qrCode' && data.message) {
      const buffer = Buffer.from(data.message, 'base64')
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      })
    }

    if (data.type === 'alreadyLogged') {
      return NextResponse.json({ message: 'WhatsApp уже авторизован' })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
