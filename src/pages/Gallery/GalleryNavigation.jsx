import { useEffect, useState } from 'react'
import { useSwiper } from 'swiper/react'

function Arrow({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      aria-hidden="true"
      style={{
        transform: direction === 'previous' ? 'rotate(180deg)' : undefined,
      }}
    >
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Каждый экземпляр управляет только своим Swiper — без глобальных CSS-селекторов.
export default function GalleryNavigation({ total }) {
  const swiper = useSwiper()
  const [state, setState] = useState({ beginning: true, end: false, index: 0 })

  useEffect(() => {
    function synchronize() {
      setState({
        beginning: swiper.isBeginning,
        end: swiper.isEnd,
        index: swiper.realIndex,
      })
    }
    synchronize()
    const events = [
      'slideChange',
      'reachBeginning',
      'reachEnd',
      'fromEdge',
      'resize',
      'update',
      'lock',
      'unlock',
    ]
    events.forEach((event) => swiper.on(event, synchronize))
    return () => events.forEach((event) => swiper.off(event, synchronize))
  }, [swiper, total])

  return (
    <div className="gallery-navigation" aria-label="Управление галереей">
      <span className="gallery-navigation__hint">Моменты поместья</span>
      <div className="gallery-navigation__controls">
        <button
          type="button"
          aria-label="Предыдущая фотография"
          disabled={state.beginning || total <= 1}
          onClick={() => swiper.slidePrev()}
        >
          <Arrow direction="previous" />
        </button>
        <span className="gallery-navigation__counter" aria-live="polite">
          <strong>{String(state.index + 1).padStart(2, '0')}</strong>
          <span>/ {String(total).padStart(2, '0')}</span>
        </span>
        <button
          type="button"
          aria-label="Следующая фотография"
          disabled={state.end || total <= 1}
          onClick={() => swiper.slideNext()}
        >
          <Arrow direction="next" />
        </button>
      </div>
    </div>
  )
}
