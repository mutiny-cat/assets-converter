// Estat global
let activeTool = "imatges", scannedFiles = [], dirOrigen = "", dirSortida = ""
const cache = {}
let HOME = ""

// DOM
const $ = (id) => document.getElementById(id)
const toolTabs = $("toolTabs")
const configImatges = $("configImatges"), configVectors = $("configVectors"), configFonts = $("configFonts")
const qualityRange = $("qualityRange"), qualityValue = $("qualityValue")
const speedRange = $("speedRange"), speedValue = $("speedValue")
const precisionRange = $("precisionRange"), precisionValue = $("precisionValue")
const treeOrigen = $("treeOrigen"), treeSortida = $("treeSortida")
const pathOrigen = $("pathOrigen"), pathSortida = $("pathSortida")
const scanBtn = $("scanBtn"), convertBtn = $("convertBtn")
const gallery = $("gallery"), fileList = $("fileList"), statusLog = $("statusLog")

qualityRange.oninput = () => { qualityValue.textContent = qualityRange.value }
speedRange.oninput = () => { speedValue.textContent = speedRange.value }
precisionRange.oninput = () => { precisionValue.textContent = precisionRange.value }

// "Sense pèrdua" deshabilita qualitat i velocitat
const losslessCheck = $("losslessCheck")
losslessCheck.addEventListener("change", () => {
  const dis = losslessCheck.checked
  qualityRange.disabled = dis
  speedRange.disabled = dis
  qualityValue.style.opacity = dis ? ".4" : "1"
  speedValue.style.opacity = dis ? ".4" : "1"
})

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

function tr(dir, name, isDir, rootLabel) {
  const row = document.createElement("div")
  row.className = "tr"
  row.dataset.path = dir
  row.dataset.isdir = isDir ? "1" : "0"

  // Fletxa
  const arr = document.createElement("span")
  arr.className = isDir ? "tr-arr" : "tr-arr hidden"
  arr.textContent = "▶"
  row.appendChild(arr)

  // Icona
  const icon = document.createElement("span")
  icon.className = "tr-icon"
  icon.textContent = isDir ? (rootLabel ? "🏠" : "📁") : "📄"
  row.appendChild(icon)

  // Nom
  const nm = document.createElement("span")
  nm.className = isDir ? "tr-name dir" : "tr-name file"
  nm.textContent = rootLabel || name
  nm.title = dir
  row.appendChild(nm)

  return row
}

function kids() {
  const el = document.createElement("div")
  el.className = "tr-kids"
  el.style.display = "none"
  return el
}

async function toggle(treeEl, row, path, esSortida, children) {
  const arr = row.querySelector(":scope > .tr-arr")
  if (!arr || arr.classList.contains("hidden")) return

  if (children.style.display === "none") {
    try {
      if (!children.hasChildNodes()) {
        const data = await fetchDir(path, esSortida)
        const depth = parseInt(row.dataset.depth || "0") + 1
        for (const e of data.entries) {
          const r = tr(e.ruta, e.nom, e.esDirectori, null)
          const k = e.esDirectori ? kids() : null
          r.addEventListener("click", (ev) => onRowClick(treeEl, ev, r, e.ruta, e.esDirectori, esSortida, k))
          r.style.paddingLeft = (8 + depth * 20) + "px"
          r.dataset.depth = depth
          children.appendChild(r)
          if (k) children.appendChild(k)
        }
      }
      children.style.display = ""
      arr.classList.add("open")
    } catch { toast("Error en carregar", "error") }
  } else {
    children.style.display = "none"
    arr.classList.remove("open")
  }
}

function onRowClick(treeEl, ev, row, path, isDir, esSortida, children) {
  // Clic a la fletxa = només expandir, no seleccionar
  if (ev.target.closest(".tr-arr")) {
    if (children) toggle(treeEl, row, path, esSortida, children)
    return
  }
  // Clic al nom = seleccionar
  treeEl.querySelectorAll(".tr.sel").forEach((r) => r.classList.remove("sel"))
  row.classList.add("sel")

  if (esSortida) {
    dirSortida = path
    pathSortida.textContent = path
  } else {
    dirOrigen = path
    pathOrigen.textContent = path
    scanBtn.disabled = false
  }
  // Si és directori, també expandir
  if (isDir && children) toggle(treeEl, row, path, esSortida, children)
}

async function initTree(treeEl, esSortida) {
  try {
    treeEl.innerHTML = ""

    // Documents
    const docPath = HOME + "/Documents"
    const docRow = tr(docPath, "Documents", true, "Documents")
    const docKids = kids()
    docRow.addEventListener("click", (ev) => onRowClick(treeEl, ev, docRow, docPath, true, esSortida, docKids))
    docRow.style.paddingLeft = "8px"
    docRow.dataset.depth = "0"
    treeEl.appendChild(docRow)
    treeEl.appendChild(docKids)

    // Volums
    try {
      const vols = await fetch("/api/volumes").then((r) => r.json())
      for (const v of vols) {
        const vRow = tr(v.ruta, v.nom, true, v.nom)
        const vKids = kids()
        vRow.querySelector(".tr-icon").textContent = "💾"
        vRow.addEventListener("click", (ev) => onRowClick(treeEl, ev, vRow, v.ruta, true, esSortida, vKids))
        vRow.style.paddingLeft = "8px"
        vRow.dataset.depth = "0"
        treeEl.appendChild(vRow)
        treeEl.appendChild(vKids)
      }
    } catch { /* no volums */ }
  } catch {
    treeEl.innerHTML = '<span style="padding:1rem;display:block;text-align:center;color:var(--text2)">Error en carregar</span>'
  }
}

