window.addEventListener("DOMContentLoaded", async function () {
  //
  // add filters from hash
  //
  urlhash = parseURLHash()
  filters = urlhash.tags

  //
  // download + process data
  //
  const tagURL     = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROGiioq8pwJ7Pt0ZDbjXK3gDHJia1_I4UT-Gw-SYRW-QLQjekFUhGGLHPbmrp2-Q3B2SoqkMv1aNzx/pub?gid=366002000&single=true&output=csv"
  const projectURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROGiioq8pwJ7Pt0ZDbjXK3gDHJia1_I4UT-Gw-SYRW-QLQjekFUhGGLHPbmrp2-Q3B2SoqkMv1aNzx/pub?gid=0&single=true&output=csv"

  knownTags = {}

  // console.log("csv loading");
  let tagPromise = new Promise((resolve, reject) => {
    let filterContainer = document.querySelector("#filterContainer")
    Papa.parse(tagURL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      step: function(results) {
        // console.log("tagURL step");
        if (results.errors.length > 0) {
          console.warn("tagURL step errors:");
          console.warn(results.errors);
          return
        }

        let data = results.data
        if (data.enabled !== "TRUE") {
          return
        }

        if (data.space_before === "TRUE") {
          var spacer = addChild(filterContainer,"span")
          spacer.style = "color:red; margin-right:1.25em; display:inline-block;"
          spacer.innerHTML = "&nbsp;"
        }

        const id = data.tag
        knownTags[id] = {
          title: data.title,
          background: data.background,
          color: data.color,
        }
        addTag(filterContainer,id)
      },
      complete: function(results) {
        // console.log("tagURL complete");
        if (results.errors.length > 0) {
          console.warn("tagURL complete errors:");
          console.warn(results.errors);
          reject(results.errors)
          return
        }
        resolve()
      },
    })
  })

  let projectPromise = new Promise((resolve, reject) => {
    let tbody = document.querySelector("#portfolioTable > tbody")
    let rowIndex = 0; // increments on each successful row
    Papa.parse(projectURL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      step: function(results) {
        // console.log("projectURL step")
        if (results.errors.length > 0) {
          console.warn("projectURL step errors:")
          console.warn(results.errors)
          return
        }

        if (rowIndex === 0) {
          // clear "loading" placeholder (first time only)
          tbody.replaceChildren()
        }

        let data = results.data
        if (data.enabled !== "TRUE") {
          return
        }

        let tr = addChild(tbody,"tr")
        tr.dataset.default_index = ("0000"+rowIndex).slice(-5) // used to sort back to default order
        let link = data.href ? `<a href="${data.href}" target=_>${data.name}</a>` : data.name
        addChild(tr,"td").innerHTML = `<div class="date">${data.date}</div><h3>${link}</h3>`
        let td_tags = addChild(tr,"td")
        { // parse tags
          let tags = splitEmpty(data.tags,",")
          for (let id of tags) {
            addTag(td_tags,id)
          }
          // td_tags.classList.add("col-tags")
        }

        addChild(tr,"td").innerHTML = `<p>${data.words}</p>`

        rowIndex += 1
      },
      complete: function(results) {
        // console.log("projectURL complete")
        if (results.errors.length > 0) {
          console.warn("projectURL complete errors:")
          console.warn(results.errors)
          reject(results.errors)
          return
        }
        resolve()
      },
    })
  })

  await Promise.all([projectPromise, tagPromise]);

  hydrateAllTags() // tags may have been parsed after projects, so recolor them
  updateTagHighlights()
  updateRowHighlightsAndOrder()
})

//
// logic
//

function parseURLHash() {
  let hash = {}
  for (let chunk of window.location.hash.substring(1).split("&")) {
    let parts = chunk.split("=")
    hash[parts[0]] = parts[1]
  }
  hash.tags = splitEmpty(hash.tags,",")
  return hash
}

function addTag(parent,id) {
  let button = addChild(parent,"button")

  button.className = "tag"
  button.href = "#"
  button.innerText = id
  button.onclick = tagOnClick
  button.dataset.id = id
  button.dataset.state = (filters.length === 0 || filters.includes(id)) ? "on" : "off"
  hydrateTag(button) // may fail silently if the tags CSV hasn't been parsed yet

  return button
}

