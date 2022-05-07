let btn = document.getElementById("switch");
let input = document.getElementById("input");
let output = document.getElementById("output");
let load = document.getElementById("loading");
let ltxt = load.querySelector("h2");
let limg = load.querySelector("img");
let f = document.getElementById("fsl");
let fnp = document.getElementById("finp");

let checking = true;

let xor = (str, key) => {
  str = String(str)
    .split("")
    .map((letter) => letter.charCodeAt());
  let res = "";
  for (i = 0; i < str.length; i++) res += String.fromCodePoint(str[i] ^ key);
  return res;
};

let urlB64 = (str) => {
  return Base64.atob(str.replace(/_/g, "/").replace(/-/g, "+"));
};

let decode = (data, key) => {
  if (data.startsWith('<?xml version="1.0"?>')) return data;

  try {
    let str = key ? xor(data, key) : data;
    str = urlB64(str, true);
    str = new Uint8Array(str.split("").map((x) => x.charCodeAt(0)));

    return pako.inflate(str, { to: "string" });
  } catch (e) {
    console.log(e);
  }
};

const inpFile = (fl) => {
  if (fl.name.endsWith(".gdsave")) {
    console.log(fl);
    input.style.display = "none";
    load.style.display = "flex";

    ltxt.textContent = `Reading ${fl.name}...`;

    let reader = new FileReader();
    reader.onload = (txt) => {
      ltxt.textContent = "Decoding...";
      let dtxt = decode(txt.target.result, 11);
      if (!dtxt) ltxt.textContent = `Failed to decode!`;

      console.log(dtxt);
      limg.classList.add("bouncy");
      limg.src = "../img/GJ_completesIcon_001.png";
      ltxt.textContent = "We're gonna pretend this works alruight!";
      checking = false;
    };
    reader.readAsText(fl);
  }
};

let yes = false;

btn.addEventListener("click", () => {
  if (checking) return;
  load.style.display = "none";
  yes = !yes;
  input.style.display = yes ? "none" : "flex";
  output.style.display = yes ? "flex" : "none";
});

f.addEventListener("dragover", (e) => {
  f.classList.add("lighter");
  e.preventDefault();
});
f.addEventListener("dragleave", () => {
  f.classList.remove("lighter");
});
f.addEventListener("drop", (e) => {
  f.classList.remove("lighter");

  let fl = e.dataTransfer.files[0];
  if (fl) {
    inpFile(fl);
  }

  e.preventDefault();
});
fnp.addEventListener("change", () => {
  if (fnp.files[0]) {
    inpFile(fnp.files[0]);
  }
});
