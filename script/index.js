// Returns the active country name for a given swiper selector
function getActiveCountryNameFromSwiper(selector) {
  const container = document.querySelector(selector);
  if (!container) return '';
  const activeSlide = container.querySelector('.swiper-slide-active');
  if (!activeSlide) return '';
  const countryEl = activeSlide.querySelector('.country') || activeSlide;
  return (countryEl.textContent || '').trim();
}
const countriesToHighlight = ["India", "South Korea", "USA", "Egypt", "Belgium", "Switzerland", "Germany", "UnitedKingdom", "Netherlands", "Denmark", "Poland", "Hungary", "France",  "Spain",  "Italy",  "Greece",  "Portugal"];

countriesToHighlight.forEach(name => {
  const countryId = name.replace(/\s+/g, ''); // normalize ID
  const path = document.querySelector(`#worldMap [id="${countryId}"]`);
  if (path) path.classList.add('country-highlight');
});


const countries = {
    // 🌍 Europe
    "Belgium": { lat: 50.8503, lng: 4.3517 },
    "Switzerland": { lat: 46.8182, lng: 8.2275 },
    "Germany": { lat: 51.1657, lng: 10.4515 },
    "United Kingdom": { lat: 55.3781, lng: -3.4360 },
    "Netherlands": { lat: 52.1326, lng: 5.2913 },
    "Denmark": { lat: 56.2639, lng: 9.5018 },
    "Poland": { lat: 51.9194, lng: 19.1451 },
    "Hungary": { lat: 47.1625, lng: 19.5033 },
    "France": { lat: 46.6034, lng: 1.8883 },
    "Spain": { lat: 40.4637, lng: -3.7492 },
    "Italy": { lat: 41.8719, lng: 12.5674 },
    "Greece": { lat: 39.0742, lng: 21.8243 },
    "Portugal": { lat: 39.3999, lng: -8.2245 },

    // 🌏 Asia
    "South Korea": { lat: 35.9078, lng: 127.7669 },
    "India": { lat: 20.5937, lng: 78.9629 },
    "China": { lat: 35.8617, lng: 104.1954 },
    "Japan": { lat: 36.2048, lng: 138.2529 },
    "Vietnam": { lat: 14.0583, lng: 108.2772 },
    "Thailand": { lat: 15.8700, lng: 100.9925 },
    "Nepal": { lat: 28.3949, lng: 84.1240 },
    "Sri Lanka": { lat: 7.8731, lng: 80.7718 },

    // 🌎 North America
    "USA": { lat: 37.0902, lng: -95.7129 },

    // 🌍 Africa
    "Egypt": { lat: 26.8206, lng: 30.8025 },
};

// create lowercase lookup to be forgiving about casing
const countriesLookup = {};
for (const k in countries) {
    countriesLookup[k.trim().toLowerCase()] = countries[k];
}	

let myearth = null;
let highlightMarker = null;
let country = document.getElementById('countries');
let isCountrySelected = false;
let isContinentSelected = false;
const COUNTRY_ANIM_MS = 1200;

// Continent coordinates mapping (simplified)
const continentCoords = {
    "asia": { lat: 20.5937, lng: 78.9629 },
    "europe": { lat: 30, lng: 0 },
    "northamerica": { lat: 37.0902, lng: -100.7129 },
    "africa": { lat: 0, lng: 30 },
    "southamerica": { lat: -8.7832, lng: -55.4915 }
};

window.addEventListener('load', () => {
    const svg = document.getElementById('worldMap');
    if (!svg) {
        console.error('SVG with id "worldMap" not found.');
        return;
    }

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

    // Initialize Earth.js with the SVG data URI
    myearth = new Earth('myearth', {
        location: { lat: 20, lng: 20 },
        light: 'none',
        transparent: true,
        autoRotate: true,
        autoRotateSpeed: 1.2,
        autoRotateStart: 2000,
        mapImage: svgDataUri,
        zoom: 1.0,
        minZoom: 0.8,
        maxZoom: 5.0
    });

    // Set initial continent rotation after Earth.js loads
    setTimeout(() => {
        rotateToCurrentContinent();
    }, 1000);
});

