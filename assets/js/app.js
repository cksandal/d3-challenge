// need to make these global
var chartData = [];  // data read from the csv gets stored here
var height = 0;      // svg height - margins --> actual chart height
var width = 0;       // svg width - margins --> actual chart width

// x selector options and the starting value
var xOpts = [
    {'sel': 'poverty', 'val': 'In Poverty (%)', 'off': 20},
    {'sel': 'age', 'val': 'Age (Median)', 'off': 40},
    {'sel': 'income', 'val': 'Household Income (Median)', 'off': 60}
];
var xSelector = 'poverty'

// y selector options and the starting value
var yOpts = [
    {'sel': 'healthcare', 'val': 'Lacks Healthcare (%)', 'off': -40},
    {'sel': 'obesity', 'val': 'Obese (%)', 'off': -60},
    {'sel': 'smokes', 'val': 'Smoker (%)', 'off': -80}
];
var ySelector = 'healthcare'

// need this to qalk the *Opts hashes - needed for ToolTips...
function findOpt(data, searchon, searchval, retrieve){
    for (i=0; i<data.length; i++) { 
        if (data[i][searchon] == searchval){
            return data[i][retrieve];
        }
    }
}

// generate and interactive chart 
function generateChart(){ 
    // margins for the SVG 
    var margin = { top: 50, bottom: 140, right: 0, left: 100 };

    // read the csv
    d3.csv("assets/data/data.csv").then(function(data){
        // make data globally available so we don't need to read it again and again...
        chartData = data;  

        // need to do this after the data loads to avoid excessive flicker
        var svgArea = d3.select("body").select("svg");
        if (!svgArea.empty())  svgArea.remove();
        var svgWidth = window.innerWidth;
        if (svgWidth > 972)  svgWidth = 972;
        if (svgWidth < 350)  svgWidth = 350;
        var svgHeight = svgWidth/16*10;
        height = svgHeight - margin.top - margin.bottom;
        width = svgWidth - margin.left - margin.right;
        var svg = d3.select("#scatter").append("svg").attr("height", svgHeight).attr("width", svgWidth);
        var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
        // typecast what we need 
        chartData.forEach(function(line){
            line.poverty        = +line.poverty;
            line.age            = +line.age;
            line.income         = +line.income;
            line.healthcare     = +line.healthcare;
            line.obesity        = +line.obesity;
            line.smokes         = +line.smokes;
        });

        // tool tips
        var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { 
            return "<b>" + d.state + "</b><br>" +
                    findOpt(xOpts, 'sel', xSelector, 'val') + ": " + d[xSelector] + "<br>" +
                    findOpt(yOpts, 'sel', ySelector, 'val') + ": " + d[ySelector] + "</span>"
        });
        svg.call(tool_tip);
        
        // x axis from a bit less than the min value to a bit more than the max.        
        var xLinScale = d3.scaleLinear()
        
        .domain([d3.min(chartData, d => d[xSelector])*.85, d3.max(chartData, d => d[xSelector])*1.1])
        .range([0, width])
        var xAxis = d3.axisBottom(xLinScale)
        chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(xAxis).attr("class", "honey");
 
        // y axis from a bit less than the min value to a bit more than the max.        
        var yLinScale = d3.scaleLinear()
        
        .domain([d3.min(chartData, d => d[ySelector])*.85, d3.max(chartData, d => d[ySelector])*1.1])
        .range([height, 0])
        var yAxis = d3.axisLeft(yLinScale)
        chartGroup.append("g").call(yAxis).attr("class", "bunny");
  
        // need to add circles
        var circle = chartGroup.selectAll("g").data(chartData).enter().append("g")
        
        // draw the circles blue w/ lightblue inside   
        circle.append("circle")
        .attr("class", "mia")
        .attr("cx", d => xLinScale(d[xSelector]))
        .attr("cy", d => yLinScale(d[ySelector]))
        .attr("r", "11")
        .attr("fill", "lightblue")
        .attr("stroke-width", "1")
        .attr("stroke", "blue")
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);
        
        // add text to the interior of the circle, anchor it to the middle of the circle.
        circle.append("text")
        .attr("class", "wallace")
        .attr("x", d => xLinScale(d[xSelector]))
        .attr("y", d => yLinScale(d[ySelector]))
        .attr("dy", ".35em")
        .attr("font-size", "12")
        .attr("fill", "blue")
        .attr("text-anchor", "middle")
        .text((d) => d['abbr'])
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

        // now - this is going to be both the x axis label and data selector.
        chartGroup.append('g').selectAll('text')
        .data(xOpts).enter().append('text')
        .attr("class", "vincent")
        .attr('x', width/2)
        .attr('y', d => height + 20 + d.off)
        .attr("text-anchor", "middle")
        .text(d => d.val)
        .attr("fill",         d => (d.sel === xSelector) ? 'black' : 'gray')
        .attr("stroke-width", d => (d.sel === xSelector) ? '1' : '0.4')
        .attr("stroke",       d => (d.sel === xSelector) ? 'black' : 'gray')
        .on("mousedown", function(d) { 
            xSelector = d.sel;
            console.log(xSelector)
            updateChart()        
        });

        chartGroup.append('g').selectAll('text')
        .data(yOpts).enter().append('text')
        .attr("class", "vega")
        .attr('x', -height/2)
        .attr('y', d => d.off)
        .attr("text-anchor", "middle")
        .text(d => d.val)
        .attr("fill",         d => (d.sel === ySelector) ? 'black' : 'gray')
        .attr("stroke-width", d => (d.sel === ySelector) ? '1' : '0.4')
        .attr("stroke",       d => (d.sel === ySelector) ? 'black' : 'gray')
        .attr("transform", "rotate(-90)")
        .on("mousedown", function(d) { 
            ySelector = d.sel;
            console.log(ySelector)
            updateChart(update=true)
        });
    });
}

