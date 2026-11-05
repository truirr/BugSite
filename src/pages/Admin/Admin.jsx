import PageIntro from '../../components/PageIntro/PageIntro'
import { useEffect, useState } from 'react'
import { api, uploadImage } from '../../lib/api'
import './Admin.css'

const newQuestion = () => ({ question: '', options: ['', ''], answer: 0 })
const uid = () => crypto.randomUUID()

// Общие элементы редакторов: текстовое поле и загрузка фотографии.
function Field({ label, value, onChange, ...props }) {
  return (
    <label className="admin__field">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  )
}

function Photo({ value, onChange, onError, onBusy }) {
  const [busy, setBusy] = useState(false)

  async function upload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    onBusy(true)
    try {
      onChange(await uploadImage(file))
    } catch (error) {
      onError(error.message)
    } finally {
      setBusy(false)
      onBusy(false)
    }
  }

  return (
    <div className="admin__photo">
      {value && <img src={value} alt="Предпросмотр" />}
      <label className="admin__upload">
        {busy ? 'Загружаем…' : 'Загрузить фото'}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={busy}
          onChange={upload}
        />
      </label>
      <small>JPG, PNG, WebP, GIF · до 10 МБ</small>
    </div>
  )
}

export default function Admin() {
  // Сессия, редактируемые данные и состояние интерфейса.
  const [user, setUser] = useState(null)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('tests')
  const [selected, setSelected] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(
    new URLSearchParams(window.location.search).get('error') || '',
  )
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploads, setUploads] = useState(0)

  // Закрытые данные загружаются только после проверки сессии.
  useEffect(() => {
    let active = true
    api('/api/auth?action=session')
      .then(async (session) => {
        const data = await api('/api/content?admin=1')
        if (active) {
          setUser(session.user)
          setContent(data)
        }
      })
      .catch((e) => {
        if (active && e.status !== 401) setError(e.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Предупреждение при уходе со страницы с несохранёнными изменениями.
  useEffect(() => {
    if (!dirty && !uploads) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    const intercept = (e) => {
      const link = e.target.closest('a[href]')
      if (
        link &&
        !window.confirm('Есть несохранённые изменения. Покинуть админку?')
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', warn)
    document.addEventListener('click', intercept, true)
    return () => {
      window.removeEventListener('beforeunload', warn)
      document.removeEventListener('click', intercept, true)
    }
  }, [dirty, uploads])

  // Все правки сначала остаются в браузере до нажатия «Сохранить».
  function edit(fn) {
    setContent((previous) => {
      const next = structuredClone(previous)
      fn(next)
      return next
    })
    setDirty(true)
    setMessage('')
  }

  async function save() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const next = await api('/api/content', {
        method: 'PUT',
        body: JSON.stringify(content),
      })
      setContent(next)
      setDirty(false)
      setMessage('Изменения опубликованы на сайте.')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    if (dirty && !window.confirm('Выйти без сохранения изменений?')) return
    try {
      await api('/api/auth?action=logout', { method: 'POST', body: '{}' })
      setDirty(false)
      setUser(null)
      setContent(null)
    } catch (e) {
      setError(e.message)
    }
  }

  const busy = saving || uploads > 0
  const photoProps = {
    onError: setError,
    onBusy: (state) => setUploads((n) => n + (state ? 1 : -1)),
  }
  const test = content?.tests[selected]
  const changeTest = (field, value) =>
    edit((c) => {
      c.tests[selected][field] = value
    })
  const changeQuestion = (index, field, value) =>
    edit((c) => {
      c.tests[selected].questions[index][field] = value
    })

  return (
    <section className="admin page">
      <div className="page__container">
        <PageIntro
          eyebrow="Control room / Команда"
          title="Управление"
          accent="поместьем."
          description="Тесты, состав и фотографии — всё для жизни отряда в одном месте."
          symbol="管"
          meta="Панель администрации"
        />
        {error && (
          <div className="admin__notice admin__notice--error" role="alert">
            {error}
            <button onClick={() => setError('')} aria-label="Закрыть сообщение">
              ×
            </button>
          </div>
        )}
        {message && (
          <p className="admin__notice" role="status">
            {message}
          </p>
        )}
        {loading ? (
          <p role="status">Проверяем доступ…</p>
        ) : !user ? (
          <div className="admin__login card">
            <img src="/images/admin-button.png" alt="" />
            <p className="page__eyebrow">Только для команды</p>
            <h2>Добро пожаловать</h2>
            <p>
              Войдите через Discord. Доступ открыт выбранным пользователям и
              участникам с административной ролью.
            </p>
            <a className="admin__primary" href="/api/auth?action=login">
              Войти через Discord ↗
            </a>
          </div>
        ) : (
          <>
            <div className="admin__toolbar">
              <span>
                {user.name} <small>• Администратор</small>
              </span>
              <button disabled={busy} onClick={logout}>
                Выйти
              </button>
            </div>
            <div
              className="admin__tabs"
              role="tablist"
              aria-label="Разделы админки"
            >
              {[
                ['tests', 'Тесты'],
                ['groups', 'Состав'],
                ['gallery', 'Галерея'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                >
                  {label}
                  <span>{content[id].length}</span>
                </button>
              ))}
            </div>
            <fieldset className="admin__workspace" disabled={busy}>
              {tab === 'tests' && (
                <div className="admin__tests">
                  <aside className="admin__list">
                    <button
                      className="admin__primary"
                      onClick={() => {
                        const index = content.tests.length
                        edit((c) =>
                          c.tests.push({
                            id: uid(),
                            title: 'Новый тест',
                            icon: '蝶',
                            description: '',
                            randomCount: 1,
                            questions: [newQuestion()],
                          }),
                        )
                        setSelected(index)
                      }}
                    >
                      + Создать тест
                    </button>
                    {content.tests.map((t, i) => (
                      <button
                        className={selected === i ? 'is-active' : ''}
                        key={t.id}
                        onClick={() => setSelected(i)}
                      >
                        {t.icon} {t.title}
                        <small>{t.questions.length} вопросов в банке</small>
                      </button>
                    ))}
                  </aside>
                  {test ? (
                    <div className="admin__editor">
                      <div className="admin__section-head">
                        <h2>Редактор теста</h2>
                        <button
                          className="admin__danger"
                          onClick={() => {
                            if (
                              window.confirm(`Удалить тест «${test.title}»?`)
                            ) {
                              edit((c) => c.tests.splice(selected, 1))
                              setSelected(0)
                            }
                          }}
                        >
                          Удалить тест
                        </button>
                      </div>
                      <Field
                        label="Название"
                        value={test.title}
                        maxLength={120}
                        onChange={(v) => changeTest('title', v)}
                      />
                      <Field
                        label="Символ"
                        value={test.icon}
                        maxLength={8}
                        onChange={(v) => changeTest('icon', v)}
                      />
                      <label className="admin__field">
                        Описание
                        <textarea
                          value={test.description}
                          maxLength={1000}
                          onChange={(e) =>
                            changeTest('description', e.target.value)
                          }
                        />
                      </label>
                      <Field
                        label="Случайных вопросов в одной попытке"
                        type="number"
                        min="1"
                        max={test.questions.length}
                        value={test.randomCount}
                        onChange={(v) => changeTest('randomCount', Number(v))}
                      />
                      {test.questions.map((q, qi) => (
                        <article className="admin__question" key={qi}>
                          <div className="admin__section-head">
                            <h3>Вопрос {String(qi + 1).padStart(2, '0')}</h3>
                            <button
                              disabled={test.questions.length <= 1}
                              onClick={() =>
                                edit((c) => {
                                  const t = c.tests[selected]
                                  t.questions.splice(qi, 1)
                                  t.randomCount = Math.min(
                                    t.randomCount,
                                    t.questions.length,
                                  )
                                })
                              }
                            >
                              Удалить
                            </button>
                          </div>
                          <label className="admin__field">
                            Текст вопроса
                            <textarea
                              value={q.question}
                              maxLength={1000}
                              onChange={(e) =>
                                changeQuestion(qi, 'question', e.target.value)
                              }
                            />
                          </label>
                          <p className="admin__hint">
                            Отметьте один правильный ответ
                          </p>
                          {q.options.map((option, oi) => (
                            <div className="admin__option" key={oi}>
                              <input
                                type="radio"
                                name={`correct-${qi}`}
                                aria-label={`Правильный ответ ${oi + 1} на вопрос ${qi + 1}`}
                                checked={q.answer === oi}
                                onChange={() =>
                                  changeQuestion(qi, 'answer', oi)
                                }
                              />
                              <input
                                aria-label={`Вариант ${oi + 1}`}
                                value={option}
                                maxLength={600}
                                onChange={(e) =>
                                  edit((c) => {
                                    c.tests[selected].questions[qi].options[
                                      oi
                                    ] = e.target.value
                                  })
                                }
                              />
                              <button
                                aria-label={`Удалить вариант ${oi + 1}`}
                                disabled={q.options.length <= 2}
                                onClick={() =>
                                  edit((c) => {
                                    const question =
                                      c.tests[selected].questions[qi]
                                    question.options.splice(oi, 1)
                                    if (question.answer === oi)
                                      question.answer = 0
                                    else if (question.answer > oi)
                                      question.answer--
                                  })
                                }
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            disabled={q.options.length >= 8}
                            onClick={() =>
                              changeQuestion(qi, 'options', [...q.options, ''])
                            }
                          >
                            + Вариант ответа
                          </button>
                        </article>
                      ))}
                      <button
                        disabled={test.questions.length >= 100}
                        onClick={() =>
                          changeTest('questions', [
                            ...test.questions,
                            newQuestion(),
                          ])
                        }
                      >
                        + Добавить вопрос
                      </button>
                    </div>
                  ) : (
                    <p>Создайте первый тест.</p>
                  )}
                </div>
              )}
              {tab === 'groups' && (
                <div className="admin__editor">
                  <p className="admin__hint">
                    Обновляйте имена и фотографии. Для вакансии укажите
                    «Свободный слот».
                  </p>
                  {content.groups.map((group, gi) => (
                    <article className="admin__question" key={gi}>
                      <div className="admin__section-head">
                        <h2>
                          {group.icon} {group.rank}
                        </h2>
                        <button
                          className="admin__danger"
                          onClick={() => {
                            if (
                              window.confirm('Удалить группу и её участников?')
                            )
                              edit((c) => c.groups.splice(gi, 1))
                          }}
                        >
                          Удалить группу
                        </button>
                      </div>
                      <div className="admin__row">
                        <Field
                          label="Название ранга"
                          value={group.rank}
                          maxLength={80}
                          onChange={(v) =>
                            edit((c) => {
                              c.groups[gi].rank = v
                            })
                          }
                        />
                        <Field
                          label="Символ"
                          value={group.icon}
                          maxLength={8}
                          onChange={(v) =>
                            edit((c) => {
                              c.groups[gi].icon = v
                            })
                          }
                        />
                      </div>
                      {group.members.map((member, mi) => (
                        <div className="admin__member" key={mi}>
                          <Photo
                            value={member.avatar}
                            onChange={(url) =>
                              edit((c) => {
                                c.groups[gi].members[mi].avatar = url
                              })
                            }
                            {...photoProps}
                          />
                          <div>
                            <Field
                              label="Никнейм"
                              value={member.name}
                              maxLength={100}
                              onChange={(v) =>
                                edit((c) => {
                                  c.groups[gi].members[mi].name = v
                                })
                              }
                            />
                            <Field
                              label="Адрес фото Cloudinary / Discord"
                              value={member.avatar}
                              onChange={(v) =>
                                edit((c) => {
                                  c.groups[gi].members[mi].avatar = v
                                })
                              }
                            />
                          </div>
                          <button
                            onClick={() =>
                              edit((c) => c.groups[gi].members.splice(mi, 1))
                            }
                          >
                            Удалить участника
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          edit((c) =>
                            c.groups[gi].members.push({
                              name: 'Свободный слот',
                              avatar: '',
                            }),
                          )
                        }
                      >
                        + Участник
                      </button>
                    </article>
                  ))}
                  <button
                    onClick={() =>
                      edit((c) =>
                        c.groups.push({
                          rank: 'Новая группа',
                          icon: '蝶',
                          members: [],
                        }),
                      )
                    }
                  >
                    + Добавить группу
                  </button>
                </div>
              )}
              {tab === 'gallery' && (
                <div className="admin__editor">
                  <h2>Моменты поместья</h2>
                  <p className="admin__hint">
                    Новые фотографии хранятся в Cloudinary. Семь исходных
                    фотографий сохраняются в галерее сайта.
                  </p>
                  <Photo
                    value=""
                    onChange={(url) =>
                      edit((c) =>
                        c.gallery.push({ id: uid(), url, caption: '' }),
                      )
                    }
                    {...photoProps}
                  />
                  <div className="admin__gallery">
                    {content.gallery.map((photo, i) => (
                      <article className="admin__question" key={photo.id}>
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Фото галереи'}
                        />
                        <Field
                          label="Подпись"
                          value={photo.caption}
                          maxLength={200}
                          onChange={(v) =>
                            edit((c) => {
                              c.gallery[i].caption = v
                            })
                          }
                        />
                        <button
                          onClick={() => {
                            if (window.confirm('Убрать фотографию с сайта?'))
                              edit((c) => c.gallery.splice(i, 1))
                          }}
                        >
                          Убрать с сайта
                        </button>
                      </article>
                    ))}
                  </div>
                  {!content.gallery.length && (
                    <p>
                      Загрузите первую фотографию — она появится после
                      сохранения.
                    </p>
                  )}
                </div>
              )}
            </fieldset>
            <div className="admin__save">
              <span>
                {uploads
                  ? 'Загружаем фотографии…'
                  : dirty
                    ? 'Есть несохранённые изменения'
                    : 'Все изменения сохранены'}
              </span>
              <button
                className="admin__primary"
                disabled={!dirty || busy}
                onClick={save}
              >
                {saving ? 'Сохраняем…' : 'Сохранить изменения'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
