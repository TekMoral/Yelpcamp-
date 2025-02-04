(() => {
    'use strict';

    // Get all forms with the 'validated-form' class
    const forms = document.querySelectorAll('.validated-form');

    // Process each form
    Array.from(forms).forEach(form => {
        // Handle form submission
        form.addEventListener('submit', handleFormSubmit);

        // Handle rating input changes if they exist
        setupRatingValidation(form);
    });

    // Main form submission handler
    function handleFormSubmit(event) {
        const form = event.currentTarget;

        // Check basic HTML validation
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Check rating validation if it's a review form
        if (isReviewForm(form)) {
            validateRating(event, form);
        }

        // Add validation classes
        form.classList.add('was-validated');
    }

    // Setup rating validation listeners
    function setupRatingValidation(form) {
        const ratingInputs = form.querySelectorAll('input[name="review[rating]"]');
        
        ratingInputs.forEach(input => {
            input.addEventListener('change', () => {
                const alertDiv = form.querySelector('.rating-alert');
                if (alertDiv) {
                    alertDiv.style.display = 'none';
                }
            });
        });
    }

    // Check if the form is a review form
    function isReviewForm(form) {
        return form.querySelector('.starability-heart') !== null;
    }

    // Validate rating selection
    function validateRating(event, form) {
        const ratingSection = form.querySelector('.starability-heart');
        const ratingInputs = form.querySelectorAll('input[name="review[rating]"]');
        const ratingSelected = Array.from(ratingInputs).some(input => input.checked);

        // Create or get alert div
        let alertDiv = getOrCreateAlertDiv(form, ratingSection);

        // Hide alert before checking
        alertDiv.style.display = 'none';

        if (!ratingSelected) {
            event.preventDefault();
            event.stopPropagation();
            
            showRatingError(alertDiv, ratingSection);
        }
    }

    // Create or get the rating alert div
    function getOrCreateAlertDiv(form, ratingSection) {
        let alertDiv = form.querySelector('.rating-alert');
        
        if (!alertDiv) {
            alertDiv = document.createElement('div');
            alertDiv.classList.add('alert', 'alert-danger', 'mt-3', 'rating-alert');
            alertDiv.style.display = 'none';
            alertDiv.setAttribute('role', 'alert');
            alertDiv.textContent = 'Please select a star rating before submitting!';
            ratingSection.after(alertDiv);
        }

        return alertDiv;
    }

    // Show rating error with animation
    function showRatingError(alertDiv, ratingSection) {
        // Show alert
        alertDiv.style.display = 'block';

        // Scroll to rating section
        ratingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Add shake animation
        ratingSection.classList.add('shake');
        setTimeout(() => {
            ratingSection.classList.remove('shake');
        }, 650);
    }
})();
