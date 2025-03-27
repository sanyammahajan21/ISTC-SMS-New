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
//               className="p-2 rounded-md ring-1 ring-black"
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
//               className="p-2 rounded-md ring-1 ring-black"
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
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user?.publicMetadata?.role) {
      router.push(`/${user?.publicMetadata.role}`);
    }
  }, [user, router]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value);
  };

  return (
    <div className="h-screen flex items-center justify-center ">
      <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url("/istc2.jpg")',
            filter: "blur(10px)",
          }}
        ></div>
        
        
      <SignIn.Root>
      <div className="absolute top-4 left-0 right-0 flex justify-center">
          <h1 className="text-6xl font-extrabold text-white flex items-center gap-3">
            <Image src="/logo1.png" alt="Logo" width={60} height={60} />
            <span>Indo Swiss Training Centre</span>
          </h1>
        </div>
        <SignIn.Step
          name="start"
          className="bg-white bg-opacity-60 p-12 rounded-xl shadow-2xl flex flex-col gap-6 w-96 transform transition-all duration-300 hover:scale-105 border border-blue-950">
          <div className="absolute inset-0 flex justify-center items-center -z-10 opacity-20">
            <Image src="/lock.png" alt="Secure Login" width={1900} height={1000} />
          </div>
          
          <Clerk.GlobalError className="text-sm text-red-400 font-bold" />

          {/* Role Selection Dropdown */}
          <Clerk.Field name="role" className="flex flex-col gap-4">
            <Clerk.Label className="text-s font-bold text-black">Select Role</Clerk.Label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="p-2 rounded-md ring-1 ring-black bg-blue-100 text-black focus:ring-blue-500 opacity-80"
            >
              <option value="" disabled>Select a Role</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="registrar">Registrar</option>
            </select>
          </Clerk.Field>

          {/* Username Field */}
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-s font-bold text-black">Username</Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-3 rounded-md ring-1 ring-blue-900 bg-blue-100 text-black focus:ring-blue-500 opacity-80"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          {/* Password Field */}
          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-s font-bold text-black">Password</Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-3 rounded-md ring-1 ring-blue-900 bg-blue-100 text-black focus:ring-blue-500 opacity-80"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          {/* Submit Button */}
          <SignIn.Action
            submit
            className="bg-blue-800 hover:bg-blue-900 text-white my-2 rounded-md text-sm py-2 transition duration-200"
          >
            Sign In
          </SignIn.Action>

        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;