function hydrateAllTags() {
  for (let button of document.querySelectorAll(".tag")) {
    hydrateTag(button)
  }
}

function hydrateTag(button) {
  let tagInfo = knownTags[button.dataset.id]
  if (tagInfo) {
    button.title = tagInfo.title
    button.style.background = tagInfo.background
    button.style.color = tagInfo.color
  }
}

function tagOnClick(ev) {
  //
  // delete tag from filter, and update tag state
  //
  let id = this.dataset.id
  if (delswap(filters,id)) {
    // console.log("removed tag from filter")
  } else {
    // console.log("added tag to filter")
    filters.push(id)
  }

  updateTagHighlights()
  updateRowHighlightsAndOrder()

  // console.log(filters);
  window.location.hash = "tags="+filters.join(",")

  document.querySelector("#portfolioTable").scrollIntoView({behavior:"smooth"})
}

function setTagState(state, id) {
  const query = (id===undefined) ? (".tag") : (".tag[data-id="+id+"]")
  for (let tag of document.querySelectorAll(query)) {
    // tag.dataset.debug_state = state

    // I'd like to set these props with css query selectors,
    //   but I can't b/c element-specific overrides (like background,
    //   set in js from the csv data) apply later than class-specific css

    let tagInfo = knownTags[tag.dataset.id]
    let bg = tagInfo ? tagInfo.background : "#858c7d"
    if (state == "filternone") {
      tag.style.background      = bg
      tag.style["border-color"] = "#0000" // clear
    } else if (state == "filterno") {
      tag.style.background      = saturate(bg,0.3)
      tag.style["border-color"] = "#0000" // clear
    } else if (state == "filteryes") {
      tag.style.background      = saturate(bg,1.2)
      tag.style["border-color"] = "#ffffff" //#2c1b2e
      // tag.style["font-size"] = "1.33em"
    }
  }
}

function updateTagHighlights() {
  if (filters.length===0) {
    setTagState("filternone")
  } else {
    setTagState("filterno")
    for (let id of filters) {
      setTagState("filteryes",id)
    }
  }
}

function updateRowHighlightsAndOrder() {
  let tbody = query("#portfolioTable > tbody")
  if (filters.length==0) {
    for (let tr of tbody.children) {
      tr.dataset.filterscore = null
    }
    sortTable(tbody, (tr)=>-tr.dataset.default_index)
  } else {
    for (let tr of tbody.children) {
      tr.dataset.filterscore=Math.min(4,trFilterScore(tr))
    }
    sortTable(tbody, (tr)=>tr.dataset.filterscore)
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

// sort an html table tbody, by comparing the results of the key function
function sortTable(tbody, key) {
  var arr = []
  for (let tr of tbody.children) {
    arr.push(tr)
  }
  arr.sort((a,b)=>key(a)<key(b))

  tbody.replaceChildren() // clear
  for (let tr of arr) {
    tbody.appendChild(tr)
  }
}

// hash-then-6-digit-hexstring in/out. e.g. "#aabbcc"
// fades the color towards gray
// satu: how saturated. 1=return hexcolor, 0=return gray
function saturate(hexcolor, satu) {
  var match = hexcolor.match(/^#(..)(..)(..)$/)
  if (!match) return hexcolor

  var rr = parseInt(match[1],16)/256
  var gg = parseInt(match[2],16)/256
  var bb = parseInt(match[3],16)/256
  // weighted average with gray
  rr = rr*satu + 0.5*(1-satu)
  gg = gg*satu + 0.5*(1-satu)
  bb = bb*satu + 0.5*(1-satu)

  return `#${channelHex(rr)}${channelHex(gg)}${channelHex(bb)}`
}

// channel: 0-1 (or beyond) color value
// return: 2digit hex string, clamped 0-255
// 0.5 => "80"
// 1.1 => "ff"
function channelHex(channel) {
  channel = Math.min(Math.max(0,channel),1)
  return ("0"+((channel*255)&0xFF).toString(16)).slice(-2)
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

// "" => []
// null, other falsey => []
// otherwise, acts like str.split
function splitEmpty(str,delim) {
  return str ? str.split(delim) : []
}

function query(sel) { return document.querySelector(sel) }
function queryAll(sel) { return document.querySelectorAll(sel) }

function addChild(parent, tagType) {
  const child = document.createElement(tagType)
  parent.appendChild(child)
  return child
}
