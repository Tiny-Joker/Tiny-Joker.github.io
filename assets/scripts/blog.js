/* global md */
(function () {
    "use strict";

    var root = null;

    function getRoot() {
        return document.getElementById("blog-root");
    }

    function escapeHtml(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function loadPosts() {
        return fetch("./assets/data/posts.json")
            .then(function (res) {
                if (!res.ok) throw new Error("文章清单读取失败 (HTTP " + res.status + ")");
                return res.json();
            });
    }

    function fetchMarkdown(file) {
        return fetch(file).then(function (res) {
            if (!res.ok) throw new Error("文章读取失败: " + file + " (HTTP " + res.status + ")");
            return res.text();
        });
    }

    function renderList(posts) {
        if (!posts || !posts.length) {
            root.innerHTML = '<p class="blog-empty">还没有文章哦~</p>';
            return;
        }
        var items = posts.map(function (p) {
            var tags = (p.tags && p.tags.length)
                ? '<span class="post-tags">' + p.tags.map(escapeHtml).join(" · ") + "</span>"
                : "";
            var excerpt = p.excerpt
                ? '<span class="post-excerpt">' + escapeHtml(p.excerpt) + "</span>"
                : "";
            return (
                '<li class="post-item">' +
                '<a class="post-link" href="#!/post/' + encodeURIComponent(p.file) + '">' +
                '<span class="post-title">' + escapeHtml(p.title) + "</span>" +
                '<span class="post-meta"><span class="post-date">' + escapeHtml(p.date) + "</span>" + tags + "</span>" +
                excerpt +
                "</a></li>"
            );
        }).join("");

        root.innerHTML =
            '<h2 class="blog-h2"><i class="fa-solid fa-book-open"></i> 文章</h2>' +
            '<ul class="post-list">' + items + "</ul>";
    }

    function renderPost(file) {
        return fetchMarkdown(file).then(function (text) {
            var html = (typeof md !== "undefined" && md.render) ? md.render(text) : "<pre>" + escapeHtml(text) + "</pre>";
            root.innerHTML =
                '<a class="post-back" href="#!/posts"><i class="fa-solid fa-arrow-left"></i> 返回文章列表</a>' +
                '<article class="post-article">' + html + "</article>";
            if (window.scrollTo) window.scrollTo(0, 0);
        });
    }

    function showError(msg) {
        root.innerHTML = '<p class="blog-error"><i class="fa-solid fa-triangle-exclamation"></i> ' + escapeHtml(msg) + "</p>";
    }

    function route() {
        root = getRoot();
        if (!root) return;

        var hash = location.hash || "";
        if (hash.indexOf("#!/post/") === 0) {
            var file = decodeURIComponent(hash.slice("#!/post/".length));
            renderPost(file).catch(showError);
        } else {
            loadPosts().then(renderList).catch(showError);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", route);
    } else {
        route();
    }
    window.addEventListener("hashchange", route);
})();
