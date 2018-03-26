const electron = require('electron');
const path = require('path');
const url = require('url');

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load html in window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addWindow.on('close', function(){
    addWindow = null;
  });
}

function createDelPrompt(){
    delPrompt = new BrowserWindow({
      width: 300,
      height:200,
      title:'Are you sure?'
    });
    delPrompt.loadURL(url.format({
      pathname: path.join(__dirname, 'delPrompt.html'),
      protocol: 'file:',
      slashes:true
    }));
    // Handle garbage collection
    delPrompt.on('close', function(){
      delPrompt = null;
    });
}

// Catch open:add
ipcMain.on('open:addWindow', function(){
    createAddWindow();
});

  // Catch item:add
ipcMain.on('item:add', function(e, item){
  mainWindow.webContents.send('item:add', item);
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  //addWindow = null;
});

// Catch item:clear
ipcMain.on('item:clear', function(){
    mainWindow.webContents.send('item:clear');
  });


// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'File',
    submenu:[
      {
        label:'Add Item',
        accelerator:process.platform == 'darwin' ? 'Command+O': 'Ctrl+O',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          createDelPrompt();  
          
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
