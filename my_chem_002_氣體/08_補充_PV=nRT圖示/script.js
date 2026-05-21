// Constants
const R = 0.08206; // L*atm/(mol*K)
const n = 1.0;     // 1 mole

// State variables
let displayT = 300; 
let displayP = 1.0; 
let displayV = 24.6; 

// UI Elements
const tempSlider = document.getElementById('temp-slider');
const presSlider = document.getElementById('pres-slider');
const volSlider = document.getElementById('vol-slider');
const tempVal = document.getElementById('temp-val');
const presVal = document.getElementById('pres-val');
const volVal = document.getElementById('vol-val');

const commonLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#a0a0a0', family: 'Inter, sans-serif', size: 14 },
    margin: { t: 40, b: 60, l: 80, r: 20 },
    xaxis: { 
        gridcolor: '#333', 
        zeroline: false,
        title: { font: { size: 17, color: '#fff' } },
        tickfont: { size: 13 }
    },
    yaxis: { 
        gridcolor: '#333', 
        zeroline: false,
        title: { font: { size: 17, color: '#fff' } },
        tickfont: { size: 13 }
    }
};

function update3DPlot() {
    const tRange = [];
    const vRange = [];
    const pMatrix = [];

    // X: T (100-600), Y: V (1-50), Z: P
    for (let t = 100; t <= 600; t += 10) tRange.push(t);
    for (let v = 1; v <= 50; v += 0.5) vRange.push(v);

    for (let i = 0; i < vRange.length; i++) {
        const row = [];
        for (let j = 0; j < tRange.length; j++) {
            let p = (R * tRange[j]) / vRange[i];
            if (p > 10) p = null; 
            row.push(p);
        }
        pMatrix.push(row);
    }

    const surface = {
        x: tRange, y: vRange, z: pMatrix,
        type: 'surface', colorscale: 'Viridis',
        showscale: false, opacity: 0.8, name: 'PV=nRT',
        contours: {
            x: { show: true, color: 'rgba(255,255,255,0.1)', width: 1 },
            y: { show: true, color: 'rgba(255,255,255,0.1)', width: 1 }
        }
    };

    const isothermLine = {
        x: Array(100).fill(displayT), y: [], z: [],
        mode: 'lines', type: 'scatter3d',
        line: { color: '#ff4b2b', width: 8 },
        showlegend: false
    };
    for (let v = 0.5; v <= 50; v += 0.5) {
        let p = (R * displayT) / v;
        if (p <= 10) { isothermLine.y.push(v); isothermLine.z.push(p); }
        else { isothermLine.y.push(v); isothermLine.z.push(null); }
    }

    const isobarLine = {
        x: [], y: [], z: Array(60).fill(displayP),
        mode: 'lines', type: 'scatter3d',
        line: { color: '#3a7bd5', width: 6 },
        showlegend: false
    };
    for (let t = 100; t <= 600; t += 10) {
        let v = (R * t) / displayP;
        if (v >= 0.5 && v <= 50) { isobarLine.x.push(t); isobarLine.y.push(v); }
        else { isobarLine.x.push(t); isobarLine.y.push(null); }
    }

    const isochoreLine = {
        x: [], y: Array(60).fill(displayV), z: [],
        mode: 'lines', type: 'scatter3d',
        line: { color: '#00d2ff', width: 6 },
        showlegend: false
    };
    for (let t = 100; t <= 600; t += 10) {
        let p = (R * t) / displayV;
        if (p <= 10) { isochoreLine.x.push(t); isochoreLine.z.push(p); }
        else { isochoreLine.x.push(t); isochoreLine.z.push(null); }
    }

    const plotEl = document.getElementById('plot3d');
    const currentCamera = plotEl && plotEl.layout && plotEl.layout.scene && plotEl.layout.scene.camera 
                          ? plotEl.layout.scene.camera : { eye: { x: 1.5, y: 1.5, z: 1.2 } };

    const layout = {
        ...commonLayout,
        scene: {
            xaxis: { title: '溫度 T (K)', range: [0, 600], gridcolor: '#444' },
            yaxis: { title: '體積 V (L)', range: [0, 50], gridcolor: '#444' },
            zaxis: { title: '壓力 P (atm)', range: [0, 10], gridcolor: '#444' },
            camera: currentCamera
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
        showlegend: false, uirevision: 'constant'
    };
    Plotly.react('plot3d', [surface, isothermLine, isobarLine, isochoreLine], layout);
}

function updatePVPlot() {
    const vData = []; const pData = [];
    for (let v = 0.5; v <= 50; v += 0.5) {
        let p = (R * displayT) / v;
        if (p <= 10) { vData.push(v); pData.push(p); }
    }
    const trace = { x: vData, y: pData, type: 'scatter', mode: 'lines', line: { color: '#ff4b2b', width: 3 } };
    const layout = { ...commonLayout, xaxis: { ...commonLayout.xaxis, title: '體積 V (L)' }, yaxis: { ...commonLayout.yaxis, title: '壓力 P (atm)' }, showlegend: false };
    Plotly.react('plot-pv', [trace], layout);
}

function updateVTPlot() {
    const tData = []; const vData = [];
    for (let t = 0; t <= 600; t += 10) {
        let v = (R * t) / displayP;
        if (v > 50) v = 50;
        vData.push(v); tData.push(t);
    }
    const trace = { x: tData, y: vData, type: 'scatter', mode: 'lines', line: { color: '#3a7bd5', width: 3 } };
    const layout = { ...commonLayout, xaxis: { ...commonLayout.xaxis, title: '溫度 T (K)' }, yaxis: { ...commonLayout.yaxis, title: '體積 V (L)' }, showlegend: false };
    Plotly.react('plot-vt', [trace], layout);
}

function updatePTPlot() {
    const tData = []; const pData = [];
    for (let t = 0; t <= 600; t += 10) {
        let p = (R * t) / displayV;
        if (p > 10) p = 10;
        tData.push(t); pData.push(p);
    }
    const trace = { x: tData, y: pData, type: 'scatter', mode: 'lines', line: { color: '#00d2ff', width: 3 } };
    const layout = { ...commonLayout, xaxis: { ...commonLayout.xaxis, title: '溫度 T (K)' }, yaxis: { ...commonLayout.yaxis, title: '壓力 P (atm)' }, showlegend: false };
    Plotly.react('plot-pt', [trace], layout);
}

function updateAll() {
    tempVal.textContent = displayT; presVal.textContent = displayP.toFixed(1); volVal.textContent = displayV.toFixed(1);
    update3DPlot(); updatePVPlot(); updateVTPlot(); updatePTPlot();
}

tempSlider.addEventListener('input', () => { displayT = parseFloat(tempSlider.value); updateAll(); });
presSlider.addEventListener('input', () => { displayP = parseFloat(presSlider.value); updateAll(); });
volSlider.addEventListener('input', () => { displayV = parseFloat(volSlider.value); updateAll(); });

updateAll();

window.addEventListener('resize', () => {
    Plotly.Plots.resize('plot3d'); Plotly.Plots.resize('plot-pv'); Plotly.Plots.resize('plot-vt'); Plotly.Plots.resize('plot-pt');
});
