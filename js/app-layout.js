/* ================================================================
   SMDE — AppLayout (OOP)
   Single source of truth for the sidebar + topbar markup. Every
   internal page just drops two mount points in its HTML:

     <div id="sidebarMount" data-active="dashboard"></div>
     <div id="topbarMount"
          data-title="Dashboard"
          data-breadcrumb="OVERVIEW / DASHBOARD"></div>

   AppLayout reads those data-attributes, injects the real markup,
   highlights the active nav item, and wires up the mobile sidebar
   toggle. No more copy-pasting the sidebar into every file.
================================================================= */

class AppLayout {

    static NAV_ITEMS = [
        { key: "dashboard",     icon: "bi-speedometer2",  label: "Dashboard",     href: "dashboard.html" },
        { key: "machines",      icon: "bi-grid-1x2",      label: "Machines",      href: "machines.html" },
        { key: "prediction",    icon: "bi-robot",         label: "Predictions",   href: "prediction.html" },
        { key: "history",       icon: "bi-clock-history", label: "History",       href: "history.html" },
        { key: "reports",       icon: "bi-bar-chart",     label: "Reports",       href: "reports.html" },
        { key: "notifications", icon: "bi-bell",          label: "Notifications", href: "notifications.html" },
        { key: "profile",       icon: "bi-person",        label: "Profile",       href: "profile.html" },
        { key: "about",         icon: "bi-info-circle",   label: "About / Help",  href: "about.html" },
    ];

    constructor({ sidebarMount, topbarMount }) {
        this.sidebarMount = sidebarMount;
        this.topbarMount = topbarMount;

        this.active = sidebarMount ? sidebarMount.dataset.active || "" : "";

        if (this.sidebarMount) this._renderSidebar();
        if (this.topbarMount) this._renderTopbar();

        this._bindMobileToggle();
        this._bindLogout();
    }

    _bindLogout() {
        const logoutLink = document.getElementById("logoutLink");
        if (!logoutLink) return;

        logoutLink.addEventListener("click", async (e) => {
            e.preventDefault();

            try {
                await fetch("../backend/api/logout.php", {
                    method: "POST",
                    credentials: "include"
                });
            } catch (err) {
                console.error("Logout request failed:", err);
            }

            localStorage.removeItem("smde_user_id");
            window.location.href = "login.html";
        });
    }

    // =========================================================
    // AUTH GUARD
    // Confirms a real server-side session exists before letting
    // the user stay on a protected page. Call once per page,
    // e.g. AppLayout.requireAuth();
    // =========================================================
    static async requireAuth() {
        try {
            const response = await fetch(
                "../backend/api/session-check.php",
                { credentials: "include" }
            );

            const data = await response.json();

            if (!data.loggedIn) {
                window.location.href = "login.html";
            }
        } catch (err) {
            console.error("Session check failed:", err);
            window.location.href = "login.html";
        }
    }

    _menuItemsHtml() {
        return AppLayout.NAV_ITEMS.map(item => `
            <a href="${item.href}" class="menu-item${item.key === this.active ? " active" : ""}">
                <i class="bi ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join("");
    }

    _renderSidebar() {
        this.sidebarMount.outerHTML = `
            <aside class="sidebar" id="appSidebar">
                <div class="logo">
                    <div class="logo-icon"><i class="bi bi-cpu"></i></div>
                    <div>
                        <h4>SMDE</h4>
                        <span>Smart Machine</span>
                    </div>
                </div>

                <div class="sidebar-menu">
                    <p class="menu-title">MAIN MENU</p>
                    ${this._menuItemsHtml()}
                </div>

                <div class="sidebar-bottom">
                    <a href="#" id="logoutLink" class="menu-item logout">
                        <i class="bi bi-box-arrow-left"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </aside>
            <button class="sidebar-toggle" id="sidebarToggle" type="button" aria-label="Toggle menu">
                <i class="bi bi-list"></i>
            </button>
            <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
        `;
    }

    _renderTopbar() {
        const title = this.topbarMount.dataset.title || "";
        const breadcrumb = this.topbarMount.dataset.breadcrumb || "";

        this.topbarMount.outerHTML = `
            <nav class="topbar">
                <div>
                    <small class="breadcrumb-text">${breadcrumb}</small>
                    <h3>${title}</h3>
                </div>

                <div class="topbar-right">
                    <a href="notifications.html" class="notification-btn">
                        <i class="bi bi-bell"></i>
                        <span></span>
                    </a>
                </div>
            </nav>
        `;
    }

    _bindMobileToggle() {
        const toggle = document.getElementById("sidebarToggle");
        const sidebar = document.getElementById("appSidebar");
        const backdrop = document.getElementById("sidebarBackdrop");
        if (!toggle || !sidebar) return;

        const close = () => {
            sidebar.classList.remove("open");
            backdrop && backdrop.classList.remove("show");
        };

        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            backdrop && backdrop.classList.toggle("show");
        });

        backdrop && backdrop.addEventListener("click", close);

        sidebar.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", close);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    AppLayout.requireAuth();

    new AppLayout({
        sidebarMount: document.getElementById("sidebarMount"),
        topbarMount: document.getElementById("topbarMount"),
    });
});