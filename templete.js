// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 30, bottom: 70, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group
    
    // Add scales    
    
    const ageGroups = [...new Set(data.map(d => d.AgeGroup))];
    const xScale = d3.scaleBand()
        .domain(ageGroups)
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.2);

    const likesMin = d3.min(data, d => d.Likes);
    const likesMax = d3.max(data, d => d.Likes);
    const yScale = d3.scaleLinear()
      .domain([Math.min(0, likesMin), likesMax]) // include 0 for nicer axis
      .range([height, 0])
      .nice();

     


    // Add x-axis label
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "middle");

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text("Age Group");

    // Add y-axis label
    svg.append("g")
      .call(d3.axisLeft(yScale));
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Likes");

    const rollupFunction = function(groupData) {
      const values = groupData.map(d => d.Likes).sort(d3.ascending);
      const min = d3.min(values);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const max = d3.max(values);
      const iqr = q3 - q1;
      return {min, q1, median, q3, max, iqr};
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth/2)
            .attr("x2", x + boxWidth/2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", Math.max(1, yScale(quantiles.q1) - yScale(quantiles.q3))) // height positive
            .attr("fill", "#cce5ff")
            .attr("stroke", "black");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
      d.AvgLikes = +d.AvgLikes;
  });

    // Define the dimensions and margins for the SVG
    const margin = {top: 40, right: 160, bottom: 70, left: 60};
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type
    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    const x0 = d3.scaleBand()
        .domain(platforms)
        .range([0, width])
        .padding(0.2);
      

    const x1 = d3.scaleBand()
        .domain(postTypes)
        .range([0, x0.bandwidth()])
        .padding(0.05);
      

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes) * 1.08])
        .range([height, 0])
        .nice();
      

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("text-anchor", "middle");

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height + margin.bottom - 20)
      .attr("text-anchor", "middle")
      .text("Platform");

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Average Likes");

  // Group container for bars

  const nested = d3.group(data, d => d.Platform);
  // Draw bars
  svg.selectAll(".platform")
  .data(platforms)
  .enter()
  .append("g")
  .attr("transform", d => `translate(${x0(d)},0)`)
  .each(function(platform) {
      const groupData = nested.get(platform) || [];
      const g = d3.select(this);
      g.selectAll("rect")
        .data(groupData)
        .enter()
        .append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));
  });

    // Add the legend
    const legend = svg.append("g")
    .attr("transform", `translate(${width + 20}, 0)`);

    postTypes.forEach((type, i) => {
      // small colored square
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 22)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", color(type));

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d => {
      // extract first token that matches mm/dd/yyyy
      const match = d.Date.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      const dateString = match ? match[1] : d.Date;
      d.date = parseDate(dateString);
      d.AvgLikes = +d.AvgLikes;
  });

  data.sort((a,b) => d3.ascending(a.date, b.date));

    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 30, bottom: 90, left: 60};
    const width = 900 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes  
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes) * 1.05])
      .range([height, 0])
      .nice();

    // Draw the axis, you can rotate the text in the x-axis here
    const xAxis = d3.axisBottom(x).ticks(Math.min(data.length, 10)).tickFormat(d3.timeFormat("%-m/%-d"));
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-25)");
      
    svg.append("g")
    .call(d3.axisLeft(y));

    // Add x-axis label
    // Add y-axis label
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height + margin.bottom - 35)
      .attr("text-anchor", "middle")
      .text("Date");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural.
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.AvgLikes))
      .curve(d3.curveNatural);

    // draw path
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.AvgLikes))
      .attr("r", 3)
      .attr("fill", "steelblue"); 

});
