
state = {
    boxes:{}, // this stores necessary command the box could do. 
    // operations {select, clear}
    lsstviewers:{ // this select firefly object of certain id
    },
    show_readouts: undefined,
    term:undefined, // this will be a terminal object
};


var readouts = function(){
        this.register = {};
        this.add = function(name, cb){
            this.register[name] = cb;
        };
        this.remove = function(name){
            this.register[name] = undefined;
        };
        firefly.appFlux.getActions('ExternalAccessActions').extensionAdd({
            plotId: 'ffview',
            extType: 'PLOT_MOUSE_READ_OUT',
            callback: function(data){
                for (var name in this.register){
                    if(this.register[name]){
                        this.register[name](data);
                    }
                }
            }.bind(this),
        });
};


var onFireflyLoaded = function() {
    var viewer = loadFirefly('ffview');
    state.lsstviewers['ffview'] = viewer;
    state.show_readouts = new readouts();
}
jQuery(function($, undefined) {
    $("#cmd").terminal(function(cmd_str, term){
        cmd_args = cmd_str.split(" ");
        state.term = term;
        var executed = false; 
        for (var name in cmds){
            cmd = cmds[name];
            if (name == cmd_args[0]){
                executed = true;
                cmd(state, cmd_args);
                break;
            }
        }
        if (!executed){
            state.term.echo("Sorry, `"+cmd_str+"` is not recognisable.");
        }
    },{
        greetings: 'Command Interface (Type help to see the full intention)',
        name: 'LSST Monitor shell',
        height: 200,
        prompt: '~>  '
    });
});

