import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const greenId = process.env.GREEN_API_ID_INSTANCE || '710722771979'
  const greenToken = process.env.GREEN_API_TOKEN || 'aa48741de6874ed8b70834aac4c6297fb2a8b07eee9045f4b0'
  const hostUrl = process.env.GREEN_API_URL || 'https://7107.api.greenapi.com'

  try {
    const res = await fetch(`${hostUrl}/waInstance${greenId}/getStateInstance/${greenToken}`, {
      cache: 'no-store',
    })
    const data = await res.json()
    const isAuthorized = data.stateInstance === 'authorized'

    return NextResponse.json({
      authorized: isAuthorized,
      stateInstance: data.stateInstance,
      staffPhone: process.env.WHATSAPP_STAFF_PHONE || '79287144816',
    })
  } catch (err: any) {
    return NextResponse.json({ authorized: false, error: err.message }, { status: 500 })
  }
}
