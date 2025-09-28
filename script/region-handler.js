document.addEventListener('DOMContentLoaded', function() {
    const regionLinks = document.querySelectorAll('.regions');
    const countryLinks = document.querySelectorAll('.country');
    const subHeadings = document.querySelectorAll('.sub-heading');
    const countriesContainer = document.getElementById('countries');
    const countryBoxesContainer = document.querySelector('.country-boxes');
    
    // Function to handle region clicks
    regionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const region = this.getAttribute('data-region').toUpperCase();
            
            // Update all sub-headings on the page
            subHeadings.forEach(subHeading => {
                subHeading.textContent = `Our global collaborations  ${region}`;
            });
        });
    });

    // Function to handle country clicks
    countryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const countryName = this.querySelector('span').textContent.toLowerCase();
            
            // Show the countries container and update country boxes
            countriesContainer.classList.remove('hidden');
            countryBoxesContainer.classList.remove('hidden');
            
            // Update the sub-heading with the country name
    const subHeading = countriesContainer.querySelector('.sub-heading');
        if (subHeading) {
         const spanText = this.querySelector('span').textContent
            .toLowerCase()
            .replace(/\b\w/g, ch => ch.toUpperCase()); // capitalize each word
        subHeading.textContent = `In ${spanText}`;
    }

            // Update the logo carousel with the selected country's images
            updateCountryBoxImages(countryName);
        });
    });

    // Handle back button clicks
    const backButtons = document.querySelectorAll('.back-btn, .logo-back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parent = this.closest('.swiper, #countries');
            if (parent) {
                parent.classList.add('hidden');
                // Clear carousel interval when hiding the container
                if (window.carouselInterval) {
                    clearInterval(window.carouselInterval);
                }
            }
        });
    });
});