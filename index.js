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
    title: "GD Save",
  });

  ipcMain.handle("dialog", async (e, f, a) => {
    let F = f === "save" ? "showSaveDialogSync" : "showOpenDialogSync";
    let xd = await dialog[F](win, a);
    return xd;
  });

  win.loadFile(__dirname + "/src/html/index.html");
});
