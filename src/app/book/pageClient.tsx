"use client";

// @ts-ignore
import HTMLFlipBook from "react-pageflip";

const BookClient = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Vocabulary Book</h1>
        <p className="text-gray-600">Flip through the pages to learn new words</p>
      </div>

      {/* Book Container */}
      <div className="flex items-center justify-center min-h-[600px] bg-[#FADADD] bg-opacity-10 rounded-2xl p-8">
        {/* @ts-ignore */}
        <HTMLFlipBook 
          width={300} 
          height={400} 
          className="shadow-2xl"
          showCover={true}
          maxShadowOpacity={0.5}
        >
          {/* Cover */}
          <div className="w-full h-full flex items-center justify-center bg-[#FADADD] text-xl p-6 rounded">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Word Book</h2>
              <p className="text-gray-700">Your Vocabulary Journey</p>
            </div>
          </div>

          {/* Content Pages */}
          <div className="w-full h-full flex items-center justify-center bg-white text-xl p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Chapter 1: Basic Words</h3>
              <div className="space-y-2">
                <p className="text-gray-700">Hello - สวัสดี</p>
                <p className="text-gray-700">Thank you - ขอบคุณ</p>
                <p className="text-gray-700">Good morning - สวัสดีตอนเช้า</p>
              </div>
            </div>
          </div>

          <div className="w-full h-full flex items-center justify-center bg-white text-xl p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Chapter 2: Common Phrases</h3>
              <div className="space-y-2">
                {/* <p className="text-gray-700">How are you? - เป็นอย่างไร</p>
                <p className="text-gray-700">Nice to meet you - ยินดีที่ได้รู้จัก</p>
                <p className="text-gray-700">See you later - แล้วพบกันใหม่</p> */}
              </div>
            </div>
          </div>

          <div className="w-full h-full flex items-center justify-center bg-white text-xl p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Chapter 3: Daily Life</h3>
              <div className="space-y-2">
                <p className="text-gray-700">Food - อาหาร</p>
                <p className="text-gray-700">Water - น้ำ</p>
                <p className="text-gray-700">Time - เวลา</p>
              </div>
            </div>
          </div>

          {/* Back Cover */}
          <div className="w-full h-full flex items-center justify-center bg-[#FADADD] text-xl p-6 rounded">
            <div className="text-center">
              <p className="text-gray-800">Continue Learning!</p>
            </div>
          </div>
        </HTMLFlipBook>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center space-x-4 mt-8">
        <button className="bg-[#FADADD] text-gray-800 px-6 py-2 rounded-lg hover:bg-pink-200 transition-colors">
          Previous Page
        </button>
        <button className="bg-[#FADADD] text-gray-800 px-6 py-2 rounded-lg hover:bg-pink-200 transition-colors">
          Next Page
        </button>
      </div>
    </div>
  );
};

export default BookClient;
