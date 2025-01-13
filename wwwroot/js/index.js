document.addEventListener("DOMContentLoaded", function () {
    console.log("Script is running");

    const root = document.documentElement;
    root.style.setProperty('--marquee-width', '80vw');
    root.style.setProperty('--marquee-height', '100px');
    root.style.setProperty('--marquee-elements-displayed', '5');

    const marqueeElementsDisplayed = getComputedStyle(root).getPropertyValue("--marquee-elements-displayed");
    const marqueeContent = document.querySelector("ul.marquee-content");

    console.log("Marquee content:", marqueeContent);
    console.log("Elements displayed:", marqueeElementsDisplayed);

    if (marqueeContent) {
        const numElements = marqueeContent.children.length;
        root.style.setProperty("--marquee-elements", numElements);
        console.log("Number of elements:", numElements);

        for (let i = 0; i < 5; i++) { // Hardcoded to 5 for testing
            marqueeContent.appendChild(marqueeContent.children[i].cloneNode(true));
        }
    }
});