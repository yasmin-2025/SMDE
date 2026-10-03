/* ================================================================
   SMDE — Shared Animation System (OOP)
   Replaces the little bespoke "fade the cards in" scripts that used
   to live inside dashboard.js / etc. One controller, reused on every
   page, so behaviour + timing stays consistent everywhere.

   - RevealAnimator : fades/slides elements in as they enter the
                       viewport (auto-applies to common card classes,
                       plus anything already marked .reveal).
   - CountUp         : animates numeric text (e.g. stat-card h3) from
                       0 up to its target value once visible.
   - Ripple          : small material-style click ripple for buttons.
================================================================= */

class RevealAnimator {

    static AUTO_SELECTORS = [
        ".stat-card", ".action-card", ".glass-card", ".step-card",
        ".risk-card", ".machine-card", ".parameter-item", ".model-card",
        ".comparison-card", ".decision-card", ".notification-item",
        ".history-row", ".report-card",
    ];

    constructor() {
        this.items = this._collectTargets();

        if (!("IntersectionObserver" in window) || this.items.length === 0) {
            this.items.forEach(el => el.classList.add("is-visible"));
            return;
        }

        this.observer = new IntersectionObserver(
            entries => this._onIntersect(entries),
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        this.items.forEach(el => this.observer.observe(el));
    }

    _collectTargets() {
        const auto = document.querySelectorAll(RevealAnimator.AUTO_SELECTORS.join(","));

        auto.forEach((el, index) => {
            el.classList.add("reveal");
            const delayIndex = (index % 6) + 1;
            el.classList.add(`reveal-delay-${delayIndex}`);
        });

        return document.querySelectorAll(".reveal");
    }

    _onIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                this.observer.unobserve(entry.target);
            }
        });
    }
}

class CountUp {

    constructor(el) {
        this.el = el;
        this.target = parseFloat(el.dataset.countup || el.textContent);
        this.suffix = el.dataset.countupSuffix || "";
        this.duration = parseInt(el.dataset.countupMs || "900", 10);
        this.hasDecimal = /\./.test(el.dataset.countup || "");
        this._played = false;
    }

    play() {
        if (this._played || isNaN(this.target)) return;
        this._played = true;

        const start = performance.now();
        const from = 0;

        const step = (now) => {
            const progress = Math.min((now - start) / this.duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = from + (this.target - from) * eased;

            this.el.textContent =
                (this.hasDecimal ? value.toFixed(1) : Math.round(value)) + this.suffix;

            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }

    static initAll() {
        const nodes = document.querySelectorAll("[data-countup]");
        if (nodes.length === 0) return;

        const counters = Array.from(nodes).map(el => new CountUp(el));

        if (!("IntersectionObserver" in window)) {
            counters.forEach(c => c.play());
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = counters.find(c => c.el === entry.target);
                    counter && counter.play();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        nodes.forEach(el => observer.observe(el));
    }
}

class Ripple {

    static attach() {
        document.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn, .menu-item, .action-card");
            if (!btn) return;

            btn.classList.add("btn-ripple");

            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const circle = document.createElement("span");

            circle.className = "ripple-circle";
            circle.style.width = circle.style.height = `${size}px`;
            circle.style.left = `${e.clientX - rect.left - size / 2}px`;
            circle.style.top = `${e.clientY - rect.top - size / 2}px`;

            btn.appendChild(circle);
            setTimeout(() => circle.remove(), 600);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new RevealAnimator();
    CountUp.initAll();
    Ripple.attach();
});