// ============== Analitzar / Convertir ==============

scanBtn.addEventListener("click", () => { if (dirOrigen) doScan() })

async function doScan() {
  resetResults()
  try {
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directory: dirOrigen, tool: activeTool, recursive: document.getElementById("recursiveCheck").checked }),
    })
    const data = await res.json()
    if (data.error) { toast(data.error, "error"); return }
    scannedFiles = data.arxius
    toast(data.missatge, data.total > 0 ? "success" : "error")
    if (activeTool === "imatges") showGallery(data.arxius)
    else showFileList(data.arxius)
    convertBtn.disabled = data.total === 0
  } catch { toast("Error d'escaneig", "error") }
}

function showGallery(files) {
  gallery.classList.remove("hidden"); fileList.classList.add("hidden")
  gallery.innerHTML = files.map((f) => `<img src="/api/preview?path=${encodeURIComponent(f)}" loading="lazy" />`).join("")
}
function showFileList(files) {
  fileList.classList.remove("hidden"); gallery.classList.add("hidden")
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
  const dir = dirOrigen, output = dirSortida || dirOrigen
  const overwrite = document.getElementById("overwriteCheck").checked
  const recursive = document.getElementById("recursiveCheck").checked
  statusLog.innerHTML = ""; statusLog.classList.remove("hidden")
  convertBtn.disabled = true; convertBtn.textContent = "Convertint..."
  let ok = 0, skip = 0, fail = 0, mida = 0; const start = Date.now()

  let url = ""
  const params = new URLSearchParams({ dir, output, overwrite: String(overwrite), recursive: String(recursive), files: scannedFiles.join(",") })
  if (activeTool === "imatges") {
    url = "/api/convert-images"; params.set("quality", qualityRange.value); params.set("speed", speedRange.value)
    params.set("lossless", String(document.getElementById("losslessCheck").checked))
  } else if (activeTool === "vectors") { url = "/api/optimize-svgs"; params.set("precision", precisionRange.value) }
  else { url = "/api/convert-fonts" }

  try {
    const es = new EventSource(`${url}?${params.toString()}`)
    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data)
        if (d.error) { log(`ERROR: ${d.error}`, "fail"); es.close(); fi(); return }
        const nm = d.arxiu.split("/").pop(), pre = `[${d.actual}/${d.total}]`
        if (d.estat === "ok") {
          ok++; if (d.midaDespres) mida += d.midaDespres
          const pct = d.midaAbans && d.midaDespres ? Math.round(100 - (d.midaDespres * 100) / d.midaAbans) : 0
          log(`${pre} OK ${nm} → ${d.sortida.split("/").pop()} (${fmt(d.midaAbans)} → ${fmt(d.midaDespres)}, ${pct}%)`, "ok")
        } else if (d.estat === "skip") { skip++; log(`${pre} SKIP ${nm} → ${d.sortida.split("/").pop()} (ja existia)`, "skip") }
        else if (d.estat === "fail") { fail++; log(`${pre} FAIL ${nm}: ${d.missatge || ""}`, "fail") }
      } catch {}
    }
    es.onerror = () => { es.close(); fi() }
  } catch (err) { log(`ERROR: ${err.message}`, "fail"); fi() }

  function fi() {
    const el = ((Date.now() - start) / 1000).toFixed(1)
    log("---", "sep"); log(`Fet: ${ok}/${scannedFiles.length} en ${el}s`, "ok")
    if (skip > 0) log(`${skip} omesa/es (ja existien)`, "skip")
    if (fail > 0) log(`${fail} error/s`, "fail")
    if (ok > 0) log(`Mida total: ${fmt(mida)}`, "ok")
    convertBtn.disabled = false; convertBtn.textContent = activeTool === "vectors" ? "Optimitza" : "Convertir"
    toast(`Fet: ${ok}/${scannedFiles.length} en ${el}s`, ok > 0 ? "success" : "error")
  }
})

function log(t, c) { const e = document.createElement("div"); e.className = c; e.textContent = t; statusLog.appendChild(e); statusLog.scrollTop = statusLog.scrollHeight }
function toast(m, t) { const e = document.createElement("div"); e.className = `toast ${t}`; e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 3000) }
function fmt(b) { if (b < 1024) return `${b}B`; if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`; return `${(b / 1048576).toFixed(1)}MB` }

// Engegar
HOME = document.documentElement.dataset.home || "/Users"
initTree(treeOrigen, false)
initTree(treeSortida, true)
