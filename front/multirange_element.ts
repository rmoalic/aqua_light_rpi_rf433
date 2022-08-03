
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

class Multirange_element extends HTMLElement {
    static formAssociated = true;
    value: FormData;
    internals: ElementInternals;
    form: HTMLFormElement | null;
    last_selected: HTMLElement | null;

    min: number;
    max: number;
    step: number;

    constructor() {
        super();

        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.value = new FormData();
        this.form = null;
        this.last_selected = null;

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
                bottom: -1px;
                width: 10px;
                height: 25px;
                background: red;
                border-radius: 0 0 5px 5px;
                z-index: 1;
                margin: 0;
                padding: 0;
            }
            handle.selected {
                outline: 1px solid black;
            }
            trail {
                display: inline-block;
                position: absolute;
                height: 20px;
                background: green;
                opacity: 40%;
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

        this.internals = this.attachInternals();
    }

    connectedCallback() {
        let parent = this;
        const mutations = function(mutation: MutationRecord[]) {
            for (let mut of mutation) {
                console.log(mut);
                if (mut.type == "childList") {
                    if (mut.addedNodes.length > 0) {
                        parent.mutations_added_node(mut);
                    } else if (mut.removedNodes.length > 0) {
                        parent.mutations_removed_node(mut);
                    }
                } else if (mut.type == "attributes") {
                    parent.mutation_update_attribute(mut);
                }
            }
            parent.sort_handle();
            parent.update_trails();
        }

        let mutation_observer = new MutationObserver(mutations);
        mutation_observer.observe(this, { 
            childList: true,
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ["name", "value", "color", "group"],
            subtree: true
        });
        this.update_value();
        this.sort_handle();
        this.update_trails();
    }

    get_selected_outter(): HTMLElement | null {
        if (this.last_selected == null) return null;
        let selected_name = this.last_selected.id;
        if (selected_name == null) return null;
        let children = this.children;
        for (let child of children) {
            if (child.nodeType == 1 && child.getAttribute("name") == selected_name) {
                return child as HTMLElement;
            }
        }
        return null;
    }

    private mutations_added_node(mut: MutationRecord) {
        if (mut.addedNodes.length == 0) return;
        if (mut.addedNodes.length > 1) {
            console.error(mut, "added lenght > 1");
            return;
        }
        if (mut.addedNodes[0].nodeType != 1) return;

        let node = mut.addedNodes[0] as HTMLElement;
        if (node.tagName == "RM-HANDLE") {
            let name = node.getAttribute("name");
            let value_text = node.getAttribute("value");
            let value: number = 0;
            let color = node.getAttribute("color") as Color | null;
            let group = node.getAttribute("group");

            if (name == null) {
                console.error(node, " must have a (unique) name attribute.");
                return;
            }

            if (value_text != null) {
                value = parseInt(value_text);
            }

            if (color == null) {
                color = "#f00";
            }

            let handle = this.addHandle(name, color, group);
            if (handle == null) return;
            this.move_handle(handle, this.value_to_offset(value));
            this.update_value();
        }
    }

    private mutations_removed_node(mut: MutationRecord) {
        if (mut.removedNodes.length == 0) return;
        if (mut.removedNodes.length > 1) {
            console.error(mut, " removed lenght > 1");
            return;
        }
        if (mut.removedNodes[0].nodeType != 1) return;

        let node = mut.removedNodes[0] as HTMLElement;
        if (node.tagName == "RM-HANDLE") {
            let name = node.getAttribute("name");
            if (name == null) return;

            this.removeHandle(name);
        }

    }

    private mutation_update_attribute(mut: MutationRecord) {
        if (mut.target == this) return;
        let node = mut.target as HTMLElement;
        let node_name = node.getAttribute("name");
        if (node_name == null) throw Error("node name cannot be null");
        if (node.tagName == "RM-HANDLE") {
            switch (mut.attributeName) {
                case "color": {
                    let inner_node = this.shadowRoot?.getElementById(node_name);
                    if (inner_node == null) return;
                    let new_color = node.getAttribute("color") as Color | null;
                    if (new_color == null) return;
                    this.handle_change_color(inner_node, new_color);
                } break;
                case "name": {
                    let old = mut.oldValue;
                    if (old == null) return;
                    let n = node.getAttribute("name");
                    if (n == null) return;

                    this.renameHandle(old, n);
                } break;
                case "value": {
                    let old = mut.oldValue;
                    if (old == null) return;
                    let n = node.getAttribute("value");
                    if (n == null) return;
                    let inner_node = this.shadowRoot?.getElementById(node_name);
                    if (inner_node == null) return;
                    
                    this.move_handle(inner_node, this.value_to_offset(parseFloat(n)))
                } break;
                case "group": {
                    let inner_node = this.shadowRoot?.getElementById(node_name);
                    if (inner_node == null) return;
                    let new_group = node.getAttribute("group");
                    if (new_group == null) return;

                    inner_node.setAttribute("group", new_group);
                    this.update_value();
                } break;
                default: {
                    throw Error("unreachable");
                }
            }

        }
    }

    formAssociatedCallback(form: HTMLFormElement) {
        this.form = form;
    }

    private setValue(value: FormData) {
        this.value = value;
        this.internals.setFormValue(value);
    }

