export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/registrar(.*)": ["registrar"],
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin", "teacher"],
  "/list/registrars": ["admin", "teacher"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "teacher"],
  "/list/exams": ["admin", "teacher", "student", "registrar"],
  "/list/assignments": ["admin", "teacher", "student", "registrar"],
  "/list/results": ["admin", "teacher", "student", "registrar"],
  "/list/attendance": ["admin", "teacher", "student", "registrar"],
  "/list/events": ["admin", "teacher", "student", "registrar"],
  "/list/announcements": ["admin", "teacher", "student", "registrar"],
};