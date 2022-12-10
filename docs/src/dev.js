// dev-only setup

function addScript(src) {
  const script = document.createElement('script')
  script.type = "text/javascript"
  script.src = src
  document.body.appendChild(script)
}

window.addEventListener("DOMContentLoaded", () => {
  dev = false
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    addScript("/src/live.js")
    dev = true
  }
  // dev_audio_chance = dev && 1
})