// Function to rotate globe to current continent in Swiper
function rotateToCurrentContinent() {
    if (isCountrySelected) return; // Don't rotate if a country is selected
    if (!myearth || !myearth.goTo) {
        console.log('Earth.js not ready yet, retrying...');
        setTimeout(rotateToCurrentContinent, 100);
        return;
    }

    const activeSlide = document.querySelector('#vertical-swiper .swiper-slide-active');
    if (!activeSlide) return;

    const regionLink = activeSlide.querySelector('.regions');
    if (!regionLink) return;

    const region = (regionLink.dataset.region || '').trim().toLowerCase();
    const coords = continentCoords[region];
    
    if (coords) {
        console.log('Rotating to continent:', region, coords);
        myearth.goTo(coords, { 
            relativeDuration: 100, 
            approachAngle: 0, 
            zoom: 1.0  // Slight zoom for continents
        });
    }
}

// highlight helper (if Earth supports addOverlay)
function highlightSVGCountry(countryId, loc) {
    // Remove highlight from all paths
    document.querySelectorAll('#worldMap path').forEach(path => {
        path.classList.remove('country-highlight');
    });

    // Highlight the selected country
    const path = document.querySelector(`#worldMap path[id="${countryId}"]`);
    if (path) {
        path.classList.add('country-highlight');
    }

    // Serialize the SVG and create a new data URI
    const svg = document.getElementById('worldMap');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

    // Remove the old globe canvas but preserve the glow
    const globeContainer = document.getElementById('myearth');
    const glowElement = document.getElementById('glow');
    
    if (glowElement) {
        glowElement.remove();
    }
    
    globeContainer.innerHTML = '';
    globeContainer.appendChild(glowElement || (() => {
        const newGlow = document.createElement('div');
        newGlow.id = 'glow';
        return newGlow;
    })());

    // Re-create the globe with the new texture and position
    myearth = new Earth('myearth', {
        location: loc ? { lat: loc.lat, lng: loc.lng } : { lat: 20, lng: 20 },
        light: 'none',
        transparent: true,
        autoRotate: false,
        autoRotateSpeed: 0,
        autoRotateStart: 0,
        mapImage: svgDataUri,
        zoom: 1.0,
        minZoom: 0.8,
        maxZoom: 5.0
    });

    // Wait for the new globe to be ready, then go to the location and pause
    waitForGoTo().then(() => {
        if (typeof loc === 'object' && loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
            myearth.goTo(loc, { relativeDuration: 2000, approachAngle: 20, zoom: 5 });
            setTimeout(() => {
                myearth.autoRotate = false;
                myearth.draggable = false;
                myearth.scrollable = false;
            }, 2200);
        } else {
            myearth.autoRotate = false;
            myearth.draggable = false;
            myearth.scrollable = false;
        }
    });
}

// helper to wait until goTo is available (polling)
function waitForGoTo(timeout = 3000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        (function check() {
            if (myearth && typeof myearth.goTo === 'function') return resolve(true);
            if (Date.now() - start > timeout) return reject('myearth.goTo not ready');
            setTimeout(check, 100);
        })();
    });
}

console.log('Setup complete. Click a slide to fly the globe.');

// Function to format region name
function formatRegionName(region) {
    switch(region.toLowerCase()) {
        case 'northamerica':
            return 'North America';
        case 'southamerica':
            return 'South America';
        default:
            return region
                .split(/(?=[A-Z])/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    }
}

// Function to change the subheading based on the clicked region
function updateSubheading(region) {
    const heading = document.querySelector('.header h2');
    if (heading) {
        if (region) {
            const formattedRegion = formatRegionName(region);
            heading.innerHTML = `Our global collaborations in ${formattedRegion}`;
        } else {
            heading.innerHTML = "Our global collaborations";
        }
    }
}

// Common swiper configuration
const swiperConfig = {
    direction: 'vertical',
    slidesPerView: 5,
    centeredSlides: true,
    spaceBetween: 12,
    mousewheel: {
        releaseOnEdges: true,
        sensitivity: 0.5
    },
    loop: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false
    },
    slideToClickedSlide: false,
    keyboard: { enabled: true },
    speed: 800,
    slidesPerGroup: 1,
    followFinger: false,
    longSwipes: false,
    shortSwipes: true,
    touchRatio: 0.5,
    resistance: true,
    resistanceRatio: 1,
    preventInteractionOnTransition: true,
    on: {
        touchStart: function(swiper, event) {
            swiper.allowSlideNext = true;
            swiper.allowSlidePrev = true;
        },
        touchEnd: function(swiper, event) {
            const diff = swiper.touches.diff;
            if (Math.abs(diff) > 0) {
                if (diff > 0) {
                    swiper.slidePrev();
                } else {
                    swiper.slideNext();
                }
            }
            swiper.allowSlideNext = false;
            swiper.allowSlidePrev = false;
        }
    }
};

