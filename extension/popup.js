const SITE = 'https://pdfpilot5u.vercel.app'
document.querySelectorAll('[data-path]').forEach((link) => {
  link.addEventListener('click', () => chrome.tabs.create({ url: SITE + link.dataset.path }))
})
