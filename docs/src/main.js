// these go in the url hash, so pls just use lowercase ascii
// todo: make these data in sheet 2, not code here on the server (?)
const knownTags={
  best:        { title: "some of my best work -- check these out first" },
  game:        { title: "something you can play" },
  tool:        { title: "a tool to help other people make things" },
  blog:        { title: "writings, devlogs, thoughts" },
  code:        { title: "programming-focused things" },
  animation:   { title: "tweetcarts and other code-art" },
  music:       { title: "sounds and time" },
  puzzle:      { title: "a game about thinking deeply and understanding a system" },
  action:      { title: "a game about executing task with precise timing and reflexes" },
  paper:       { title: "a nikoli-stlye logic puzzle you can print on paper" },
  physical:    { title: "a game you play with cards or other props" },
  sizecode:    { title: "a game or animation where I can only use a limited amount of code" },
  about:       { title: "talking about myself" },
  collab:      { title: "made with other folks" },
  tutorial:    { title: "I try to explain how to do something" },
  hard:        { title: "particularly difficult" },
  tiny:        { title: "takes seconds or minutes to experience" },
  small:       { title: "takes minutes or hours to experience" },
  medium:      { title: "takes hours or days to experience" },
  large:       { title: "takes days or weeks to experience" },
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

  const tableURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROGiioq8pwJ7Pt0ZDbjXK3gDHJia1_I4UT-Gw-SYRW-QLQjekFUhGGLHPbmrp2-Q3B2SoqkMv1aNzx/pub?gid=0&single=true&output=csv"

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

      updateRowHighlights()
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
    tagInfo = {title: "."}
  }

  let button = addChild(parent,"button")
  button.className = "tag"
  button.href = "#"
  button.dataset.id = id
  button.innerText = id
  button.title = tagInfo.title
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

  updateRowHighlights()

  // console.log(filters);
  window.location.hash="tags="+filters.join(",")
}

function updateRowHighlights() {
  let tbody = query("#portfolioTable > tbody")
  if (filters.length==0) {
    for (let tr of tbody.children) {
      tr.dataset.filterscore = null
    }
  } else {
    for (let tr of tbody.children) {
      tr.dataset.filterscore=Math.min(4,trFilterScore(tr))
    }
  }
}

function trFilterScore(tr) {
  let count=0
  for (let id of filters) {
    if (tr.querySelector(".tag[data-id="+id+"]")) count+=1
  }
  return count
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
