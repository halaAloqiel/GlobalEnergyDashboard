
const api_url = "https://api.eia.gov/v2/ieo/2021/data/?api_key=6WTzBPJg3WgdViKVmfoAqgUlfQohxgX60ayUe7KP&data[]=value&facets[regionId][]=4-0&facets[scenario][]=Reference&facets[history][]=HISTORIC&start=2009-12-31&sort[0][column]=period&sort[0][direction]=asc";
var CapacityYearGraph = document.getElementById("Capacity Year Graph");
var ConsumptionYearGraph = document.getElementById("Consumption Year Graph");




res = fetch(api_url).then((response) => {
  return response.json()})

function indicator(titleId , percentID , indicatorID){
  let unit;
  const title = document.getElementById(titleId);
  const percent = document.getElementById(percentID);
  const indicator = document.getElementById(indicatorID);
  
  
  var apidata = []
  res.then(data =>{

    if(indicatorID =="Energy Consumption"){
    serID="cnsm_de_eu_de_qbtu"
    region = "Total World"
    unit="Qbtu"
    }
    if(indicatorID =="Installed Generating Capacity"){
    serID ="pgcap_cap_tot_gw"
    region = "Total World"
    unit ="Gw"
    }
    if(indicatorID =="Electricity Generation"){
    serID = "pgdis_cap_tot_bkwh"
    region = "Total World"
    unit = "BkWh"
    }
    var d = data.response.data

    for(var element in d){
      if(d[element].seriesId==serID && d[element].regionName == region){
        apidata.push(d[element])
      }
    };

    var maxYear = apidata[apidata.length-1].period;
    var Value = parseInt(apidata[apidata.length-1].value)
    var lastYearValue = parseInt(apidata[apidata.length-2].value)
    var dif = parseInt(((Value-lastYearValue)/lastYearValue)*100)
    title.innerHTML= maxYear
    indicator.innerHTML= Value + " "+ "<span class='unit'>" +unit + "</span>";
    percent.innerHTML= dif+ "%" ;
    if(dif  >0 ){
      percent.style.color = "#289b91"
    }
    else{
      percent.style.color = "#f06e4b"
    }
  })
}

indicator("Consumption Year","Energy Consumption Percent","Energy Consumption")
indicator("Generation Year","Electricity Generation Percent","Electricity Generation")
indicator("Capacity Year","Installed Generating Capacity Percent","Installed Generating Capacity")


function removeDuplicates(arr) {
  return [...new Set(arr)];
}

function barGraph(graphName, wid , hei){

  var margin = {top: 30, right: 30, bottom: 40, left: 60},
      width = wid - margin.left - margin.right,
      height = hei - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  var svg = d3.select(graphName)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  
  res.then(data =>{
  filteredData =[]
  apidata= data.response.data
  apidata.forEach( f => {
    if(f.seriesId=="cnsm_de_eu_de_qbtu" && f.regionName == "Total World"){
      f.value = Number(f.value)
      filteredData.push(f)
    }
  })
  
  var colorScale = d3.scaleLinear()
    .domain([(d3.min(filteredData, d => d.value))*0.8, d3.max(filteredData, d => d.value)])
    .range(["#e1fafa", "#3c5a82"])
  
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(filteredData.map(d => d.period))
    .padding(0.2);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .style("text-anchor", "middle");
  
  var y = d3.scaleLinear()
    .domain([(d3.min(filteredData, d => d.value))*0.8, d3.max(filteredData, d => d.value)])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  svg.selectAll("mybar")
    .data(filteredData)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.period); })
      .attr("y", function(d) { return y(0); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(0); })
      .attr("fill", function(d) { return colorScale(d.value)})

  svg.selectAll("rect")
  .transition()
  .duration(800)
  .attr("y", function(d) { return y(d.value); })
  .attr("height", function(d) { return height - y(d.value); })
  .delay(function(d,i){return(i*100)})
  })
  
}

