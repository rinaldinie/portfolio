document.addEventListener("DOMContentLoaded", function () {
    'use strict';

    const html = document.querySelector('html'),
        globalWrap = document.querySelector('.global-wrap'),
        body = document.querySelector('body'),
        menuToggle = document.querySelector(".hamburger"),
        searchOpenButton = document.querySelectorAll(".search-button, .hero__search"),
        toggleTheme = document.querySelector(".toggle-theme"),
        blogViewButton = document.querySelector(".blog__toggle"),
        splides = document.querySelector(".logos"),
        imagesOverlay = document.querySelector('.images-overlay'),
        btnScrollToTop = document.querySelector(".top");


    // =======================================================
    // Menu + Search + Theme Switcher + Blog List View
    // =======================================================
    menuToggle.addEventListener("click", () => {
        menu();
    });

    searchOpenButton.forEach(button => {
        button.addEventListener("click", searchOpen);
    });

    if (blogViewButton) {
        blogViewButton.addEventListener("click", () => {
            viewToggle();
        });
    }

    // Theme Switcher
    if (toggleTheme && isToggleEnabled) {
        toggleTheme.addEventListener("click", () => {
            const isDarkMode = html.classList.contains("dark-mode");
            if (isDarkMode) {
                setTheme("light");
                localStorage.setItem("theme", "light");
            } else {
                setTheme("dark");
                localStorage.setItem("theme", "dark");
            }
        });
    }


    // Blog List View
    function viewToggle() {
        if (html.classList.contains('view-list')) {
            html.classList.remove('view-list');
            localStorage.removeItem("classView");
            document.documentElement.removeAttribute("list");
        } else {
            html.classList.add('view-list');
            localStorage.setItem("classView", "list");
            document.documentElement.setAttribute("list", "");
        }
    }


    // ============================
    // Logos Slider
    // ============================
    if (splides) {
        new Splide(splides, {
            direction: 'ltr',
            clones: 8,
            gap: 16,
            autoWidth: true,
            drag: true,
            arrows: false,
            pagination: false,
            type: 'loop',
            autoScroll: {
                autoStart: true,
                speed: 0.4,
                pauseOnHover: false,
                pauseOnFocus: false
            },
            intersection: {
                inView: {
                    autoScroll: true,
                },
                outView: {
                    autoScroll: false,
                }
            },
        }).mount(window.splide.Extensions);
    }


    // ================================================================
    // Stop Animations During Window Resizing and Switching Theme Modes
    // ================================================================
    let disableTransition;

    if (toggleTheme) {
        toggleTheme.addEventListener("click", () => {
            stopAnimation();
        });
    }

    window.addEventListener("resize", () => {
        stopAnimation();
    });

    function stopAnimation() {
        document.body.classList.add("disable-animation");
        clearTimeout(disableTransition);
        disableTransition = setTimeout(() => {
            document.body.classList.remove("disable-animation");
        }, 100);
    };

    // =======================
    // Responsive Videos
    // =======================
    reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");


    /* =======================
    // LazyLoad Images
    ======================= */
    var lazyLoadInstance = new LazyLoad({
        elements_selector: ".lazy"
    })


    // =======================
    // Zoom Image
    // =======================
    if (imagesOverlay) {
        const images = document.querySelectorAll('.post__content img, .page__content img, .gallery__image img');

        const clearOverlay = () => {
            imagesOverlay.classList.remove('active');
            imagesOverlay.innerHTML = '';
        };

        const createImageElement = (src) => {
            const img = document.createElement('img');
            img.src = src;
            return img;
        };

        const createDescriptionElement = (description) => {
            const descriptionElem = document.createElement('p');
            descriptionElem.textContent = description;
            descriptionElem.classList.add('image-overlay__description');
            return descriptionElem;
        };

        images.forEach(image => {
            image.addEventListener('click', () => {
                const galleryImage = image.closest('.gallery__image');
                const description = galleryImage?.querySelector('.gallery__image__caption')?.textContent || '';
                imagesOverlay.classList.add('active');

                imagesOverlay.innerHTML = '';
                imagesOverlay.appendChild(createImageElement(image.dataset.src || image.src));

                if (description) {
                    imagesOverlay.appendChild(createDescriptionElement(description));
                }
            });
        });

        imagesOverlay.addEventListener('click', clearOverlay);
    }


    // =====================
    // Copy Code Button
    // =====================
    document.querySelectorAll('.post__content pre.highlight, .page__content pre.highlight')
        .forEach(function (pre) {
            const button = document.createElement('button');
            const copyText = 'Copy';
            button.type = 'button';
            button.ariaLabel = 'Copy code to clipboard';
            button.innerText = copyText;
            button.addEventListener('click', function () {
                let code = pre.querySelector('code').innerText;
                try {
                    code = code.trimEnd();
                } catch (e) {
                    code = code.trim();
                }
                navigator.clipboard.writeText(code);
                button.innerText = 'Copied!';
                setTimeout(function () {
                    button.blur();
                    button.innerText = copyText;
                }, 2e3);
            });
            pre.appendChild(button);
        });


    // =====================
    // Load More Posts
    // =====================
    var load_posts_button = document.querySelector(".load-more-posts");

    load_posts_button && load_posts_button.addEventListener("click", function (e) {
        e.preventDefault();
        var t = load_posts_button.textContent; load_posts_button.classList.add("button--loading"), load_posts_button.textContent = "Loading";
        var o = document.querySelector(".pagination"), n = pagination_next_url.split("/page")[0] + "/page/" + pagination_next_page_number + "/";
        fetch(n).then(function (e) { if (e.ok) return e.text() }).then(function (e) {
            var n = document.createElement("div");
            n.innerHTML = e;
            for (var a = document.querySelector(".grid"), i = n.querySelectorAll(".grid__post"), l = 0; l < i.length; l++)
                a.appendChild(i.item(l));
            new LazyLoad({ elements_selector: ".lazy" }), pagination_next_page_number++, pagination_next_page_number > pagination_available_pages_number && (o.style.display = "none")
        }).finally(function () { load_posts_button.classList.remove("button--loading"), load_posts_button.textContent = t })
    });

    // =======================
    // Scroll Top Button
    // =======================
    window.addEventListener("scroll", function () {
        window.scrollY > window.innerHeight ? btnScrollToTop.classList.add("is-active") : btnScrollToTop.classList.remove("is-active");
    });

    btnScrollToTop.addEventListener("click", function () {
        if (window.scrollY != 0) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
            })
        }
    });
});