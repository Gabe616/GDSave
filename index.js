const { BrowserWindow, app } = require("electron");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minimizable: true,
    autoHideMenuBar: true,
    title: "GD Save",
  });

  win.loadFile(__dirname + "/src/html/index.html");
});
