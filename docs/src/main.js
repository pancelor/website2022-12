// these go in the url hash, so pls just use lowercase ascii
const knownTags={
  game: 1,
  blog: 1,
  code: 1,
  tool: 1,
  animation: 1,
  puzzle: 1,
  action: 1,
  paper: 1,
  yajilin: 1,
  sizecode: 1,
  tiny: 1,
  small: 1,
  medium: 1,
}

window.addEventListener("DOMContentLoaded", function () {
  urlhash = parseURLHash()

  //
  // add filter buttons
  //
  filters = urlhash.tags
  let filterContainer = query("#filterContainer")
  for (let id of Object.keys(knownTags)) {
    let tag = addTag(filterContainer,id)
  }

  const tableURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROGiioq8pwJ7Pt0ZDbjXK3gDHJia1_I4UT-Gw-SYRW-QLQjekFUhGGLHPbmrp2-Q3B2SoqkMv1aNzx/pub?output=csv"

  // console.log("csv loading");
  Papa.parse(tableURL, {
    download: true,
    header: true,
    complete: function(results) {
      //
      // parse data
      //

      // console.log("csv loaded");
      if (results.errors.length > 0) {
        console.warn("csv parse errors:");
        console.warn(results.errors);
      }
      data = results.data
      let tbody = query("#portfolioTable > tbody")
      tbody.replaceChildren() // clear "loading" placeholder
      for (let i=0; i<data.length; i++) {
        let tr = addChild(tbody,"tr")
        parseDate(addChild(tr,"td"),data[i])
        parseName(addChild(tr,"td"),data[i])
        parseTags(addChild(tr,"td"),data[i])
        parseWords(addChild(tr,"td"),data[i])
        parseLink(addChild(tr,"td"),data[i])
      }
    }
  })
})

function parseURLHash() {
  let hash = {}
  for (let chunk of window.location.hash.substring(1).split("&")) {
    let parts = chunk.split("=")
    hash[parts[0]] = parts[1]
  }
  if (hash.tags) {
    hash.tags = hash.tags.split(",")
  } else {
    hash.tags = []
  }
  return hash
}

function parseDate(td,data) {
  td.innerText = data.date
}
function parseName(td,data) {
  td.innerText = data.name
}

function parseTags(td,data) {
  let tags = data.tags.split(",")
  for (let id of tags) {
    addTag(td,id)
  }
  td.classList.add("col-tags")
}
function addTag(parent,id) {
  let tagInfo = knownTags[id]
  if (!tagInfo) {
    console.warn("unrecognized tag: ",id)
    // tagInfo = {background: "purple", color: "white"}
  }

  let button = addChild(parent,"button")
  button.className = "tag"
  button.href = "#"
  // button.style.background = tagInfo.background
  // button.style.color = tagInfo.color
  button.dataset.id = id
  button.innerText = id
  button.onclick = tagOnClick
  button.dataset.state = (filters.length === 0 || filters.includes(id)) ? "on" : "off"
  return button
}
function parseWords(td,data) {
  td.innerHTML = data.words
}
function parseLink(td,data) {
  td.innerHTML = data.link
}

function tagOnClick(ev) {
  //
  // delete tag from filter, and update tag state
  //
  let id = this.dataset.id
  if (delswap(filters,id)) {
    // console.log("removed tag from filter")
    if (filters.length===0) {
      for (let tag of queryAll(".tag")) {
        tag.dataset.state = "on"
      }
    } else {
      for (let tag of queryAll(".tag[data-id="+id+"]")) {
        tag.dataset.state = "off"
      }
    }
  } else {
    // console.log("added tag to filter")
    filters.push(id)
    if (filters.length===1) {
      for (let tag of queryAll(".tag")) {
        tag.dataset.state = "off"
      }
    }
    for (let tag of queryAll(".tag[data-id="+id+"]")) {
      tag.dataset.state = "on"
    }
  }

  //
  // hide table rows
  //
  // todo: switch html table to css table/grid and add animation: ?
  // https://stackoverflow.com/questions/3508605/how-can-i-transition-height-0-to-height-auto-using-css?rq=1
  let tbody = query("#portfolioTable > tbody")
  for (let tr of tbody.children) {
    if (trPassesFilters(tr)) {
      // tr.style.display = null
      if (filters.length>0) {
        // todo this doesn't update right with multiple filters
        tr.dataset.state = "on"
      } else {
        tr.dataset.state = null
      }
    } else {
      // tr.style.display = "none"
    }
  }

  // console.log(filters);
  window.location.hash="tags="+filters.join(",")
}

function trPassesFilters(tr) {
  for (let id of filters) {
    if (!tr.querySelector(".tag[data-id="+id+"]")) return false
  }
  return true
}

//
// helpers
//

// if elem is in arr, delete it
//   (by replacing it with the array's last element)
// returns the element or null
function delswap(arr, elem) {
  let ix = arr.indexOf(elem)
  if (ix === -1) {
    return null
  } else {
    deliswap(arr,ix)
    return elem
  }
}

// delete the ix-th index from array, by swapping with the last element
// deletes the last index if none is given
function deliswap(arr, ix) {
  if (ix != null) arr[ix] = arr[arr.length-1]
  arr.length -= 1
}

function query(sel) { return document.querySelector(sel) }
function queryAll(sel) { return document.querySelectorAll(sel) }

function addChild(parent, tagType) {
  const child = document.createElement(tagType)
  parent.appendChild(child)
  return child
}
