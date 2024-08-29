// app/components/Loader.tsx
const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-ping"></div>
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    </div>
  );
};

export default Loader;
