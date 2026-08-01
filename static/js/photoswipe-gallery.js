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
            // Updated children selector to exclude hidden items so PhotoSwipe 
            // doesn't show filtered-out images in the lightbox.
            const lightbox = new PhotoSwipeLightbox({
                gallery: galleryEl,
                children: "a:not([style*='display: none'])",
                pswpModule: () => import(cfg.coreUrl)
            });

            lightbox.on("uiRegister", function () {
                // NOTE: The default counter was removed here to prevent the "double counter" 
                // issue, as PhotoSwipe v5 includes a counter by default if not disabled.
                
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

            // Category filter logic
            // We look for filters associated with this specific gallery
            const filterContainer = document.querySelector('.gallery-filters');
            
            if (filterContainer) {
                const filterButtons = filterContainer.querySelectorAll(".filter-btn");
                const galleryItems = galleryEl.querySelectorAll("a");

                filterButtons.forEach(function (btn) {
                    btn.addEventListener("click", function (e) {
                        e.preventDefault();
                        const filter = btn.getAttribute("data-filter");

                        // Update active state UI
                        filterButtons.forEach(function (b) { b.classList.remove("active"); });
                        btn.classList.add("active");

                        // Filter the DOM elements
                        galleryItems.forEach(function (item) {
                            const itemCategory = item.getAttribute("data-category");
                            const show = filter === "all" || itemCategory === filter;
                            item.style.display = show ? "" : "none";
                        });

                        // Important: Refresh lightbox to ignore hidden items
                        // (PhotoSwipe v5 picks up the filtered list automatically on next open)
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