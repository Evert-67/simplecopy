(function () {
    'use strict';

    const DEFAULT_SCOPE_SELECTORS = [
        '.scb-content-scope',
        '.wp-block-post-content',
        '.entry-content',
        '.post-content',
        '.page-content',
        'article',
        'main',
        'body'
    ];

    function closestScope(button) {
        const customScope = button.getAttribute('data-scb-scope');
        if (customScope) {
            const custom = button.closest(customScope) || document.querySelector(customScope);
            if (custom) return custom;
        }

        for (const selector of DEFAULT_SCOPE_SELECTORS) {
            const found = button.closest(selector);
            if (found) return found;
        }

        return document.body;
    }

    function getMarkers(scope) {
        return Array.from(scope.querySelectorAll('[data-scb-marker="1"]'));
    }

    function makeRange(scope, currentMarker) {
        const markers = getMarkers(scope);
        const currentIndex = markers.indexOf(currentMarker);
        const previousMarker = currentIndex > 0 ? markers[currentIndex - 1] : null;
        const range = document.createRange();

        if (previousMarker) {
            range.setStartAfter(previousMarker);
        } else {
            range.setStart(scope, 0);
        }

        range.setEndBefore(currentMarker);
        return range;
    }

    function cleanupClone(fragment, button) {
        // Remove copy buttons and wrappers from copied content.
        fragment.querySelectorAll('[data-scb-marker="1"], [data-scb-copy-button="1"]').forEach(function (node) {
            node.remove();
        });

        // Exclude common page titles unless explicitly requested.
        if (button.getAttribute('data-scb-include-title') !== '1') {
            fragment.querySelectorAll('.entry-title, .page-title, .post-title, .wp-block-post-title').forEach(function (node) {
                node.remove();
            });
        }

        // Remove optional custom exclusions.
        const exclude = button.getAttribute('data-scb-exclude');
        if (exclude) {
            try {
                fragment.querySelectorAll(exclude).forEach(function (node) {
                    node.remove();
                });
            } catch (e) {
                // Invalid selector: ignore silently.
            }
        }

        // Scripts/styles never belong on the clipboard.
        fragment.querySelectorAll('script, style, noscript').forEach(function (node) {
            node.remove();
        });
    }

    function fragmentToText(fragment) {
        const container = document.createElement('div');
        container.appendChild(fragment);

        // Add line breaks after common block elements so pasted text remains readable.
        container.querySelectorAll('br').forEach(function (br) {
            br.replaceWith('\n');
        });

        container.querySelectorAll('p, div, section, article, header, footer, li, tr, h1, h2, h3, h4, h5, h6, blockquote').forEach(function (el) {
            el.appendChild(document.createTextNode('\n'));
        });

        return (container.textContent || '')
            .replace(/\u00a0/g, ' ')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function fragmentToHtml(fragment) {
        const container = document.createElement('div');
        container.appendChild(fragment);
        return container.innerHTML.trim();
    }

    async function copyToClipboard(value, format) {
        if (!value) {
            throw new Error('Nothing to copy');
        }

        if (format === 'html' && navigator.clipboard && window.ClipboardItem) {
            const htmlBlob = new Blob([value], { type: 'text/html' });
            const textBlob = new Blob([value.replace(/<[^>]+>/g, ' ')], { type: 'text/plain' });
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': htmlBlob,
                    'text/plain': textBlob
                })
            ]);
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
            return;
        }

        // Fallback for older browsers.
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        const ok = document.execCommand('copy');
        textarea.remove();

        if (!ok) {
            throw new Error('Copy command failed');
        }
    }

    function flashLabel(button, text) {
        const label = button.querySelector('.scb-copy-label') || button;
        const original = label.textContent;
        label.textContent = text;
        button.classList.add('scb-copied');

        window.setTimeout(function () {
            label.textContent = original;
            button.classList.remove('scb-copied');
        }, 1600);
    }

    document.addEventListener('click', async function (event) {
        const button = event.target.closest('[data-scb-copy-button="1"]');
        if (!button) return;

        event.preventDefault();

        const marker = button.closest('[data-scb-marker="1"]');
        const scope = closestScope(button);
        const range = makeRange(scope, marker);
        const fragment = range.cloneContents();
        cleanupClone(fragment, button);

        const format = button.getAttribute('data-scb-format') === 'html' ? 'html' : 'text';
        const value = format === 'html' ? fragmentToHtml(fragment) : fragmentToText(fragment);

        try {
            await copyToClipboard(value, format);
            flashLabel(button, button.getAttribute('data-scb-copied-label') || 'Gekopieerd!');
        } catch (error) {
            flashLabel(button, button.getAttribute('data-scb-error-label') || 'Kopiëren mislukt');
        }
    });
}());