function updateChart() {
        // x axis from a bit less than the min value to a bit more than the max.        
        var xLinScale = d3.scaleLinear()
        .domain([d3.min(chartData, d => d[xSelector])*.85, d3.max(chartData, d => d[xSelector])*1.1])
        .range([0, width])
        var xAxis = d3.axisBottom(xLinScale)

        // y axis from a bit less than the min value to a bit more than the max.        
        var yLinScale = d3.scaleLinear()
        .domain([d3.min(chartData, d => d[ySelector])*.85, d3.max(chartData, d => d[ySelector])*1.1])
        .range([height, 0])
        var yAxis = d3.axisLeft(yLinScale)

        // update xaxis
        d3.select(".honey")
        .call(xAxis);
    
        // update yaxis
        d3.select(".bunny")
        .call(yAxis);
      
        // update circles
        d3.selectAll(".mia")
        .transition()
        .duration(1000)
        .attr("cx", d => xLinScale(d[xSelector]))
        .attr("cy", d => yLinScale(d[ySelector]));
     
        // update text
        d3.selectAll(".wallace")
        .transition()
        .duration(1000)
        .attr("x", d => xLinScale(d[xSelector]))
        .attr("y", d => yLinScale(d[ySelector]))
        .text((d) => d['abbr']);

        // update xaxis label(s)
        d3.selectAll(".vincent")
        .attr("fill",         d => (d.sel === xSelector) ? 'black' : 'gray')
        .attr("stroke-width", d => (d.sel === xSelector) ? '1' : '0.4')
        .attr("stroke",       d => (d.sel === xSelector) ? 'black' : 'gray')


        // update yaxis label(s)
        d3.selectAll(".vega")
        .attr("fill",         d => (d.sel === ySelector) ? 'black' : 'gray')
        .attr("stroke-width", d => (d.sel === ySelector) ? '1' : '0.4')
        .attr("stroke",       d => (d.sel === ySelector) ? 'black' : 'gray')
}


// do the first drawing of the chart w/ default selectors
generateChart()

// keep on redrawing on re-size
d3.select(window).on("resize", generateChart());