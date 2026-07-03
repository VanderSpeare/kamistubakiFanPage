// src/hooks/useBodyClass.js
// ════════════════════════════════════════════════════════════════
// Hook thêm/xóa class trên <body> theo route hiện tại.
// Dùng để CSS global (index.css) ẩn các layer Landing
// (base-black, bottom-image, bottom-color) khi vào trang Teams.
//
// Cách dùng trong Teams.jsx:
//   import useBodyClass from "../hooks/useBodyClass";
//   useBodyClass("page-teams");
//
// Khi component unmount (navigate ra), class tự động bị xóa.
// ════════════════════════════════════════════════════════════════

import { useEffect } from "react";

export default function useBodyClass(className) {
  useEffect(() => {
    document.body.classList.add(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, [className]);
}