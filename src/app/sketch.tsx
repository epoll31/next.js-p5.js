"use client"

import React from "react";
import p5Types from "p5"; //Import this for typechecking and intellisense
import dynamic from 'next/dynamic'

// Will only import `react-p5` on client-side
const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
    ssr: false,
})

interface ComponentProps {
    // Your component props
}

let x = 50;
let y = 50;
let radius = 50;
let angle = 30;
let speed = 1;

const SketchComponent: React.FC<ComponentProps> = (props: ComponentProps) => {

    // See annotations in JS for more information
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(500, 500).parent(canvasParentRef);
    };

    const draw = (p5: p5Types) => {
        x += speed * p5.cos(p5.radians(angle));
        y += speed * p5.sin(p5.radians(angle));
        if (x > p5.width - radius || x < radius) {
            angle = 180 - angle;
        }
        if (y > p5.height - radius || y < radius) {
            angle = 360 - angle;
        }

        p5.background(255);
        p5.ellipse(x, y, radius * 2, radius * 2);
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default SketchComponent;