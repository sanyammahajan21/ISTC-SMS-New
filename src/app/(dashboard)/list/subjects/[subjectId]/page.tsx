import prisma from "@/lib/prisma";

const SubjectDetailsPage = async ({ params }: { params: { subjectId: string } }) => {
  const subjectId = parseInt(params.subjectId);

  if (isNaN(subjectId)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Invalid Subject ID</h1>
        <p className="text-gray-500">The provided subject ID is not valid.</p>
      </div>
    );
  }

  // Fetch the subject details
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Subject Not Found</h1>
        <p className="text-gray-500">No subject found with the provided ID.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-gray-100">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">{subject.name}</h1>
      <p className="text-gray-500">Subject Code: {subject.subjectCode}</p>
      <p className="text-gray-500">Type: {subject.type}</p>
      <p className="text-gray-500">Max Marks: {subject.maxMarks}</p>
      <p className="text-gray-500">Branch ID: {subject.branchId}</p>
      <p className="text-gray-500">Semester ID: {subject.semesterId}</p>
      {subject.fileUrl && (
          <a
            href={`/api/files/${subject.fileUrl}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Subject Curriculum
          </a>
        )}
    </div>
  );
};

export default SubjectDetailsPage;