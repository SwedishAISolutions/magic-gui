import { theData } from "./dummyData1.js";

// Build lookup
const nodesById = new Map();
theData.nodes.forEach(n => nodesById.set(n.id, { ...n, children: [], parents: [] }));
theData.edges.forEach(e => {
  const p = nodesById.get(e.parent);
  const c = nodesById.get(e.child);
  if (p && c) { p.children.push(c); c.parents.push(p); }
});

const rootNodes = Array.from(nodesById.values()).filter(n => n.parents.length === 0);
let selectedNode = null;
const app = document.getElementById('app');

function renderAll() {
  app.innerHTML = '';
  const levels = [];

  if (selectedNode) {
	const ancestors = [];
	let cur = selectedNode;
	while (true) {
	  ancestors.unshift(cur);
	  if (cur.parents.length === 0) break;
	  cur = cur.parents[0];
	}
	levels.push({ nodes: rootNodes, parent: null });
	for (let i = 1; i < ancestors.length; i++) {
	  const parent = ancestors[i].parents[0] || null;
	  const nodes = parent ? parent.children : rootNodes;
	  levels.push({ nodes, parent });
	}
	levels.push({ nodes: selectedNode.children, parent: selectedNode });
  } else {
	levels.push({ nodes: rootNodes, parent: null });
  }

  const levelDivs = [];
  levels.forEach((lvlData, idx) => {
	let { nodes, parent } = lvlData;
	// filter out leaves when alwaysRender is false
	nodes = nodes.filter(n => n.children.length > 0 || n.fields.alwaysRender);
	const dir = parent?.fields.listDirection || 'H';
	const lvl = document.createElement('div');
	lvl.className = 'level-container';
	lvl.style.flexDirection = dir === 'H' ? 'row' : 'column';
	if (idx === levels.length - 1) {
	  lvl.style.flex = '1 1 auto';
	  lvl.style.alignSelf = 'stretch';
	} else {
	  lvl.style.flex = '0 0 auto';
	  lvl.style.alignSelf = dir === 'V' ? 'flex-start' : 'stretch';
	}
	lvl.style.overflowX = dir === 'H' ? 'auto' : 'hidden';
	lvl.style.overflowY = dir === 'V' ? 'auto' : 'hidden';

	nodes.forEach(node => {
	  const box = document.createElement('div');
	  box.className = 'box';
	  box.dataset.nodeId = node.id;
	  box.textContent = node.fields.label;
	  if (node.children.length > 0) {
		box.addEventListener('click', () => { selectedNode = node; renderAll(); });
	  } else {
		box.style.cursor = 'default';
		box.classList.add('no-hover');
	  }
	  lvl.appendChild(box);
	});

	levelDivs.push({ div: lvl, parent });
	app.appendChild(lvl);
  });

  levelDivs.forEach((lvlObj, idx) => {
	const { div, parent } = lvlObj;
	if (parent && idx > 0) {
	  const prevDiv = levelDivs[idx - 1].div;
	  const selBox = prevDiv.querySelector(`[data-node-id="${parent.id}"]`);
	  if (selBox) selBox.classList.add('selected-parent');
	}
  });
}

window.addEventListener('DOMContentLoaded', () => renderAll());