function groupBar(graphName ,wid, hei){
    
  var margin = {top: 10, right: 30, bottom: 70, left: 50},
      width = wid - margin.left - margin.right,
      height = hei - margin.top - margin.bottom;
  
 
  var svg = d3.select(graphName)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  
  
  res.then(data =>{
    filteredData =[]
    fuels = []
    sectors = []
    apidata= data.response.data
    lastYear = apidata[apidata.length -1].period
    ConsumptionYearGraph.innerHTML = lastYear
    apidata.forEach( f => {
      if(f.tableName=="Delivered energy consumption by end-use sector and fuel" && f.period==lastYear && ((f.seriesName.split(":")[1]).trim())!= "All End-use" && ((f.seriesName.split(":")[1]).trim())!= "Total"&& f.seriesName!=="Energy use : Industrial : Total Industrial Delivered Energy" &&f.seriesName!=="Energy use : Commercial : Total Commercial Delivered Energy" &&f.seriesName!=="Energy use : Transportation : Total Transportation Delivered Energy" &&f.seriesName!=="Energy use : Residential : Total Residential Delivered Energy" &&f.seriesName!=="Energy use : Electric Power : Total Electric Power Sector" && (f.seriesName.split(":")[1]).trim()!= "Electric Power"){
        f.sector = (f.seriesName.split(":")[1]).trim()
        f.fuel = (f.seriesName.split(":")[2]).trim()
        f.value = Number(f.value)
        filteredData.push(f)
        fuels.push(f.fuel)
        sectors.push(f.sector)
      }
    })

    fuels = removeDuplicates(fuels)
    sectors = removeDuplicates(sectors)
    graphData = []
    sectors.forEach(d =>{
      sectorData = {}
      sectorData["sector"] =d
      sectorData["values"]=[]
      filteredData.forEach( i =>{
        fuelData ={}
        if(i.sector == d){
          fuelData.fuel=i.fuel
          fuelData.value =  Number(i.value)
          sectorData["values"].push(fuelData)}
      })
      graphData.push(sectorData)
  })




    var x = d3.scaleBand()
      .domain(graphData.map(function(d) {return d.sector}))
      .range([0, width])
      .padding([0.2])

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(0));
  
    var y = d3.scaleLinear()
      .domain([(d3.min(filteredData, d => d.value))*0.8, d3.max(filteredData, d => d.value)])
      .range([height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // Another scale for subgroup position?
    var xSubgroup = d3.scaleBand()
      .domain(filteredData.map(d => d.fuel))
      .range([0, x.bandwidth()])
      .padding([0.05])

  
    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
      .domain(filteredData.map(d => d.fuel))
      .range(['#289b91','#f06e4b','#3c5a82' , '#96c3d7' ,'#283241'])
  
    // Show the bars
    svg.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(graphData)
      .enter()
      .append("g")
        .attr("transform", function(d) {return "translate(" + x(d.sector) + ",0)"; })
      .selectAll("rect")
      .data(function(d) { return d.values})
      .enter().append("rect")
        .attr("x", function(d) { return xSubgroup(d.fuel); })
        .attr("y", function(d) { return y(0); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { return height - y(0); })
        .attr("fill", function(d) { return color(d.fuel); });

    svg.selectAll("rect")
      .transition()
      .duration(800)
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .delay(function(d,i){return(i*70)})

    const legend = svg.append("g")
      .attr("transform" , `translate(${wid*0.1}, ${(hei*0.8 +30 )})`)
    
    
    fuels.forEach((fuel , i) =>{
      const legendRow = legend.append("g")
        .attr("transform", `translate(${i * 120}, 0)`)
    
      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color(fuel))
    
      legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(fuel)
      
    })
  
  })
  
}

function donut(graphName , wid , hei){
  var margin = 40
    radius = Math.min(wid, hei) / 1.7 - margin;

  var color = d3.scaleOrdinal()
    .range(['#289b91', '#f06e4b', '#3c5a82', '#96c3d7', '#283241']);

  var arc = d3.arc()
    .outerRadius(radius - 20)
    .innerRadius(radius - 80);


  var svg = d3.select(graphName).append("svg")
    .attr("width" , wid)
    .attr("height" , hei)
    .append("g")
    .attr("transform","translate(" + (wid / 2 )+ "," + (hei)/ 2 + ")");


  res.then(data =>{
    filteredData =[]
    fuels = []
    apidata= data.response.data
    lastYear = apidata[apidata.length -1].period
    CapacityYearGraph.innerHTML = lastYear
    apidata.forEach( f => {
      if(f.tableName=="Installed generating capacity by region and fuel" && f.regionName == "Total World" && f.period==lastYear &&(f.seriesName =="Installed generating capacity: Renewables"|| f.seriesName =="Installed generating capacity : Coal" || f.seriesName =="Installed generating capacity : Natural Gas" || f.seriesName =="Installed generating capacity : Liquids" || f.seriesName =="Installed generating capacity : Nuclear"|| f.seriesName =="Installed generating capacity : Nuclear")){
        f.fuel = (f.seriesName.split(":")[1]).trim()
        f.value = Number(f.value)
        filteredData.push(f)
        fuels.push(f.fuel)
      }
    })

  

  var pie = d3.pie()
    .sort(null)
    .value(function(d){ return d.value;});


  var g = svg.selectAll(".arc")
    .data(pie(filteredData))
    .enter().append("g")
    .attr("class", "arc")
    .attr("transform" , `translate(${0}, ${-30})`);

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d.data.fuel); });

  const legend = svg.append("g")
    .attr("transform" , `translate(${0 - wid/2.5}, ${(hei*0.4)})`)


  fuels.forEach((fuel , i) =>{
    const legendRow = legend.append("g")
		  .attr("transform", `translate(${i * 120}, 0)`)

    legendRow.append("rect")
      .attr("width", 10)
      .attr("height", 10)
		  .attr("fill", color(fuel))

    legendRow.append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(fuel)
  
    })
  })  
}

