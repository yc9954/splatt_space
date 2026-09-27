/**
 * Publicly hosted Luma Gaussian-splat captures used for the Travel map,
 * the "Pick a Luma scene" gallery and the demo-mode feed.
 * Every capture URL is a real, publicly viewable Luma capture.
 */

export interface SampleScene {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  captureUrl: string;
  thumbnail: string;
  tags: string[];
}

const LUMA = {
  arosa: 'https://lumalabs.ai/capture/4da7cf32-865a-4515-8cb9-9dfc574c90c2',
  globe: 'https://lumalabs.ai/capture/ca9ea966-ca24-4ec1-ab0f-af665cb546ff',
  dandelion: 'https://lumalabs.ai/capture/d80d4876-cf71-4b8a-8b5b-49ffac44cd4a',
  sculpture: 'https://lumalabs.ai/capture/1b5f3e33-3900-4398-8795-b585ae13fd2d',
  nebula: 'https://lumalabs.ai/capture/b86b7928-f130-40a5-8cac-8095f30eed54',
  a: 'https://lumalabs.ai/capture/e5b6d44c-43e1-4d1e-b2d5-eca9d334b3fa',
  b: 'https://lumalabs.ai/capture/822bac8d-70c6-404e-aaae-f89f46672c67',
  c: 'https://lumalabs.ai/capture/9d9e1e45-b089-4e4b-bb7d-ebc2d8cc7f57',
  d: 'https://lumalabs.ai/capture/9dfc3d2d-c6c4-40e6-b23c-c44f3f84af99',
} as const;

const THUMB = {
  globe:
    'https://cdn-luma.com/dae39f9834ce5ff37efd798c27669caad8f67969a188f74a2e387607773b3fa9/MIT_WPU_Globe_thumb.jpg',
  dandelion:
    'https://cdn-luma.com/998f66a10b35ecdc8ff532714eccd37ef567ba190b6b9a45833975e5b48fdf05/Dandelion_thumb.jpg',
  sculpture:
    'https://cdn-luma.com/77b06b20dd103ee39f6c8fb54768068ce4f043c8f1cc238d563abe7e5c7a4a84/Jules_Desbois_La_Femme_l_thumb.jpg',
  alps: 'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?w=900&q=80',
  eiffel: 'https://images.unsplash.com/photo-1570097703229-b195d6dd291f?w=900&q=80',
  santorini: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=900&q=80',
  nebula: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=900&q=80',
  liberty: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=900&q=80',
  seoul: 'https://images.unsplash.com/photo-1538485399081-7c8ed7f0ee8e?w=900&q=80',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=900&q=80',
  bigben: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=900&q=80',
  colosseum: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80',
  taj: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=80',
  greatwall: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=900&q=80',
  machu: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=900&q=80',
  rio: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=900&q=80',
  goldengate: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=900&q=80',
  burj: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80',
  angkor: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80',
  petra: 'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=900&q=80',
  sagrada: 'https://images.unsplash.com/photo-1583779457094-ab6f77f7bf57?w=900&q=80',
  acropolis: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=900&q=80',
  stonehenge: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=900&q=80',
  fuji: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=900&q=80',
} as const;

/** Curated Luma captures offered in the upload flow ("Pick a Luma scene"). */
export const LUMA_GALLERY: SampleScene[] = [
  {
    id: 'luma-arosa',
    name: 'Arosa Alps',
    location: 'Arosa, Switzerland',
    lat: 46.7785,
    lon: 9.6764,
    captureUrl: LUMA.arosa,
    thumbnail: THUMB.alps,
    tags: ['Alps', 'Landscape', 'Switzerland'],
  },
  {
    id: 'luma-globe',
    name: 'MIT WPU Globe',
    location: 'Cambridge, USA',
    lat: 42.3601,
    lon: -71.0942,
    captureUrl: LUMA.globe,
    thumbnail: THUMB.globe,
    tags: ['Sculpture', 'Campus'],
  },
  {
    id: 'luma-dandelion',
    name: 'Dandelion Macro',
    location: 'Meadow',
    lat: 47.3769,
    lon: 8.5417,
    captureUrl: LUMA.dandelion,
    thumbnail: THUMB.dandelion,
    tags: ['Nature', 'Macro'],
  },
  {
    id: 'luma-sculpture',
    name: 'Jules Desbois Sculpture',
    location: 'Paris, France',
    lat: 48.8606,
    lon: 2.3376,
    captureUrl: LUMA.sculpture,
    thumbnail: THUMB.sculpture,
    tags: ['Art', 'Museum'],
  },
  {
    id: 'luma-nebula',
    name: 'Nebula',
    location: 'Deep space',
    lat: 0,
    lon: 0,
    captureUrl: LUMA.nebula,
    thumbnail: THUMB.nebula,
    tags: ['Space', 'Abstract'],
  },
];