cmds = {
    help : function(state, args){
        switch (args[1]){
            case "show_boundary":
                state.term.echo("show_boundary -> show boundary on the main view");
                state.term.echo("show_boundary id -> currently not supported");
                break;
            case "hide_boundary":
                state.term.echo("hide_boundary -> hide the boundary of the main view if it is presented");
                state.term.echo("currently the command is shaky, sometimes need to zoom in to see the effect.");
                break;
            case "create_box":
                state.term.echo("create_box <name> -> will create a box for graph or analysis on the right of the screen.")
                state.term.echo("Note that the box will be empty, to add content to the box, see other options");
                state.term.echo("Note that the name be one word and please do not use the space in between");
                state.term.echo("And if there exists a box with the same name, the new box will not be created");
                break;
            case "delete_box":
                state.term.echo("delete_box <name> -> will delete the box (completely)");
                state.term.echo("Note that if the box does not exists, nothing will happen");
                state.term.echo("If you wish to have a mininal view of the box, see hide_box");
                break;
            case "hide_box":
                state.term.echo("hide_box <name> -> will hide the box with only title left");
                state.term.echo("If you wish to delete the box completely, use delete_box");
                break;
            case "viewer":
                state.term.echo("viewer <name> <image> -> add firefly viewer view inside the box");
                state.term.echo("currently there are three images available im0 im1 image");
                state.term.echo("if image is not speficied, return the default image");
                state.term.echo("If the box does not exists, nothing will happen");
                break;
            case "chart":
                state.term.echo("chart <name> -> add a dummy chart inside the box");
                state.term.echo("The next step would probably connect to backend, stay tune");
                break;
            case "chart2":
                state.term.echo("chart2 <name> -> add another dummy chart inside the box");
                state.term.echo("The next step would probably connect to backend, stay tune");
                break;
            case "read_mouse":
                state.term.echo("read_mouse <name> -> add the mouse position parameters inside the box");
                state.term.echo("currently showing the pixel coordinates of x,y and the region it correspond to");
            case "blink":
                state.term.echo("blink <name> <im1> <im2> <interval> <times>-> show two images flash back and forth");
                state.term.echo("If only name is specified, then it just restart the blinking process of previous settings");
                state.term.echo("currently there are two available images im0 and im1");
                state.term.echo("interval shall be in ms");
                state.term.echo("times will be blinking times that it adds on");
                state.term.echo("blink <name> stop -> stop the image blinking");
            default:
                state.term.echo("The followings are the functionality we wish to provide");
                state.term.echo("For further detail, type `help <command>` for specific command");
                state.term.echo("show_boundary");
                state.term.echo("hide_boundary");
                state.term.echo("create_box");
                state.term.echo("delete_box");
                state.term.echo("hide_box");
                state.term.echo("show_box");
                state.term.echo("viewer");
                state.term.echo("chart");
                state.term.echo("chart2");
                state.term.echo("read_mouse");
                state.term.echo("blink");
        }
    },
    show_boundary : function(state, cmd_args){
        var plotid = 'ffview'; // ffview as a default
        var region_id = plotid+'-boundary';
        if (state.lsstviewers[region_id]){
            firefly.removeRegionData(state.lsstviewers[region_id], region_id);
            state.lsstviewers[region_id] = undefined;
        }
        var regions = [];
        var height = 2000;
        var width = 502;
        var color = 'black';
        var rows = 3;
        var columns = 16;
        for (var x=0; x<columns; x++){
            for (var y=0; y<rows; y++){
                var content = ['box', x*width, (y+1)*height, width, height, 0, '#color='+color].join(' ');
                regions.push(content);
            }
        }
        state.lsstviewers[region_id] = regions;
        firefly.overlayRegionData(regions, region_id, "Boundary", plotid);
    },
    hide_boundary : function(state, cmd_args) {
        var plotid = 'ffview';
        var region_id = plotid+'-boundary';
        if (state.lsstviewers[region_id]){
            firefly.removeRegionData(state.lsstviewers[region_id], region_id);
            state.lsstviewers[region_id] = undefined;
            state.term.echo("Boundary Removed");
        }else{
            state.term.echo("The boundary has not been drawn yet.");
        }
    },
    create_box : function(state, cmd_args){
        var name = cmd_args[1];
        if (state.boxes[name]){
            state.term.echo("the box "+name+" has already existed! choose another name\n");
        }else{
            var box = d3.select('#rightside').append('div').classed('box', true);
            var box_title = box.append('div').classed('box-bar', true).text(name);
            var box_content = box.append('div').classed('box-content',true);
            state.boxes[name] = {select: box,};
            state.term.echo("Success!\n");
        }
    },
    delete_box : function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("the box "+name+" does not existed yet\n");
        }else{
            cmds.clear_box(state, [name]);
            state.boxes[name].select.remove();
            state.boxes[name] = undefined;
            state.term.echo("Success!");
        }
    },
    hide_box : function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("the box "+name+" does not existed yet\n");
        }else{
            state.boxes[name].select.classed('box-hide', true);
        }
    },
    show_box : function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("the box "+name+" does not existed yet\n");
        }else{
            state.boxes[name].select.classed('box-hide', false);
        }
    },
    clear_box : function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("the box "+name+" does not existed yet\n");
        }else{
            if (state.boxes[name].clear){
                state.boxes[name].clear();
                state.boxes[name].clear = undefined;
            }
            state.boxes[name].select.select('.box-content').attr("id", "").html("");
        }
    },
    viewer : function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("The box "+name+" cannot be found\n");
        }else{
            var view_id = "view-"+name;
            if (state.lsstviewers[view_id]){
                changeViewFirefly(state.lsstviewers[view_id], cmd_args[2]); 
            }else{
                cmds.clear_box(state, ['', name]);
                var content = state.boxes[name].select.select('.box-content').attr('id', view_id);
                state.lsstviewers[view_id] = loadFirefly(view_id, cmd_args[2]);
            }
        }
    },

    chart : function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("The box "+name+" cannot be found\n");
        }else{
            cmds.clear_box(state, [name]);
            var content = state.boxes[name].select.select('.box-content').attr('id', 'chart-'+name);
            nv.addGraph(function(){return draw_graph(content)});
        }
    },

    chart2 : function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("The box "+name+" cannot be found\n");
        }else{
            cmds.clear_box(state, ['', name]);
            var content = state.boxes[name].select.select('.box-content').attr('id', 'chart2-'+name);
            nv.addGraph(function(){return draw_graph2(content)})
        }
    },
    read_mouse: function(state, cmd_args){
        var name = cmd_args[1];
        if (!state.boxes[name]){
            state.term.echo("The box "+name+" cannot be found\n");
        }else{
            var viewer = cmd_args[2] || 'ffview';
            cmds.clear_box(state, ['', name]);
            var content = state.boxes[name].select.select('.box-content').attr('id', 'readout-'+name);
            var first_line = content.append('p');
            first_line.append('span').text('point x:');
            var x_point = first_line.append('span').attr('id', 'readout-x-'+name);

            var second_line = content.append('p');
            second_line.append('span').text('point y:');
            var y_point = second_line.append('span').attr('id', 'readout-y-'+name);

            var third_line = content.append('p');
            third_line.append('span').text('region: ');
            var region_name = third_line.append('span').attr('id', 'readout-region-'+name);
            
            var forth_line = content.append('p');
            forth_line.append('span').text('aveage-pixel: ');
            var average_pixel_value = forth_line.append('span').attr('id', 'average-pixel-'+name);
            var height = 2000;
            var width = 502;

            var getRegion = function(pt){
                var x = Math.floor(pt.x/width);
                var y = Math.floor(pt.y/height);
                var x_before = Math.floor(+x_point.text()/width);
                var y_before = Math.floor(+y_point.text()/height);
                if (x!=x_before || y!=y_before){
                    request = {'region': {'geometry': 
                        {'type': 'Polygon',
                        'coordinates': [
                        [x*width, y*height], [(x+1)*width, y*height],
                        [(x+1)*width, (y+1)*height], [x*width, (y+1)*height],
                        [x*width, y*height]
                        ]}}};
                    $.ajax({
                        'method': 'GET',
                        'data': {json: JSON.stringify(request)},
                        'url': '/api/average-pixel-value',
                        success: function(json){
                            average_pixel_value.text(json.value);
                        }
                        });
                }
                return 'Region <'+x+','+y+'>';
            }
            state.show_readouts.add(name, function(data){
                region_name.text(getRegion(data.ipt));
                x_point.text(Math.floor(data.ipt.x));
                y_point.text(Math.floor(data.ipt.y));
            });
            state.boxes[name].clear = function(){
                state.show_readouts.remove(name);
            };
        }
    },
    blink: function(state, cmd_args){
        var argc = cmd_args.length;
        var name = cmd_args[1];
        
        if (argc == 2 || argc == 3){
            var datum = state.boxes[name].select.select('.box-content').datum();
            if (state.boxes[name] && state.boxes[name].select.select('.box-content').classed('blink')){
                if (cmd_args[2] == 'stop'){
                    datum.times = 0;
                }else{ datum.times = datum.times+ (Number(cmd_args[2]) || 0)}
                console.log(datum.times)
            } 
        }else{
            var im1 = cmd_args[2];
            var im2 = cmd_args[3];
            var interval = Number(cmd_args[4]);
            var times = Number(cmd_args[5]);
            
            cmds.clear_box(state, ['', name]);
            var content = state.boxes[name].select.select('.box-content')
                            .attr('id', 'blink-'+name).classed('blink', 'true');
            content.datum({times: times, interval: interval, interval_id: undefined});
            var datum = content.datum();
            state.boxes[name].clear = function(){
                clearInterval(datum.interval_id);
            }
            content.style({'position': 'relative'});
            var first_element = content.append('div').attr('id', 'blink-1-'+name).style({
                'opacity': 1,
                'position': 'absolute',
                'top': 0, 'bottom': 0, 'left': 0, 'right': 0
            });
            var second_element = content.append('div').attr('id', 'blink-2-'+name).style({
                'opacity': 0,
                'position': 'absolute',
                'top': 0, 'bottom': 0, 'left': 0, 'right': 0
            });
            loadFirefly('blink-1-'+name, im1);
            loadFirefly('blink-2-'+name, im2);

            var flip = function(){
                console.log(datum);
                if (datum.times > 0){
                    opacity_1 = first_element.style('opacity');
                    opacity_2 = second_element.style('opacity');
                    first_element.style('opacity', opacity_2);
                    second_element.style('opacity', opacity_1);
                    datum.times -= 1;
                }
            }
            datum.interval_id = setInterval(flip, interval);
        }
    }
}
    



