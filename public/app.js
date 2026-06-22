// Estat global
let activeTool = "imatges"
let scannedFiles = []
let dirOrigen = ""
let dirSortida = ""
const cache = {}
let HOME = ""

// DOM refs
const $ = (id) => document.getElementById(id)
const toolTabs = $("toolTabs")
const configImatges = $("configImatges")
const configVectors = $("configVectors")
const configFonts = $("configFonts")
const qualityRange = $("qualityRange")
const qualityValue = $("qualityValue")
const speedRange = $("speedRange")
const speedValue = $("speedValue")
const precisionRange = $("precisionRange")
const precisionValue = $("precisionValue")
const treeOrigen = $("treeOrigen")
const treeSortida = $("treeSortida")
const pathOrigen = $("pathOrigen")
const pathSortida = $("pathSortida")
const scanBtn = $("scanBtn")
const convertBtn = $("convertBtn")
const gallery = $("gallery")
const fileList = $("fileList")
const statusLog = $("statusLog")

// Sliders
qualityRange.addEventListener("input", () => { qualityValue.textContent = qualityRange.value })
speedRange.addEventListener("input", () => { speedValue.textContent = speedRange.value })
precisionRange.addEventListener("input", () => { precisionValue.textContent = precisionRange.value })

// Selector d'eina
toolTabs.addEventListener("click", (e) => {
  const tab = e.target.closest(".tool-tab")
  if (!tab) return
  activeTool = tab.dataset.tool
  toolTabs.querySelectorAll(".tool-tab").forEach((t) => t.classList.remove("active"))
  tab.classList.add("active")
  configImatges.classList.toggle("hidden", activeTool !== "imatges")
  configVectors.classList.toggle("hidden", activeTool !== "vectors")
  configFonts.classList.toggle("hidden", activeTool !== "fonts")
  convertBtn.textContent = activeTool === "vectors" ? "Optimitza" : "Convertir"
  resetResults()
})

// ============== Arbre ==============