// Function to create a swiper with enhanced control
function createControlledSwiper(elementId) {
    const swiper = new Swiper(elementId, swiperConfig);
    
    swiper.on('touchStart', function() {
        this.allowSlideNext = true;
        this.allowSlidePrev = true;
    });

    swiper.on('touchEnd', function() {
        const diff = this.touches.diff;
        if (Math.abs(diff) > 0) {
            if (diff > 0) {
                this.slidePrev();
            } else {
                this.slideNext();
            }
        }
        this.allowSlideNext = false;
        this.allowSlidePrev = false;
    });

    // Link globe rotation to Swiper events
swiper.on('slideChangeTransitionStart', function() {
        if (!isCountrySelected && !isContinentSelected) rotateToCurrentContinent();
    });

    swiper.on('slideChange', function() {
        if (!isCountrySelected && !isContinentSelected) rotateToCurrentContinent();
    });

    return swiper;
}

// Create all swipers with enhanced control
const regionSwiper = createControlledSwiper('#vertical-swiper');

// country-swiper config: one slide visible, no autoplay, with navigation
const countrySwiperConfig = Object.assign({}, swiperConfig, {
  direction: 'horizontal',
  slidesPerView: 1,
  centeredSlides: false,
  spaceBetween: 8,
  loop: true,
  autoplay: false,
  mousewheel: false,
  speed: 400,
  followFinger: true,
  longSwipes: false,
  shortSwipes: true,
  // navigation will be wired per-container
  navigation: {}
});

function ensureNavButtons(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return false;

  let created = false;

  if (!container.querySelector('.country-nav-next')) {
    const next = document.createElement('button');
    next.className = 'country-nav-next';
    next.innerText = '>';
    container.appendChild(next);
    created = true;
    // Add click handler to loop infinitely
    // At click time re-query the container and use its attached swiper instance.
    next.addEventListener('click', function() {
      const curContainer = document.querySelector(containerSelector);
      const swiperInstance = curContainer && (curContainer.swiper || curContainer.__swiper);
      if (swiperInstance && typeof swiperInstance.slideNext === 'function') {
        swiperInstance.slideNext();
      } else {
        console.debug('country nav: swiper instance not found for', containerSelector);
      }
    });
  }

  

  // Return true if the next button now exists (either existed before or we created it)
  return !!container.querySelector('.country-nav-next') || created;
}

