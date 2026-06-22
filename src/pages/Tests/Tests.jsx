import { useEffect, useMemo, useState } from 'react'

import './Tests.css'

const API_URL = ''

const tests = [
  {
    id: 'anatomy',
    title: 'Анатомия',
    icon: '脳',
    description:
      'Вопросы по системам организма: ЖКТ, дыхание, ткани, нервная система, мозг, ОДА и сердце.',
    questions: [
      {
        question:
          'Какая система отвечает за превращение пищи в вещества, которые организм может усвоить?',
        options: [
          'Дыхательная система',
          'Пищеварительная система',
          'Нервная система',
          'Опорно-двигательный аппарат',
        ],
        answer: 1,
      },
      {
        question: 'Что является основными органами газообмена?',
        options: ['Почки', 'Лёгкие', 'Печень', 'Желудок'],
        answer: 1,
      },
      {
        question: 'Что такое ткань?',
        options: [
          'Случайное скопление клеток',
          'Совокупность клеток и межклеточного вещества, объединённых строением и функциями',
          'Только мышечные волокна',
          'Только кровь',
        ],
        answer: 1,
      },
      {
        question: 'Какие элементы относятся к форменным элементам крови?',
        options: [
          'Эритроциты, лейкоциты и тромбоциты',
          'Кости и мышцы',
          'Нейроны и синапсы',
          'Желчь и ферменты',
        ],
        answer: 0,
      },
      {
        question: 'Какая функция у спинного мозга указана в справочнике?',
        options: [
          'Пищеварительная',
          'Рефлекторная и проводниковая',
          'Выработка желчи',
          'Фильтрация крови',
        ],
        answer: 1,
      },
      {
        question: 'Что координирует мозжечок?',
        options: [
          'Движения и равновесие',
          'Выработку желчи',
          'Работу желудочного сока',
          'Состав крови',
        ],
        answer: 0,
      },
      {
        question: 'Что входит в опорно-двигательный аппарат?',
        options: ['Только сердце', 'Скелет и мышцы', 'Только лёгкие', 'Только желудок'],
        answer: 1,
      },
      {
        question: 'Сколько камер у сердца человека?',
        options: ['2', '3', '4', '5'],
        answer: 2,
      },
    ],
  },
  {
    id: 'first-aid',
    title: 'ПМП',
    icon: '救',
    description: 'Вопросы по первой помощи, безопасности, составу ПМП и базовым действиям.',
    questions: [
      {
        question: 'Что нужно сделать перед оказанием первой медицинской помощи?',
        options: [
          'Сразу начать лечение',
          'Убедиться, что вам и раненому ничего не угрожает',
          'Оставить пациента одного',
          'Сразу отправить отчёт',
        ],
        answer: 1,
      },
      {
        question: 'Что входит в состав ПМП?',
        options: [
          'Перчатки, маски, антисептик, бинты, жгут, ножницы, пинцет',
          'Только еда и вода',
          'Только оружие',
          'Только одежда',
        ],
        answer: 0,
      },
      {
        question: 'Что используется при кровотечении для фиксации сосудов?',
        options: ['Жгут', 'Градусник', 'Сироп алтея', 'Капли в нос'],
        answer: 0,
      },
      {
        question: 'Что надо сделать при резаной/колотой ране в ПМП?',
        options: [
          'Надеть перчатки и маску, обработать рану и перебинтовать',
          'Сразу отпустить пациента',
          'Игнорировать кровотечение',
          'Дать пациенту бегать',
        ],
        answer: 0,
      },
      {
        question: 'Что делают при ожоге в ПМП?',
        options: [
          'Наносят мазь на бинт и перебинтовывают место ожога',
          'Перетягивают шею',
          'Дают крепкий чай',
          'Сразу накладывают гипс',
        ],
        answer: 0,
      },
      {
        question: 'Куда нужно отнести пациента после оказания ПМП?',
        options: ['В поместье', 'В лес', 'На тренировку', 'На патруль без лечения'],
        answer: 0,
      },
    ],
  },
  {
    id: 'wounds',
    title: 'Лечение ран',
    icon: '傷',
    description: 'Вопросы по ушибам, гематомам, вывихам, переломам, ранам и другим травмам.',
    questions: [
      {
        question: 'Что делают при ушибе?',
        options: [
          'Через полотенце прикладывают лёд, делают компресс и бинтуют',
          'Сразу накладывают шов',
          'Проводят ампутацию',
          'Дают пациенту бегать',
        ],
        answer: 0,
      },
      {
        question: 'Что делают при гематоме?',
        options: [
          'Охлаждают место с гематомой',
          'Сразу вскрывают грудную клетку',
          'Накладывают турникет на шею',
          'Проводят ВВК',
        ],
        answer: 0,
      },
      {
        question: 'Сколько человек требуется для RP-лечения вывиха?',
        options: ['1 человек', '2 человека', '5 человек', 'Не требуется никто'],
        answer: 1,
      },
      {
        question: 'Что является признаком вывиха?',
        options: [
          'Смещение кости в суставе, боль, отёк и ограничение движения',
          'Только насморк',
          'Только кашель',
          'Только сонливость',
        ],
        answer: 0,
      },
      {
        question: 'Что нужно сделать при ссадине?',
        options: [
          'Промыть, обработать, забинтовать или наклеить пластырь',
          'Сразу дать наркоз',
          'Сразу делать пункцию плевральной полости',
          'Не трогать вообще',
        ],
        answer: 0,
      },
      {
        question: 'Что делают при закрытом переломе руки?',
        options: [
          'Накладывают гипсовую повязку и обездвиживают повреждённую часть',
          'Накладывают пластырь на палец',
          'Дают отвар ромашки',
          'Проводят проверку зрения',
        ],
        answer: 0,
      },
      {
        question: 'Что делают при сильном кровотечении резаной раны?',
        options: ['Накладывают жгут', 'Дают сладкий чай', 'Проверяют зрение', 'Проводят лекцию'],
        answer: 0,
      },
      {
        question: 'Что делают при пониженном давлении?',
        options: [
          'Поднимают ноги выше головы, обтирают лицо прохладной влажной тряпкой, дают крепкий сладкий чай',
          'Накладывают гипс',
          'Сразу проводят ампутацию',
          'Дают антибиотик без причины',
        ],
        answer: 0,
      },
    ],
  },
  {
    id: 'tools',
    title: 'Инструменты',
    icon: '器',
    description: 'Вопросы по хирургическим инструментам и их назначению.',
    questions: [
      {
        question: 'Для чего используется брюшистый скальпель?',
        options: [
          'Для длинных и широких, но неглубоких разрезов',
          'Для проверки зрения',
          'Для прослушивания сердца',
          'Для бинтования',
        ],
        answer: 0,
      },
      {
        question: 'Для чего используется тенотом?',
        options: [
          'Для подкожного рассечения сухожилий',
          'Для измерения температуры',
          'Для обработки рук',
          'Для наложения гипса',
        ],
        answer: 0,
      },
      {
        question: 'Для чего применяются кусачки Люэра?',
        options: [
          'Для скусывания костной ткани',
          'Для проверки слуха',
          'Для обработки ожогов',
          'Для введения наркоза',
        ],
        answer: 0,
      },
      {
        question: 'Что делает ранорасширитель?',
        options: [
          'Разводит края раны и удерживает их в нужном положении',
          'Измеряет давление',
          'Уменьшает температуру',
          'Проверяет зрение',
        ],
        answer: 0,
      },
      {
        question: 'Для чего используется корнцанг?',
        options: [
          'Для подачи материала, инструментов, тампонов, дренажей и обработки поля',
          'Для питья лекарств',
          'Для проверки рефлексов',
          'Для патруля',
        ],
        answer: 0,
      },
      {
        question: 'Для чего используется пила Джильи-Оливекрона?',
        options: [
          'Для костно-пластической трепанации черепа',
          'Для наложения бинта',
          'Для обработки ожога',
          'Для проверки слуха',
        ],
        answer: 0,
      },
    ],
  },
  {
    id: 'pharmacy',
    title: 'Фармация',
    icon: '薬',
    description: 'Вопросы по препаратам, антибиотикам, наркозам и подготовке к операциям.',
    questions: [
      {
        question: 'Что такое новокаин?',
        options: [
          'Местноанестезирующее средство',
          'Хирургическая пила',
          'Перевязочный материал',
          'Вид патруля',
        ],
        answer: 0,
      },
      {
        question: 'Какое действие имеет парацетамол?',
        options: [
          'Анальгетическое и жаропонижающее',
          'Только хирургическое',
          'Только перевязочное',
          'Только механическое',
        ],
        answer: 0,
      },
      {
        question: 'Что используется как сильнодействующее обезболивающее?',
        options: ['Морфин', 'Марля', 'Пинцет', 'Градусник'],
        answer: 0,
      },
      {
        question: 'Что такое этиловый спирт в медицинском разделе?',
        options: [
          'Подсушивающее и обеззараживающее средство',
          'Костный инструмент',
          'Вид шва',
          'Часть мозга',
        ],
        answer: 0,
      },
      {
        question: 'Что относится к пенициллинам?',
        options: ['Бициллин-1 и Бициллин-5', 'Пила листовая', 'Корнцанг', 'Роторасширитель'],
        answer: 0,
      },
      {
        question: 'Что такое хлороформ?',
        options: ['Анестетик, использовавшийся при операциях', 'Кость', 'Нерв', 'Мышца'],
        answer: 0,
      },
      {
        question: 'Для чего используется атропин перед наркозом?',
        options: [
          'Уменьшает секрецию бронхиальных желёз и блокирует влияние блуждающего нерва на сердце',
          'Измеряет температуру',
          'Разрезает ткани',
          'Фиксирует бинт',
        ],
        answer: 0,
      },
    ],
  },
]

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