async function fetchDir(dir, esSortida) {
  if (cache[dir]) return cache[dir]
  const tool = esSortida ? "" : `&tool=${activeTool}`
  const res = await fetch(`/api/browse?dir=${encodeURIComponent(dir)}${tool}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  cache[dir] = data
  return data
}

function crearNodeArbre(data, treeEl, esSortida, indent) {
  const container = document.createElement("div")
  container.className = "tree-children"
  container.style.paddingLeft = indent + "px"

  for (const entry of data.entries) {
    const node = document.createElement("div")
    node.className = "tree-node"
    node.dataset.ruta = entry.ruta

    if (entry.esDirectori) {
      const toggle = document.createElement("span")
      toggle.className = "tree-toggle"
      toggle.textContent = "▸"
      toggle.addEventListener("click", (e) => { e.stopPropagation(); toggleNode(treeEl, node, entry.ruta, esSortida) })
      node.appendChild(toggle)

      const icon = document.createElement("span")
      icon.className = "tree-icon"
      icon.textContent = "📁"
      node.appendChild(icon)

      const name = document.createElement("span")
      name.className = "tree-name dir-name"
      name.textContent = entry.nom
      name.title = entry.ruta
      node.appendChild(name)

      node.addEventListener("click", (e) => {
        if (e.target.closest(".tree-toggle")) return
        seleccionarDirectori(entry.ruta, esSortida, node)
      })

      const children = document.createElement("div")
      children.className = "tree-children"
      children.style.display = "none"
      node.appendChild(children)
    } else {
      const spacer = document.createElement("span")
      spacer.className = "tree-toggle"
      spacer.style.visibility = "hidden"
      node.appendChild(spacer)

      const icon = document.createElement("span")
      icon.className = "tree-icon"
      icon.textContent = "📄"
      node.appendChild(icon)

      const name = document.createElement("span")
      name.className = "tree-name file-name"
      name.textContent = entry.nom
      node.appendChild(name)
    }

    container.appendChild(node)
  }
  return container
}

async function toggleNode(treeEl, nodeEl, ruta, esSortida) {
  const toggle = nodeEl.querySelector(":scope > .tree-toggle")
  const children = nodeEl.querySelector(":scope > .tree-children")
  if (!toggle || !children) return

  if (children.style.display === "none") {
    try {
      if (!children.hasChildNodes()) {
        const data = await fetchDir(ruta, esSortida)
        const depth = parseInt(nodeEl.dataset.depth || "0") + 20
        const newKids = crearNodeArbre(data, treeEl, esSortida, depth)
        while (newKids.firstChild) {
          newKids.firstChild.dataset.depth = depth
          children.appendChild(newKids.firstChild)
        }
      }
      children.style.display = ""
      toggle.textContent = "▾"
    } catch { showToast("Error en carregar", "error") }
  } else {
    children.style.display = "none"
    toggle.textContent = "▸"
  }
}

function seleccionarDirectori(ruta, esSortida, nodeEl) {
  const tree = esSortida ? treeSortida : treeOrigen
  tree.querySelectorAll(".tree-node.selected").forEach((n) => n.classList.remove("selected"))
  nodeEl.classList.add("selected")

  if (esSortida) {
    dirSortida = ruta
    pathSortida.textContent = ruta
  } else {
    dirOrigen = ruta
    pathOrigen.textContent = ruta
    scanBtn.disabled = false
  }
}

function crearNodeArrel(emoji, label, ruta, treeEl, esSortida, parent) {
  const node = document.createElement("div")
  node.className = "tree-node"
  node.dataset.ruta = ruta
  node.dataset.depth = "0"

  const toggle = document.createElement("span")
  toggle.className = "tree-toggle"
  toggle.textContent = "▸"
  toggle.addEventListener("click", (e) => { e.stopPropagation(); toggleNode(treeEl, node, ruta, esSortida) })
  node.appendChild(toggle)

  const icon = document.createElement("span")
  icon.className = "tree-icon"
  icon.textContent = emoji
  node.appendChild(icon)

  const name = document.createElement("span")
  name.className = "tree-name dir-name"
  name.textContent = label
  name.title = ruta
  node.appendChild(name)

  node.addEventListener("click", (e) => {
    if (e.target.closest(".tree-toggle")) return
    seleccionarDirectori(ruta, esSortida, node)
  })

  const children = document.createElement("div")
  children.className = "tree-children"
  children.style.display = "none"
  node.appendChild(children)

  parent.appendChild(node)
  return node
}

async function initTree(treeEl, esSortida) {
  try {
    const root = document.createElement("div")
    root.className = "tree-children"

    // Node Documents
    crearNodeArrel("🏠", "Documents", HOME + "/Documents", treeEl, esSortida, root)

    // Volums externs
    try {
      const vols = await fetch("/api/volumes").then((r) => r.json())
      for (const vol of vols) {
        crearNodeArrel("💾", vol.nom, vol.ruta, treeEl, esSortida, root)
      }
    } catch { /* no volums */ }

    treeEl.innerHTML = ""
    treeEl.appendChild(root)
  } catch {
    treeEl.innerHTML = '<span class="file" style="padding:1rem;display:block;text-align:center">Error en carregar</span>'
  }
}

// ============== Analitzar / Convertir ==============

scanBtn.addEventListener("click", () => { if (dirOrigen) doScan(dirOrigen) })

async function doScan(dir) {
  resetResults()
  try {
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directory: dir, tool: activeTool, recursive: document.getElementById("recursiveCheck").checked }),
    })
    const data = await res.json()
    if (data.error) { showToast(data.error, "error"); return }
    scannedFiles = data.arxius
    showToast(data.missatge, data.total > 0 ? "success" : "error")
    if (activeTool === "imatges") showGallery(data.arxius)
    else showFileList(data.arxius)
    convertBtn.disabled = data.total === 0
  } catch { showToast("Error d'escaneig", "error") }
}

function showGallery(files) {
  gallery.classList.remove("hidden")
  fileList.classList.add("hidden")
  gallery.innerHTML = files.map((f) => `<img src="/api/preview?path=${encodeURIComponent(f)}" alt="" loading="lazy" />`).join("")
}

function showFileList(files) {
  fileList.classList.remove("hidden")
  gallery.classList.add("hidden")
  fileList.innerHTML = files.map((f) => `<div class="file">${f}</div>`).join("")
}

function resetResults() {
  scannedFiles = []
  gallery.innerHTML = ""; gallery.classList.add("hidden")
  fileList.innerHTML = ""; fileList.classList.add("hidden")
  statusLog.innerHTML = ""; statusLog.classList.add("hidden")
  convertBtn.disabled = true
}

convertBtn.addEventListener("click", async () => {
  if (scannedFiles.length === 0) return
  const dir = dirOrigen
  const output = dirSortida || dirOrigen
  const overwrite = document.getElementById("overwriteCheck").checked
  const recursive = document.getElementById("recursiveCheck").checked

  statusLog.innerHTML = ""; statusLog.classList.remove("hidden")
  convertBtn.disabled = true; convertBtn.textContent = "Convertint..."
  let ok = 0, skip = 0, fail = 0, mida = 0
  const start = Date.now()

  let url = ""
  const params = new URLSearchParams({ dir, output, overwrite: String(overwrite), recursive: String(recursive), files: scannedFiles.join(",") })

  if (activeTool === "imatges") {
    url = "/api/convert-images"
    params.set("quality", qualityRange.value)
    params.set("speed", speedRange.value)
    params.set("lossless", String(document.getElementById("losslessCheck").checked))
  } else if (activeTool === "vectors") {
    url = "/api/optimize-svgs"
    params.set("precision", precisionRange.value)
  } else {
    url = "/api/convert-fonts"
  }

  try {
    const es = new EventSource(`${url}?${params.toString()}`)
    es.onmessage = (event) => {
      try {
        const ev = JSON.parse(event.data)
        if (ev.error) { log(`ERROR: ${ev.error}`, "fail"); es.close(); finalitzar(); return }
        const name = ev.arxiu.split("/").pop()
        const prefix = `[${ev.actual}/${ev.total}]`
        if (ev.estat === "ok") {
          ok++; if (ev.midaDespres) mida += ev.midaDespres
          const pct = ev.midaAbans && ev.midaDespres ? Math.round(100 - (ev.midaDespres * 100) / ev.midaAbans) : 0
          log(`${prefix} OK ${name} → ${ev.sortida.split("/").pop()} (${fmtMida(ev.midaAbans)} → ${fmtMida(ev.midaDespres)}, ${pct}%)`, "ok")
        } else if (ev.estat === "skip") {
          skip++; log(`${prefix} SKIP ${name} → ${ev.sortida.split("/").pop()} (ja existia)`, "skip")
        } else if (ev.estat === "fail") {
          fail++; log(`${prefix} FAIL ${name}: ${ev.missatge || ""}`, "fail")
        }
      } catch { /* ignora */ }
    }
    es.onerror = () => { es.close(); finalitzar() }
  } catch (err) { log(`ERROR: ${err.message}`, "fail"); finalitzar() }

  function finalitzar() {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    log("---", "sep")
    log(`Fet: ${ok}/${scannedFiles.length} en ${elapsed}s`, "ok")
    if (skip > 0) log(`${skip} omesa/es (ja existien)`, "skip")
    if (fail > 0) log(`${fail} error/s`, "fail")
    if (ok > 0) log(`Mida total: ${fmtMida(mida)}`, "ok")
    convertBtn.disabled = false
    convertBtn.textContent = activeTool === "vectors" ? "Optimitza" : "Convertir"
    showToast(`Fet: ${ok}/${scannedFiles.length} en ${elapsed}s`, ok > 0 ? "success" : "error")
  }
})

function log(text, cls) {
  const el = document.createElement("div")
  el.className = cls; el.textContent = text
  statusLog.appendChild(el)
  statusLog.scrollTop = statusLog.scrollHeight
}

function showToast(msg, type) {
  const t = document.createElement("div")
  t.className = `toast ${type}`; t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 3000)
}

function fmtMida(b) {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / (1024 * 1024)).toFixed(1)}MB`
}

// Inicialitzar
HOME = document.documentElement.dataset.home || "/Users"
initTree(treeOrigen, false)
initTree(treeSortida, true)