function createCountrySwiper(selector) {
  const container = document.querySelector(selector);
  const slideCount = container ? container.querySelectorAll('.swiper-slide').length : 0;

  // create nav buttons only if >1 slide (ensureNavButtons does cleanup if <=1)
  const hasNav = slideCount > 1 && ensureNavButtons(selector);

  // copy base config and enable loop only when >1 slide
  const cfg = Object.assign({}, countrySwiperConfig);

  // enforce no autoplay and no pointer interactions for country swipers
  cfg.loop = slideCount > 1;
  cfg.autoplay = false;
  cfg.mousewheel = false;
  cfg.allowTouchMove = false;
  cfg.simulateTouch = false;
  cfg.touchRatio = 0;
  cfg.slidesPerView = 1;
  cfg.followFinger = false;
  cfg.loopedSlides = Math.max(1, slideCount); // help loop logic
  cfg.loopedSlides = slideCount;

  if (hasNav) {
    cfg.navigation = { nextEl: selector + ' .country-nav-next' };
  } else {
    delete cfg.navigation;
  }

  const sw = new Swiper(selector, cfg);

  // ensure no autoplay is running
  try { sw.autoplay && sw.autoplay.stop && sw.autoplay.stop(); } catch(e){}

  // Delayed loop init: some Swiper builds need a short delay so cloned slides / loop internals are created properly.
  if (cfg.loop) {
    setTimeout(() => {
      try {
        sw.loopCreate && sw.loopCreate();
        sw.loopFix && sw.loopFix();
        const startIndex = (typeof activeCountryIndexMap[selector] === 'number') ? activeCountryIndexMap[selector] : 0;
        if (typeof sw.slideToLoop === 'function') {
          sw.slideToLoop(startIndex, 0, false);
        } else if (typeof sw.slideTo === 'function') {
          sw.slideTo(startIndex, 0, false);
        }
      } catch (e) { console.debug('delayed loop init failed', e); }
    }, 50);
  }
  // ensure Swiper loop internals are initialized / fixed for looped instances
  try {
    if (cfg.loop && typeof sw.loopCreate === 'function') {
      sw.loopCreate && sw.loopCreate();
      sw.loopFix && sw.loopFix();
    }
  } catch (e) { console.debug('loop init fix failed', e); }

  // when user manually changes slide (via nav button), highlight that country once
  sw.on('slideChange', function() {
    // slideChange will fire when we call slideNext() from the panel button
    if (typeof clearAllCountryHighlights === 'function') clearAllCountryHighlights();
    const name = getActiveCountryNameFromSwiper(selector);
    if (!name) return;
    const p = (typeof findPathByCountryName === 'function')
      ? findPathByCountryName(name)
      : document.querySelector(`#worldMap [id="${name.replace(/\s+/g,'')}"]`);
    if (p) p.classList.add('country-highlight');
    if (typeof updateGlobeTexturePreserve === 'function') updateGlobeTexturePreserve().catch(()=>{});
  });

 // attach instance to DOM node so click handlers can find it later
  try {
    const el = document.querySelector(selector);
    if (el) {
      el.swiper = sw;
      el.__swiper = sw; // some Swiper builds use __swiper
    }
  } catch (e) { console.debug('attach swiper to DOM failed', e); }

  // ensure no autoplay is running
  try { sw.autoplay && sw.autoplay.stop && sw.autoplay.stop(); } catch(e){}
  // ...existing code...
  return sw;
}
//
// Create one-per-view country swipers (no autoplay)
const asiaSwiper = createCountrySwiper('#asia-swiper');
const europeSwiper = createCountrySwiper('#europe-swiper');
const naSwiper = createCountrySwiper('#northamerica-swiper');
const africaSwiper = createCountrySwiper('#africa-swiper');

// Map of country swiper selectors -> Swiper instances
const countrySwiperMap = {
  '#asia-swiper': asiaSwiper,
  '#europe-swiper': europeSwiper,
  '#northamerica-swiper': naSwiper,
  '#africa-swiper': africaSwiper
};

let activeCountrySwiperSelector = null;

const activeCountryIndexMap = {}; // selector -> current logical index (0..n-1)

function getSlidesForSelector(selector) {
  const container = document.querySelector(selector);
  if (!container) return [];
  // exclude Swiper duplicated loop slides
  return Array.from(container.querySelectorAll('.swiper-slide')).filter(s => !s.classList.contains('swiper-slide-duplicate'));
}

function getCountryNameFromSlide(slideEl) {
  if (!slideEl) return '';
  const countryEl = slideEl.querySelector('.country') || slideEl;
  return (countryEl.textContent || '').trim();
}

function showCountryBoxByName(name) {
  if (!name) return;
  const lower = name.trim().toLowerCase();
  document.querySelectorAll('.country-boxes').forEach(box => box.classList.add('hidden'));
  const targetBox = document.querySelector(`.country-boxes[data-place="${lower}"]`);
  if (targetBox) targetBox.classList.remove('hidden');
  // update subheading
  const countriesSubheading = document.querySelector('#countries .sub-heading');
  if (countriesSubheading) countriesSubheading.textContent = `In ${name}`;
  // update country panel h1 heading
  const countryPanelHeading = document.querySelector('#countries h1.heading');
  if (countryPanelHeading) countryPanelHeading.innerHTML = `<span class="presence-label">Our Presence in</span><br><span class="country-name">${name}</span>`;
}

