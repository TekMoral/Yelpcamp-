(() => {
  "use strict";

  const forms = document.querySelectorAll(".validated-form");

  Array.from(forms).forEach((form) => {
    // Handle review form validation (rating selection)
    const ratingSection = form.querySelector(".starability-heart");
    let alertDiv;

    if (ratingSection) {
      alertDiv = document.createElement("div");
      alertDiv.classList.add("alert", "alert-danger", "mt-3");
      alertDiv.style.display = "none";
      alertDiv.role = "alert";
      alertDiv.textContent = "Please select a star rating before submitting!";
      ratingSection.after(alertDiv);
    }

    // Add input event listeners for real-time validation
    const inputs = form.querySelectorAll("input[required], textarea[required]");
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        // Remove existing error messages
        const errorSpan = this.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains("error-message")) {
          errorSpan.remove();
        }

        // Handle price validation
        if (this.name === "campground[price]") {
          const price = parseFloat(this.value);
          if (price < 0) {
            this.classList.add("is-invalid");
            this.classList.remove("is-valid");
            return;
          }
        }

        // Update validation classes based on input validity
        if (this.checkValidity()) {
          this.classList.remove("is-invalid");
          this.classList.add("is-valid");
        } else {
          this.classList.remove("is-valid");
          this.classList.add("is-invalid");
        }
      });
    });

    form.addEventListener(
      "submit",
      (event) => {
        let isValid = true;

        // Validate rating selection (Review Form)
        if (ratingSection) {
          alertDiv.style.display = "none";
          const ratingInputs = form.querySelectorAll(
            'input[name="review[rating]"]'
          );
          const ratingSelected = Array.from(ratingInputs).some(
            (input) => input.checked
          );

          if (!ratingSelected) {
            event.preventDefault();
            isValid = false;

            alertDiv.style.display = "block";
            ratingSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            ratingSection.classList.add("shake");
            setTimeout(() => ratingSection.classList.remove("shake"), 650);
          }
        }

        // Validate required input fields
        const requiredFields = form.querySelectorAll(
          "input[required], textarea[required]"
        );
        requiredFields.forEach((field) => {
          const errorSpan = field.nextElementSibling;
          if (errorSpan && errorSpan.classList.contains("error-message")) {
            errorSpan.remove();
          }

          const priceInput = document.querySelector("#price");
          if (priceInput) {
            priceInput.addEventListener("input", function () {
              if (this.value === "") {
                this.classList.add("is-invalid");
                this.classList.remove("is-valid");
              } else if (parseFloat(this.value) < 0) {
                this.classList.add("is-invalid");
                this.classList.remove("is-valid");
              } else {
                this.classList.remove("is-invalid");
                this.classList.add("is-valid");
              }
            });
          }

          if (!field.value.trim()) {
            event.preventDefault();
            isValid = false;
            field.classList.add("is-invalid");
            field.classList.remove("is-valid");
          } else {
            field.classList.remove("is-invalid");
            field.classList.add("is-valid");
          }
        });

        if (!isValid) {
          event.stopPropagation();
          event.preventDefault();
        } else {
          // Disable submit to prevent duplicate submissions and show loading state
          const submitBtn = form.querySelector('.js-submit-btn, button[type="submit"], button:not([type]), input[type="submit"]');
          if (submitBtn && !submitBtn.disabled) {
            // Determine loading text
            const action = (form.getAttribute('action') || '').toLowerCase();
            const isLoginForm = action.includes('/login') || (typeof window !== 'undefined' && window.location && window.location.pathname === '/login');
            const loadingText = submitBtn.dataset.loadingText || (isLoginForm ? 'Logging in...' : 'Processing...');

            // Preserve original label
            if (submitBtn.tagName.toLowerCase() === 'button') {
              submitBtn.dataset.originalText = submitBtn.innerHTML;
              submitBtn.innerHTML = `${loadingText} <span class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>`;
            } else {
              submitBtn.dataset.originalText = submitBtn.value || 'Submit';
              submitBtn.value = loadingText;
            }

            submitBtn.disabled = true;
            submitBtn.classList.add('disabled');
            submitBtn.setAttribute('aria-disabled', 'true');
          }
        }

        form.classList.add("was-validated");
      },
      false
    );

    // Clear rating alert when a rating is selected
    if (ratingSection) {
      const ratingInputs = form.querySelectorAll(
        'input[name="review[rating]"]'
      );
      ratingInputs.forEach((input) => {
        input.addEventListener("change", () => {
          alertDiv.style.display = "none";
        });
      });
    }
  });
})();
