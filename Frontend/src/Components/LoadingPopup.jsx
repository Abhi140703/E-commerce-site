const LoadingPopup = ({ message = "Please wait, products are loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white px-6 py-5 rounded-lg shadow-lg text-center max-w-sm">
        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

        {/* Message */}
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingPopup;
