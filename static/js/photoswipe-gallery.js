(function () {
    async function initOntwerpGallery() {
        const cfg = window.PHOTOSWIPE_CONFIG || {};
        if (!cfg.lightboxUrl || !cfg.coreUrl) {
            console.warn("PhotoSwipe config missing; gallery not initialized.");
            return;
        }

        const { default: PhotoSwipeLightbox } = await import(cfg.lightboxUrl);

        const lightbox = new PhotoSwipeLightbox({
            gallery: "#ontwerp-gallery",
            children: "a:not([style*='display: none'])",
            pswpModule: () => import(cfg.coreUrl)
        });

        // Counter (current / total)
        lightbox.on("uiRegister", function () {
            lightbox.pswp.ui.registerElement({
                name: "counter",
                order: 5,
                isButton: false,
                appendTo: "bar",
                html: "",
                onInit: (el, pswp) => {
                    pswp.on("change", () => {
                        el.innerHTML = (pswp.currIndex + 1) + " / " + pswp.getNumItems();
                    });
                }
            });

            // Caption (from image alt text)
            lightbox.pswp.ui.registerElement({
                name: "custom-caption",
                order: 9,
                isButton: false,
                appendTo: "root",
                html: "",
                onInit: (el, pswp) => {
                    pswp.on("change", () => {
                        const currSlideElement = pswp.currSlide.data.element;
                        let captionHTML = "";
                        if (currSlideElement) {
                            const img = currSlideElement.querySelector("img");
                            if (img) captionHTML = img.getAttribute("alt") || "";
                        }
                        el.innerHTML = captionHTML;
                    });
                }
            });
        });

        lightbox.init();

        // Category filter
        const filterButtons = document.querySelectorAll(".gallery-filters .filter-btn");
        const galleryItems = document.querySelectorAll("#ontwerp-gallery a");

        filterButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                const filter = btn.getAttribute("data-filter");

                filterButtons.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");

                galleryItems.forEach(function (item) {
                    const show = filter === "all" || item.getAttribute("data-category") === filter;
                    item.style.display = show ? "" : "none";
                });
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initOntwerpGallery);
    } else {
        initOntwerpGallery();
    }
})();