// Show exactly one country swiper and unhide it; hide others
function showOnlyCountrySwiper(selector) {
  Object.keys(countrySwiperMap).forEach(sel => {
    const el = document.querySelector(sel);
    const sw = countrySwiperMap[sel];
    if (!el) return;
    if (sel === selector) {
      el.classList.remove('hidden');
      try {
        // update and ensure loop internals are fixed for visible swiper
        sw && sw.update && sw.update();
        if (sw && sw.params && sw.params.loop && typeof sw.loopFix === 'function') {
          sw.loopFix();
        }
        // position visible looped swiper to logical index so slideNext will loop
        try {
          const targetIdx = (typeof activeCountryIndexMap[sel] === 'number') ? activeCountryIndexMap[sel] : 0;
          if (sw && sw.params && sw.params.loop && typeof sw.slideToLoop === 'function') {
            sw.slideToLoop(targetIdx, 0, false);
          } else if (sw && typeof sw.slideTo === 'function') {
            sw.slideTo(targetIdx, 0, false);
          }
        } catch (e) { console.debug('positioning visible swiper failed', e); }
        // ensure nav buttons visible if present (nav buttons are optional; panel uses its own next)
  // Do not hide the next button; let CSS control its visibility
        // enforce no interactions
        try { sw.autoplay && sw.autoplay.stop && sw.autoplay.stop(); } catch(_) {}
        try { sw.mousewheel && sw.mousewheel.disable && sw.mousewheel.disable(); } catch(_) {}
        sw.allowTouchMove = false;
      } catch(e){ console.debug(e); }
    } else {
      el.classList.add('hidden');
      try { 
        if (sw && sw.slideTo) {
          // reset visible index to first real slide (consider looped instances)
          if (sw.params && sw.params.loop) {
            try { sw.loopFix && sw.loopFix(); } catch(_){}
          } else {
            sw.slideTo && sw.slideTo(0, 0, false);
          }
        }
      } catch(e){}
    }
  });

  // ensure the countries panel (slide 3) is not accidentally shown when showing country swiper
  const countriesPanel = document.getElementById('countries');
  if (countriesPanel) {
    countriesPanel.classList.add('hidden'); // keep country detail panel hidden while showing country swiper
  }
}


// centralized helper: restore main view and re-sync globe + swiper
async function restoreMainViewAndSync() {
  // UI restore
  const headerSubheading = document.querySelector('.header h2');
  if (headerSubheading) headerSubheading.textContent = "Our global collaborations";
  const headerDiv = document.querySelector('.header');
  if (headerDiv) headerDiv.style.display = 'flex';
  const countriesSubheading = document.querySelector('#countries .sub-heading');
  if (countriesSubheading) countriesSubheading.textContent = 'Our global collaborations';

  // Hide country detail panel
  if (country) {
    country.classList.remove('visible');
    country.classList.add('hidden');
  }

  // Hide child swipers
  try { if (typeof hideAllCountrySwipers === 'function') hideAllCountrySwipers(); } catch(e){ console.debug(e); }

  // Reapply main highlights on DOM SVG before serializing
  try {
    if (typeof clearAllCountryHighlights === 'function') clearAllCountryHighlights();
    (countriesToHighlight || []).forEach(name => {
      let el = (typeof findPathByCountryName === 'function') ? findPathByCountryName(name) : null;
      if (!el) {
        const id = String(name).replace(/\s+/g, '');
        el = document.querySelector(`#worldMap [id="${id}"]`);
      }
      if (el) el.classList.add('country-highlight');
    });
  } catch (e) { console.debug('reapply highlights failed', e); }

  // Rebuild globe texture safely
  const svg = document.getElementById('worldMap');
  let svgDataUri = '';
  try {
    if (typeof getSvgDataUri === 'function') svgDataUri = getSvgDataUri(svg);
    if (!svgDataUri) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      svgDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
  } catch (e) { console.debug('SVG -> dataURI failed', e); }

  // Recreate globe container preserving glow
  const globeContainer = document.getElementById('myearth');
  const glowElement = document.getElementById('glow');
  try { if (glowElement) glowElement.remove(); } catch(_) {}
  globeContainer.innerHTML = '';
  globeContainer.classList.remove('shifted');
  globeContainer.appendChild(glowElement || (() => { const d = document.createElement('div'); d.id='glow'; return d; })());

  // Destroy and recreate Earth instance
  try { myearth = null; } catch(_) {}
  try {
    myearth = new Earth('myearth', {
      location: { lat: 20, lng: 20 },
      light: 'none',
      transparent: true,
      autoRotate: true,
      autoRotateSpeed: 1.2,
      autoRotateStart: 2000,
      mapImage: svgDataUri,
      zoom: 1.0,
      minZoom: 0.8,
      maxZoom: 5.0
    });
  } catch (err) { console.error('Earth recreate failed', err); }

  // Clear flags & restart region swiper
  isCountrySelected = false;
  isContinentSelected = false;
  try {
    regionSwiper && regionSwiper.update && regionSwiper.update();
    regionSwiper && regionSwiper.autoplay && regionSwiper.autoplay.start && regionSwiper.autoplay.start();
    regionSwiper && regionSwiper.mousewheel && regionSwiper.mousewheel.enable && regionSwiper.mousewheel.enable();
  } catch (err) { console.debug('resume regionSwiper failed', err); }

  // Wait for globe then rotate to active continent (use consistent timing)
  try { await waitForGoTo(Math.max(300, COUNTRY_ANIM_MS)); } catch (_) {}
  setTimeout(() => {
    try { rotateToCurrentContinent(); } catch (err) { console.debug(err); }
  }, 50);

  // Show main region swiper
  const vs = document.getElementById('vertical-swiper');
  if (vs) vs.classList.remove('hidden');
}

