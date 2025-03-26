import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex bg-blue-50">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link
          href="/"
          className="pl-10 flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo1.png" alt="logo" width={32} height={32} />
          <span className="hidden text-xl lg:block font-bold text-blue-950">ISTC</span>
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] overflow-scroll flex flex-col ">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
