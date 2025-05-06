'use client'

const HomeClient = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800">
                    Welcome to <span className="text-[#FADADD]">Word Book</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Your personal vocabulary learning companion
                </p>
                <div className="space-x-4">
                    <a 
                        href="/book" 
                        className="bg-[#FADADD] text-white px-8 py-3 rounded-lg hover:bg-pink-400 transition-colors inline-block"
                    >
                        Start Reading
                    </a>
                    <a 
                        href="/practice" 
                        className="bg-white text-[#FADADD] border-2 border-[#FADADD] px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors inline-block"
                    >
                        Practice Now
                    </a>
                </div>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-[#FADADD]">
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Interactive Learning</h3>
                    <p className="text-gray-600">
                        Engage with our interactive book interface for an immersive learning experience
                    </p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-[#FADADD]">
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Track Progress</h3>
                    <p className="text-gray-600">
                        Monitor your learning journey through the dashboard
                    </p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-[#FADADD]">
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Personalized Content</h3>
                    <p className="text-gray-600">
                        Learn at your own pace with customized vocabulary lists
                    </p>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-[#FADADD] bg-opacity-10 rounded-2xl p-8 mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Why Choose Word Book?</h2>
                <div className="grid md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-[#FADADD] mb-2">1000+</div>
                        <div className="text-gray-600">Active Users</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-[#FADADD] mb-2">5000+</div>
                        <div className="text-gray-600">Words Available</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-[#FADADD] mb-2">100+</div>
                        <div className="text-gray-600">Daily Lessons</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-[#FADADD] mb-2">4.8</div>
                        <div className="text-gray-600">User Rating</div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-800">
                    Ready to expand your vocabulary?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                    Start your learning journey today with Word Book
                </p>
                <div className="space-x-4">
                    <a 
                        href="/dashboard" 
                        className="bg-[#FADADD] text-white px-8 py-3 rounded-lg hover:bg-pink-400 transition-colors inline-block"
                    >
                        Go to Dashboard
                    </a>
                    <a 
                        href="/profile" 
                        className="bg-white text-[#FADADD] border-2 border-[#FADADD] px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors inline-block"
                    >
                        Create Profile
                    </a>
                </div>
            </div>
        </div>
    )
}

export default HomeClient
