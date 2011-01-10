firefoxblackbox.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ firefoxblackbox.showFirefoxContextMenu(e); }, false);
};

firefoxblackbox.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-firefoxblackbox").hidden = gContextMenu.onImage;
};

window.addEventListener("load", firefoxblackbox.onFirefoxLoad, false);
