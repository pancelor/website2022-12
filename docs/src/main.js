function query(sel) { return document.querySelector(sel) }
function queryAll(sel) { return document.querySelectorAll(sel) }

function addChild(parent, tagType) {
  const child = document.createElement(tagType)
  parent.appendChild(child)
  return child
}

window.addEventListener("DOMContentLoaded", function () {
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

      //
      // add filter buttons
      //
      filters = []
      let filterContainer = query("#filterContainer")
      for (let id of Object.keys(knownTags)) {
        let tag = addTag(filterContainer,id)
      }
    }
  })
})

function parseDate(td,data) {
  td.innerText = data.date
}
function parseName(td,data) {
  td.innerText = data.name
}
const knownTags={
  // maps to css props
  game: {background: "#100", color: "white"},
  tiny: {background: "#300", color: "white"},
  puzzle: {background: "#500", color: "white"},
  action: {background: "#700", color: "white"},
  paper: {background: "#900", color: "white"},
  yajilin: {background: "#110", color: "white"},
  blog: {background: "#130", color: "white"},
  medium: {background: "#150", color: "white"},
  code: {background: "#170", color: "white"},
  tool: {background: "#190", color: "white"},
  animation: {background: "#210", color: "white"},
  sizecode: {background: "#230", color: "white"},
  small: {background: "#250", color: "white"},
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
    tagInfo = {background: "purple", color: "white"}
  }

  let span = addChild(parent,"span")
  span.className = "tag"
  span.style.background = tagInfo.background
  span.style.color = tagInfo.color
  span.dataset.id = id
  span.innerText = id
  span.onclick = tagOnClick
  return span
}
function parseWords(td,data) {
  td.innerHTML = data.words
}
function parseLink(td,data) {
  td.innerHTML = data.link
}

function tagOnClick(ev) {
  let id = this.dataset.id
  if (delswap(filters,id)) {
    // console.log("removed tag from filter")
    if (filters.length===0) {
      for (let tag of queryAll(".tag")) {
        tag.classList.add("on")
      }
    } else {
      for (let tag of queryAll(".tag[data-id="+id+"]")) {
        tag.classList.add("off")
      }
    }
  } else {
    // console.log("added tag to filter")
    filters.push(id)
    if (filters.length===1) {
      for (let tag of queryAll(".tag")) {
        tag.classList.add("off")
      }
    } else {
      for (let tag of queryAll(".tag[data-id="+id+"]")) {
        tag.classList.add("on")
      }
    }
  }

  let tbody = query("#portfolioTable > tbody")
  for (let tr of tbody.children) {
    if (trPassesFilters(tr)) {
      tr.style.display = null
    } else {
      tr.style.display = "none"
    }
  }

  console.log(filters);
}

function trPassesFilters(tr) {
  for (let id of filters) {
    if (!tr.querySelector(".tag[data-id="+id+"]")) return false
  }
  return true
}

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
