const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: '#FBFCFC',
    title: 'Дозатор — расчёт доз и рецепты',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Внешние ссылки открываем в браузере, а не внутри приложения
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function buildMenu() {
  const template = [
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Печать',
          accelerator: 'CmdOrCtrl+P',
          click: () => win && win.webContents.print({})
        },
        {
          label: 'Сохранить как PDF',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: async () => {
            if (!win) return;
            const { dialog } = require('electron');
            const data = await win.webContents.printToPDF({ printBackground: false });
            const { canceled, filePath } = await dialog.showSaveDialog(win, {
              defaultPath: 'recept.pdf',
              filters: [{ name: 'PDF', extensions: ['pdf'] }]
            });
            if (!canceled && filePath) require('fs').writeFileSync(filePath, data);
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Выход' }
      ]
    },
    {
      label: 'Правка',
      submenu: [
        { role: 'undo', label: 'Отменить' },
        { role: 'redo', label: 'Повторить' },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { role: 'selectAll', label: 'Выделить всё' }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { role: 'resetZoom', label: 'Обычный масштаб' },
        { role: 'zoomIn', label: 'Крупнее' },
        { role: 'zoomOut', label: 'Мельче' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Полный экран' },
        { role: 'reload', label: 'Обновить' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
