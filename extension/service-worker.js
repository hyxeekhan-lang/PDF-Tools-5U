chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'pdfpilot5u-open',
    title: 'Open PDF Pilot 5U',
    contexts: ['page', 'selection', 'link'],
  })
})

chrome.contextMenus.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'https://pdfpilot5u.vercel.app/tools' })
})
