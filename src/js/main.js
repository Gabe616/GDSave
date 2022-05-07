let btn = document.getElementById("switch");
let input = document.getElementById("input");
let output = document.getElementById("output");

btn.addEventListener("click", () => {
  input.style.display = input.style.display === "none" ? "block" : "none";
  output.style.display = output.style.display === "none" ? "block" : "none";
});