/** Landmark pins for the Travel map. */
export const TRAVEL_SCENES: SampleScene[] = [
  { id: 't-1', name: 'Eiffel Tower', location: 'Paris, France', lat: 48.8584, lon: 2.2945, captureUrl: LUMA.globe, thumbnail: THUMB.eiffel, tags: ['Paris', 'Architecture'] },
  { id: 't-2', name: 'Statue of Liberty', location: 'New York, USA', lat: 40.6892, lon: -74.0445, captureUrl: LUMA.a, thumbnail: THUMB.liberty, tags: ['NewYork', 'Landmark'] },
  { id: 't-3', name: 'Namsan Seoul Tower', location: 'Seoul, Korea', lat: 37.5512, lon: 126.9882, captureUrl: LUMA.b, thumbnail: THUMB.seoul, tags: ['Seoul', 'Skyline'] },
  { id: 't-4', name: 'Tokyo Tower', location: 'Tokyo, Japan', lat: 35.6586, lon: 139.7454, captureUrl: LUMA.c, thumbnail: THUMB.tokyo, tags: ['Tokyo', 'Night'] },
  { id: 't-5', name: 'Sydney Opera House', location: 'Sydney, Australia', lat: -33.8568, lon: 151.2153, captureUrl: LUMA.d, thumbnail: THUMB.sydney, tags: ['Sydney', 'Architecture'] },
  { id: 't-6', name: 'Arosa Alps', location: 'Arosa, Switzerland', lat: 46.7785, lon: 9.6764, captureUrl: LUMA.arosa, thumbnail: THUMB.alps, tags: ['Alps', 'Landscape'] },
  { id: 't-7', name: 'Big Ben', location: 'London, UK', lat: 51.4994, lon: -0.1245, captureUrl: LUMA.dandelion, thumbnail: THUMB.bigben, tags: ['London', 'Historical'] },
  { id: 't-8', name: 'Colosseum', location: 'Rome, Italy', lat: 41.8902, lon: 12.4922, captureUrl: LUMA.sculpture, thumbnail: THUMB.colosseum, tags: ['Rome', 'Historical'] },
  { id: 't-9', name: 'Taj Mahal', location: 'Agra, India', lat: 27.1751, lon: 78.0421, captureUrl: LUMA.nebula, thumbnail: THUMB.taj, tags: ['India', 'Architecture'] },
  { id: 't-10', name: 'Great Wall', location: 'Beijing, China', lat: 40.4319, lon: 116.5704, captureUrl: LUMA.arosa, thumbnail: THUMB.greatwall, tags: ['China', 'Historical'] },
  { id: 't-11', name: 'Machu Picchu', location: 'Cusco, Peru', lat: -13.1631, lon: -72.545, captureUrl: LUMA.globe, thumbnail: THUMB.machu, tags: ['Peru', 'Ruins'] },
  { id: 't-12', name: 'Christ the Redeemer', location: 'Rio de Janeiro, Brazil', lat: -22.9519, lon: -43.2105, captureUrl: LUMA.a, thumbnail: THUMB.rio, tags: ['Rio', 'Landmark'] },
  { id: 't-13', name: 'Golden Gate Bridge', location: 'San Francisco, USA', lat: 37.8199, lon: -122.4783, captureUrl: LUMA.b, thumbnail: THUMB.goldengate, tags: ['SanFrancisco', 'Bridge'] },
  { id: 't-14', name: 'Burj Khalifa', location: 'Dubai, UAE', lat: 25.1972, lon: 55.2744, captureUrl: LUMA.c, thumbnail: THUMB.burj, tags: ['Dubai', 'Skyline'] },
  { id: 't-15', name: 'Angkor Wat', location: 'Siem Reap, Cambodia', lat: 13.4125, lon: 103.867, captureUrl: LUMA.d, thumbnail: THUMB.angkor, tags: ['Cambodia', 'Temple'] },
  { id: 't-16', name: 'Petra', location: 'Ma\'an, Jordan', lat: 30.3285, lon: 35.4444, captureUrl: LUMA.dandelion, thumbnail: THUMB.petra, tags: ['Jordan', 'Historical'] },
  { id: 't-17', name: 'Sagrada Familia', location: 'Barcelona, Spain', lat: 41.4036, lon: 2.1744, captureUrl: LUMA.sculpture, thumbnail: THUMB.sagrada, tags: ['Barcelona', 'Architecture'] },
  { id: 't-18', name: 'Acropolis', location: 'Athens, Greece', lat: 37.9715, lon: 23.7267, captureUrl: LUMA.nebula, thumbnail: THUMB.acropolis, tags: ['Athens', 'Historical'] },
  { id: 't-19', name: 'Stonehenge', location: 'Wiltshire, UK', lat: 51.1789, lon: -1.8262, captureUrl: LUMA.arosa, thumbnail: THUMB.stonehenge, tags: ['UK', 'Historical'] },
  { id: 't-20', name: 'Mount Fuji', location: 'Honshu, Japan', lat: 35.3606, lon: 138.7274, captureUrl: LUMA.globe, thumbnail: THUMB.fuji, tags: ['Japan', 'Mountain'] },
];

export const SAMPLE_THUMBNAILS = THUMB;
export const SAMPLE_CAPTURES = LUMA;
