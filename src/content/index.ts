interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

// extract all chat messages from the page
function extractChatMessages(): ChatMessage[] {
    const turnEls = Array.from(
        document.querySelectorAll<HTMLTitleElement>(
            'article[data-testid^="conversation-turn-"]'
        )
    );
    const messages: ChatMessage[] = [];

    turnEls.forEach((el, index) => {
        const msgDiv = el.querySelector<HTMLElement>(
            'div[data-message-id][data-message-author-role]'
        );
        if (!msgDiv) return;

        const id = msgDiv.getAttribute('data-message-id') || `msg-${index}`;
        const roleAttr = msgDiv.getAttribute('data-message-author-role');
        const role: 'user' | 'assistant' =
            roleAttr === 'user' ? 'user' : 'assistant';

        const textEl = el.querySelector<HTMLElement>('div.whitespace-pre-wrap');
        const text = textEl?.innerText.trim() ?? '';

        messages.push({ id, role, text });
    });

    return messages;
}

// send messages to background script
function relayMessages() {
    const msgs = extractChatMessages();
    chrome.runtime.sendMessage({
        type: 'CHAT_MESSAGES',
        payload: msgs,
    });
}

relayMessages();

// observe for changes in the chat messages
const observer = new MutationObserver(() => {
    relayMessages();
});
observer.observe(document.body, {
    childList: true,
    subtree: true,
});
