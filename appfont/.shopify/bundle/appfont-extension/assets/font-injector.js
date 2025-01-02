// font-injector.js
function injectFontCSS(fontName, fontFileURL) {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    
    const cssContent = `
      @font-face {
        font-family: "${fontName}";
        src: url("${fontFileURL}.woff2") format("woff2"),
             url("${fontFileURL}.woff") format("woff");
      }
      h1, h2, h3, h4, h5, h6, body, p, a {
        font-family: "${fontName}" !important;
      }
    `;
    
    styleElement.appendChild(document.createTextNode(cssContent));
    document.head.appendChild(styleElement);
  }
  
  window.injectFontCSS = injectFontCSS;
  