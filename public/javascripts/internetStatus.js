document.addEventListener('DOMContentLoaded', function () {
  const statusElement = document.querySelector('#status');
  const offlineMessage = document.querySelector('#offline-message');

  function updateInternetStatus() {
      if (!statusElement || !offlineMessage) {
          console.error("Internet status elements not found in the DOM.");
          return;
      }

      if (navigator.onLine) {
          statusElement.style.display = 'none'; // Hide status bar when online
          offlineMessage.style.display = 'none'; // Hide offline warning
      } else {
          statusElement.style.display = 'block';
          statusElement.textContent = 'No Internet Connection';
          offlineMessage.style.display = 'block'; // Show offline message
      }
  }

  // Check status on load
  updateInternetStatus();

  // Listen for online/offline changes
  window.addEventListener('online', updateInternetStatus);
  window.addEventListener('offline', updateInternetStatus);
});
