document.addEventListener("DOMContentLoaded", () => {
  const inputs = Array.from(document.querySelectorAll("input, select, textarea"))

  inputs.forEach((input, index) => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault()
        const next = inputs[index + 1]
        if (next) next.focus()
      }
    })
  })
})

document.querySelectorAll(".drop-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation()
    const menu = btn.nextElementSibling
    document.querySelectorAll(".drop-menu").forEach(m => {
      if (m !== menu) m.style.display = "none"
    })
    menu.style.display = menu.style.display === "flex" ? "none" : "flex"
  })
})

document.addEventListener("click", () => {
  document.querySelectorAll(".drop-menu").forEach(m => m.style.display = "none")
})
