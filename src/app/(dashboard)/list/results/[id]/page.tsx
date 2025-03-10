import prisma from "@/lib/prisma";

const ResultDetailsPage = async ({ params }: { params: { id: string } }) => {
  // Parse the result ID from the URL params
  const resultId = parseInt(params.id);

  if (isNaN(resultId)) {
    return <div>Invalid result ID</div>;
  }

  // Fetch the result details
  const result = await prisma.result.findUnique({
    where: { id: resultId },
    include: {
      student: { select: { name: true } },
      exam: { select: { id: true } },
      subject: { select: { name: true } },
    },
  });

  if (!result) {
    return <div>Result not found</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-gray-100">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Result Details</h1>
      <p className="text-gray-500">Student Name: {result.student.name}</p>
      <p className="text-gray-500">Exam ID: {result.exam?.id ?? "N/A"}</p>
      <p className="text-gray-500">Subject: {result.subject?.name ?? "N/A"}</p>
      <p className="text-gray-500">Sessional Exam: {result.sessionalExam ?? "N/A"}</p>
      <p className="text-gray-500">End Term Marks: {result.endTerm ?? "N/A"}</p>
      <p className="text-gray-500">Overall Marks: {result.overallMark}</p>
      <p className="text-gray-500">Grade: {result.grade}</p>
    </div>
  );
};

export default ResultDetailsPage;