document.addEventListener("DOMContentLoaded", () => {
  const galleryEl = document.getElementById("gallery");
  const popupEl = document.getElementById("popup");
  const popupImageEl = document.getElementById("popupImage");

  const numImages = 50; //Elements of album

  const images = [];
  for (let i = 1; i <= numImages; i++) {
    images.push(`image${i}.jpg`);
  }

  let currentIndex = 0;
  const batchSize = 20; // Elements to load

  // Calculate elements height
  const resizeGridItem = (item) => {
    const rowHeight = parseInt(
      window.getComputedStyle(galleryEl).getPropertyValue("grid-auto-rows")
    );
    const rowGap = parseInt(
      window.getComputedStyle(galleryEl).getPropertyValue("grid-row-gap")
    );
    const contentHeight = item.querySelector("img").getBoundingClientRect().height - 20;
    const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = `span ${rowSpan}`;
  };

  const resizeAllGridItems = () => {
    const allItems = document.getElementsByClassName("gallery-item");
    for (let x = 0; x < allItems.length; x++) {
      resizeGridItem(allItems[x]);
    }
  };

  const createGalleryItem = (img) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `<img data-src="images/${img}" alt="${img}" loading="lazy">`;
    item.addEventListener("click", () => openPopup(`images/${img}`));
    return item;
  };

  const loadMoreItems = () => {
    const fragment = document.createDocumentFragment();
    const endIndex = Math.min(currentIndex + batchSize, images.length);
    for (let i = currentIndex; i < endIndex; i++) {
      const item = createGalleryItem(images[i]);
      fragment.appendChild(item);
    }
    galleryEl.appendChild(fragment);
    currentIndex = endIndex;
    observeImages();
    if (currentIndex >= images.length) {
      window.removeEventListener("scroll", handleScroll);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 500
    ) {
      loadMoreItems();
    }
  };

  const openPopup = (src) => {
    popupImageEl.src = src;
    popupEl.classList.add("active");
  };

  popupEl.addEventListener("click", (e) => {
    if (e.target === popupEl) {
      popupEl.classList.remove("active");
    }
  });

  //  Intersection Observer for lazy loading
  const loadImage = (image) => {
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
  };

  const handleIntersection = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        entry.target.addEventListener("load", () =>
          resizeGridItem(entry.target.parentElement)
        );
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(handleIntersection, {
    rootMargin: "50px 0px",
    threshold: 0.01,
  });

  const observeImages = () => {
    document
      .querySelectorAll("img[data-src]")
      .forEach((img) => observer.observe(img));
  };

  //Load initial batch
  loadMoreItems();


  window.addEventListener("scroll", handleScroll);
  window.addEventListener("load", resizeAllGridItems);
  window.addEventListener("resize", resizeAllGridItems);
});
