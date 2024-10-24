import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { lessonsData, role } from "@/lib/data";
import { ITEM_PER_PAGE } from "@/lib/sttings";
import prisma from "@/prisma";
import { Lesson, Prisma, Subject , Class, Teacher ,   } from "@prisma/client";
import Image from "next/image";

type LessonList = Lesson & {subject:Subject} & {class:Class} & {teacher : Teacher}

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];
const renderRow = (item: LessonList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
    <td>{item.class.name}</td>
    <td className="hidden md:table-cell">{item.teacher.name}</td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormModal table="lesson" type="update" data={item} />
            <FormModal table="lesson" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);
// const LessonListPage = () => {
  const LessonListPage = async ({
    searchParams,
  }:{
    searchParams : {[key:string]:string| undefined}
  }) => {
    const {page,...queryParams}=searchParams
    const p = page ? parseInt(page): 1
    const query: Prisma.LessonWhereInput = {}
    if(queryParams){
      for(const [key ,value] of Object.entries(queryParams)){
        if (value !== undefined) {
          switch (key) {
            case "classId":
              query.classId= parseInt(value) 
            break;
            case "teacherId":
              query.teacherId= value 
            break;
            case "search": {
              // query.name = { contains: value, mode: "insensitive" };
              query.OR = [
                {subject:{name : {contains:value , mode:"insensitive"}}},
                {teacher:{name :{contains:value, mode: "insensitive"}}}
              ]
            break;
              }
          }
      }
      
      }
    }
    const [count, lessons] = await prisma.$transaction([
      prisma.lesson.count({
        where : query,
      }),
      prisma.lesson.findMany({
        include:{
          subject:{select: {name: true} }, 
          class:{select: {name: true} },
          teacher:{select: {name: true} },
        },
        where : query,
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
    ]);
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="lesson" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={lessons} />
      {/* PAGINATION */}
      <Pagination page={p} count={count}/>
    </div>
  );
};

export default LessonListPage;
