const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const zlib = require("zlib");

let xor = (str, key) => {
  str = String(str)
    .split("")
    .map((letter) => letter.charCodeAt());
  let res = "";
  for (i = 0; i < str.length; i++) res += String.fromCodePoint(str[i] ^ key);
  return res;
};

let obj = {};
obj.dialog = {};
obj.dialog.saveFile = async (a) => ipcRenderer.invoke("dialog", "save", a);
obj.LOCALAPPDATA = process.env.LOCALAPPDATA;
obj.fs = {
  writeFileSync: (...a) => fs.writeFileSync(...a),
  readFileSync: (...a) => fs.readFileSync(...a),
  existsSync: (...a) => fs.existsSync(...a),
};
obj.decode = (data) => {
  if (data.startsWith('<?xml version="1.0"?>')) return data;

  try {
    let str = xor(data, 11);
    str = Buffer.from(str, "base64");

    return zlib.unzipSync(str).toString();
  } catch (e) {
    console.log(e);
  }
};
obj.encode = (data) => {
  if (!data.startsWith("<k>kCEK</k>")) return data;

  try {
    let str = zlib.gzipSync(data);
    str = str.toString("base64");

    return xor(str, 11);
  } catch (e) {
    console.log(e);
  }
};

contextBridge.exposeInMainWorld("electronAPI", obj);
