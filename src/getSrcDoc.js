function getSrcDoc({ babelOutput, error, css }) {
    if (error) {
        return `<html lang="en">
      <head>
          <meta charset="utf-8">
          <style>body {background-color:#FFFFFF}</style>
      </head>
  
      <body>
         <pre>
         <code>
          ${error}
          </code>
         </pre>
      </body>
  </html>`;
    }
    return `<html lang="en">
  <head>
      <meta charset="utf-8">
  </head>

  <body>
      <div id="app" style="background-color: grey; height:100%; width:100%;"></div>
      <script crossorigin src="https://unpkg.com/react/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
      <script>
      try {
          ${babelOutput}
      } catch (e) {
          const body = document.getElementsByTagName("body")[0];
          const pre = document.createElement("pre");
          pre.innerHTML = e;
          body.appendChild(pre);
      }
      </script>
  </body>
</html>`;
}

export { getSrcDoc };
