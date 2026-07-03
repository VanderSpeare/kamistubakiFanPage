import React from 'react';
import { Link } from 'react-router-dom';

export default function services() {    
    return (    
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-[var(--primary)] mb-4">404</h1>
            
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