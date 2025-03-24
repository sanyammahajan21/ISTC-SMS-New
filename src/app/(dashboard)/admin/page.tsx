import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
<<<<<<< HEAD
    <div className="p-6 bg-blue-50">
=======
    <div className="p-6 bg-blue-100">
>>>>>>> a2b2dbf308c0875a1ba8977daf9b5df9d793b3dd
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2 font-mono">ADMIN DASHBOARD</h1>
        <div className="h-1 w-24 bg-red-500"></div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content - Left Column */}
        <div className="w-full lg:w-8/12 flex flex-col gap-6">
          {/* User Cards Section */}
<<<<<<< HEAD
          <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-400">
=======
          <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-500">
>>>>>>> a2b2dbf308c0875a1ba8977daf9b5df9d793b3dd
          <h2 className="text-lg font-semibold mb-6 text-white text-center bg-blue-900 p-2 rounded-md">System Users</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UserCard type="admin" />
              <UserCard type="teacher" />
              <UserCard type="student" />
              <UserCard type="registrar" />
            </div>
          </div>
          
            {/* Analytics Section */}
<<<<<<< HEAD
            <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-400">
            <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-900 p-2 rounded-md">Attendence</h2>
=======
            <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-500">
            <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-900 p-2 rounded-md">Attendance</h2>
>>>>>>> a2b2dbf308c0875a1ba8977daf9b5df9d793b3dd
            <div className="h-[450px]">
              {/* <AttendanceChartContainer /> */}
            </div>
          </div>
        </div>
        
        {/* Sidebar - Right Column */}
        <div className="w-full lg:w-4/12 flex flex-col gap-6">
          {/* Calendar Section */}
<<<<<<< HEAD
          <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-400">
=======
          <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-500">
>>>>>>> a2b2dbf308c0875a1ba8977daf9b5df9d793b3dd
          <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-900 p-2 rounded-md">Upcoming Events</h2>
            <EventCalendarContainer searchParams={searchParams} />
          </div>
          
          {/* Announcements Section */}
<<<<<<< HEAD
          <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-400">
=======
          <div className="bg-teal-50 p-4 rounded-lg shadow-md border border-red-500">
>>>>>>> a2b2dbf308c0875a1ba8977daf9b5df9d793b3dd
          <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-900 p-2 rounded-md">Announcements</h2>
            <Announcements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;