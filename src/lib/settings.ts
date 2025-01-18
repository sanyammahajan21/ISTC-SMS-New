export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/registrar(.*)": ["registrar"],
  "/list/teachers": ["admin", "teacher", "registrar"],
  "/list/students": ["admin", "teacher", "registrar"],
  "/list/registrars": ["admin"],
  "/list/subjects": ["registrar"],
  "/list/classes": ["registrar", "teacher"],
  "/list/exams": ["teacher", "registrar"],
  "/list/assignments": ["teacher"],
  "/list/results": ["teacher", "student", "registrar"],
  "/list/attendance": ["teacher", "student", "registrar"],
  "/list/events": ["admin", "teacher", "student", "registrar"],
  "/list/announcements": ["admin", "teacher", "student", "registrar"],
};