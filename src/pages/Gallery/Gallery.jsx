import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import gallery1 from '../../assets/img/gallery-1.jpg'
import gallery2 from '../../assets/img/gallery-2.jpg'
import gallery3 from '../../assets/img/gallery-3.jpg'

import './Gallery.css'

const images = [gallery1, gallery2, gallery3]

function Gallery() {
  return (
    <section className="gallery page">
      <div className="page__container">
        <p className="page__eyebrow">Moments</p>
        <h1 className="page__title">Галерея поместья</h1>

        <div className="gallery__frame card">
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation
            pagination={{ clickable: true }}
            keyboard
            spaceBetween={22}
            slidesPerView={1}
            breakpoints={{
              760: { slidesPerView: 2 },
              1120: { slidesPerView: 3 },
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={image}>
                <article className="gallery__item">
                  <img src={image} alt={`Скриншот ${index + 1}`} />
                  <span>#{String(index + 1).padStart(2, '0')}</span>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}

export default Gallery