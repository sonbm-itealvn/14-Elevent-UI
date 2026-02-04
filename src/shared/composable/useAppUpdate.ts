import { onMounted, onUnmounted } from 'vue';

// Build timestamp - sẽ được inject bởi Vite build
const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP || Date.now().toString();

let checkInterval: ReturnType<typeof setInterval> | null = null;

export const useAppUpdate = () => {

  const checkForUpdate = async () => {
    try {
      // Fetch version file với cache busting
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverTimestamp = data.timestamp || data.buildTime;
        
        if (serverTimestamp && serverTimestamp !== BUILD_TIMESTAMP) {
          showUpdateNotification();
          return true; // Có update
        }
      }
    } catch (error) {
      // File không tồn tại hoặc lỗi network - không làm gì (bình thường trong dev mode)
      console.debug('Version check failed (expected in dev mode):', error);
    }
    return false; // Không có update
  };

  const showUpdateNotification = () => {
    // Sử dụng browser confirm dialog
    const shouldReload = window.confirm(
      'Đã có phiên bản mới của ứng dụng. Bạn có muốn tải lại trang để cập nhật không?'
    );
    
    if (shouldReload) {
      // Clear cache và reload
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      window.location.reload();
    }
  };

  const startChecking = () => {
    // Check mỗi 5 phút
    checkInterval = setInterval(() => {
      checkForUpdate();
    }, 5 * 60 * 1000);
    
    // Check ngay sau khi mount
    setTimeout(() => {
      checkForUpdate();
    }, 3000); // Đợi 3 giây sau khi app load xong
  };

  const stopChecking = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };

  onMounted(() => {
    startChecking();
  });

  onUnmounted(() => {
    stopChecking();
  });

  return {
    checkForUpdate,
  };
};

