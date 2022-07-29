
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

class Multirange_element extends HTMLElement {
    private isGrabbed: boolean;
    private grabbedOffset: number;

    private handle: HTMLElement[];
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        const style = document.createElement("style");
        style.innerHTML = `
            :host {
                position: relative;
            }
            .bar {
                display: inline-block;
                width: 100%;
                height: 20px;
                background: lightgray;
                border-radius: 5px;
                
                font: 16px "DejaVu Sans", sans-serif;
            }
            handle {
                display: inline-block;
                position: absolute;
                top: auto;
                width: 15px;
                height: 25px;
                background: red;
                border-radius: 0 0 5px 5px;
                z-index: 1;
                margin: 0;
                padding 0;
            }
            trail {
                display: inline-block;
                position: absolute;
                height: 20px;
                background: green;
                z-index: 0;
            }
            trail:last-child {
                border-radius: 5px;
            }
        `;
        shadow.appendChild(style);
        const bar = document.createElement("div");
        bar.classList.add("bar");
        shadow.appendChild(bar);
        this.addHandle("#ff22ff");
        this.addHandle("#00ffff");
    }

    addHandle(color: Color) {
        let handle = document.createElement("handle");
        handle.onmousedown = down;
        handle.ontouchstart = down;
        
        let trail = document.createElement("trail");

        handle.style.background = color;
        trail.style.background = color;

        let parent = this;

        function down(ev: MouseEvent | TouchEvent) {
            ev.preventDefault();
            let leftBound = 0;
            let rightBound = parent.offsetWidth;
            let handle_width: number = handle.offsetWidth;

            function up(ev: MouseEvent | TouchEvent) {
                document.removeEventListener("mouseup", up);
                document.removeEventListener("mousemove", move);
                document.removeEventListener("touchend", up);
                document.removeEventListener("touchmove", move);
            }

            function move(ev: MouseEvent | TouchEvent) {
                ev.preventDefault();
                let x: number;
                if (ev.type == "mousemove") {
                    x = (ev as MouseEvent).clientX;
                } else {
                    x = (ev as TouchEvent).touches[0].clientX;
                }
                let half_handle = Math.floor(handle_width / 2);
                let pos = (x - half_handle);
                if (pos > rightBound - handle_width) pos = rightBound - handle_width;
                if (pos < leftBound) pos = leftBound;
                handle.style.left = pos + "px";
                trail.style.left = half_handle + "px";

                parent.sort_handle();
                parent.update_trails();
            }
            document.addEventListener("mouseup", up);
            document.addEventListener("mousemove", move);
            document.addEventListener("touchend", up);
            document.addEventListener("touchmove", move);
        };
        this.shadowRoot?.appendChild(handle);
        handle.appendChild(trail);
        handle.style.left = "0px";
        trail.style.left = Math.floor(handle.offsetWidth / 2) + "px";
    }

    private swap_handle(a: HTMLElement, b: HTMLElement) {
        console.log("SWAP: ", a , b);
        a.parentNode?.insertBefore(a, b);
    }

    private sort_handle() {
        if (! this.shadowRoot) return;
        let children = this.shadowRoot.children;
        let prev: HTMLElement | null = null;
        for (let i = 0; i < children.length; i++) {
            let curr = children[i] as HTMLElement;
            if (curr.tagName == "HANDLE") {
                if (prev) {
                    if (curr.offsetLeft < prev.offsetLeft) {
                        this.swap_handle(curr, prev);
                    }
                }
                prev = curr;
            }
        }
    }

    private update_trails() {
        let rightBound = this.offsetWidth;

        if (! this.shadowRoot) return;
        let children = this.shadowRoot.children;
        let next_handle: HTMLElement | null = null;
        for (let i = children.length - 1; i >= 0; i--) {
            let curr_handle = children[i] as HTMLElement;
            let half_handle = Math.floor(curr_handle.offsetWidth / 2);
            if (curr_handle.tagName == "HANDLE") {
                let trail = curr_handle.firstChild as HTMLElement;
                if (!trail || trail.tagName != "TRAIL") {
                    console.error("child is not a trail");
                    continue;
                }
                if (next_handle) {
                    trail.style.width = next_handle.offsetLeft - curr_handle.offsetLeft + half_handle + "px";
                } else { // last handle
                    trail.style.width = rightBound - (curr_handle.offsetLeft + half_handle) + "px";
                }
                next_handle = curr_handle;
            }
        }
    }
}

customElements.define('rm-multirange', Multirange_element);