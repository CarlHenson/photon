/*
  Photon – site configuration
  ---------------------------------------------------------------
  Everything that depends on real contact details or an external
  service lives here. Leave a value empty ("") and the site hides
  or placeholders that item instead of inventing it.
*/
window.PHOTON_CONFIG = {
  // Form submission (GitHub Pages has no backend, so use an external form service).
  // Example (Formspree): "https://formspree.io/f/xxxxxxxx"
  // Example (Web3Forms): "https://api.web3forms.com/submit"  + formExtraFields: { access_key: "..." }
  formEndpoint: "",
  formExtraFields: {},

  // Contact options. Leave empty until real details are available.
  email: "",            // e.g. "hello@yourdomain.com"
  phone: "",            // display format, e.g. "+266 0000 0000"
  whatsapp: "26668975772", // digits only, international format

  // Social links (full URLs). Empty = not shown.
  social: {
    linkedin: "",
    facebook: "",
    instagram: "",
    x: ""
  }
};
