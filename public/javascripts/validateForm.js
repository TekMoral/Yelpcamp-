(() => {
  'use strict'
  const forms = document.querySelectorAll('.validated-form');
  
  Array.from(forms).forEach(form => {
      // Get the rating fieldset and create an alert div if it doesn't exist
      const ratingSection = form.querySelector('.starability-heart');
      const alertDiv = document.createElement('div');
      alertDiv.classList.add('alert', 'alert-danger', 'mt-3');
      alertDiv.style.display = 'none';
      alertDiv.role = 'alert';
      alertDiv.textContent = 'Please select a star rating before submitting!';
      ratingSection.after(alertDiv);

      form.addEventListener('submit', event => {
          // Remove any existing alerts
          alertDiv.style.display = 'none';

          // Check if any rating is selected
          const ratingInputs = form.querySelectorAll('input[name="review[rating]"]');
          const ratingSelected = Array.from(ratingInputs).some(input => input.checked);

          if (!ratingSelected) {
              event.preventDefault();
              event.stopPropagation();
              
              // Show the alert
              alertDiv.style.display = 'block';
              
              // Scroll to the rating section
              ratingSection.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
              });

              // Add shake animation to the rating section
              ratingSection.classList.add('shake');
              setTimeout(() => {
                  ratingSection.classList.remove('shake');
              }, 650);
          }

          form.classList.add('was-validated');
      }, false);

      // Clear alert when a rating is selected
      const ratingInputs = form.querySelectorAll('input[name="review[rating]"]');
      ratingInputs.forEach(input => {
          input.addEventListener('change', () => {
              alertDiv.style.display = 'none';
          });
      });
  });
})()
