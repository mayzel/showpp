const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'render') {
        draw(message.data);
    }
});

function draw(model) {
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const channelHeight = 100;
    const width = 800;
    const height = model.channels.length * channelHeight + margin.top + margin.bottom;

    d3.select("#viz").selectAll("*").remove();
    const svg = d3.select("#viz").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "white");

    const x = d3.scaleLinear()
        .domain([0, model.totalDuration])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(model.channels.map(c => c.id))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);
    
    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Add channel groups
    const channel = svg.selectAll(".channel")
        .data(model.channels)
        .enter().append("g")
        .attr("class", "channel")
        .attr("transform", d => `translate(0,${y(d.id)})`);

    // Add channel labels
    channel.append("text")
        .attr("x", margin.left - 10)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name);
    
    // Add channel lines
    channel.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y.bandwidth() / 2)
        .attr("y2", y.bandwidth() / 2)
        .attr("stroke", "black");

    // Create a group for events
    const events = svg.append("g").attr("class", "events");

    model.events.forEach(event => {
        const eventGroup = events.append("g")
            .attr("transform", `translate(0, ${y(event.channel)})`);
        
        if (event.type === 'pulse') {
            eventGroup.append("rect")
                .attr("x", x(event.time))
                .attr("y", y.bandwidth() / 2 - 20)
                .attr("width", x(event.time + event.duration) - x(event.time))
                .attr("height", 20)
                .attr("fill", "steelblue");
        } else if (event.type === 'gradient') {
            const gradientPath = d3.path();
            gradientPath.moveTo(x(event.time), y.bandwidth() / 2);
            gradientPath.bezierCurveTo(
                x(event.time + event.duration / 2), y.bandwidth() / 2 - 30,
                x(event.time + event.duration / 2), y.bandwidth() / 2 - 30,
                x(event.time + event.duration), y.bandwidth() / 2
            );
            eventGroup.append("path")
                .attr("d", gradientPath)
                .attr("stroke", "black")
                .attr("fill", "none");
        } else if (event.type === 'fid') {
            const fidPath = d3.path();
            const nPoints = 100;
            const decay = 5;
            for (let i = 0; i < nPoints; i++) {
                const t = i / (nPoints - 1);
                const xt = x(event.time + t * event.duration);
                const yt = y.bandwidth() / 2 - 20 * Math.exp(-t * decay) * Math.sin(t * 2 * Math.PI * 5);
                if (i === 0) fidPath.moveTo(xt, yt);
                else fidPath.lineTo(xt, yt);
            }
            eventGroup.append("path")
                .attr("d", fidPath)
                .attr("stroke", "black")
                .attr("fill", "none");
        }

        // Add labels for all events
        if (event.type === 'delay') {
            model.annotations.push({
                label: event.label,
                time: event.time + event.duration / 2
            });
        } else {
            eventGroup.append("text")
                .attr("x", x(event.time + event.duration / 2))
                .attr("y", y.bandwidth() / 2 - (event.type === 'gradient' ? 35 : 25))
                .attr("text-anchor", "middle")
                .text(event.label);
        }
    });

    // Add annotations
    const annotations = svg.append("g").attr("class", "annotations");
    annotations.selectAll("text")
        .data(model.annotations)
        .enter().append("text")
        .attr("x", d => x(d.time))
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .text(d => d.label);
}
