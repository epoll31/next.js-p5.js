import Image from "next/image";
import SketchComponent from "./sketch";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen h-fit flex flex-col items-center justify-center justify-between p-24 text-center bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-white">
      <div className="flex-0 flex flex-col items-center gap-5">
        <h1 className="text-4xl font-bold">Next.js p5.js Demonstration</h1>
        <h3 className="text-2xl font-semibold">by <Link className="text-blue-500 hover:underline" href="https://github.com/epoll31">epoll31</Link></h3>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <SketchComponent className="w-full" />
      </div>
    </main>
  );
}
