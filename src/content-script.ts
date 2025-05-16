import * as d3 from 'd3';

type Message = { id: number; text: string; speaker: 'user' | 'assistant' };

// 1. 注入按鈕與側邊欄
function setupUI() {
    const btn = document.createElement('button');
    btn.textContent = '☰';
    Object.assign(btn.style, {
        position: 'fixed', top: '10px', left: '10px', zIndex: '10000', padding: '8px', fontSize: '16px', cursor: 'pointer'
    });
    document.body.appendChild(btn);

    const sidebar = document.createElement('div');
    sidebar.id = 'chatgpt-graph-sidebar';
    Object.assign(sidebar.style, {
        position: 'fixed', top: '0', right: '-320px', width: '320px', height: '100%',
        backgroundColor: '#fff', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)', transition: 'right 0.3s',
        zIndex: '9999', overflow: 'auto'
    });
    const container = document.createElement('div');
    container.id = 'sidebar-root';
    container.style.padding = '16px';
    sidebar.appendChild(container);
    document.body.appendChild(sidebar);

    let open = false;
    btn.addEventListener('click', () => {
        sidebar.style.right = open ? '-320px' : '0';
        open = !open;
        if (open) renderGraph();
    });
}

// 2. 抓取對話訊息
function fetchMessages(): Message[] {
    const articles = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn"]'));
    return articles.map((article, idx) => ({
        id: idx,
        speaker: !!article.querySelector('h5.sr-only') ? 'user' : 'assistant',
        text: (article.querySelector('div.text-message, div.markdown')?.textContent || '').trim()
    }));
}

// 3. 繪製簡單結構圖（無拖曳）
function renderGraph() {
    const data = fetchMessages();
    const width = 320;
    const height = window.innerHeight;
    const svg = d3.select('#sidebar-root')
        .selectAll<SVGSVGElement, unknown>('svg')
        .data([null])
        .join('svg')
        .attr('width', width)
        .attr('height', height);

    svg.selectAll('*').remove();

    // 計算節點位置：垂直等分
    const nodes = data.map((d, i) => ({
        ...d,
        x: width / 2,
        y: (i + 1) * (height / (data.length + 1))
    }));

    // 繪製連線
    svg.append('g')
        .selectAll('line')
        .data(nodes.slice(1))
        .join('line')
        .attr('x1', () => width / 2)
        .attr('y1', (_d, i) => nodes[i].y)
        .attr('x2', d => d.x)
        .attr('y2', d => d.y)
        .attr('stroke', '#999')
        .attr('stroke-width', 1);

    // 繪製節點並加入 hover 提示
    svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 12)
        .attr('fill', d => d.speaker === 'assistant' ? '#1E90FF' : '#FF6347')
        .append('title')
        .text(d => d.text);
}

// 4. 初始化
setupUI();