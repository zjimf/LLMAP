function injectButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = '☰';
    Object.assign(btn.style, {
        position: 'fixed',
        top: '30px',
        left: '10px',
        zIndex: '10000',
        padding: '8px',
        fontSize: '16px',
        cursor: 'pointer'
    });
    document.body.appendChild(btn);
    return btn;
}

function injectSidebar(): HTMLDivElement {
    const sidebar = document.createElement('div');
    sidebar.id = 'my-chatgpt-sidebar';
    sidebar.textContent = '123';
    Object.assign(sidebar.style, {
        position: 'fixed',
        top: '0',
        right: '-300px',
        width: '300px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease-in-out',
        zIndex: '9999',
        padding: '16px',
        overflow: 'auto'
    });
    document.body.appendChild(sidebar);
    return sidebar;
}

// 3. 初始化注入
const btn = injectButton();
const sidebar = injectSidebar();
let isOpen = false;

// 4. 綁定按鈕點擊事件，切換側邊欄顯示
btn.addEventListener('click', () => {
    sidebar.style.right = isOpen ? '-300px' : '0';
    isOpen = !isOpen;
});