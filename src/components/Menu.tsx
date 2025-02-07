import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "registrar"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "registrar"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher", "registrar"],
      },
      {
        icon: "/registrar.png",
        label: "Registrars",
        href: "/list/registrars",
        visible: ["admin"],
      },
      {
        icon: "/subject.png",
        label: "Courses",
        href: "/list/courses",
        visible: ["registrar"],
      },
      {
        icon: "/subject.png",
        label: "Alloted Subjects",
        href: "/list/allotedSubjects",
        visible: ["teacher"],
      },
      {
        icon: "/class.png",
        label: "Branches",
        href: "/list/branches",
        visible: ["registrar", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lectures",
        href: "/list/lectures",
        visible: ["teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: [ "teacher", "registrar"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["teacher"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: [ "teacher"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "registrar"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "registrar"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "registrar"],
      },
      // {
      //   icon: "/setting.png",
      //   label: "Settings",
      //   href: "/settings",
      //   visible: ["admin", "teacher", "student", "registrar"],
      // },
      // {
      //   icon: "/logout.png",
      //   label: "Logout",
      //   href: "/logout",
      //   visible: ["admin", "teacher", "student", "registrar"],
      // },
    ],
  },
];

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
