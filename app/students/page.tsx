import type { Metadata } from "next";
import StudentApp from "@/components/student/StudentApp";
import "./students.css";

export const metadata: Metadata = { title: "Loop Legends for Students · Texas CS I" };

export default function StudentsPage() {
  return (
    <div className="ll-s">
      <StudentApp />
    </div>
  );
}
