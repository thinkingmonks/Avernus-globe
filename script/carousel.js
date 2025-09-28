// Object containing image arrays for each country
const countryImages = {
    nigeria: [
        'images/logos/new/join-therapeutics.png',
        'images/logos/new/ntc.png',
        'images/logos/new/dicofarm.png',
        'images/logos/new/basic-pharma.png',
        'images/logos/new/neuraxpharm.png',
        'images/logos/new/exim-pharma.png',
        'images/logos/new/fa-dem.png',
        'images/logos/new/beneo.png',
        'images/logos/new/savio.png',
        'images/logos/new/lisapharma.png',
        'images/logos/new/omisan.png',
        'images/logos/new/drossa-pharma.png',
        'images/logos/new/molteni-pharmaseuticals.png',
        'images/logos/new/viga-pharma.png',
        'images/logos/new/diva-international.png',
        'images/logos/new/drossa-adelco.png'
    ],
    egypt: [
        'images/logos/new/join-therapeutics.png',
        'images/logos/new/ntc.png',
        'images/logos/new/dicofarm.png',
        'images/logos/new/basic-pharma.png',
        'images/logos/new/neuraxpharm.png',
        'images/logos/new/exim-pharma.png',
        'images/logos/new/fa-dem.png',
        'images/logos/new/beneo.png',
        'images/logos/new/savio.png',
        'images/logos/new/lisapharma.png',
        'images/logos/new/omisan.png',
        'images/logos/new/drossa-pharma.png',
        'images/logos/new/molteni-pharmaseuticals.png',
        'images/logos/new/viga-pharma.png',
        'images/logos/new/diva-international.png',
        'images/logos/new/drossa-adelco.png'
    ],
    india: [
        'images/logos/new/join-therapeutics.png',
        'images/logos/new/ntc.png',
        'images/logos/new/dicofarm.png',
        'images/logos/new/basic-pharma.png',
        'images/logos/new/neuraxpharm.png',
        'images/logos/new/exim-pharma.png',
        'images/logos/new/fa-dem.png',
        'images/logos/new/beneo.png',
        'images/logos/new/savio.png',
        'images/logos/new/lisapharma.png',
        'images/logos/new/omisan.png',
        'images/logos/new/drossa-pharma.png',
        'images/logos/new/molteni-pharmaseuticals.png',
        'images/logos/new/viga-pharma.png',
        'images/logos/new/diva-international.png',
        'images/logos/new/drossa-adelco.png'
    ]
};

function getRandomBox(boxes) {
    return boxes[Math.floor(Math.random() * boxes.length)];
}

function getImagesForCountry(country) {
    // Try to get country-specific images first
    const images = countryImages[country.toLowerCase()];
    // If no images found for the country, return Nigeria's images as fallback
    return images || countryImages['nigeria'];
}

function getRandomImage(currentSrc, country) {
    const images = getImagesForCountry(country);
    let newImage;
    do {
        newImage = images[Math.floor(Math.random() * images.length)];
    } while (newImage === currentSrc); // Ensure we don't pick the same image
    return newImage;
}

function updateCountryBoxImages(countryCode) {
    const countryContainer = document.querySelector('.country-boxes');
    if (!countryContainer) return;
    
    // Clear existing boxes
    countryContainer.innerHTML = '';
    countryContainer.setAttribute('data-place', countryCode.toLowerCase());
    
    const images = getImagesForCountry(countryCode);

    // Create exactly 6 boxes
    // Create exactly 6 boxes
    const BOX_COUNT = 6;
    const VISIBLE_COUNT = 2;
    for (let i = 0; i < BOX_COUNT; i++) {
        const box = document.createElement('div');
        box.className = 'country-box';
        const img = document.createElement('img');
        box.appendChild(img);
        countryContainer.appendChild(box);
    }

    const boxEls = Array.from(countryContainer.querySelectorAll('.country-box'));
    const imgEls = boxEls.map(b => b.querySelector('img'));
    const indices = Array.from(Array(BOX_COUNT).keys());

    // pick 2 unique logo indices
    function pickUniqueLogoIndices(count) {
        const pool = Array.from(Array(images.length).keys());
        const out = [];
        while (out.length < count && pool.length) {
            const i = Math.floor(Math.random() * pool.length);
            out.push(pool.splice(i,1)[0]);
        }
        return out;
    }

    // pick 2 unique box indices
    function pickUniqueBoxIndices(count) {
        const pool = indices.slice();
        const out = [];
        while (out.length < count && pool.length) {
            const i = Math.floor(Math.random() * pool.length);
            out.push(pool.splice(i,1)[0]);
        }
        return out;
    }

    function showTwoRandomLogos() {
        // Hide all boxes
        boxEls.forEach(el => el.classList.remove('visible'));

        // Pick 2 unique logos and 2 unique boxes
        const logoIdxs = pickUniqueLogoIndices(VISIBLE_COUNT);
        const boxIdxs = pickUniqueBoxIndices(VISIBLE_COUNT);

        // Assign logos to boxes
        for (let i = 0; i < VISIBLE_COUNT; i++) {
            const imgEl = imgEls[boxIdxs[i]];
            const imgSrc = images[logoIdxs[i]];
            imgEl.onerror = function() {
                // Try another random image if loading fails
                let altIdx;
                do {
                    altIdx = Math.floor(Math.random() * images.length);
                } while (altIdx === logoIdxs[i]);
                imgEl.src = images[altIdx];
            };
            imgEl.src = imgSrc;
            boxEls[boxIdxs[i]].classList.add('visible');
        }
    }

    showTwoRandomLogos();

    if (window.carouselInterval) clearInterval(window.carouselInterval);
    window.carouselInterval = setInterval(showTwoRandomLogos, 800);
    window.carouselInterval = setInterval(updateRandomBox, 800);
}