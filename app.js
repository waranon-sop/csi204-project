// ──────────────────────────────────────────
//  app.js  —  Re-wear Project Docs
// ──────────────────────────────────────────

// ── Remove inline TOC section from markdown (sidebar handles navigation) ──
function removeToc(text) {
    // Match a "สารบัญ" heading block and remove it along with its list items
    // Stops at the next heading (## or ---) using a non-greedy match
    return text.replace(
        /^#{1,3}[^\n]*สารบัญ[^\n]*\n[\s\S]*?(?=\n#{1,3}\s|\n---)/im,
        ''
    );
}

// ── Fix image paths for files inside /docs subfolder ──
function fixImagePaths(text, filePath) {
    if (!filePath.startsWith('docs/')) return text;
    // Prefix relative image paths with docs/ if not already prefixed
    return text.replace(/!\[([^\]]*)\]\((?!https?:\/\/|docs\/)([^)]+)\)/g, '![$1](docs/$2)');
}

// ── Strip leading emoji/symbols from heading text for TOC ──
function cleanHeadingText(text) {
    // Remove common emoji and leading symbols, then trim
    return text
        .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}✅☑️🔲#*\-\s]+/gu, '')
        .trim();
}

// ── Build sidebar Table of Contents ──
function buildToc(contentEl) {
    const headings = contentEl.querySelectorAll('h2, h3');
    const list     = document.getElementById('toc-list');
    list.innerHTML = '';

    if (!headings.length) {
        list.innerHTML = '<li><a class="toc-empty">ไม่มีหัวข้อ</a></li>';
        return;
    }

    headings.forEach((heading, i) => {
        // Give each heading an ID for anchor scrolling
        heading.id = 'h-' + i;

        const li = document.createElement('li');
        const a  = document.createElement('a');

        // Use cleaned text so emoji/numbers don't clutter the TOC
        const label = cleanHeadingText(heading.textContent);
        a.textContent = label || heading.textContent.trim();
        a.href        = '#';
        a.className   = heading.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
        a.title       = heading.textContent.trim(); // full text on hover

        a.addEventListener('click', (e) => {
            e.preventDefault();
            // Offset by topbar height (44px) + a little breathing room
            const topbarHeight = 52;
            const top = heading.getBoundingClientRect().top
                        + document.getElementById('main').scrollTop
                        - topbarHeight;
            document.getElementById('main').scrollTo({ top, behavior: 'smooth' });

            // Highlight active TOC item
            document.querySelectorAll('#toc-list a').forEach(el => el.classList.remove('toc-active'));
            a.classList.add('toc-active');
        });

        li.appendChild(a);
        list.appendChild(li);
    });
}

// ── Fade transition helper ──
function fadeIn(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    // Force reflow
    void el.offsetHeight;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
}

// ── Load and render a Markdown file ──
function loadFile(filePath, btnId, displayLabel) {

    // Update active nav button
    document.querySelectorAll('.file-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(btnId).classList.add('active');

    // Update breadcrumb
    document.getElementById('crumb-name').textContent = displayLabel;

    // Show loading state
    const content = document.getElementById('content');
    content.classList.add('loading-msg');
    content.innerHTML = '<span class="spinner"></span> กำลังโหลดเนื้อหา...';

    // Scroll #main to top (not window, since sidebar is fixed)
    document.getElementById('main').scrollTo({ top: 0 });

    fetch(filePath)
        .then(res => {
            if (!res.ok) throw new Error('Not found: ' + filePath);
            return res.text();
        })
        .then(text => {
            text = removeToc(text);
            text = fixImagePaths(text, filePath);

            content.classList.remove('loading-msg');
            content.innerHTML = marked.parse(text);

            // Smooth fade-in
            fadeIn(content);

            // Scroll to top of main again after content is set
            document.getElementById('main').scrollTo({ top: 0, behavior: 'instant' });

            // Build sidebar TOC from rendered headings
            buildToc(content);

            // Render Mermaid diagrams dynamically
            if (window.mermaid) {
                const mermaidBlocks = content.querySelectorAll('pre code.language-mermaid');
                if (mermaidBlocks.length > 0) {
                    // Use timestamp to avoid ID collision when user re-loads the same file
                    const runId = Date.now();
                    const mermaidNodes = [];

                    mermaidBlocks.forEach((block, index) => {
                        const rawCode = block.textContent;
                        const preElement = block.parentElement;

                        const container = document.createElement('div');
                        container.className = 'mermaid-container';

                        const mermaidDiv = document.createElement('div');
                        mermaidDiv.className = 'mermaid';
                        mermaidDiv.id = `mermaid-${runId}-${index}`; // unique ID per render session
                        mermaidDiv.textContent = rawCode;

                        container.appendChild(mermaidDiv);
                        preElement.replaceWith(container);
                        mermaidNodes.push(mermaidDiv);
                    });

                    // Run after all DOM replacements are complete
                    try {
                        window.mermaid.run({ nodes: mermaidNodes });
                    } catch (err) {
                        console.error('Mermaid render error:', err);
                    }
                }
            }
        })
        .catch((err) => {
            content.classList.remove('loading-msg');
            content.innerHTML = `
                <div class="error-box">
                    <strong>⚠️ ไม่สามารถโหลดไฟล์ได้</strong>
                    <p>กรุณาเปิดผ่าน <code>Live Server</code> ใน VS Code<br>
                    และตรวจสอบว่าไฟล์ <code>${filePath}</code> มีอยู่จริง</p>
                </div>`;
            console.error(err);
        });
}

// ── Highlight TOC item on scroll ──
function onMainScroll() {
    const main     = document.getElementById('main');
    const headings = document.querySelectorAll('#content h2, #content h3');
    const tocLinks = document.querySelectorAll('#toc-list a');
    if (!headings.length) return;

    const scrollTop = main.scrollTop + 70;
    let activeIndex = 0;

    headings.forEach((h, i) => {
        if (h.offsetTop <= scrollTop) activeIndex = i;
    });

    tocLinks.forEach((a, i) => {
        a.classList.toggle('toc-active', i === activeIndex);
    });
}

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
    // Initialize Mermaid config
    if (window.mermaid) {
        window.mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true }
        });
    }

    // Make #main scrollable (not window) so sidebar stays fixed
    document.getElementById('main').addEventListener('scroll', onMainScroll);

    // Load README on startup
    loadFile('README.md', 'btn-readme', 'README.md');
});
