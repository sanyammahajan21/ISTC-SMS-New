// "use client";

// import * as Clerk from "@clerk/elements/common";
// import * as SignIn from "@clerk/elements/sign-in";
// import { useUser } from "@clerk/nextjs";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// const LoginPage = () => {
//   const { isLoaded, isSignedIn, user } = useUser();

//   const router = useRouter();

//   useEffect(() => {
//     const role = user?.publicMetadata.role;
//     if (role) {
//       router.push(`/${role}`);
//     }
//   }, [user, router]);

//   return (
//     <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
//       <SignIn.Root>
//         <SignIn.Step
//           name="start"
//           className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
//         >
//           <h1 className="text-xl font-bold flex items-center gap-2">
//             <Image src="/logo.png" alt="" width={24} height={24} />
//             Indo Swiss Training Centre
//           </h1>
//           <h2 className="text-gray-400">Sign in to your account</h2>
//           <Clerk.GlobalError className="text-sm text-red-400" />
//           <Clerk.Field name="identifier" className="flex flex-col gap-2">
//             <Clerk.Label className="text-xs text-gray-500">
//               Username
//             </Clerk.Label>
//             <Clerk.Input
//               type="text"
//               required
//               className="p-2 rounded-md ring-1 ring-gray-300"
//             />
//             <Clerk.FieldError className="text-xs text-red-400" />
//           </Clerk.Field>
//           <Clerk.Field name="password" className="flex flex-col gap-2">
//             <Clerk.Label className="text-xs text-gray-500">
//               Password
//             </Clerk.Label>
//             <Clerk.Input
//               type="password"
//               required
//               className="p-2 rounded-md ring-1 ring-gray-300"
//             />
//             <Clerk.FieldError className="text-xs text-red-400" />
//           </Clerk.Field>
//           <SignIn.Action
//             submit
//             className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
//           >
//             Sign In
//           </SignIn.Action>
//         </SignIn.Step>
//       </SignIn.Root>
//     </div>
//   );
// };

// export default LoginPage;

"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = user?.publicMetadata.role;
    if (userRole) {
      router.push(`/${userRole}`);
    }
  }, [user, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-teal-50 via-green-100 to-blue-50">
      <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url("/istc2.jpg")',
            filter: "blur(10px)",
          }}
        ></div>
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-opacity-80 bg-white p-12 rounded-xl shadow-xl flex flex-col gap-6 text-black backdrop-blur-sm border border-blue-900"
        >
          <h1 className="text-3xl font-bold flex items-center gap-2 text-blue-900">
            <Image src="/logo.png" alt="" width={24} height={24} />
            Indo Swiss Training Centre
          </h1>
          <h2 className="text-red-600">Sign in to your account</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <div className="flex flex-col gap-6">
            <Clerk.Field name="identifier" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-black">Username</Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="p-3 rounded-md ring-2 ring-blue-500 bg-teal-50 text-black focus:ring-4 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-md hover:ring-blue-500"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>

            <Clerk.Field name="password" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-black">Password</Clerk.Label>
              <Clerk.Input
                type="password"
                required
                className="p-3 rounded-md ring-2 ring-blue-500 bg-teal-50 text-black focus:ring-4 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-md hover:ring-blue-500"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>

            <Clerk.Field name="role" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-black">Role</Clerk.Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="p-3 rounded-md ring-2 ring-blue-500 bg-teal-50 text-black focus:ring-4 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-md hover:ring-blue-500"
              >
                <option value="">Select Role</option>
                <option value="teacher">Teacher</option>
                <option value="registrar">Registrar</option>
                <option value="admin">Admin</option>
              </select>
            </Clerk.Field>
          </div>

          <SignIn.Action
            submit
            className="bg-blue-800 text-white my-2 rounded-md text-sm p-3 hover:bg-blue-900 transition-all duration-200 ease-in-out shadow-lg transform hover:scale-105"
          >
            Sign In
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;
