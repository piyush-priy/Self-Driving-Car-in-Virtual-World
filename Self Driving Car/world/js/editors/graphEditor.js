class GraphEditor{
    constructor(viewport, graph){
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext("2d");

        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mouse = null;
    }

    enable(){
        this.#addEventListeners();
    }

    disable(){
        this.#removeEventListeners();
        this.selected = false;
        this.hovered = false;
    }

    #addEventListeners(){
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.boundMouseUp = ()=> this.dragging = false;
        this.boundContextMenu = (evt)=> evt.preventDefault();
        this.canvas.addEventListener("mousedown", this.boundMouseDown); // On mouse clicking
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));  // On mouse movemont
        this.canvas.addEventListener("mouseup", this.boundMouseUp);  //To stop dragging when we release mouse click
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);  //Prevent Right mouse click menu to open

        window.addEventListener("keydown", (evt) => {
            if(evt.key == "s"){
                this.start = this.mouse;
            }
            if(evt.key == "e"){
                this.end = this.mouse;
            }
            if(this.start && this.end){
                world.generateCorridor(this.start, this.end);
            }
        });
    }

    #removeEventListeners(){
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("mouseup", this.boundMouseUp);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    #handleMouseMove(evt){
        this.mouse = this.viewport.getMouse(evt, true);
            this.hovered = getNearestpoint(this.mouse, this.graph.points, 11 *this.viewport.zoom);
            if(this.dragging == true){  //Dragging points
                this.selected.x = this.mouse.x;
                this.selected.y = this.mouse.y;
            }
    }

    #handleMouseDown(evt){
        // Remove and deselect points
        if(evt.button == 2){   // Right click
            if(this.selected){
                this.selected = null;
            }
            else if(this.hovered){
                this.#removePoint(this.hovered);
            }
        }
        // Add points and segments
        if(evt.button == 0){   // Left Click
            if(this.hovered){
                this.#select(this.hovered);
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mouse);
            this.#select(this.mouse);
            this.hovered = this.mouse;
        }
    }

    #select(point){
        if(this.selected){
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    #removePoint(point){
        this.graph.removePoint(point);
        this.hovered = null;
        if(this.selected == point){
            this.selected = null;
        }
    }

    dispose(){
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

    display(){
        this.graph.draw(this.ctx);
        if(this.hovered){
            this.hovered.draw(this.ctx, { full: true });
        }
        if(this.selected){
            const intent = this.hovered?this.hovered:this.mouse;
            new Segment(this.selected, intent).draw(ctx, {dash: [3,3]});
            this.selected.draw(this.ctx, { outline: true });
        }
    }
}