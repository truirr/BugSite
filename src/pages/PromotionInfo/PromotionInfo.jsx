import './PromotionInfo.css'

const mainInfo = [
  'Система повышения написана для отряда Сэйсэки. Перед началом прочтения требуется знать следующие вещи.',
  'Для корректного отображения СП сделайте следующее: “Вид” → “Ширина текста” → “Средняя”.',
  'Задания, помеченные “*”, невозможно пропустить за счёт рекомендации.',
  'Прежде чем повышаться, убедитесь, что требования из IX пункта устава были выполнены.',
  'Отчёт о выполнении спец. заданий пишется отдельно от основного отчёта.',
  'Тренировки — это события, в которых вы улучшаете свои физические или дыхательные навыки.',
  'Мероприятия — это события, в которых вы занимаетесь обыденностью.',
  'Захват точек / зачистка не считаются тренировкой или мероприятием.',
  'При подаче рапорта на повышение по вашим скриншотам должно быть интуитивно понятно, что именно вы делали.',
]

const patrolRules = [
  {
    title: 'Форма отчёта во время патрулей',
    text: '/f [ Имя ворона, если есть ] Место: Название локации ; Участников: N количество ; Время патруля: 0/N ; Докладывает Имя Фамилия, территория полностью чиста, никакой активности демонов не было замечено.',
  },
  {
    title: 'Пример отчёта',
    text: '/f [ ??? ] Место: НТ ; Время патруля: 0/15 ; Докладывает Рио Мацуда, всё спокойно, активности демонов не было замечено, продолжаю патрулирование.',
  },
  {
    title: 'Патруль от 3 человек',
    text: 'Если в патрулировании участвует более 3 человек, все участники разделяются по локациям и каждый индивидуально докладывает о состоянии своей территории.',
  },
  {
    title: 'Пример разделения по локациям',
    text: '/f [ ??? ] Место: НТ [Заброшенное здание] ; Время 0/15 ; Докладывает Рио Мацуда, прибыл на позицию, всё спокойно, демоны не были обнаружены.',
  },
  {
    title: 'Периодичность отчётов',
    text: 'Отчёт о состоянии территории делается каждые 5 минут. Если число не кратно 5, например 15, 20, 25 и т.д., число делится на 3, и доклады делаются по полученному времени.',
  },
]

const instructorInfo = [
  'Вы повышаетесь по такой же системе повышения, как и обычные истребители, но есть некоторые изменения.',
  'В случае заданий из категории «Поручения» вы запрашиваете их у человека, который по должности выше вас.',
  'В случае тренировок и мероприятий — 50% в меньшую сторону при нечётном числе вы проводите сами.',
]

function PromotionInfo() {
  return (
    <section className="promotion-info page">
      <div className="promotion-info__orb promotion-info__orb--left"></div>
      <div className="promotion-info__orb promotion-info__orb--right"></div>

      <div className="page__container promotion-info__container">
        <p className="page__eyebrow">Promotion Details</p>
        <h1 className="page__title">Дополнительная информация</h1>

        <p className="promotion-info__lead">
          Здесь собраны пояснения к системе повышения, правила оформления
          патрулей и отдельные условия для должности Инструктор+.
        </p>

        <div className="promotion-info__layout">
          <article className="promotion-info__section card">
            <div className="promotion-info__section-head">
              <span>01</span>
              <h2>Информация</h2>
            </div>

            <ul className="promotion-info__list">
              {mainInfo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="promotion-info__note">
              <strong>Примечание</strong>
              <p>
                Должно быть 2 скриншота: получение задания → утверждение
                задания. Желательно подавать отчётность без создания
                Google-документа.
              </p>
            </div>
          </article>

          <article className="promotion-info__section card">
            <div className="promotion-info__section-head">
              <span>02</span>
              <h2>Правила проведения патруля</h2>
            </div>

            <p className="promotion-info__text">
              При проведении или участии в патруле стоит учитывать несколько
              правил оформления доклада и распределения участников.
            </p>

            <div className="promotion-info__cards">
              {patrolRules.map((rule, index) => (
                <div
                  className="promotion-info__mini-card"
                  key={rule.title}
                  style={{ '--delay': `${index * 0.06}s` }}
                >
                  <h3>{rule.title}</h3>
                  <p>{rule.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="promotion-info__section promotion-info__section--accent card">
            <div className="promotion-info__section-head">
              <span>03</span>
              <h2>Информация Инструктор+</h2>
            </div>

            <ul className="promotion-info__list">
              {instructorInfo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}

export default PromotionInfo