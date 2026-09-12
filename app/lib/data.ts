export type Event = {
  id: number
  title: string
  subtitle: string
  venue: string
  city: string
  date: string
  time: string
  category: string
  image: string
  minPrice: number
  maxPrice: number
  ticketsLeft: number
  hot: boolean
}

export type TicketSection = {
  label: string
  row: string
  seats: string
  qty: number
  price: number
}

export const CATEGORIES = ['All', 'Concerts', 'Sports', 'Theatre', 'Comedy', 'Festivals']

export const EVENTS: Event[] = [
  {
    id: 1,
    title: 'Kendrick Lamar',
    subtitle: 'Grand National Tour',
    venue: 'Madison Square Garden',
    city: 'New York, NY',
    date: 'Sat, Oct 11',
    time: '8:00 PM',
    category: 'Concerts',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop&auto=format',
    minPrice: 148,
    maxPrice: 890,
    ticketsLeft: 34,
    hot: true,
  },
  {
    id: 2,
    title: 'New York Knicks vs. Boston Celtics',
    subtitle: 'NBA Regular Season',
    venue: 'Madison Square Garden',
    city: 'New York, NY',
    date: 'Thu, Oct 16',
    time: '7:30 PM',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop&auto=format',
    minPrice: 95,
    maxPrice: 1240,
    ticketsLeft: 128,
    hot: false,
  },
  {
    id: 3,
    title: 'Sabrina Carpenter',
    subtitle: "Short n' Sweet Tour",
    venue: 'Barclays Center',
    city: 'Brooklyn, NY',
    date: 'Fri, Oct 24',
    time: '7:00 PM',
    category: 'Concerts',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format',
    minPrice: 210,
    maxPrice: 650,
    ticketsLeft: 12,
    hot: true,
  },
  {
    id: 4,
    title: 'Hamilton',
    subtitle: 'Broadway Revival',
    venue: 'Richard Rodgers Theatre',
    city: 'New York, NY',
    date: 'Tue, Nov 4',
    time: '8:00 PM',
    category: 'Theatre',
    image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&h=400&fit=crop&auto=format',
    minPrice: 185,
    maxPrice: 2100,
    ticketsLeft: 7,
    hot: true,
  },
  {
    id: 5,
    title: 'Dave Chappelle',
    subtitle: 'Live Stand-Up',
    venue: 'Radio City Music Hall',
    city: 'New York, NY',
    date: 'Sat, Nov 8',
    time: '9:00 PM',
    category: 'Comedy',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&h=400&fit=crop&auto=format',
    minPrice: 120,
    maxPrice: 480,
    ticketsLeft: 55,
    hot: false,
  },
  {
    id: 6,
    title: 'Governors Ball 2025',
    subtitle: 'Music Festival — 3-Day Pass',
    venue: 'Flushing Meadows Corona Park',
    city: 'Queens, NY',
    date: 'Fri–Sun, Jun 6–8',
    time: 'All Day',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop&auto=format',
    minPrice: 340,
    maxPrice: 780,
    ticketsLeft: 204,
    hot: false,
  },
  {
    id: 7,
    title: 'NY Rangers vs. Pittsburgh Penguins',
    subtitle: 'NHL Regular Season',
    venue: 'Madison Square Garden',
    city: 'New York, NY',
    date: 'Wed, Oct 29',
    time: '7:00 PM',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=600&h=400&fit=crop&auto=format',
    minPrice: 78,
    maxPrice: 620,
    ticketsLeft: 89,
    hot: false,
  },
  {
    id: 8,
    title: 'Chappell Roan',
    subtitle: 'The Rise and Fall Tour',
    venue: 'Forest Hills Stadium',
    city: 'Queens, NY',
    date: 'Sun, Sep 28',
    time: '6:30 PM',
    category: 'Concerts',
    image: 'https://images.unsplash.com/photo-1501386761578-eaa54b45c5e0?w=600&h=400&fit=crop&auto=format',
    minPrice: 175,
    maxPrice: 540,
    ticketsLeft: 21,
    hot: true,
  },
]

export const TICKET_SECTIONS: TicketSection[] = [
  { label: 'Floor GA', row: '—', seats: 'General Admission', qty: 2, price: 310 },
  { label: 'Pit A', row: 'A', seats: '14–15', qty: 2, price: 428 },
  { label: 'Section 101', row: 'C', seats: '22–23', qty: 2, price: 212 },
  { label: 'Section 104', row: 'F', seats: '7–8', qty: 2, price: 185 },
  { label: 'Section 108', row: 'J', seats: '1–2', qty: 2, price: 148 },
  { label: 'Section 201', row: 'B', seats: '11–12', qty: 2, price: 162 },
]

export function getEventById(id: number): Event | undefined {
  return EVENTS.find(e => e.id === id)
}
