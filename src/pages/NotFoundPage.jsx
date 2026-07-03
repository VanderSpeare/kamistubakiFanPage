import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[var(--primary)] mb-4">404</h1>
        <h2 className="text-4xl font-semibold mb-6">Trang không tìm thấy</h2>
        <p className="text-xl text-gray-600 mb-10">Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Link 
          to="/"
          className="inline-block bg-[var(--accent)] text-white font-bold py-4 px-10 rounded-full text-lg hover:shadow-xl transition"
        >
          Quay về Trang Chủ
        </Link>
      </div>
    </div>
  );
}