// Unified back handlers: both visible back buttons call the same restore helper
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    restoreMainViewAndSync().catch(err => console.debug(err));
  });
});

document.querySelectorAll('.logo-back-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    restoreMainViewAndSync().catch(err => console.debug(err));
  });
});

// Region click → show the right country swiper
document.querySelector('#vertical-swiper').addEventListener('click', async (e) => {
    const regionLink = e.target.closest('.regions');
    if (!regionLink) return;

    const region = (regionLink.dataset.region || '').trim();
    updateSubheading(region);

    // Rotate to continent before switching
    const regionLower = region.toLowerCase();
    const coords = continentCoords[regionLower];
    if (coords && myearth && myearth.goTo) {
        myearth.goTo(coords, { relativeDuration: 1500, approachAngle: 15, zoom: 1.0 });
        // stop globe auto-rotation when a continent is selected
        try {
          isContinentSelected = true;
          myearth.autoRotate = false;
          if (typeof myearth.autoRotateSpeed !== 'undefined') myearth.autoRotateSpeed = 0;
        } catch (e) { console.debug('stop autoRotate failed', e); }
    }

    document.getElementById('vertical-swiper').classList.add('hidden');

if (regionLower === "asia") {
        activeCountrySwiperSelector = '#asia-swiper';
        showOnlyCountrySwiper(activeCountrySwiperSelector);
    } else if (regionLower === "europe") {
        activeCountrySwiperSelector = '#europe-swiper';
        showOnlyCountrySwiper(activeCountrySwiperSelector);
    } else if (regionLower === "northamerica") {
        activeCountrySwiperSelector = '#northamerica-swiper';
        showOnlyCountrySwiper(activeCountrySwiperSelector);
    } else if (regionLower === "africa") {
        activeCountrySwiperSelector = '#africa-swiper';
        showOnlyCountrySwiper(activeCountrySwiperSelector);
    } else {
        activeCountrySwiperSelector = null;
        hideAllCountrySwipers();
    }

    // ensure panel nav reflects the currently shown country-swiper
    createCountryPanelNav();
    updateCountryPanelNavForSelector(activeCountrySwiperSelector);
});

// backbutton for swipers
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const headerSubheading = document.querySelector('.header h2');
        if (headerSubheading) {
            headerSubheading.textContent = "Our global collaborations";
        }

        btn.parentElement.classList.add('hidden');
        document.getElementById('vertical-swiper').classList.remove('hidden');
        
        // Rotate back to current continent
        try {
          isContinentSelected = false;
          if (myearth) {
            myearth.autoRotate = true;
            if (typeof myearth.autoRotateSpeed !== 'undefined') myearth.autoRotateSpeed = 1.2;
          }
        } catch (e) { console.debug(e); }

        setTimeout(() => {
            rotateToCurrentContinent();
        }, 100);
    });
});


