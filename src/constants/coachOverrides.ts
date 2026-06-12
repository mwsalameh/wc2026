// Verified correct head coaches for WC 2026 (as of June 2026).
// Keyed by the English team name as returned by api-football.
// Arab teams are excluded — their coaches are managed separately via JSON.
export const COACH_NAME_OVERRIDES: Record<string, string> = {

  // ── CONMEBOL ─────────────────────────────────────────────────────────────────
  'Argentina':  'Lionel Scaloni',
  'Brazil':     'Carlo Ancelotti',
  'Colombia':   'Néstor Lorenzo',
  'Ecuador':    'Sebastián Beccacece',
  'Paraguay':   'Gustavo Alfaro',
  'Uruguay':    'Marcelo Bielsa',

  // ── CONCACAF ─────────────────────────────────────────────────────────────────
  'Canada':           'Jesse Marsch',
  'Curacao':          'Dick Advocaat',
  'Curaçao':          'Dick Advocaat',
  'Haiti':            'Sébastien Migné',
  'Mexico':           'Javier Aguirre',
  'Panama':           'Thomas Christiansen',
  'United States':    'Mauricio Pochettino',

  // ── UEFA ─────────────────────────────────────────────────────────────────────
  'Austria':                  'Ralf Rangnick',
  'Belgium':                  'Rudi Garcia',
  'Bosnia and Herzegovina':   'Sergej Barbarez',
  'Bosnia & Herzegovina':     'Sergej Barbarez',
  'Croatia':                  'Zlatko Dalić',
  'Czech Republic':           'Miroslav Koubek',
  'Czechia':                  'Miroslav Koubek',
  'England':                  'Thomas Tuchel',
  'France':                   'Didier Deschamps',
  'Germany':                  'Julian Nagelsmann',
  'Netherlands':               'Ronald Koeman',
  'Norway':                   'Ståle Solbakken',
  'Portugal':                 'Roberto Martínez',
  'Scotland':                 'Steve Clarke',
  'Spain':                    'Luis de la Fuente',
  'Sweden':                   'Graham Potter',
  'Switzerland':              'Murat Yakin',
  'Turkey':                   'Vincenzo Montella',
  'Türkiye':                  'Vincenzo Montella',

  // ── CAF (non-Arab) ────────────────────────────────────────────────────────────
  'Cape Verde':               'Bubista',
  'Cabo Verde':               'Bubista',
  'DR Congo':                 'Sébastien Desabre',
  'Congo DR':                 'Sébastien Desabre',
  'Ghana':                    'Carlos Queiroz',
  "Ivory Coast":              'Emerse Faé',
  "Côte d'Ivoire":            'Emerse Faé',
  "Cote d'Ivoire":            'Emerse Faé',
  'Senegal':                  'Pape Thiaw',
  'South Africa':             'Hugo Broos',

  // ── Arab teams — coach hardcoded from verified JSON ──────────────────────────
  'Iraq':             'Graham Arnold',
  'Saudi Arabia':     'Georgios Donis',
  'Morocco':          'Mohamed Ouahbi',

  // ── AFC (non-Arab) ────────────────────────────────────────────────────────────
  'Australia':        'Tony Popovic',
  'Iran':             'Amir Ghalenoei',
  'Japan':            'Hajime Moriyasu',
  'South Korea':      'Hong Myung-bo',
  'Korea Republic':   'Hong Myung-bo',
  'Uzbekistan':       'Fabio Cannavaro',

  // ── OFC ──────────────────────────────────────────────────────────────────────
  'New Zealand':  'Darren Bazeley',
};
