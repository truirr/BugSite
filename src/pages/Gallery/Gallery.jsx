import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import gallery1 from '../../assets/img/gallery-1.jpg'
import gallery2 from '../../assets/img/gallery-2.jpg'
import gallery3 from '../../assets/img/gallery-3.jpg'
import gallery4 from '../../assets/img/gallery-4.jpg'
import gallery5 from '../../assets/img/gallery-5.jpg'
import gallery6 from '../../assets/img/gallery-6.jpg'
import gallery7 from '../../assets/img/gallery-7.jpg'

import './Gallery.css'

const images = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery7]

function Gallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (index) => {
    setActiveIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (!isModalOpen) return

    document.body.classList.add('modal-open')

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isModalOpen])

  return (
    <section className="gallery page">
      <div className="gallery__orb gallery__orb--left"></div>
      <div className="gallery__orb gallery__orb--right"></div>

      <div className="page__container gallery__container">
        <p className="page__eyebrow">Moments</p>
        <h1 className="page__title">Галерея поместья</h1>

        <p className="gallery__lead">
          Скриншоты и моменты из жизни поместья Бабочки. Нажми на изображение,
          чтобы открыть его в полном размере.
        </p>

        <div className="gallery__frame card">
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation
            pagination={{ clickable: true }}
            keyboard
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
                  <img src={image} alt={`Скриншот ${index + 1}`} />

                  <span className="gallery__number">
                    #{String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="gallery__open">Открыть</span>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {isModalOpen && (
        <div className="gallery-modal" onMouseDown={closeModal}>
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
              modules={[Navigation, Pagination, Keyboard]}
              navigation
              pagination={{ clickable: true }}
              keyboard
              initialSlide={activeIndex}
              slidesPerView={1}
              spaceBetween={24}
            >
              {images.map((image, index) => (
                <SwiperSlide key={image}>
                  <div className="gallery-modal__slide">
                    <img src={image} alt={`Скриншот ${index + 1}`} />

                    <span className="gallery-modal__counter">
                      {String(index + 1).padStart(2, '0')} /{' '}
                      {String(images.length).padStart(2, '0')}
                    </span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </section>
  )
}

export default Gallery