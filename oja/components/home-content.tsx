import { Button } from '@lastprice/ui'
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function HomeContent() {
  return (
    <div className="flex flex-1 items-center justify-center bg-white px-6">
      <div className="flex max-w-4xl items-center gap-16">
        {/* Text Content */}
        <div className="flex-1">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">Hello Omolade</h1>
          <p className="mb-6 text-base leading-relaxed text-gray-600">
            Track what matters—Paid turns usage and margin into live billing and payouts, without rigid SKUs or legacy
            constraints.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/get-started">
              <Button className="bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Get started
              </Button>
            </Link>
            <Link
              href="/documentation"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600"
            >
              Documentation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Waving Hand Illustration */}
        <div className="flex-shrink-0">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-900"
          >
            {/* Wave lines */}
            <path d="M85 45 Q80 40 85 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M75 50 Q68 42 75 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M155 45 Q160 40 155 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M165 50 Q172 42 165 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Palm */}
            <ellipse cx="120" cy="140" rx="45" ry="50" stroke="currentColor" strokeWidth="2.5" fill="none" />
            {/* Thumb */}
            <path
              d="M75 130 Q65 125 68 110 Q72 95 85 100"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Index finger */}
            <path
              d="M95 95 Q93 75 95 55 Q97 45 105 45 Q113 45 115 55 Q117 75 115 95"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Middle finger */}
            <path
              d="M115 95 Q113 70 115 50 Q117 38 125 38 Q133 38 135 50 Q137 70 135 95"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Ring finger */}
            <path
              d="M135 95 Q133 72 135 52 Q137 42 145 42 Q153 42 155 52 Q157 72 155 95"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Pinky finger */}
            <path
              d="M155 100 Q155 82 157 65 Q159 55 165 55 Q171 55 173 65 Q175 82 173 100"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Wrist */}
            <path
              d="M90 185 L90 190 L150 190 L150 185"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
