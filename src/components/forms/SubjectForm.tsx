"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema ,
  branchSchema,
  BranchSchema,
  
 } from "@/lib/formValidationSchemas";
import { createSubject,
   updateSubject,
   createBranch,
    updateBranch,
    
  } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers } = relatedData;
  const branches = relatedData?.branches || [];
  const semesters = relatedData?.semesters || [];
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Subject" : "Update the Subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Maximun marks"
          name="maxMarks"
          defaultValue={data?.maxMarks}
          register={register}
          error={errors?.maxMarks}
        />
        <InputField
          label="Subject code"
          name="subjectCode"
          defaultValue={data?.subjectCode}
          register={register}
          error={errors?.subjectCode}
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("type")}
            defaultValue={data?.type}
          >
            <option value="THEORY">THEORY</option>
            <option value="PRACTICAL">PRACTICAL</option>
          </select>
          {errors.type?.message && (
            <p className="text-xs text-red-400">
              {errors.type.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Semester</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("semesterId")}
            defaultValue={data?.semesterId}
          >
            {semesters.map((semester: { id: number; level: number }) => (
              <option value={semester.id} key={semester.id}>
                {semester.level}
              </option>
            ))}
          </select>
          {errors.semesterId?.message && (
            <p className="text-xs text-red-400">
              {errors.semesterId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Branch</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("branchId")}
            defaultValue={data?.branchId}
          >
            {branches.map(
              (branchItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={branchItem.id} key={branchItem.id}>
                  ({branchItem.name} -{" "}
                  {branchItem._count.students + "/" + branchItem.capacity}{" "}
                  Capacity)
                </option>
              )
            )}
          </select>
          {errors.branchId?.message && (
            <p className="text-xs text-red-400">
              {errors.branchId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
