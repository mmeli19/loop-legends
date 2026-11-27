import type { Metadata } from "next";
import TeacherApp from "@/components/teacher/TeacherApp";
import "./teachers.css";

export const metadata: Metadata = { title: "Loop Legends for Teachers · TExES CS 241 Prep" };

export default function TeachersPage() {
  return (
    <div className="ll-t">
      <TeacherApp />
    </div>
  );
}
