(() => {
  const btn = document.createElement("button");
  btn.id = "llm-node-toggle";
  btn.textContent = "≡";
  document.body.appendChild(btn);

  const iframe = document.createElement("iframe");
  iframe.id = "llm-node-sidebar";
  iframe.src = chrome.runtime.getURL("sidebar/dist/index.html");
  document.body.appendChild(iframe);

  let visible = false;
  btn.addEventListener("click", () => {
    visible = !visible;
    iframe.style.right = visible ? "0" : "-400px";
  });
})();
