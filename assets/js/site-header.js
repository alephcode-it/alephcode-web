(function () {
    "use strict";

    var header = document.getElementById("site-header");
    if (!header) {
        return;
    }

    var nav = document.getElementById("site-primary-nav");
    var toggle = header.querySelector(".site-header-toggle");
    var backdrop = header.querySelector(".site-header-backdrop");
    var menuItems = header.querySelectorAll(".site-nav-item.has-menu");
    var desktopQuery = window.matchMedia("(min-width: 992px)");
    var closeTimer = null;
    var scrollTicking = false;

    function isDesktop() {
        return desktopQuery.matches;
    }

    function setHeaderHeight() {
        header.style.setProperty("--site-header-h", header.offsetHeight + "px");
    }

    function closeMenus(exceptItem) {
        for (var i = 0; i < menuItems.length; i += 1) {
            var item = menuItems[i];
            if (item === exceptItem) {
                continue;
            }
            item.classList.remove("is-open");
            var trigger = item.querySelector(".site-nav-trigger");
            if (trigger) {
                trigger.setAttribute("aria-expanded", "false");
            }
        }
    }

    function openMenu(item) {
        if (!item) {
            return;
        }
        closeMenus(item);
        item.classList.add("is-open");
        var trigger = item.querySelector(".site-nav-trigger");
        var mega = item.querySelector(".site-mega");
        if (trigger) {
            trigger.setAttribute("aria-expanded", "true");
        }
        if (mega && isDesktop()) {
            keepMegaInView(mega);
        }
    }

    function toggleMenu(item) {
        if (item.classList.contains("is-open")) {
            closeMenus();
            return;
        }
        openMenu(item);
    }

    function keepMegaInView(mega) {
        mega.style.left = "0px";
        mega.style.right = "auto";
        var rect = mega.getBoundingClientRect();
        var margin = 12;
        if (rect.right > window.innerWidth - margin) {
            mega.style.left = "auto";
            mega.style.right = "0px";
            rect = mega.getBoundingClientRect();
            if (rect.left < margin) {
                mega.style.left = "0px";
                mega.style.right = "auto";
            }
        }
    }

    function setMobileOpen(open) {
        header.classList.toggle("is-open", open);
        document.documentElement.classList.toggle("site-nav-lock", open);
        if (toggle) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        }
        if (backdrop) {
            if (open) {
                backdrop.removeAttribute("hidden");
            } else {
                backdrop.setAttribute("hidden", "hidden");
            }
        }
        if (!open) {
            closeMenus();
        }
        setHeaderHeight();
    }

    function markActive() {
        var path = (window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
        var file = path.split("/").pop() || "";
        var key = "";

        if (!file || file === "index.html") {
            key = "";
        } else if (path.indexOf("/products") !== -1 || file.indexOf("products") === 0) {
            key = "products";
        } else if (path.indexOf("blog") !== -1) {
            key = "blog";
        } else if (file.indexOf("technology") === 0) {
            key = "technology";
        } else if (/^(about|team|careers|team-details)/.test(file)) {
            key = "company";
        } else if (/erp-solutions|e-commerce|migration-system|it-consulting/.test(file)) {
            key = "solutions";
        } else if (path.indexOf("/services/") !== -1 || file === "service.html") {
            key = "services";
        }

        var items = header.querySelectorAll(".site-nav-item[data-nav]");
        for (var i = 0; i < items.length; i += 1) {
            items[i].classList.toggle("is-active", items[i].getAttribute("data-nav") === key);
        }
    }

    function onScroll() {
        if (scrollTicking) {
            return;
        }
        scrollTicking = true;
        window.requestAnimationFrame(function () {
            header.classList.toggle("sticky", window.pageYOffset > 8);
            scrollTicking = false;
        });
    }

    if (toggle) {
        toggle.addEventListener("click", function () {
            setMobileOpen(!header.classList.contains("is-open"));
        });
    }

    if (backdrop) {
        backdrop.addEventListener("click", function () {
            setMobileOpen(false);
        });
    }

    for (var i = 0; i < menuItems.length; i += 1) {
        (function (item) {
            var trigger = item.querySelector(".site-nav-trigger");
            if (!trigger) {
                return;
            }

            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                toggleMenu(item);
            });

            item.addEventListener("mouseenter", function () {
                if (!isDesktop()) {
                    return;
                }
                window.clearTimeout(closeTimer);
                openMenu(item);
            });

            item.addEventListener("mouseleave", function () {
                if (!isDesktop()) {
                    return;
                }
                closeTimer = window.setTimeout(function () {
                    closeMenus();
                }, 140);
            });
        }(menuItems[i]));
    }

    header.addEventListener("click", function (event) {
        var link = event.target.closest("a");
        if (!link || isDesktop()) {
            return;
        }
        if (link.classList.contains("site-nav-trigger")) {
            return;
        }
        setMobileOpen(false);
    });

    document.addEventListener("click", function (event) {
        if (!header.contains(event.target)) {
            closeMenus();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }
        if (header.classList.contains("is-open")) {
            setMobileOpen(false);
            if (toggle) {
                toggle.focus();
            }
            return;
        }
        closeMenus();
    });

    if (typeof desktopQuery.addEventListener === "function") {
        desktopQuery.addEventListener("change", function () {
            closeMenus();
            setMobileOpen(false);
            setHeaderHeight();
        });
    } else if (typeof desktopQuery.addListener === "function") {
        desktopQuery.addListener(function () {
            closeMenus();
            setMobileOpen(false);
            setHeaderHeight();
        });
    }

    window.addEventListener("resize", setHeaderHeight);
    window.addEventListener("scroll", onScroll, { passive: true });

    markActive();
    setHeaderHeight();
    onScroll();
}());
