import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import useContent from '../../lib/useContent'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Keyboard, A11y } from 'swiper/modules'
import GalleryNavigation from './GalleryNavigation'

import 'swiper/css'

import gallery1 from '../../assets/img/gallery-1.jpg'
import gallery2 from '../../assets/img/gallery-2.jpg'
import gallery3 from '../../assets/img/gallery-3.jpg'
import gallery4 from '../../assets/img/gallery-4.jpg'
import gallery5 from '../../assets/img/gallery-5.jpg'
import gallery6 from '../../assets/img/gallery-6.jpg'
import gallery7 from '../../assets/img/gallery-7.jpg'

import './Gallery.css'

const initialImages = [
  gallery1,
  gallery2,
  gallery3,
  gallery4,
  gallery5,
  gallery6,
  gallery7,
]

function Gallery() {
  const { content, error } = useContent()
  const photos = [
    ...initialImages.map((url, i) => ({ url, caption: `Скриншот ${i + 1}` })),
    ...(content?.gallery || []),
  ]
  const images = photos.map((photo) => photo.url)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dialogRef = useRef(null)
  const lastFocusedElement = useRef(null)

  const openModal = (index) => {
    lastFocusedElement.current = document.activeElement
    setActiveIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (!isModalOpen) return

    document.body.classList.add('modal-open')
    dialogRef.current?.focus()

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
      if (event.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll(
          'button:not(:disabled)',
        )
        const first = controls?.[0]
        const last = controls?.[controls.length - 1]
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialogRef.current)
        ) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleEsc)
      lastFocusedElement.current?.focus()
    }
  }, [isModalOpen])

  return (
    <section className="gallery page">
      <div className="gallery__orb gallery__orb--left"></div>
      <div className="gallery__orb gallery__orb--right"></div>

      <div className="page__container gallery__container">
        <p className="page__eyebrow">Moments</p>
        <h1 className="page__title">Галерея поместья</h1>
        {error && (
          <p role="status">
            Новые фотографии временно недоступны. Показана исходная галерея.
          </p>
        )}

        <p className="gallery__lead">
          Скриншоты и моменты из жизни поместья Бабочки. Нажми на изображение,
          чтобы открыть его в полном размере.
        </p>

        <div className="gallery__frame card">
          <Swiper
            modules={[Keyboard, A11y]}
            keyboard={{ enabled: !isModalOpen }}
            spaceBetween={22}
            slidesPerView={1}
            breakpoints={{
              760: { slidesPerView: 1.4 },
              1024: { slidesPerView: 2 },
              1440: { slidesPerView: 2.5 },
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={image}>
                <button
                  className="gallery__item"
                  type="button"
                  onClick={() => openModal(index)}
                  aria-label={`Открыть скриншот ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={photos[index].caption || `Скриншот ${index + 1}`}
                    loading="lazy"
                  />

                  <span className="gallery__number">
                    #{String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="gallery__open">Открыть</span>
                </button>
              </SwiperSlide>
            ))}
            <GalleryNavigation slot="container-end" total={images.length} />
          </Swiper>
        </div>
      </div>

      {isModalOpen &&
        createPortal(
          <div
            className="gallery-modal"
            onMouseDown={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фотографий"
            tabIndex={-1}
            ref={dialogRef}
          >
            <button
              className="gallery-modal__close"
              type="button"
              onClick={closeModal}
              aria-label="Закрыть галерею"
            >
              ×
            </button>

            <div
              className="gallery-modal__content"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Swiper
                modules={[Keyboard, A11y]}
                keyboard
                initialSlide={activeIndex}
                slidesPerView={1}
                spaceBetween={24}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={image}>
                    <div className="gallery-modal__slide">
                      <img
                        src={image}
                        alt={photos[index].caption || `Скриншот ${index + 1}`}
                      />

                      <span className="gallery-modal__counter">
                        {String(index + 1).padStart(2, '0')} /{' '}
                        {String(images.length).padStart(2, '0')}
                      </span>
                    </div>
                  </SwiperSlide>
                ))}
                <GalleryNavigation slot="container-end" total={images.length} />
              </Swiper>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}

export default Gallery
