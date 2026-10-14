// Informação geral do site, num só sítio.
export const site = {
  name: 'Gonçalo',
  title: 'Gonçalo — Designer',
  description: 'Designer crafting digital products, websites and tools. Selected work and contact.',
  lang: 'en',
  role: 'Designer',
  intro: 'Designer crafting digital products, websites & tools — from first mockup to the real thing.',
  location: 'Based in Portugal',
  available: true,
  skills: ['Product design', 'Websites', 'Prototyping', 'AI tools', 'Design systems'],
  links: {
    instagram: { label: 'Instagram', handle: '@goncas.02', url: 'https://www.instagram.com/goncas.02/' },
    // Email profissional ainda por criar
    email: null as string | null,
    // CV em PDF: colocar em public/cv.pdf e mudar para true
    cv: false,
  },
};
