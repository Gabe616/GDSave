const { BrowserWindow, app, dialog, ipcMain } = require("electron");

app.whenReady().then(() => {
  let open = process.argv.filter((x) => x.endsWith(".gdsave"))[0];

  const win = new BrowserWindow({
    width: !open ? 900 : 800,
    height: !open ? 750 : 560,
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

  win.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.key.toLowerCase() === "r") {
      if (open) event.preventDefault();
    }
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

  ipcMain.handle("qopen", () => open);

  win.on("closed", () => {
    yes = false;
  });

  win.loadFile(__dirname + "/src/html/index.html");
});