    private renameHandle(id: string, new_id: string) {
        if (new_id == "") throw Error("id cannot be empty");
        if (this.shadowRoot?.getElementById(new_id) != null) {
            throw Error("id "+ new_id +" already exist");
        }

        let node = this.shadowRoot?.getElementById(id);
        if (node == null) {
            console.error("node "+id+" does not exist");
            return;
        }
        node.id = new_id;
        this.update_value();
    }

    private selectHandle(handle: HTMLElement) {
        let children = this.shadowRoot?.children;
        if (children != null) {
            for (let child of children) {
                child.classList.remove("selected");
            }
            this.last_selected = handle;
            handle.classList.add("selected");
        }
    }

    private removeHandle(id: string) {
        let node = this.shadowRoot?.getElementById(id);
        if (node == null) return;

        node.remove();
        this.update_trails();
        this.update_value();
    }

    private handle_change_color(handle: HTMLElement, color: Color) {
        let trail = handle.children[0] as HTMLElement;
        if (trail.tagName != "TRAIL") throw Error("first child is not trail");
        handle.style.background = color;
        trail.style.background = color;
    }

    private addHandle(id: string, color: Color, group: string | null): HTMLElement | null {
        if (this.shadowRoot?.getElementById(id) != null) {
            console.error(this, "contains multiples ", id, "handles");
            return null;
        }
        let handle = document.createElement("handle");

        handle.id = id;
        handle.onmousedown = down;
        handle.ontouchstart = down;

        if (group != null) {
            handle.setAttribute("group", group);
        }
        
        let trail = document.createElement("trail");

        let parent = this;

        function down(ev: MouseEvent | TouchEvent) {
            ev.preventDefault();

            parent.selectHandle(handle);
            let handle_width: number = handle.offsetWidth;
            let half_handle = Math.floor(handle_width / 2);

            function up(ev: MouseEvent | TouchEvent) {
                parent.update_value();
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

                parent.move_handle(handle, x - parent.offsetLeft - half_handle);
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
        this.handle_change_color(handle, color);
        return handle;
    }

    private move_handle(handle: HTMLElement, new_pos: number) {
        let leftBound = 0;
        let rightBound = this.offsetWidth;
        let handle_width: number = handle.offsetWidth;
        let trail = handle.firstElementChild as HTMLElement | null;
        if (trail == null) throw Error("handle first element is not a trail");

        let half_handle = Math.floor(handle_width / 2);
        let pos = new_pos;
        if (pos > rightBound - handle_width) pos = rightBound - handle_width;
        if (pos < leftBound) pos = leftBound;
        handle.style.left = pos + "px";
        trail.style.left = half_handle + "px";

        this.sort_handle();
        this.update_trails();
    }

    private swap_handle(a: HTMLElement, b: HTMLElement) {
        a.parentNode?.insertBefore(a, b);
    }

    private sort_handle() {
        if (! this.shadowRoot) return;
        let children = this.shadowRoot.children;
        let change: boolean;
        do {
            let prev: HTMLElement | null = null;
            change = false;
            for (let i = 0; i < children.length; i++) {
                let curr = children[i] as HTMLElement;
                if (curr.tagName == "HANDLE") {
                    if (prev) {
                        if (curr.offsetLeft < prev.offsetLeft) {
                            this.swap_handle(curr, prev);
                            change = true;
                        }
                    }
                    prev = curr;
                }
            }
        } while (change != false);
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

    private offset_to_value(offset: number): number {
        let offsetWidth = this.offsetWidth - 10; //TODO: replace 15 by handle size
        return ((offset / offsetWidth) * (this.max - this.min)) + this.min;
    }

    private value_to_offset(value: number): number {
        let offsetWidth = this.offsetWidth - 10; //TODO: replace 10 by handle size
        return (((value - this.min) / (this.max - this.min)) * offsetWidth);
    }

    private get_not_shadow_node_by_name(name: string): HTMLElement | null {
        for (let node of this.children) {
            if (node.nodeType == 1 && node.tagName == "RM-HANDLE" && node.getAttribute("name") == name) {
                return node as HTMLElement;
            }
        }
        return null;
    }

    private update_value() {
        let ret_value = new FormData();

        if (! this.shadowRoot) return;
        let children = this.shadowRoot.children;
        for (let i = 0; i < children.length; i++) {
            let curr = children[i] as HTMLElement;
            if (curr.tagName == "HANDLE") {
                let v = this.offset_to_value(curr.offsetLeft);
                let id;
                if (curr.hasAttribute("group")) {
                    id = curr.getAttribute("group")+"[]";
                } else {
                    id = curr.id;
                }
                ret_value.append(id, v.toString());
                console.log(id, v);

                let external_node = this.get_not_shadow_node_by_name(curr.id);
                if (external_node != null) {
                    let new_value = v.toString();
                    if (external_node.getAttribute("value") != new_value) {
                        external_node.setAttribute("value", new_value);
                    }
                }
            }
        }

        this.setValue(ret_value);
    }


    static get observedAttributes() {
        return ['min', 'max', 'step'];
    }

    attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return;
        if (property == "min" || property == "max" || property == "step") {
            if (newValue == null) return;
            this[property] = parseInt(newValue);
        }
    }
}

customElements.define('rm-multirange', Multirange_element);