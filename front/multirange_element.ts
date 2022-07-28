
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
                border-radius: 5px;
                z-index: 1;
            }
            trail {
                display: inline-block;
                position: absolute;
                height: 20px;
                background: green;
            }
        `;
        shadow.appendChild(style);
        const bar = document.createElement("div");
        bar.classList.add("bar");
        shadow.appendChild(bar);
        this.addHandle();
        this.addHandle();
    }

    addHandle() {
        let handle = document.createElement("handle");
        handle.onmousedown = down;
        handle.ontouchstart = down;
        
        let trail = document.createElement("trail");

        let parent = this;
        handle.style.left = "0px";
        trail.style.left = "0px";
        function down(ev: MouseEvent | TouchEvent) {
            let leftBound = 0;
            let rightBound = parent.offsetWidth;
            let handle_width: number = (ev.target as HTMLElement).offsetWidth;

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
                trail.style.left = pos + half_handle + "px";

                let nextElementSibling = trail.nextElementSibling;
                if (nextElementSibling && nextElementSibling.tagName == "HANDLE") {
                    trail.style.width = (nextElementSibling as HTMLElement).offsetLeft - pos + "px";
                }

                let previousElementSibling = handle.previousElementSibling;
                if (previousElementSibling && previousElementSibling.tagName == "TRAIL") {
                    (previousElementSibling as HTMLElement).style.width = handle.offsetLeft - (previousElementSibling as HTMLElement).offsetLeft + half_handle +"px";
                }
            }
            document.addEventListener("mouseup", up);
            document.addEventListener("mousemove", move);
            document.addEventListener("touchend", up);
            document.addEventListener("touchmove", move);
        };
        this.shadowRoot?.appendChild(handle);
        this.shadowRoot?.appendChild(trail);
    }
}

customElements.define('rm-multirange', Multirange_element);