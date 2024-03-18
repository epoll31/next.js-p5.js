"use client"

import React, { useState } from "react";
import p5Types from "p5"; //Import this for typechecking and intellisense
import dynamic from 'next/dynamic'

// Will only import `react-p5` on client-side
const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
    ssr: false,
})

let flock: Flock;

class Flock {
    boids: Boid[];

    constructor() {
        this.boids = [];
    }

    run(p5: p5Types) {
        for (let boid of this.boids) {
            boid.run(p5, this.boids);
        }
    }

    addBoid(b: Boid) {
        this.boids.push(b);
    }
}

class Boid {
    acceleration: p5Types.Vector;
    velocity: p5Types.Vector;
    position: p5Types.Vector;
    r: number;
    maxspeed: number;
    maxforce: number;

    constructor(x: number, y: number) {
        this.acceleration = new p5Types.Vector(0, 0);
        this.velocity = p5Types.Vector.random2D();
        this.position = new p5Types.Vector(x, y);
        this.r = 5.0;
        this.maxspeed = 3;
        this.maxforce = 0.05;
    }

    run(p5: p5Types, boids: Boid[]) {
        this.flock(p5, boids);
        this.update(p5);
        this.borders(p5);
        this.render(p5);
    }

    applyForce(force: p5Types.Vector) {
        this.acceleration.add(force);
    }

    flock(p5: p5Types, boids: Boid[]) {
        let sep = this.separate(p5, boids);
        let ali = this.align(p5, boids);
        let coh = this.cohesion(p5, boids);

        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);

        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    update(p5: p5Types) {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    seek(p5: p5Types, target: p5Types.Vector) {
        let desired = p5Types.Vector.sub(target, this.position);
        desired.setMag(this.maxspeed);

        let steer = p5Types.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);

        return steer;
    }

    render(p5: p5Types) {
        let theta = this.velocity.heading() + p5.PI / 2;
        p5.fill(127);
        p5.stroke(200);
        p5.push();
        p5.translate(this.position.x, this.position.y);
        p5.rotate(theta);
        p5.beginShape();
        p5.vertex(0, -this.r * 2);
        p5.vertex(-this.r, this.r * 2);
        p5.vertex(this.r, this.r * 2);
        p5.endShape(p5.CLOSE);
        p5.pop();
    }

    borders(p5: p5Types) {
        if (this.position.x < -this.r) this.position.x = p5.width + this.r;
        if (this.position.y < -this.r) this.position.y = p5.height + this.r;
        if (this.position.x > p5.width + this.r) this.position.x = -this.r;
        if (this.position.y > p5.height + this.r) this.position.y = -this.r;
    }

    separate(p5: p5Types, boids: Boid[]) {
        let desiredseparation = 25.0;
        let steer = new p5Types.Vector(0, 0);
        let count = 0;

        for (let other of boids) {
            let d = p5Types.Vector.dist(this.position, other.position);

            if (d > 0 && d < desiredseparation) {
                let diff = p5Types.Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        let mousePos = p5.createVector(p5.mouseX, p5.mouseY);
        let d = p5Types.Vector.dist(this.position, mousePos);

        if (d > 0 && d < desiredseparation * 100) {
            let diff = p5Types.Vector.sub(this.position, mousePos);
            diff.normalize();
            diff.div(d);

            diff.mult(100);
            steer.add(diff);
            count++;
        }


        if (count > 0) {
            steer.div(count);
        }

        if (steer.mag() > 0) {
            steer.setMag(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }

        return steer;
    }
    align(p5: p5Types, boids: Boid[]) {
        let neighbordist = 50;
        let sum = new p5Types.Vector(0, 0);
        let count = 0;

        for (let other of boids) {
            let d = p5Types.Vector.dist(this.position, other.position);

            if (d > 0 && d < neighbordist) {
                sum.add(other.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxspeed);
            let steer = p5Types.Vector.sub(sum, this.velocity);
            steer.limit(this.maxforce);
            return steer;
        } else {
            return new p5Types.Vector(0, 0);
        }
    }
    cohesion(p5: p5Types, boids: Boid[]) {
        let neighbordist = 50;
        let sum = new p5Types.Vector(0, 0);
        let count = 0;

        for (let other of boids) {
            let d = p5Types.Vector.dist(this.position, other.position);

            if (d > 0 && d < neighbordist) {
                sum.add(other.position);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            return this.seek(p5, sum);
        } else {
            return new p5Types.Vector(0, 0);
        }
    }
}

interface ComponentProps {
    className?: string;
}

const SketchComponent: React.FC<ComponentProps> = (props: ComponentProps) => {
    const strings = [
        "Hi there!",
        "My name is Ethan Pollack.",
        "Check out my projects below!",
    ]
    const tickRate = 100;
    const holdTime = 1000;
    const cursorBlinkRate = 400;

    const [timer, setTimer] = useState(0);
    const [cursorBlinkTimer, setCursorBlinkTimer] = useState(0);
    const [currentString, setCurrentString] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const [direction, setDirection] = useState(1);
    const [reachedEnd, setReachedEnd] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    // See annotations in JS for more information
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(1400, 400).parent(canvasParentRef);
        // p5.loadFont("public/JetBrainsMono-Regular.ttf");

        flock = new Flock();
        for (let i = 0; i < 400; i++) {
            let b = new Boid(p5.width / 2, p5.height / 2);
            flock.addBoid(b);
        }
    };

    const draw = (p5: p5Types) => {

        setTimer(timer + p5.deltaTime);
        setCursorBlinkTimer(cursorBlinkTimer + p5.deltaTime);
        if (reachedEnd) {
            // console.log("reached end: ", timer, holdTime)
            if (timer > holdTime) {
                setTimer(0);
                setReachedEnd(false);
                setDirection(-1);
            }
        }
        else {
            // console.log("not reached end: ", timer, tickRate)
            if (timer > tickRate) {
                setTimer(0);
                setCurrentChar(currentChar + direction);
                if (currentChar > strings[currentString].length) {
                    setReachedEnd(true);
                    setCurrentChar(strings[currentString].length);
                }
                else if (currentChar < 0) {
                    setCurrentString((currentString + 1) % strings.length);
                    setCurrentChar(0);
                    setDirection(1);
                }
            }
        }
        if (cursorBlinkTimer > cursorBlinkRate) {
            setCursorBlinkTimer(0);
            setShowCursor(!showCursor);
        }

        // console.log(currentChar, strings[currentString].length, currentString, strings.length);
        let curr = strings[currentString].substring(0, currentChar);
        if (showCursor) {
            curr = curr + "_";
        }

        p5.background(51);
        flock.run(p5);

        p5.textSize(80);
        p5.textAlign(p5.LEFT, p5.CENTER);
        p5.textFont("Arial")
        p5.fill(50, 168, 82);
        p5.stroke(200);
        p5.text(curr, 150, p5.height / 2);
    };

    return <Sketch setup={setup} draw={draw} className={props.className} />;
};

export default SketchComponent;