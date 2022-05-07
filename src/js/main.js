const { dialog, LOCALAPPDATA, fs, decode, encode, quickopen } =
  window.electronAPI;
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
let qopen;

let btn = document.getElementById("switch");
let input = document.getElementById("input");
let output = document.getElementById("output");
let olst = document.getElementById("olst");
let load = document.getElementById("loading");
let ltxt = load.querySelector("h2");
let limg = load.querySelector("img");
let f = document.getElementById("fsl");
let fnp = document.getElementById("finp");

let gdexists = false;
let lcl = LOCALAPPDATA;
let gdexistserr = "Couldn't find your AppData/Local!\n(how???)";

if (lcl) {
  let path = lcl + "\\GeometryDash";
  gdexistserr = "Couldn't find your GD Data!\nTried to look in:\n" + path;
  if (fs.existsSync(path)) {
    path += "\\CCLocalLevels.dat";
    gdexistserr =
      "Couldn't find your CCLocalLevels.dat!\nTried to look in:\n" + path;
    if (fs.existsSync(path)) gdexists = path;
  }
}

let checking = false;

let getLevels = () => {
  let dt = fs.readFileSync(gdexists, "utf8");
  return decode(dt);
};

let uload = async (img, txt) => {
  input.style.display = "none";
  output.style.display = "none";
  load.style.display = "flex";
  txt = txt.replace(/\n/g, "<br/>");

  if (img == "load") {
    limg.classList.remove("bouncy");
    limg.src = "../img/loading.png";
    checking = true;
  } else {
    if (!limg.classList.contains("bouncy")) limg.classList.add("bouncy");
    yes = !yes;
    limg.src =
      img === "error"
        ? "../img/exMark_001.png"
        : "../img/GJ_completesIcon_001.png";
    checking = false;
  }

  ltxt.innerHTML = txt;
  await wait(50);
};

const inppFile = async (fl) => {
  if (fl.name.endsWith(".gdsave")) {
    if (!gdexists) return await uload("error", gdexistserr);

    await uload("load", `Reading ${fl.name}...`);
    let reader = new FileReader();
    reader.onload = async (txt) => {
      inpFile(txt.target.result);
    };
    reader.readAsText(fl);
  }
};

const inpFile = async (txt) => {
  await uload("load", "Decoding...");
  let dtxt = decode(txt, 11);
  if (!dtxt) return await uload("error", "File is corrupt!");

  await uload("load", "Decoding levels...");

  let svs = getLevels();
  if (!svs) return await uload("error", "File is corrupt!");

  await uload("load", "Adding level...");

  let dt = svs.split("<k>_isArr</k><t />");
  dt[1] = dt[1].replace(
    /<k>k_([0-9]+)<\/k><d><k>kCEK<\/k>/g,
    (n) => `<k>k_${parseInt(n.slice(5).split("<")[0]) + 1}</k><d><k>kCEK</k>`
  );
  dt = `${dt[0]}<k>_isArr</k><t /><k>k_0</k><d>${dtxt}</d>${dt[1]}`;

  fs.writeFileSync(gdexists, encode(dt));

  await uload("success", "Saved!");
};

let olist = [];

const outFile = async (dt) => {
  await uload("load", "Encoding...");

  let bl = encode(dt);
  if (!bl) return await uload("error", "File is corrupt!");

  await uload("load", "Prompting...");

  let fld = await dialog.saveFile({
    filters: [
      {
        name: "GDSave",
        extensions: ["gdsave"],
      },
      {
        name: "All Files",
        extensions: ["*"],
      },
    ],
  });
  if (!fld) return await uload("error", "No file specfified!");

  await uload("load", "Saving...");
  fs.writeFileSync(fld, bl);
  await uload("success", "Saved!");
};

let yes = false;

btn.addEventListener("click", () => {
  if (checking) return;
  if (qopen) return window.close();

  load.style.display = "none";
  yes = !yes;
  input.style.display = yes ? "none" : "flex";
  output.style.display = yes ? "flex" : "none";

  olst.innerHTML = "";
  olist = [];
  if (yes) {
    let lvs = getLevels();
    let lst = lvs.split("<k>_isArr</k><t />")[1].split("</d><k>LLM_02</k>")[0];
    let list = lst.split(/<k>k_[0-9]+<\/k>/).slice(1);

    olst.innerHTML = list
      .map((x, y) => {
        let name = x.match(/<k>k2<\/k><s>([^<]+)<\/s>/)[1];
        let len = x.match(/<k>k23<\/k><i>([^<]+)<\/i>/);
        let vef = x.match(/<k>k14<\/k><t ?\/>/);
        let id = x.match(/<k>k1<\/k><i>([^<]+)<\/i>/);

        x = x
          .replace(/<k>k1<\/k><i>([^<]+)<\/i>/, "")
          .replace(/<k>k16<\/k><i>([^<]+)<\/i>/, "")
          .replace(/<k>k90<\/k><i>([^<]+)<\/i>/, "")
          .replace(/<k>k15<\/k><t ?\/>/, "")
          .replace(/<k>k89<\/k><t ?\/>/, "");

        len = len
          ? ["Tiny", "Short", "Medium", "Long", "XL"][parseInt(len[1])]
          : "Tiny";
        vef = id ? "Uploaded" : vef ? "Verified" : "Unverified";

        olist[y] = x.slice(3, -4);
        return `<div class="lvl"><span><img src="../img/GJ_downloadBtn_001.png" data-order="${y}" class="button"><b>${name}</b> ${len}, ${vef}</span></div>`;
      })
      .join("\n");

    olst.querySelectorAll(".button").forEach((el, i) => {
      el.addEventListener("click", () => {
        let l = parseInt(el.attributes["data-order"].value);
        outFile(olist[l]);
      });
    });
  }
});

f.addEventListener("dragover", (e) => {
  f.classList.add("lighter");
  e.preventDefault();
});
f.addEventListener("dragleave", () => {
  f.classList.remove("lighter");
});
f.addEventListener("drop", (e) => {
  e.preventDefault();
  f.classList.remove("lighter");

  let fl = e.dataTransfer.files[0];
  if (fl) {
    inppFile(fl);
  }
});
fnp.addEventListener("change", (e) => {
  let fl = fnp.files[0];
  fnp.value = "";
  if (fl) {
    inppFile(fl);
  }
});

if (!gdexists) uload("error", gdexistserr);

(async () => {
  qopen = await quickopen();
  if (qopen) {
    inpFile(fs.readFileSync(qopen, "utf8"));
  }
})();
