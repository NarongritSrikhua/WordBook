"use client";

// @ts-ignore
import HTMLFlipBook from "react-pageflip";

const BookClient = () => {
  return (
    <>
      <div className="flex justify-center">
        Book
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <HTMLFlipBook width={300} height={400} className="shadow-lg">
          <div className="w-full h-full flex items-center justify-center bg-white text-xl p-6">
            หน้า 1: บทนำ
          </div>
          <div className="w-full h-full flex items-center justify-center bg-white text-xl p-6">
            หน้า 2: เนื้อหาแรก
          </div>
          <div className="w-full h-full flex items-center justify-center bg-white text-xl p-6">
            หน้า 3: เนื้อหาต่อไป
          </div>
          <div className="w-full h-full flex items-center justify-center bg-white text-xl p-6">
            หน้า 4: สรุป
          </div>
        </HTMLFlipBook>
      </div>
    </>
  );
};

export default BookClient;
