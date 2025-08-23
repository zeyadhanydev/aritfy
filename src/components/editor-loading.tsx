import React from 'react';

export const EditorLoading = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Navbar Loading */}
      <div className="h-[68px] w-full bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar Loading */}
        <div className="w-[100px] bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>

        {/* Main Content Loading */}
        <div className="flex-1 bg-gray-100 flex flex-col">
          {/* Toolbar Loading */}
          <div className="h-[56px] bg-white border-b border-gray-200 flex items-center px-4">
            <div className="flex items-center space-x-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-8 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Canvas Area Loading */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="text-gray-600 font-medium">Loading Editor...</div>
                <div className="text-gray-400 text-sm">Setting up your workspace</div>
              </div>
            </div>
          </div>

          {/* Footer Loading */}
          <div className="h-[52px] bg-white border-t border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
