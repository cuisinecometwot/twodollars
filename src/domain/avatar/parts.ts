/** Scene is a 32×32 pixel grid. Sprites are placed at (x, y) in that grid. */
export const GRID = 32;

export interface Sprite {
  x: number;
  y: number;
  rows: readonly string[];
}

export interface Part {
  id: string;
  label: string;
  sprites: readonly Sprite[];
  /** Overrides palette characters for this part only (e.g. a gold bowl). */
  colors?: Readonly<Record<string, string>>;
}

export type Slot = 'hair' | 'shirt' | 'bowl' | 'mat' | 'pet' | 'instrument';

const alt = (a: string, b: string, n: number) =>
  Array.from({ length: n }, (_, i) => (i % 2 ? b : a)).join('');
const fill = (c: string, n: number) => c.repeat(n);

/** Always drawn: crossed legs, arms, torso skin, head. Shirt/hair go on top. */
export const BODY: readonly Sprite[] = [
  {
    x: 7,
    y: 22,
    rows: [
      '..kkkkkkkkkkkkkk..',
      '.kppppppppppppppk.',
      'kppppppPPPPppppppk',
      'kppppksssssskppppk',
      '.kkkkkkkkkkkkkkkk.',
    ],
  },
  {
    x: 9,
    y: 14,
    rows: [
      '....kkkkkk....',
      '..kkkssssskk..',
      '.kssssssssssk.',
      'kssssssssssssk',
      'ksskssssssk' + 'ssk',
      'ksskssssssk' + 'ssk',
      'ksskssssssk' + 'ssk',
      'ksskSSSSSSkssk',
    ],
  },
];

export const HEAD: Sprite = {
  x: 11,
  y: 5,
  rows: [
    '..kkkkkk..',
    '.kssssssk.',
    'kssssssssk',
    'kssssssssk',
    'kssksskssk',
    'kvssssssvk',
    'ksssmmsssk',
    '.kssssssk.',
    '..kkkkkk..',
    '...kSSk...',
  ],
};

/** Eye pixels, used by renderers for blinking. */
export const EYES: readonly [number, number][] = [
  [14, 9],
  [17, 9],
];