// backbutton for swipers
 document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Reset the header subheading
        const headerSubheading = document.querySelector('.header h2');
        if (headerSubheading) {
          headerSubheading.textContent = "Our global collaborations";
        }

        // Hide current swiper and show main region swiper
        btn.parentElement.classList.add('hidden');
        document.getElementById('vertical-swiper').classList.remove('hidden');
      });
    });


      document.querySelectorAll('.country').forEach(countryEl => {
    countryEl.addEventListener('click', async (e) => {
      e.preventDefault(); // prevent link reload

      const countryName = (countryEl.textContent || '').trim();
      const countryNameLower = countryName.toLowerCase();

      // Get location data for the country
      let loc = countries[countryName] || countries[countryNameLower];
      if (!loc) {
        const countryKey = Object.keys(countries).find(
          key => key.toLowerCase() === countryNameLower
        );
        if (countryKey) {
          loc = countries[countryKey];
        }
      }

      const countryId = countryName.replace(/\s+/g, '');
      if (loc) {
        // Pass the location to highlightSVGCountry
// mark selection to stop swiper-driven rotations
         isCountrySelected = true;
         // stop swiper autoplay to avoid further slide changes driving the globe
         try {
          [regionSwiper, asiaSwiper, europeSwiper, naSwiper, africaSwiper, southAmericaSwiper].forEach(s => {
             if (!s) return;
            s.autoplay && s.autoplay.stop && s.autoplay.stop();
             s.mousewheel && s.mousewheel.disable && s.mousewheel.disable();
           });
         } catch (_) {}
 
       // perform synchronized highlight + globe animation + UI shift
         await highlightSVGCountry(countryId, loc, COUNTRY_ANIM_MS);
      }

// Hide the header div when a country is clicked
const headerDiv = document.querySelector('.header');
if (headerDiv) {
  headerDiv.style.display = 'none';
}

// Function to format country name for display
function formatCountryDisplay(name) {
  if (!name) return '';
  const formatted = name.trim();
  return `In ${formatted}`;
}

// Update the subheading in the countries div
const countriesSubheading = document.querySelector('#countries .sub-heading');
if (countriesSubheading) {
  countriesSubheading.textContent = formatCountryDisplay(countryName);
}

if (myearth) {
  // Debug logging to see what's happening
  console.log('Country clicked:', countryName);
  console.log('Country lowercase:', countryNameLower);
  console.log('Available countries:', Object.keys(countries));
  
  let loc = countries[countryName] || countries[countryNameLower];
  
  // If still not found, try searching case-insensitive
  if (!loc) {
    const countryKey = Object.keys(countries).find(
      key => key.toLowerCase() === countryNameLower
    );
    if (countryKey) {
      loc = countries[countryKey];
    }
  }
  
  console.log('Location found:', loc);

  if (loc) {
    try {
      // Stop autorotation when clicking any country
      myearth.autoRotate = false;

      await waitForGoTo();

      // Stop auto-rotation immediately
      myearth.autoRotate = false;

      // Disable user interaction
      myearth.draggable = false;
      myearth.scrollable = false;
      
      // Fly to the country
      myearth.goTo(loc, { relativeDuration: 2000, approachAngle: 20, zoom: 5 });
      // highlightCountry(loc);

      // Ensure the globe stays stopped and locked after animation
      setTimeout(() => {
        myearth.autoRotate = false;
        myearth.draggable = false;
        myearth.scrollable = false;
      }, 2200); // wait for animation to complete

    } catch (err) {
      console.error(err);
    }
  }
}
 // Animate globe shift
  const globe = document.getElementById("myearth");
  globe.classList.add("shifted");

  // Wait until the transform finishes, then show #countries
  setTimeout(() => {
    country.classList.remove("hidden");
    country.classList.add("visible");
  // Update country panel heading with styled country name
  const countryPanelHeading = document.querySelector('#countries h1.heading');
  if (countryPanelHeading) countryPanelHeading.innerHTML = `<span class="presence-label">Our Presence in</span><br><span class="country-name">${countryName}</span>`;
  }, 1000); // matches transition time
      


      // --- Hide all swipers ---
      document.querySelectorAll('.swiper').forEach(swiper => {
        swiper.classList.add('hidden');
      });
      country.classList.remove('hidden');
      // countries


      // --- Hide all country-boxes ---
      document.querySelectorAll('.country-boxes').forEach(box => {
        box.classList.add('hidden');
      });

      // --- Show only the selected country-box ---
      const targetBox = document.querySelector(`.country-boxes[data-place="${countryNameLower}"]`);
      if (targetBox) {
        targetBox.classList.remove('hidden');
      }
            // Make sure back button is visible
      const backBtn = document.querySelector('.logo-back-btn');
      if (backBtn) {
        backBtn.style.display = 'block';
      }
      console.log('Showing country box for:', countryNameLower); // Debug log
    });
  });

  
  document.querySelectorAll('.country-boxes').forEach(box => {
    
      const backBtn = document.querySelector('.logo-back-btn');


backBtn.addEventListener('click', async () => {
    // Restore header and UI
    const headerSubheading = document.querySelector('.header h2');
    if (headerSubheading) headerSubheading.textContent = "Our global collaborations";

    country.classList.remove('visible');
    country.classList.add('hidden');

    const headerDiv = document.querySelector('.header');
    if (headerDiv) headerDiv.style.display = 'flex';

    const countriesSubheading = document.querySelector('#countries .sub-heading');
    if (countriesSubheading) countriesSubheading.textContent = 'Our global collaborations';

    // Hide all child country-swipers immediately
    try { if (typeof hideAllCountrySwipers === 'function') hideAllCountrySwipers(); } catch(e) { console.debug(e); }

    // Clear DOM highlights and reapply main highlights BEFORE serializing
    try {
      if (typeof clearAllCountryHighlights === 'function') clearAllCountryHighlights();
      countriesToHighlight.forEach(name => {
        // prefer robust finder if available
        let el = (typeof findPathByCountryName === 'function') ? findPathByCountryName(name) : null;
        if (!el) {
          const id = String(name).replace(/\s+/g, '');
          el = document.querySelector(`#worldMap [id="${id}"]`);
        }
        if (el) el.classList.add('country-highlight');
      });
    } catch (e) { console.debug('reapply highlights failed', e); }

    // Rebuild globe texture safely (prefer getSvgDataUri if available)
    const svg = document.getElementById('worldMap');
    let svgDataUri = '';
    try {
      if (typeof getSvgDataUri === 'function') svgDataUri = getSvgDataUri(svg);
      if (!svgDataUri) {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        svgDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      }
    } catch (e) {
      console.debug('SVG -> dataURI failed', e);
    }

    // Recreate globe container preserving glow
    const globeContainer = document.getElementById('myearth');
    const glowElement = document.getElementById('glow');
    if (glowElement) glowElement.remove();
    globeContainer.innerHTML = '';
    globeContainer.classList.remove('shifted');
    globeContainer.appendChild(glowElement || (() => { const d = document.createElement('div'); d.id='glow'; return d; })());

    // Destroy and recreate Earth instance with the new texture
    try { myearth = null; } catch (_) {}
    try {
      myearth = new Earth('myearth', {
        location: { lat: 20, lng: 20 },
        light: 'none',
        transparent: true,
        autoRotate: true,
        autoRotateSpeed: 1.2,
        autoRotateStart: 2000,
        mapImage: svgDataUri,
        zoom: 1.0,
        minZoom: 0.8,
        maxZoom: 5.0
      });
    } catch (err) {
      console.error('Earth recreate failed', err);
   }

    // Clear selection flags so swiper-driven rotation resumes
    isCountrySelected = false;
    isContinentSelected = false;

    // Ensure region swiper is active and restarted
    try {
      regionSwiper && regionSwiper.update && regionSwiper.update();
      regionSwiper && regionSwiper.autoplay && regionSwiper.autoplay.start && regionSwiper.autoplay.start();
      regionSwiper && regionSwiper.mousewheel && regionSwiper.mousewheel.enable && regionSwiper.mousewheel.enable();
    } catch (err) { console.debug('resume regionSwiper failed', err); }

    // Wait until Earth.goTo is available then sync rotation to active slide
    try { await waitForGoTo(Math.max(300, COUNTRY_ANIM_MS)); } catch (_) {}
    // give swiper a small moment to settle state then rotate
    setTimeout(() => {
      try { rotateToCurrentContinent(); } catch (err) { console.debug(err); }
    }, 50);

    // Finally show main region swiper
    document.getElementById('vertical-swiper').classList.remove('hidden');
  });
 });

