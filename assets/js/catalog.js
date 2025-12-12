/* catalog.js — products, types, sizes, materials, pricing (editable) */

const PRICING = {
  products: {
    'sliding-doors': { base: 1500, per_sqm: 950 },
    'hinged-doors': { base: 1200, per_sqm: 900 },
    windows: { base: 600, per_sqm: 700 },
    shopfronts: { base: 2500, per_sqm: 1600 },
    'folding-doors': { base: 2000, per_sqm: 1200 },
    'pivot-doors': { base: 1800, per_sqm: 1100 },
    'security-doors': { base: 1400, per_sqm: 1000 },
    'wood-look': { base: 1700, per_sqm: 1100 }
  },
  materials: { standard: 1.0, charcoal: 1.05, bronze: 1.06, white: 1.03, woodLook: 1.12 },
  glass: { clear: 1.0, grey: 1.08, bronze: 1.08, obscure: 1.06, laminated: 1.18, toughened: 1.12 },
  handles: { standard: 0, stainless: 120, flush: 150, premium: 280 },
  locks: { standard: 0, multipoint: 450, security3: 650 },
  variancePct: 0.12
};

const CATALOG = {
  'sliding-doors': {
    label: 'Sliding Doors',
    types: [
      { id:'sl2', label:'2-panel Sliding', img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200' },
      { id:'sl3', label:'3-panel Sliding', img:'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200' },
      { id:'mslider', label:'Multi-slide', img:'https://images.unsplash.com/photo-1542317854-1c6b6e53a6f0?q=80&w=1200' }
    ],
    sizes: [
      {id:'s1', w:1500,h:2100,label:'1500 × 2100'},
      {id:'s2', w:1800,h:2100,label:'1800 × 2100'},
      {id:'s3', w:2400,h:2100,label:'2400 × 2100'},
      {id:'custom', custom:true, label:'Custom size'}
    ]
  },
  'hinged-doors': {
    label:'Hinged / Swing Doors',
    types:[
      {id:'hinged',label:'Single Hinged',img:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200'},
      {id:'double',label:'Double Door',img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200'}
    ],
    sizes:[
      {id:'h1',w:900,h:2100,label:'900 × 2100'},
      {id:'h2',w:1200,h:2100,label:'1200 × 2100'},
      {id:'custom',custom:true,label:'Custom size'}
    ]
  },
  windows: {
    label:'Windows',
    types:[
      {id:'win-slide',label:'Sliding Window',img:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200'},
      {id:'win-casement',label:'Casement',img:'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200'}
    ],
    sizes:[
      {id:'w1',w:600,h:600,label:'600 × 600'},
      {id:'w2',w:900,h:600,label:'900 × 600'},
      {id:'custom',custom:true,label:'Custom size'}
    ]
  },
  shopfronts: {
    label:'Shopfronts',
    types:[{id:'sf1',label:'Glazed Shopfront',img:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200'}],
    sizes:[{id:'custom',custom:true,label:'Custom (specify mm)'}]
  },
  'folding-doors': {
    label:'Folding / Stack Doors',
    types:[{id:'fold1',label:'Bi-fold 3-panel',img:'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200'}],
    sizes:[{id:'custom',custom:true,label:'Custom (specify mm)'}]
  },
  'pivot-doors': {
    label:'Pivot Doors',
    types:[{id:'pivot1',label:'Pivot Door',img:'https://images.unsplash.com/photo-1542317854-1c6b6e53a6f0?q=80&w=1200'}],
    sizes:[{id:'custom',custom:true,label:'Custom (specify mm)'}]
  },
  'security-doors': {
    label:'Security Doors',
    types:[{id:'sec1',label:'Security Door',img:'https://images.unsplash.com/photo-1531991221914-9c2ff3c8e7fe?q=80&w=1200'}],
    sizes:[{id:'custom',custom:true,label:'Custom (specify mm)'}]
  },
  'wood-look': {
    label:'Wood‑Look Aluminium',
    types:[
      {id:'wl1',label:'Wood-look Sliding',img:'https://images.unsplash.com/photo-1505682634904-d7c4c7f0b0f4?q=80&w=1200'},
      {id:'wl2',label:'Wood-look Hinged',img:'https://images.unsplash.com/photo-1482989790260-19b2e8f2e2a4?q=80&w=1200'}
    ],
    sizes:[{id:'custom',custom:true,label:'Custom (specify mm)'}]
  }
};

const FRAME_MATERIALS = [
  {id:'standard',label:'Standard Aluminium',img:'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=600'},
  {id:'charcoal',label:'Charcoal',img:'https://images.unsplash.com/photo-1505691723518-36a6b4f3daae?q=80&w=600'},
  {id:'bronze',label:'Bronze',img:'https://images.unsplash.com/photo-1517245386807-bb43f82c31f6?q=80&w=600'},
  {id:'white',label:'White',img:'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=600'},
  {id:'woodLook',label:'Wood‑Look (Oak)',img:'https://images.unsplash.com/photo-1505682634904-d7c4c7f0b0f4?q=80&w=600'}
];

const GLASS_TYPES = [
  {id:'clear',label:'Clear',img:'https://via.placeholder.com/600x400?text=Clear+Glass'},
  {id:'grey',label:'Grey Tint',img:'https://via.placeholder.com/600x400/9aa0a6?text=Grey+Tint'},
  {id:'bronze',label:'Bronze Tint',img:'https://via.placeholder.com/600x400/8b6b4f?text=Bronze+Tint'},
  {id:'obscure',label:'Obscure',img:'https://via.placeholder.com/600x400?text=Obscure'},
  {id:'laminated',label:'Laminated Safety',img:'https://via.placeholder.com/600x400?text=Laminated'},
  {id:'toughened',label:'Toughened',img:'https://via.placeholder.com/600x400?text=Toughened'}
];

const HANDLES = [
  {id:'standard',label:'Standard Handle',img:'https://via.placeholder.com/300x180?text=Standard+Handle',price:PRICING.handles.standard},
  {id:'stainless',label:'Stainless Handle',img:'https://via.placeholder.com/300x180?text=Stainless',price:PRICING.handles.stainless},
  {id:'flush',label:'Flush Handle',img:'https://via.placeholder.com/300x180?text=Flush',price:PRICING.handles.flush},
  {id:'premium',label:'Premium Handle',img:'https://via.placeholder.com/300x180?text=Premium',price:PRICING.handles.premium}
];

const LOCKS = [
  {id:'standard',label:'Standard Lock',price:PRICING.locks.standard},
  {id:'multipoint',label:'Multi-point Lock',price:PRICING.locks.multipoint},
  {id:'security3',label:'3-point Security Lock',price:PRICING.locks.security3}
];