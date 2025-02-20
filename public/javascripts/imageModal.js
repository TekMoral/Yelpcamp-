document.addEventListener('DOMContentLoaded', function () {
    // Select elements
    const modal = document.querySelector('.fullscreen-modal');
    const modalImage = document.querySelector('.fullscreen-image');
    const closeButton = document.querySelector('.close-button');
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');
    let images = [];
    let currentImageIndex = 0;

    // Function to open the modal
    function openModal(imageElement) {
        modal.style.display = 'flex';
        modalImage.src = imageElement.src;
        
        // Get all carousel images
        images = Array.from(document.querySelectorAll('.carousel-item img'));
        currentImageIndex = images.findIndex(img => img.src === imageElement.src);
        
        // Disable scroll on body when modal is open
        document.body.style.overflow = 'hidden';
    }

    // Function to close the modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Function to show next image
    function showNextImage() {
        if (currentImageIndex < images.length - 1) {
            currentImageIndex++;
        } else {
            currentImageIndex = 0;
        }
        modalImage.src = images[currentImageIndex].src;
    }

    // Function to show previous image
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
        } else {
            currentImageIndex = images.length - 1;
        }
        modalImage.src = images[currentImageIndex].src;
    }

    // Event Listeners
    closeButton.addEventListener('click', closeModal);

    // Close modal when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            }
        }
    });

    // Add click handlers to navigation buttons if they exist
    if (prevButton) prevButton.addEventListener('click', showPrevImage);
    if (nextButton) nextButton.addEventListener('click', showNextImage);

    // Add event listeners to images in the carousel
    const imagesInCarousel = document.querySelectorAll('#campgroundCarousel .carousel-item img');
    imagesInCarousel.forEach(function (img) {
        img.addEventListener('click', function () {
            openModal(img);  // Call openModal with the clicked image
        });
    });
});