export const PARTS: Readonly<Record<Slot, readonly Part[]>> = {
  hair: [
    {
      id: 'messy',
      label: 'Messy',
      sprites: [
        {
          x: 10,
          y: 3,
          rows: [
            '..kk.kkk.k..',
            '.khhkhhhkhk.',
            '.khhhhhhhhk.',
            'khhhhhhhhhhk',
            'khhhhHHhhhhk',
            'kh........hk',
          ],
        },
      ],
    },
    {
      id: 'spiky',
      label: 'Spiky',
      sprites: [
        {
          x: 10,
          y: 2,
          rows: [
            '.k..k..k..k.',
            'khkkhkkhkkhk',
            'khhhhhhhhhhk',
            'khhhhhhhhhhk',
            'khhhhhhhhhhk',
            'khhHh..hHhhk',
            'kh........hk',
          ],
        },
      ],
    },
    {
      id: 'long',
      label: 'Long',
      sprites: [
        {
          x: 10,
          y: 3,
          rows: [
            '...kkkkkk...',
            '..khhhhhhk..',
            '.khhhhhhhhk.',
            'khhhhhhhhhhk',
            'khhhhHHhhhhk',
            'khh......hhk',
            'kh........hk',
            'kh........hk',
            'kh........hk',
            'khh......hhk',
            'khhk....khhk',
            'kHhk....khHk',
            '.kk......kk.',
          ],
        },
      ],
    },
    {
      id: 'bun',
      label: 'Bun',
      sprites: [
        {
          x: 10,
          y: 0,
          rows: [
            '....kkkk....',
            '...khhhhk...',
            '...khHHhk...',
            '..kkkkkkkk..',
            '.khhhhhhhhk.',
            'khhhhhhhhhhk',
            'khhHhhhhHhhk',
            'kh........hk',
          ],
        },
      ],
    },
    {
      id: 'cap',
      label: 'Cap',
      sprites: [
        {
          x: 10,
          y: 3,
          rows: [
            '...kkkkkk.....',
            '..khhhhhhk....',
            '.khhhhwhhhk...',
            'khhhhhhhhhhkkk',
            'kHHHHHHHHHHHHk',
            '.kkkkkkkkkkkk.',
          ],
        },
      ],
    },
    { id: 'bald', label: 'Bald', sprites: [{ x: 13, y: 6, rows: ['ww', 'w.'] }] },
  ],

  shirt: [
    {
      id: 'tee',
      label: 'T-shirt',
      sprites: [
        {
          x: 9,
          y: 14,
          rows: [
            '....kkkkkk....',
            '..kkcccccckk..',
            '.kcccccccccck.',
            'kcccccccccccck',
            'kcCkcccccckCck',
            'kkkkcccccckkkk',
            '....cccccc....',
            '....CCCCCC....',
          ],
        },
      ],
    },
    {
      id: 'stripe',
      label: 'Stripe',
      sprites: [
        {
          x: 9,
          y: 14,
          rows: [
            '....kkkkkk....',
            '..kkcccccckk..',
            '.kddddddddddk.',
            'kcccccccccccck',
            'kdCkddddddkCdk',
            'kkkkcccccckkkk',
            '....dddddd....',
            '....CCCCCC....',
          ],
        },
      ],
    },
    {
      id: 'hoodie',
      label: 'Hoodie',
      sprites: [
        {
          x: 9,
          y: 13,
          rows: [
            '...kCCCCCCk...',
            '...kCkkkkCk...',
            '..kkcccccckk..',
            '.kccccwwcccck.',
            'kcccccwwccccck',
            'kcCkcccccckCck',
            'kcCkcccccckCck',
            'kcCkcCCCCckCck',
            'ksskCCCCCCkssk',
          ],
        },
      ],
    },
    {
      id: 'tank',
      label: 'Tank top',
      sprites: [
        {
          x: 9,
          y: 14,
          rows: [
            '....kkkkkk....',
            '...kc....ck...',
            '...kcccccck...',
            '...kcccccck...',
            '...kcccccck...',
            '...kcccccck...',
            '....cccccc....',
            '....CCCCCC....',
          ],
        },
      ],
    },
    {
      id: 'suit',
      label: 'Laid-off suit',
      sprites: [
        {
          x: 9,
          y: 14,
          rows: [
            '....kkkkkk....',
            '..kkcwwwwckk..',
            '.kcccwrrwccck.',
            'kccccwrrwcccck',
            'kcCkcwrrwckCck',
            'kcCkccrrcckCck',
            'kcCkcccccckCck',
            'ksskCCCCCCkssk',
          ],
        },
      ],
    },
  ],

  bowl: [
    {
      id: 'clay',
      label: 'Clay bowl',
      sprites: [
        { x: 22, y: 24, rows: ['kkkkkkkk', 'kBByBBBk', 'kbbbbbbk', '.kbbbbk.', '..kkkk..'] },
      ],
    },
    {
      id: 'gold',
      label: 'Gold bowl',
      colors: { b: '#f5c542', B: '#c9952b' },
      sprites: [
        { x: 22, y: 24, rows: ['kkkkkkkk', 'kBBBBBBk', 'kbbwbbbk', '.kbbbbk.', '..kkkk..'] },
      ],
    },
    {
      id: 'can',
      label: 'Tin can',
      sprites: [
        {
          x: 23,
          y: 23,
          rows: ['kkkkkk', 'kGGGGk', 'kggggk', 'krrrrk', 'krwwrk', 'kggggk', '.kkkk.'],
        },
      ],
    },
    {
      id: 'nonla',
      label: 'Nón lá',
      sprites: [
        {
          x: 21,
          y: 24,
          rows: [
            'kkkkkkkkkk',
            'kEEyEEEEEk',
            'keeeeeeeek',
            '.keEeeEek.',
            '..keeeek..',
            '...kEEk...',
            '....kk....',
          ],
        },
      ],
    },
    {
      id: 'noodle',
      label: 'Noodle cup',
      sprites: [
        {
          x: 23,
          y: 22,
          rows: [
            '.kkkkk.',
            'kyyyyyk',
            'kkkkkkk',
            'kwwwwwk',
            'kwrrrwk',
            'kwrwrwk',
            '.kwwwk.',
            '.kkkkk.',
          ],
        },
      ],
    },
  ],

  mat: [
    {
      id: 'straw',
      label: 'Chiếu',
      sprites: [
        {
          x: 1,
          y: 27,
          rows: [
            '..' + fill('k', 26) + '..',
            '.k' + alt('e', 'E', 26) + 'k.',
            'k' + alt('E', 'e', 28) + 'k',
            fill('k', 30),
          ],
        },
      ],
    },
    {
      id: 'cardboard',
      label: 'Cardboard',
      colors: { b: '#c49a63', B: '#9c7646' },
      sprites: [
        {
          x: 1,
          y: 27,
          rows: [
            '..' + fill('k', 26) + '..',
            '.k' + fill('b', 26) + 'k.',
            'k' + fill('b', 4) + 'BBB' + fill('b', 14) + 'BBBB' + fill('b', 3) + 'k',
            fill('k', 30),
          ],
        },
      ],
    },
    {
      id: 'newspaper',
      label: 'Newspaper',
      sprites: [
        {
          x: 1,
          y: 27,
          rows: [
            '..' + fill('k', 26) + '..',
            '.k' + 'w' + fill('g', 8) + fill('w', 5) + fill('g', 9) + fill('w', 3) + 'k.',
            'k' + fill('w', 3) + fill('g', 6) + fill('w', 6) + fill('g', 10) + fill('w', 3) + 'k',
            fill('k', 30),
          ],
        },
      ],
    },
    {
      id: 'blanket',
      label: 'Red blanket',
      sprites: [
        {
          x: 1,
          y: 27,
          rows: [
            '..' + fill('k', 26) + '..',
            '.k' + alt('rr', 'RR', 13) + 'k.',
            'k' + alt('RR', 'rr', 14) + 'k',
            fill('k', 30),
          ],
        },
      ],
    },
    { id: 'none', label: 'Bare street', sprites: [] },
  ],

  pet: [
    { id: 'none', label: 'No pet', sprites: [] },
    {
      id: 'dog',
      label: 'Dog',
      sprites: [
        {
          x: 1,
          y: 20,
          rows: [
            'kk....kk',
            'kTkkkkTk',
            'kTttttTk',
            'ktkttktk',
            'kttttttk',
            'kttkkttk',
            '.kttttk.',
            '.ktttttk',
            'kttttttk',
            'kTkttkTk',
            '.kk..kk.',
          ],
        },
      ],
    },
    {
      id: 'cat',
      label: 'Cat',
      sprites: [
        {
          x: 1,
          y: 21,
          rows: [
            'k.....k.',
            'kfk.kfk.',
            'kffkffk.',
            'kfffffk.',
            'kkfffkk.',
            'kffvffk.',
            '.kfffk..',
            '.kfffkkk',
            'kffffkFk',
            'kFkkFkk.',
          ],
        },
      ],
    },
    {
      id: 'chicken',
      label: 'Chicken',
      sprites: [
        {
          x: 2,
          y: 21,
          rows: [
            '..rr....',
            '.kwwk...',
            'okkwwk..',
            '.kwwwkk.',
            '.kwwwwwk',
            '.kwgwwwk',
            '..kwwwk.',
            '...ok...',
            '...oo...',
          ],
        },
      ],
    },
  ],

  instrument: [
    { id: 'none', label: 'Empty hands', sprites: [] },
    {
      id: 'laptop',
      label: 'Laptop (dev)',
      sprites: [
        {
          x: 11,
          y: 18,
          rows: [
            'kkkkkkkkkk',
            'kggggggggk',
            'kggggggggk',
            'kgggwwgggk',
            'kggggggggk',
            'kkkkkkkkkk',
            'kGGGGGGGGk',
            'kkkkkkkkkk',
          ],
        },
      ],
    },
    {
      id: 'guitar',
      label: 'Guitar',
      sprites: [
        {
          x: 5,
          y: 18,
          rows: [
            '..............kkk.',
            '.............koook',
            'kk..........kooOok',
            'kBkkkkkkkkkkoookok',
            'kwBwBwBwBwBwoOkOok',
            'kBkkkkkkkkkkoookok',
            'kk..........kooOok',
            '.............kooOk',
            '..............kkk.',
          ],
        },
      ],
    },
    {
      id: 'drum',
      label: 'Drum',
      sprites: [
        {
          x: 11,
          y: 19,
          rows: [
            '..kkkkkk..',
            '.kwwwwwwk.',
            'kwwwwwwwwk',
            'kkwwwwwwkk',
            'krkkkkkkrk',
            'krrwrrwrrk',
            'kRrrwwrrRk',
            '.kRRRRRRk.',
            '..kkkkkk..',
          ],
        },
      ],
    },
    {
      id: 'flute',
      label: 'Sáo trúc',
      sprites: [
        {
          x: 16,
          y: 11,
          rows: [
            'ke.........',
            '.keE.......',
            '...keE.....',
            '.....keE...',
            '.......keE.',
            '.........kk',
          ],
        },
      ],
    },
  ],
};

export const SLOTS: readonly Slot[] = ['hair', 'shirt', 'bowl', 'mat', 'pet', 'instrument'];

export function findPart(slot: Slot, id: string): Part | undefined {
  return PARTS[slot].find((p) => p.id === id);
}
