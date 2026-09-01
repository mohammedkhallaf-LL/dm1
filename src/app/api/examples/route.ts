import { EXAMPLES } from '../../../examples/index.ts'

export async function GET() {
  return Response.json({
    data: EXAMPLES.map((e) => ({
      id: e.id,
      order: e.order,
      theme: e.theme,
      eventName: e.eventName,
      tagline: e.tagline,
      venue: e.venue,
      city: e.city,
      country: e.country,
      dates: e.dates,
      difficulty: e.difficulty,
      label: e.label,
      scale: e.scale,
    })),
  })
}