function getResultClass(percent) {
  if (percent >= 90) return 'tests__result--green'
  if (percent >= 50) return 'tests__result--yellow'
  return 'tests__result--red'
}

function getResultText(percent) {
  if (percent >= 90) return 'Отличный результат'
  if (percent >= 50) return 'Средний результат'
  return 'Нужно повторить материал'
}

function Tests() {
  const [selectedTest, setSelectedTest] = useState(null)
  const [participant, setParticipant] = useState({
    fullName: '',
    position: '',
  })
  const [isStarted, setIsStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [sendStatus, setSendStatus] = useState('idle')
  const [sendMessage, setSendMessage] = useState('')

  const combinedTest = useMemo(() => {
    const allQuestions = tests.flatMap((test) =>
      test.questions.map((question) => ({
        ...question,
        category: test.title,
      })),
    )

    return {
      id: 'combined',
      title: 'Комбинированный тест',
      icon: '混',
      description:
        'Случайные вопросы по всем разделам: анатомия, ПМП, лечение ран, инструменты и фармация.',
      questions: shuffleArray(allQuestions).slice(0, 16),
    }
  }, [])

  const testList = [...tests, combinedTest]

  const resetModalState = () => {
    setParticipant({
      fullName: '',
      position: '',
    })
    setIsStarted(false)
    setAnswers({})
    setResult(null)
    setSendStatus('idle')
    setSendMessage('')
  }

  const openTest = (test) => {
    setSelectedTest({
      ...test,
      questions: shuffleArray(test.questions).map((question) => ({
        ...question,
        options: shuffleArray(
          question.options.map((option, index) => ({
            text: option,
            originalIndex: index,
          })),
        ),
      })),
    })

    resetModalState()
  }

  const closeTest = () => {
    setSelectedTest(null)
    resetModalState()
  }

  const startTest = () => {
    if (!participant.fullName.trim() || !participant.position.trim()) return
    setIsStarted(true)
  }

  const selectAnswer = (questionIndex, optionOriginalIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionOriginalIndex,
    }))
  }

  const finishTest = async () => {
    if (!selectedTest || sendStatus === 'sending') return

    const total = selectedTest.questions.length

    let correct = 0

    selectedTest.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correct += 1
      }
    })

    const percent = Math.round((correct / total) * 100)

    const finalResult = {
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      fullName: participant.fullName.trim(),
      position: participant.position.trim(),
      total,
      correct,
      percent,
      date: new Date().toLocaleString('ru-RU'),
    }

    setResult(finalResult)
    setSendStatus('sending')
    setSendMessage('Результат отправляется в Discord...')

    try {
      const response = await fetch(`${API_URL}/api/test-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalResult),
      })

      const data = await response.json()

      if (!response.ok) {
        setSendStatus('error')
        setSendMessage(data.message || 'Результат показан на сайте, но не отправился в Discord.')
        return
      }

      setSendStatus('success')
      setSendMessage(data.message || 'Результат успешно отправлен в Discord.')
    } catch (error) {
      console.error('Не удалось отправить результат теста:', error)
      setSendStatus('error')
      setSendMessage('Не удалось связаться с сервером отправки результата.')
    }
  }

  const answeredCount = selectedTest ? Object.keys(answers).length : 0

  const canFinish =
    selectedTest &&
    answeredCount === selectedTest.questions.length &&
    sendStatus !== 'sending'

  useEffect(() => {
    if (!selectedTest) return

    document.body.classList.add('modal-open')

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        closeTest()
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleEsc)
    }
  }, [selectedTest])

  return (
    <section className="tests page">
      <div className="tests__orb tests__orb--left"></div>
      <div className="tests__orb tests__orb--right"></div>

      <div className="page__container tests__container">
        <p className="page__eyebrow">Knowledge Check</p>
        <h1 className="page__title">Тестирование</h1>

        <p className="tests__lead">
          Выбери нужный тест, введи имя, фамилию и должность, после чего пройди
          вопросы. В конце появится оценка в процентах.
        </p>

        <div className="tests__grid">
          {testList.map((test, index) => (
            <button
              type="button"
              className="tests__card card"
              key={test.id}
              onClick={() => openTest(test)}
              style={{ '--delay': `${index * 0.06}s` }}
            >
              <span className="tests__icon">{test.icon}</span>

              <span className="tests__card-content">
                <strong>{test.title}</strong>
                <small>{test.description}</small>
                <em>{test.questions.length} вопросов</em>
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedTest && (
        <div className="tests-modal" onMouseDown={closeTest}>
          <div
            className="tests-modal__content"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="tests-modal__close"
              type="button"
              onClick={closeTest}
              aria-label="Закрыть тест"
            >
              ×
            </button>

            {!isStarted && !result && (
              <div className="tests-modal__start">
                <div className="tests-modal__head">
                  <span>{selectedTest.icon}</span>

                  <div>
                    <p>Выбранный тест</p>
                    <h2>{selectedTest.title}</h2>
                  </div>
                </div>

                <p className="tests-modal__description">
                  {selectedTest.description}
                </p>

                <div className="tests-modal__form">
                  <label>
                    Имя и фамилия
                    <input
                      type="text"
                      value={participant.fullName}
                      onChange={(event) =>
                        setParticipant((prev) => ({
                          ...prev,
                          fullName: event.target.value,
                        }))
                      }
                      placeholder="Например: Ай Хошино"
                    />
                  </label>

                  <label>
                    Должность
                    <input
                      type="text"
                      value={participant.position}
                      onChange={(event) =>
                        setParticipant((prev) => ({
                          ...prev,
                          position: event.target.value,
                        }))
                      }
                      placeholder="Например: Истребитель"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="tests-modal__button"
                  onClick={startTest}
                  disabled={!participant.fullName.trim() || !participant.position.trim()}
                >
                  Начать тест
                </button>
              </div>
            )}

            {isStarted && !result && (
              <div className="tests-modal__quiz">
                <div className="tests-modal__top">
                  <div>
                    <p>{participant.fullName}</p>
                    <h2>{selectedTest.title}</h2>
                  </div>

                  <span>
                    {answeredCount}/{selectedTest.questions.length}
                  </span>
                </div>

                <div className="tests-modal__questions">
                  {selectedTest.questions.map((question, questionIndex) => (
                    <article
                      className="tests-modal__question"
                      key={`${question.question}-${questionIndex}`}
                    >
                      <div className="tests-modal__question-head">
                        <span>{String(questionIndex + 1).padStart(2, '0')}</span>
                        {question.category && <em>{question.category}</em>}
                      </div>

                      <h3>{question.question}</h3>

                      <div className="tests-modal__options">
                        {question.options.map((option) => (
                          <button
                            type="button"
                            key={option.text}
                            className={
                              answers[questionIndex] === option.originalIndex
                                ? 'tests-modal__option tests-modal__option--active'
                                : 'tests-modal__option'
                            }
                            onClick={() =>
                              selectAnswer(questionIndex, option.originalIndex)
                            }
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <button
                  type="button"
                  className="tests-modal__button"
                  onClick={finishTest}
                  disabled={!canFinish}
                >
                  Завершить тест
                </button>
              </div>
            )}

            {result && (
              <div className={`tests__result ${getResultClass(result.percent)}`}>
                <span className="tests__result-percent">{result.percent}%</span>

                <h2>{getResultText(result.percent)}</h2>

                <p>
                  {result.fullName}, должность: {result.position}
                </p>

                <div className="tests__result-stats">
                  <div>
                    <strong>{result.correct}</strong>
                    <span>Правильных</span>
                  </div>

                  <div>
                    <strong>{result.total}</strong>
                    <span>Всего вопросов</span>
                  </div>

                  <div>
                    <strong>{result.date}</strong>
                    <span>Дата</span>
                  </div>
                </div>

                <div className={`tests__send-status tests__send-status--${sendStatus}`}>
                  {sendMessage}
                </div>

                <button
                  type="button"
                  className="tests-modal__button"
                  onClick={closeTest}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default Tests