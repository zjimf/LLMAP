import * as d3 from 'd3';

type Message = {
    id: string;
    text: string;
    speaker: 'user' | 'assistant';
    children: Message[];
    parent: string | null;
};

/**
 * @description setting up the UI
 */
function setupUI() {
    const btn = document.createElement('button');
    btn.textContent = '☰';
    Object.assign(btn.style, {
        position: 'fixed',
        top: '50px',
        left: '10px',
        zIndex: '10000',
        padding: '8px 12px',
        fontSize: '18px',
        cursor: 'pointer',
        background: 'linear-gradient(135deg,#0ff,#06f)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        transition: 'transform 0.2s, box-shadow 0.2s',
    });
    // Hover 效果
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.1)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });
    document.body.appendChild(btn);

    const sidebar = document.createElement('div');
    sidebar.id = 'chatgpt-graph-sidebar';
    Object.assign(sidebar.style, {
        position: 'fixed', top: '0', right: '-320px', width: '320px', height: '100%',
        background: 'linear-gradient(to bottom, #1a1a2e, #16213e)', color: '#eaeaea',
        fontFamily: 'Consolas, Monaco, monospace', transition: 'right 0.4s cubic-bezier(.25,.8,.25,1)',
        zIndex: '9999', overflowY: 'auto', paddingTop: '48px', backdropFilter: 'blur(4px)',
    });
    // Close 按鈕
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, { position: 'absolute', top: '10px', right: '10px', fontSize: '18px', cursor: 'pointer', color: '#fff' });
    sidebar.appendChild(closeBtn);
    closeBtn.addEventListener('click', () => { sidebar.style.right = '-320px'; open = false; });

    const container = document.createElement('div');
    container.id = 'sidebar-root';
    Object.assign(container.style, { padding: '16px' });
    sidebar.appendChild(container);
    document.body.appendChild(sidebar);

    let open = false;
    btn.addEventListener('click', () => {
        sidebar.style.right = open ? '-320px' : '0';
        open = !open;
        if (open) renderGraph();
    });
}

/**
 * @description fetch full conversation JSON mapping
 */
async function fetchConversationJson(): Promise<Record<string, any>> {
    const session = await fetch('/api/auth/session', { credentials: 'include' }).then(r => r.json());
    const token = session.accessToken;
    const convId = window.location.pathname.split('/').pop();
    const url = `/backend-api/conversation/${convId}`;
    const res = await fetch(url, { credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    return json.mapping;
}

/**
 * @description build hierarchy data from JSON map
 */
function buildTree(raw: Record<string, any>): Message {
    const entries = Object.entries(raw) as [string, any][];
    const [rootId] = entries.find(([_, node]) => node.parent === null)!;
    function recurse(id: string): Message {
        const node = raw[id];
        const msg = node.message;
        const parts = msg?.content?.parts;
        const text = Array.isArray(parts) ? parts.join(' ').trim() : '';
        const speaker = msg?.author?.role === 'user' ? 'user' : 'assistant';
        const children = node.children.map((cid: string) => recurse(cid));
        return { id, text, speaker, children, parent: node.parent };
    }
    return recurse(rootId);
}

/**
 * @description render the graph with custom layout
 */
async function renderGraph() {
    const mapping = await fetchConversationJson();
    const treeData = buildTree(mapping);

    const width = 320;
    const height = window.innerHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // 2. flatten and collect only nodes with text
    const nodes: { data: Message; depth: number }[] = [];
    function collect(node: Message, depth = 0) {
        if (node.text) nodes.push({ data: node, depth });
        node.children.forEach(child => collect(child, depth + 1));
    }
    collect(treeData);

    const minDepth = d3.min(nodes, d => d.depth)!;
    const maxDepth = d3.max(nodes, d => d.depth)!;
    const groupByDepth = d3.group(nodes, d => d.depth);
    const levelCount = maxDepth - minDepth || 1;
    const levelHeight = (height - margin.top - margin.bottom) / levelCount;

    const positioned = nodes.map(({ data, depth }) => {
        const layer = groupByDepth.get(depth)!;
        const idx = layer.findIndex(d => d.data.id === data.id);
        const n = layer.length;
        const availWidth = width - margin.left - margin.right;
        const x = n === 1 ? margin.left + availWidth / 2 : margin.left + (availWidth) * idx / (n - 1);
        const relDepth = depth - minDepth;
        const y = margin.top + relDepth * levelHeight;
        return { data, depth, x, y };
    });

    const svg = d3.select('#sidebar-root')
        .selectAll<SVGSVGElement, unknown>('svg')
        .data([null])
        .join('svg')
        .attr('width', width)
        .attr('height', height);
    svg.selectAll('*').remove();

    // draw parent-child links (skipping hidden intermediate nodes)
    positioned.forEach(node => {
        let parentId = node.data.parent;
        let parentPos: typeof node | undefined;
        while (parentId) {
            parentPos = positioned.find(p => p.data.id === parentId);
            if (parentPos) break;
            parentId = mapping[parentId]?.parent;
        }
        if (!parentPos) return;
        svg.append('line')
            .attr('x1', parentPos.x)
            .attr('y1', parentPos.y)
            .attr('x2', node.x)
            .attr('y2', node.y)
            .attr('stroke', '#555')
            .attr('stroke-width', 1)
            .style('mix-blend-mode', 'screen');
    });

    // draw nodes
    const nodeSel = svg.append('g')
        .selectAll<SVGCircleElement, typeof positioned[0]>('circle')
        .data(positioned)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 6)
        .attr('fill', d => d.data.speaker === 'assistant' ? '#1E90FF' : '#FF6347')
        .attr('stroke', '#0ff')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseenter', function () { d3.select(this).transition().duration(200).attr('r', 10); })
        .on('mouseleave', function () { d3.select(this).transition().duration(200).attr('r', 6); });

    nodeSel.append('title').text(d => d.data.text.length > 50 ? d.data.text.slice(0, 50) + '…' : d.data.text);

    nodeSel.on('click', (_e, d) => {
        const el = document.querySelector(`article[data-id="${d.data.id}"]`);
        if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

// initialize
setupUI();