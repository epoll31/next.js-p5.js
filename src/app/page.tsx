import Image from "next/image";
import SketchComponent from "./sketch";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">p5.js demonstration</h1>
      <SketchComponent />
    </main>
  );
}
