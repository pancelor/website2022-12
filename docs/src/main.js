window.addEventListener("DOMContentLoaded", function () {
  urlhash = parseURLHash()

  //
  // add filter buttons
  //
  filters = urlhash.tags

  const tagURL     = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROGiioq8pwJ7Pt0ZDbjXK3gDHJia1_I4UT-Gw-SYRW-QLQjekFUhGGLHPbmrp2-Q3B2SoqkMv1aNzx/pub?gid=366002000&single=true&output=csv"
  const projectURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROGiioq8pwJ7Pt0ZDbjXK3gDHJia1_I4UT-Gw-SYRW-QLQjekFUhGGLHPbmrp2-Q3B2SoqkMv1aNzx/pub?gid=0&single=true&output=csv"

  let projectData
  let tagData

  // console.log("csv loading");
  Papa.parse(tagURL, {
    download: true,
    header: true,
    complete: function(results) {
      // console.log("tagURL loaded");
      if (results.errors.length > 0) {
        console.warn("tagURL parse errors:");
        console.warn(results.errors);
      }
      tagData = results.data

      Papa.parse(projectURL, {
        download: true,
        header: true,
        complete: function(results) {
          // console.log("projectURL loaded");
          if (results.errors.length > 0) {
            console.warn("projectURL parse errors:");
            console.warn(results.errors);
          }
          projectData = results.data

          processTagData(tagData) // must be first, to populate knownTags
          processProjectData(projectData)

          updateTagHighlights()
          updateRowHighlights()
        }
      })
    }
  })
})

//
// spreadsheet parsing
//

function processTagData(tagData) {
  let filterContainer = query("#filterContainer")
  knownTags = {}
  for (let i=0; i<tagData.length; i++) {
    if (tagData[i].enabled === "TRUE") {
      const id = tagData[i].tag
      knownTags[id] = {
        title: tagData[i].title,
        background: tagData[i].background,
      }
      addTag(filterContainer,id)
    }
  }
}

function processProjectData(projectData) {
  let tbody = query("#portfolioTable > tbody")
  tbody.replaceChildren() // clear "loading" placeholder
  for (let i=0; i<projectData.length; i++) {
    if (projectData[i].enabled === "TRUE") {
      let tr = addChild(tbody,"tr")
      let data = projectData[i]
      addChild(tr,"td").innerHTML = `<div class="date">${data.date}</div><h3><a href="${data.href}" target=_>${data.name}</a></h3>`
      parseTags(addChild(tr,"td"),data)
      addChild(tr,"td").innerHTML = `<p>${data.words}</p>`
    }
  }
}

function parseTags(td,data) {
  let tags = splitEmpty(data.tags,",")
  for (let id of tags) {
    addTag(td,id)
  }
  td.classList.add("col-tags")
}

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
  button.style.background = tagInfo.background
  button.dataset.state = (filters.length === 0 || filters.includes(id)) ? "on" : "off"
  return button
}

function tagOnClick(ev) {
  //
  // delete tag from filter, and update tag state
  //
  let id = this.dataset.id
  if (delswap(filters,id)) {
    // console.log("removed tag from filter")
  } else {
    filters.push(id)
    // console.log("added tag to filter")
  }

  updateTagHighlights()
  updateRowHighlights()

  // console.log(filters);
  window.location.hash="tags="+filters.join(",")
}

function setTagState(state, id) {
  const list = (id===undefined) ? queryAll(".tag") : queryAll(".tag[data-id="+id+"]")
  for (let tag of list) {
    tag.dataset.state = state // todo: remove this? not doing much anymore
    // I can't set the color in css b/c element-specific overrides are later than class-specific

    let background = knownTags[tag.dataset.id].background
    let border = null
    if (state=="filternone") {
      // use defaults
    } else if (state=="filterno") {
      background = "#9c656c"
    } else if (state=="filteryes") {
      border = "4px solid #2c1b2e"
    }
    tag.style.background=background
    tag.style.border=border
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
