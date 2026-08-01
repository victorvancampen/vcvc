(function () {
    async function initGalleries() {
        const cfg = window.PHOTOSWIPE_CONFIG || {};
        if (!cfg.lightboxUrl || !cfg.coreUrl) {
            console.warn("PhotoSwipe config missing; gallery not initialized.");
            return;
        }

        const { default: PhotoSwipeLightbox } = await import(cfg.lightboxUrl);
        const galleries = document.querySelectorAll(".pswp-gallery");

        galleries.forEach(function (galleryEl) {
            const lightbox = new PhotoSwipeLightbox({
                gallery: "#" + galleryEl.id,
                children: "a:not([style*='display: none'])",
                pswpModule: () => import(cfg.coreUrl)
            });

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

            // Category filter, scoped to this gallery's own filter bar
            const filterContainer = document.querySelector(
                '.gallery-filters[data-target="' + galleryEl.id + '"]'
            );
            if (filterContainer) {
                const filterButtons = filterContainer.querySelectorAll(".filter-btn");
                const galleryItems = galleryEl.querySelectorAll("a");

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
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initGalleries);
    } else {
        initGalleries();
    }
})();