function line(graphName, wid,hei){
  
  var margin = {top: 10, right: 30, bottom: 40, left: 60},
    width = wid - margin.left - margin.right,
    height = hei - margin.top - margin.bottom;

  var svg = d3.select(graphName)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

  var g = svg.append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  res.then(data => {
    filteredData =[]
    apidata= data.response.data
    apidata.forEach( f => {
      if(f.tableName=="Net electricity generation by region and fuel" && f.regionName == "Total World" &&(f.seriesName =="Net generation : Coal"|| f.seriesName =="Net generation : Nuclear" || f.seriesName =="Net generation : Renewables" || f.seriesName =="Net generation : Liquids" || f.seriesName =="Installed generating capacity : Nuclear"|| f.seriesName =="Net generation : Natural Gas")){
        f.fuel = (f.seriesName.split(":")[1]).trim()
        f.value = Number(f.value)
        filteredData.push(f)
      }
    })

    
    var fuels =  d3.map(filteredData, function(d){return(d.fuel)}).keys()
    d3.select("#selectButton")
    .selectAll('myOptions')
     .data(fuels)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button


    var color = d3.scaleOrdinal()
    .range(['#289b91', '#f06e4b', '#3c5a82', '#96c3d7', '#283241'])
    .domain(filteredData.map(d => d.fuel));

    var x = d3.scaleBand()
      .range([ 0, width])
      .domain(filteredData.map(d => d.period))
    
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
      .range([height,0])
      .domain([0, d3.max(filteredData, d => d.value)*1.3])
    
    g.append("g")
      .call(d3.axisLeft(y));

    var line = g
    .append('g')
    .append("path")
      .datum(filteredData.filter(function(d){return d.fuel==fuels[0]}))
      .attr("d", d3.line()
        .x(function(d) { return x(d.period) })
        .y(function(d) { return y(+d.value) })
      )
      .attr("stroke", function(d){ return color("valueA") })
      .style("stroke-width", 2)
      .style("fill", "none")
    
    function update(selectedGroup) {

      // Create new data with the selection?
      var dataFilter = filteredData.filter(function(d){return d.fuel==selectedGroup})
        // Give these new data to update line
        line
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(d.period) })
              .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ return color(selectedGroup) })
      }
    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      update(selectedOption)
    })
  
  })
}




barGraph("#energy-consumption" , 600,300)
groupBar("#energy-consumption-fuel" , 600, 300)
donut("#installed-capacity-fuel" ,600, 300)
line("#electricity-generation-fuel",600,300)

