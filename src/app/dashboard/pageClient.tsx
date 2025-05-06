'use client'

const DashboardClient = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-[#FADADD] rounded-2xl p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Learning Dashboard</h1>
                <p className="text-gray-700">Track your progress and manage your vocabulary lists</p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-2 border-[#FADADD]">
                    <h3 className="text-lg font-semibold text-gray-800">Words Learned</h3>
                    <p className="text-3xl font-bold text-[#FADADD]">150</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-2 border-[#FADADD]">
                    <h3 className="text-lg font-semibold text-gray-800">Current Streak</h3>
                    <p className="text-3xl font-bold text-[#FADADD]">7 days</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-2 border-[#FADADD]">
                    <h3 className="text-lg font-semibold text-gray-800">Time Spent</h3>
                    <p className="text-3xl font-bold text-[#FADADD]">5.2 hrs</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-2 border-[#FADADD]">
                    <h3 className="text-lg font-semibold text-gray-800">Achievement</h3>
                    <p className="text-3xl font-bold text-[#FADADD]">12</p>
                </div>
            </div>

            {/* Recent Activity & Vocabulary Lists */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        <div className="border-b pb-2">
                            <p className="text-gray-800">Completed Chapter 3</p>
                            <p className="text-sm text-gray-600">2 hours ago</p>
                        </div>
                        <div className="border-b pb-2">
                            <p className="text-gray-800">Learned 10 new words</p>
                            <p className="text-sm text-gray-600">Yesterday</p>
                        </div>
                        <div className="border-b pb-2">
                            <p className="text-gray-800">Started Chapter 4</p>
                            <p className="text-sm text-gray-600">Yesterday</p>
                        </div>
                    </div>
                </div>

                {/* Vocabulary Lists */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Vocabulary Lists</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div>
                                <p className="text-gray-800">Basic Words</p>
                                <p className="text-sm text-gray-600">20 words</p>
                            </div>
                            <button className="text-[#FADADD] hover:text-pink-600">Review</button>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <div>
                                <p className="text-gray-800">Advanced Vocabulary</p>
                                <p className="text-sm text-gray-600">15 words</p>
                            </div>
                            <button className="text-[#FADADD] hover:text-pink-600">Review</button>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <div>
                                <p className="text-gray-800">Daily Practice</p>
                                <p className="text-sm text-gray-600">30 words</p>
                            </div>
                            <button className="text-[#FADADD] hover:text-pink-600">Review</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardClient
