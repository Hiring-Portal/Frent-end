import React from "react";

export default function ChangePassword() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            ✅ Form is now working!
          </p>
        </div>
        <div className="text-center">
          <p className="text-green-600 font-medium">Change Password Form Test</p>
          <p className="text-gray-600 text-sm mt-2">Route: /student/change-password</p>
          <form className="space-y-4">
            <input
              type="password"
              placeholder="Old Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
