const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

svg.attr("viewBox", [-width / 2, -height / 2, width, height]);

color = (function () {
  const scale = d3.scaleOrdinal(d3.schemeSet1);
  return d => scale(d.species);
})();

const drag = simulation => {

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

d3.json("biogrid.json").then(function (data) {
  const chart = (function () {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const link = svg.append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-opacity", 0.8)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);


    let radius = 5

    function mouseOver(d, i) {
      d3.select(this)
        .transition()
        .duration(300)
        .attr("r", (d) => (d.degree >= 3) ? d.degree : 3)
        .attr("fill-opacity", 0.9);
      link.style('stroke-width', (l) => (d === l.source || d === l.target) ? 4 : 2);
      link.style('stroke', (l) => (d === l.source || d === l.target) ? "#AC0399" : "#ddd");
      link.style('stroke-opacity', (l) => (d === l.source || d === l.target) ? 1 : 0.5);
    }

    function mouseOut(d, i) {
      d3.select(this)
        .transition()
        .duration(300)
        .attr("r", radius)
        .attr("fill-opacity", 0.7);
      link.style("stroke-width", 2);
      link.style("stroke", "#ddd");
      link.style("stroke-opacity", 0.5);
    }

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", radius)
      .attr("fill", color)
      .attr("fill-opacity", 0.7)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .call(drag(simulation));


    node.append("title")
      .text(d => `Protein: ${d.id.split('_')[1]}\nSpecies: ${d.species}`)
      .attr("fill", "yellow");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    return svg.node();
  })();

  document.querySelector("body").appendChild(chart);
})