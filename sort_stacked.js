//Google charts sorting script, best works for stacked bars driven from google sheets, see sample sheet linked in query argument for input format.
// Created : Ethiohelix , http://ethiohelix.blogspot.com/

/* activate visualization callback below
google.load('visualization', '1', {packages: ['corechart', 'bar']});
google.setOnLoadCallback( function () {
    var Link = 'https://docs.google.com/spreadsheets/d/1pF2GIadRqB0MnqMZ-OurbSW8VJ_CYSYe8-uJ7m0XMT0/edit#gid=0&range=Sheet1!A1:H8';
    var my_div = "chart_div";

    //set google visualization bar chart options here
    //**********************************************************
    var options = {
        title: 'Sample Document',
        chartArea: {
            width: '55%',
            height: '70%'
        },
        isStacked: true,
    };
    //***********************************************************
    //pull data from spread sheet (Columns = Labels, Rows = pops)
    // add sheet and range of data at the end like: &range=Sheet1!A1:H8
    var query = new google.visualization.Query(Link);
    query.send(handleQueryResponse);
    function handleQueryResponse(response) {
    var data = response.getDataTable();
    process_data(data,my_div,options);
}  
});
*/
function process_data(data,my_div,options){
    var get_config = chart_config(data,options);
    var options = get_config[0];
    var original_colors = get_config[1];
    var select_counter = 0;
    var chart = new google.visualization.BarChart(document.getElementById(my_div));
    var modifications
    function selectHandler() {
        select_counter +=1;
        //used for sorting selected label
        var selection = chart.getSelection();
        // do for all selections that are valid, if clicking on the actual chart to
        // sort is not desired add && (selection[0].row == null)) to only sort by labels
        if (selection.length > 0)  {
            var selected_column = selection[0].column;
            if (select_counter == 1){
                var selected_label = new google.visualization.DataView(data).getColumnLabel(selected_column);
            }
            else{
                var selected_label = modifications[0].getColumnLabel(selected_column);
            }
            for (var i = 0; i < data.getNumberOfColumns(); i++) {
                var original_label = data.getColumnLabel(i);
                if (selected_label == original_label) {
                    var original_column = i;
                    break
                }
            }
            //sort data and send to view modifier
            data.sort({
                column: original_column,
                desc: true
            });

            modifications = modify_view(original_column, data, original_colors, options);
            //redraw chart
            chart.draw(modifications[0], modifications[1]);
        }
    }
    // 'listener' detects selections made on chart area
    google.visualization.events.addListener(chart, 'select', selectHandler);
    chart.draw(data, options);

}

function modify_view(column, data, original_colors, options) {
    // modifies view after selection to best represent descending sort
    var view = new google.visualization.DataView(data);
    
    //store new sort order in an array
    var new_order = []
    for (var i = 0; i < view.getNumberOfColumns(); i++) {
        if (i == 0) {
            new_order[i] = 0;
        } else if (i == 1) {
            new_order[i] = column;
        } else if ((i == column) && (i != 1)) {
            new_order[i] = 1;
        } else {
            new_order[i] = i;
        }
    }
  

    //Modify series options to use original color scheme
    var modified_options = options;
   
    for (var i = 0; i < view.getNumberOfColumns(); i++) {
        var org_color = original_colors[view.getColumnLabel(new_order[i])];
        if (i != 0) {
            modified_options.series[i - 1] = {color: org_color};
        }
    }
   // set new view and send
    view.setColumns(new_order);
    return [view, modified_options]
}

function chart_config(data,options) {
    //sets and stores parameters for initial chart
    //primary colors to choose from
    var bright_colors = ['#C0C0C0','#FF00FF','#A52A2A', '#00FF00', '#0000A0', '#888888' ,'#FFA500', '#FF0000', '#0000FF', '#FFFF00', '#00E5EE','#008000', '#808000'] 
    

    //redefine series colors here and store original config
    options.series = {};
    original_colors = {};
    
    for (var i = 0; i < data.getNumberOfColumns(); i++) {
        if (bright_colors.length > 0){
        var new_color = bright_colors[0];
        // bright_colors[Math.floor(Math.random() * bright_colors.length)];
        bright_colors.splice(bright_colors.indexOf(new_color), 1);
        }
        else{
         var   new_color = getRandomColor();
        }
                     
        if (i != 0) {
            options.series[i - 1] = {color: new_color};
            original_colors[data.getColumnLabel(i)] = new_color;
        }
    }
    return [options, original_colors]
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
