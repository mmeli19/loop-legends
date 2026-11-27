import Link from "next/link";
import "./landing.css";

export default function Home() {
  return (
    <main className="ll-home">
      <h1>Loop Legends</h1>
      <p>Spaced-repetition practice and games for Texas computer science. One app for students in Computer Science I, one for teachers preparing for TExES Computer Science 8–12 (241).</p>
      <div className="cards">
        <Link className="card" href="/students/">
          <span className="tag">Students · Grades 9–12</span>
          <b>Computer Science I</b>
          <span className="d">17 units covering all 62 Texas CS I TEKS in Python or Java. Daily Review, Output Lab, Bug Hunt, Binary Blitz, and more.</span>
        </Link>
        <Link className="card" href="/teachers/">
          <span className="tag">Teachers · Exam 241</span>
          <b>TExES CS 8–12 Prep</b>
          <span className="d">Practice questions weighted like the real exam, flashcards, timed Exam Runs, and a daily spaced-repetition review.</span>
        </Link>
      </div>
      <small>Progress is saved in your browser. No accounts, no tracking.</small>
    </main>
  );
}
