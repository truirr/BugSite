import steps from './promotion-steps.json'

// Требования перенесены из «Система повышения Насекомого.docx».
// Каждый элемент tasks — один критерий, даже если внутри несколько действий.
// В документе повторяются переходы: это три отдельных блока, не дубликаты.
export const promotionTracks = [
  { id: 'main', name: 'Истребитель', steps: steps.slice(0, 10) },
  { id: 'instructors', name: 'Инструктор', steps: steps.slice(10, 17) },
  { id: 'successors', name: 'Цугуко', steps: steps.slice(17) },
]

export const rankSymbols = [
  '癸',
  '壬',
  '辛',
  '庚',
  '己',
  '戊',
  '丁',
  '丙',
  '乙',
  '甲',
]
export const rankNames = [
  'Мидзуното',
  'Мидзуноэ',
  'Каното',
  'Каноэ',
  'Тсучиното',
  'Тсучиное',
  'Хиното',
  'Хиноэ',
  'Киното',
  'Киноэ',
]

// Глава VIII устава. За одно повышение применяется только одна рекомендация.
export const recommendations = [
  {
    degree: '1',
    title: 'I степень',
    benefit: 'Один ранг',
    issuer: 'Столпы и Семья Убуяшики',
    description: 'Позволяет повыситься на один ранг.',
  },
  {
    degree: '2',
    title: 'II степень',
    benefit: '50% заданий',
    issuer: 'Цугуко и выше',
    description: 'Позволяет пропустить половину заданий на повышение.',
  },
  {
    degree: '3',
    title: 'III степень',
    benefit: 'Один критерий',
    issuer: 'Инструктор и выше',
    description: 'Позволяет пропустить один критерий повышения.',
  },
]
