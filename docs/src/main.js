function query(sel) { return document.querySelector(sel) }
function queryAll(sel) { return document.querySelectorAll(sel) }

window.addEventListener("DOMContentLoaded", function () {
  console.log(query("#portfolioTable"));
})
