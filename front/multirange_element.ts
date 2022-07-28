
class Multirange_element extends HTMLElement {
    private isGrabbed: boolean;
    private grabbedOffset: number;

    private handle: HTMLElement[];
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        const style = document.createElement("style");
        style.innerHTML = `
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
            }
        `;
        shadow.appendChild(style);
        const bar = document.createElement("div");
        bar.classList.add("bar");
        shadow.appendChild(bar);
        this.addHandle();
    }

    addHandle() {
        let handle = document.createElement("handle");
        handle.onmousedown = down;
        handle.ontouchstart = down;
        
        let parent = this;
        handle.style.left = parent.offsetLeft + "px";
        function down(ev: MouseEvent | TouchEvent) {
            let leftBound = parent.offsetLeft;
            let rightBound = parent.offsetWidth + leftBound;
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
                let pos = (x - Math.floor(handle_width / 2));
                if (pos > rightBound - handle_width) pos = rightBound - handle_width;
                if (pos < leftBound) pos = leftBound;
                handle.style.left = pos + "px";        
            }
            document.addEventListener("mouseup", up);
            document.addEventListener("mousemove", move);
            document.addEventListener("touchend", up);
            document.addEventListener("touchmove", move);
        };
        this.shadowRoot?.appendChild(handle);
    }
}

customElements.define('rm-multirange', Multirange_element);