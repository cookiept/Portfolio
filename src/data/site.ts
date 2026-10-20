// Informação geral do site, num só sítio.
export const site = {
  name: 'Gonçalo',
  title: 'Gonçalo, designer',
  description: 'Gonçalo designs apps, websites and little tools, from the first mockup to something you can click.',
  lang: 'en',
  links: {
    instagram: { handle: '@goncas.02', url: 'https://www.instagram.com/goncas.02/' },
    // Email profissional ainda por criar
    email: null as string | null,
    // CV em PDF: colocar em public/cv.pdf e mudar para true
    cv: false,
  },
  // Formulário de contacto: as mensagens chegam ao teu email através do FormSubmit.
  // O código no fim é o alias que o FormSubmit deu, para o email não ficar público.
  contactForm: 'https://formsubmit.co/ajax/3f8563f19e302521122b0527982c7a88',
};
