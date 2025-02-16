(() => {
    'use strict';
  
    const forms = document.querySelectorAll('.validated-form');
  
    Array.from(forms).forEach(form => {
        // Handle review form validation (rating selection)
        const ratingSection = form.querySelector('.starability-heart');
        let alertDiv;
        
        if (ratingSection) {
            alertDiv = document.createElement('div');
            alertDiv.classList.add('alert', 'alert-danger', 'mt-3');
            alertDiv.style.display = 'none';
            alertDiv.role = 'alert';
            alertDiv.textContent = 'Please select a star rating before submitting!';
            ratingSection.after(alertDiv);
        }
  
        form.addEventListener('submit', event => {
            let isValid = true;
  
            // Validate rating selection (Review Form)
            if (ratingSection) {
                alertDiv.style.display = 'none';
                const ratingInputs = form.querySelectorAll('input[name="review[rating]"]');
                const ratingSelected = Array.from(ratingInputs).some(input => input.checked);
  
                if (!ratingSelected) {
                    event.preventDefault();
                    isValid = false;
  
                    alertDiv.style.display = 'block';
                    ratingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
                    ratingSection.classList.add('shake');
                    setTimeout(() => ratingSection.classList.remove('shake'), 650);
                }
            }
  
            // Validate required input fields (New Campground & Edit Campground Forms)
            const requiredFields = form.querySelectorAll('input[required], textarea[required]');
            requiredFields.forEach(field => {
                const errorSpan = field.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('error-message')) {
                    errorSpan.remove();
                }
                if (field.name === 'campground[price]') {
                    const price = parseFloat(field.value);
                    if (price < 0) {
                        event.preventDefault();
                        isValid = false;
                        field.classList.add('is-invalid');
                        return;
                    }
                }

  
                if (!field.value.trim()) {
                    event.preventDefault();
                    isValid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                }
            });
  
            if (!isValid) {
                event.stopPropagation();
                event.preventDefault();
            }
  
            form.classList.add('was-validated');
        }, false);
  
        // Remove error message when user types
        const requiredFields = form.querySelectorAll('input[required], textarea[required]');
        requiredFields.forEach(field => {
            field.addEventListener('input', () => {
                const errorSpan = field.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('error-message')) {
                    errorSpan.remove();
                }
            });
        });
  
        // Clear rating alert when a rating is selected
        if (ratingSection) {
            const ratingInputs = form.querySelectorAll('input[name="review[rating]"]');
            ratingInputs.forEach(input => {
                input.addEventListener('change', () => {
                    alertDiv.style.display = 'none';
                });
            });
        }
    });
  })();
  