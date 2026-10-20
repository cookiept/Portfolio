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
  // Formulário de contacto: as mensagens chegam por email através do FormSubmit.
  // Depois de ativares o formulário (link no 1.º email), podes trocar o email
  // pelo código aleatório que o FormSubmit te dá, para não ficar público.
  contactForm: 'https://formsubmit.co/ajax/goncalogsa@gmail.com',
};
