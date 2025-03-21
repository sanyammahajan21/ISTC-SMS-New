import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";

const TeacherPage = () => {
  const { userId } = auth();
  return (
    <div className="p-6 bg-blue-80">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 font-mono">TEACHER DASHBOARD</h1>
        <div className="h-1 w-24 bg-blue-700"></div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content - Left Column */}
        <div className="w-full lg:w-8/12 flex flex-col gap-6">
          {/* Schedule Section */}
          {/* <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-6 text-white text-center bg-blue-500 p-2 rounded-md"></h2>
            <div className="h-[450px]">
            </div>
          </div> */}
        </div>
        
        {/* Sidebar - Right Column */}
        <div className="w-full lg:w-4/12 flex flex-col gap-6">
          {/* Announcements Section */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-500 p-2 rounded-md">Announcements</h2>
            <Announcements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
