function query(sel) { return document.querySelector(sel) }
function queryAll(sel) { return document.querySelectorAll(sel) }

function addChild(parent, tagType) {
  const child = document.createElement(tagType)
  parent.appendChild(child)
  return child
}

window.addEventListener("DOMContentLoaded", function () {
  const tableURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROGiioq8pwJ7Pt0ZDbjXK3gDHJia1_I4UT-Gw-SYRW-QLQjekFUhGGLHPbmrp2-Q3B2SoqkMv1aNzx/pub?output=csv"

  Papa.parse(tableURL, {
    download: true,
    header: true,
    complete: function(results) {
      data = results.data
      let tbody = query("#portfolioTable")
      for (let i=0; i<data.length; i++) {
        let tr = addChild(tbody,"tr")
        addChild(tr,"td").innerText = data[i].date
        addChild(tr,"td").innerText = data[i].name
        addChild(tr,"td").innerText = data[i].tags
        addChild(tr,"td").innerHTML = data[i].words
        addChild(tr,"td").innerHTML = data[i].link
        // let link = addChild(tr,"td")
        // let linka = addChild(link,"a")
        // linka.href = data[i].link
        // linka.innerText = data[i].verb
      }
    }
  })
})
