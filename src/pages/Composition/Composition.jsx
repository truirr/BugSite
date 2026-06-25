import './Composition.css'

const groups = [
  {
    rank: 'Столп',
    icon: '柱',
    members: [
      {
        name: '[🦝] Шинобу Кочо | Фанатка Иры',
        avatar: 'https://cdn.discordapp.com/guilds/986216078017462292/users/662723448082137098/avatars/75de770ed6f139356b526c1d4cf626b5.png?size=1024',
      },
    ],
  },
  {
    rank: 'Цугуко',
    icon: '継',
    members: [
      {
        name: 'Hiroto Takayama',
        avatar: 'https://cdn.discordapp.com/avatars/771841169259757619/416d747e9a2fac2d9e5ae2492d954703.png?size=1024',
      },
      {
        name: 'Риса Наосохима',
        avatar: 'https://cdn.discordapp.com/avatars/814508220675653642/31908d0de7c0bbf06f2fbfbfcb310da1.png?size=1024',
      },
    ],
  },
  {
    rank: 'Канао Цуюри',
    icon: '花',
    members: [
      {
        name: 'Kanao | Musasi Hagivara',
        avatar: 'https://cdn.discordapp.com/guilds/986216078017462292/users/769528396563611648/avatars/82cad9a851430e09ea6423dc6504cda2.png?size=1024',
      },
    ],
  },
  {
    rank: 'Инструктор',
    icon: '教',
    members: [
      {
        name: 'Hiroshi Akarui',
        avatar: 'https://cdn.discordapp.com/avatars/557522859849940992/c6e34afe29072e9079a410f26923e189.png?size=1024',
      },
      {
        name: 'Лейл Мэй',
        avatar: 'https://cdn.discordapp.com/avatars/543714854402261012/76d252c8a9311c062680a735ed8a1e3a.png?size=1024',
      },
      {
        name: 'Ясу Таида',
        avatar: 'https://cdn.discordapp.com/guilds/986216078017462292/users/979416779182977115/avatars/26cd272aed958c1ed67b01a7e0b4ae74.png?size=1024',
      },
    ],
  },
  {
    rank: 'Истребитель',
    icon: '滅',
    members: [
      {
        name: 'Асуми Хидака',
        avatar: 'https://cdn.discordapp.com/avatars/1511724724823265371/483c641c5f1f6fda2ae0572c6dfdae5d.png?size=1024',
      },
      {
        name: 'Свободный слот',
        avatar: '',
      },
      {
        name: 'Дзётаро Арасака',
        avatar: 'https://cdn.discordapp.com/avatars/595954098248089601/b24c15fd54f190bcb52ca36fb7c31620.png?size=1024',
      },
      {
        name: 'Оки Мирай',
        avatar: 'https://cdn.discordapp.com/avatars/444880330545954819/f3cf12ee98d0d64a3833b8949edf8bb0.png?size=1024',
      },
      {
        name: 'Kaito Fujimoto',
        avatar: 'https://cdn.discordapp.com/avatars/1436828265284112577/4d3bf59673736b5a8868f1dcbb524beb.png?size=1024',
      },
      {
        name: 'Свободный слот',
        avatar: '',
      },
      {
        name: 'Свободный слот',
        avatar: '',
      },
      {
        name: 'Свободный слот',
        avatar: '',
      },
      {
        name: 'Аманэ / Hinami Matsuda',
        avatar: 'https://cdn.discordapp.com/avatars/1396831997158096977/a4792aec92ebe001083e3ba116c9022f.png?size=1024',
      },
      {
        name: 'Theotto Rikko',
        avatar: 'https://cdn.discordapp.com/avatars/282527382580232192/199060b142ee0dd746818b50b0c9875c.png?size=1024',
      },
    ],
  },
  {
    rank: 'Ученик',
    icon: '学',
    members: [
      {
        name: 'Hikaru Kusakabe',
        avatar: 'https://cdn.discordapp.com/avatars/351978445707673601/9d638a20d36045d8b9f15a8b8dfdd8e4.png?size=1024',
      },
      {
        name: 'Свободный слот',
        avatar: '',
      },
      {
        name: 'Свободный слот',
        avatar: '',
      },
    ],
  },
  {
    rank: 'Чистильщик',
    icon: '清',
    members: [
      {
        name: 'Кэтсэро Накамура',
        avatar: 'https://cdn.discordapp.com/avatars/915168550547759126/a_6f860b2cb7616109806087a11c85fa4a.gif?size=1024',
      },
      {
        name: 'Тиша Ито',
        avatar: 'https://cdn.discordapp.com/avatars/414828581626052608/5a704d34fe20aedb6673a5765c072d5e.png?size=1024',
      },
    ],
  },
  {
    rank: 'Донат слот',
    icon: '蝶',
    members: [
      {
        name: 'Miko Fujiwara',
        avatar: 'https://cdn.discordapp.com/guilds/986216078017462292/users/922568676908077116/avatars/a_cd4e85d76000718f2bcb42e3589bd2b7.gif?size=1024',
      },
    ],
  },
]

function Composition() {
  return (
    <section className="composition page">
      <div className="page__container">
        <p className="page__eyebrow">Butterfly Squad</p>
        <h1 className="page__title">Состав дыхания насекомого</h1>

        <div className="composition__grid">
          {groups.map((group, index) => (
            <article
              className="composition__card card"
              key={group.rank}
              style={{ '--delay': `${index * 0.07}s` }}
            >
              <div className="composition__kanji">{group.icon}</div>

              <h2>{group.rank}</h2>

              <ul>
                {group.members.map((member, memberIndex) => (
                  <li
                    className={
                      member.name === 'Свободный слот' ? 'composition__empty' : ''
                    }
                    key={`${group.rank}-${member.name}-${memberIndex}`}
                  >
                    <span className="composition__member">
                      {member.avatar && (
                        <img
                          className="composition__avatar"
                          src={member.avatar}
                          alt={member.name}
                        />
                      )}

                      <span className="composition__member-name">
                        {member.name}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Composition