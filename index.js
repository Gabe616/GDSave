const {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  ipcRenderer,
} = require("electron");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 900,
    height: 750,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: __dirname + "/src/js/preload.js",
    },
    icon: __dirname + "/src/icon/icon.ico",
    title: "GD Save",
  });

  let yes = true;

  setInterval(() => {
    if (yes) win.setMenuBarVisibility(false);
  }, 1);

  ipcMain.handle("dialog", async (e, f, a) => {
    let F = f === "save" ? "showSaveDialogSync" : "showOpenDialogSync";
    let xd = await dialog[F](win, a);
    return xd;
  });

  win.on("closed", () => {
    yes = false;
  });

  win.loadFile(__dirname + "/src/html/index.html");
});
