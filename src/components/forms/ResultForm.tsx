"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  ResultSchema,
  resultSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
  createResult,
  updateResult,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ResultForm = ({
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
    setValue,
    unregister, // Allows complete removal of sessionalExam field
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  // Determine initial state: If sessionalExam exists and is not "-"
  const [hasSessionalExam, setHasSessionalExam] = useState(
    data?.sessionalExam !== undefined && data?.sessionalExam !== "-"
  );

  const onSubmit = handleSubmit((formData) => {
    const finalData = {
      ...formData,
      sessionalExam: hasSessionalExam ? formData.sessionalExam : "-", // Always pass "-"
    };
    formAction(finalData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  useEffect(() => {
    if (!hasSessionalExam) {
      unregister("sessionalExam"); // Fully remove field from form
    } else {
      setValue("sessionalExam", data?.sessionalExam || ""); // Restore value if enabled
    }
  }, [hasSessionalExam, unregister, setValue, data]);

  const { students, exams, subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a result" : "Update the result"}
      </h1>

      {/* Toggle for Sessional Exam */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hasSessionalExam}
          onChange={() => setHasSessionalExam(!hasSessionalExam)}
          className="w-4 h-4"
        />
        <label className="text-sm text-gray-600">Sessional Exam Exists</label>
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Render Sessional Exam Input ONLY if hasSessionalExam is true */}
        {hasSessionalExam && (
          <InputField
            label="Sessional Exam"
            name="sessionalExam"
            defaultValue={data?.sessionalExam || ""}
            register={register}
            error={errors.sessionalExam}
          />
        )}

        <InputField
          label="End Term Exam"
          name="endTerm"
          defaultValue={data?.endTerm}
          register={register}
          error={errors.endTerm}
        />

        <InputField
          label="Overall Marks"
          name="overallMark"
          defaultValue={data?.overallMark}
          register={register}
          error={errors.overallMark}
        />

        <InputField
          label="Grade"
          name="grade"
          defaultValue={data?.grade}
          register={register}
          error={errors.endTerm}
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
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId}
          >
            {students.map((student: { id: string; name: string }) => (
              <option value={student.id} key={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Exam</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("examId")}
            defaultValue={data?.examId}
          >
            {exams.map((exam: { id: number }) => (
              <option value={exam.id} key={exam.id}>
                {exam.id}
              </option>
            ))}
          </select>
          {errors.examId?.message && (
            <p className="text-xs text-red-400">
              {errors.examId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
        
      </div>


      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;