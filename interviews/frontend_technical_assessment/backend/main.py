from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import json

app = FastAPI(title="VectorShift Pipeline API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, float]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str = None
    targetHandle: str = None

class PipelineData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:


    graph = {node.id: [] for node in nodes}
    
    for edge in edges:
        if edge.source in graph and edge.target in graph:
            graph[edge.source].append(edge.target)
    

    visit_state = {node.id: 0 for node in nodes}
    
    def has_cycle_dfs(node_id: str) -> bool:
        if visit_state[node_id] == 1:
            return True
        if visit_state[node_id] == 2:
            return False
            
        visit_state[node_id] = 1
        
        for neighbor in graph[node_id]:
            if has_cycle_dfs(neighbor):
                return True
                
        visit_state[node_id] = 2
        return False
    for node_id in graph:
        if visit_state[node_id] == 0:
            if has_cycle_dfs(node_id):
                return False  # Cycle found, not a DAG
                
    return True  # No cycles found, it's a DAG

@app.get('/')
def read_root():
    return {
        'message': 'VectorShift Pipeline API',
        'version': '1.0.0',
        'endpoints': {
            'parse': '/pipelines/parse',
            'health': '/'
        }
    }

@app.post('/pipelines/parse')
def parse_pipeline(pipeline_data: PipelineData):
    try:
        nodes = pipeline_data.nodes
        edges = pipeline_data.edges
        

        num_nodes = len(nodes)
        num_edges = len(edges)
        

        is_dag_result = is_dag(nodes, edges)
        

        node_types = {}
        for node in nodes:
            node_type = node.type
            node_types[node_type] = node_types.get(node_type, 0) + 1
        

        connected_nodes = set()
        for edge in edges:
            connected_nodes.add(edge.source)
            connected_nodes.add(edge.target)
        
        isolated_nodes = [node.id for node in nodes if node.id not in connected_nodes]
        

        in_degree = {node.id: 0 for node in nodes}
        out_degree = {node.id: 0 for node in nodes}
        
        for edge in edges:
            if edge.target in in_degree:
                in_degree[edge.target] += 1
            if edge.source in out_degree:
                out_degree[edge.source] += 1
        

        source_nodes = [node_id for node_id, degree in in_degree.items() if degree == 0 and node_id in connected_nodes]
        sink_nodes = [node_id for node_id, degree in out_degree.items() if degree == 0 and node_id in connected_nodes]
        
        return {
            'num_nodes': num_nodes,
            'num_edges': num_edges,
            'is_dag': is_dag_result,
            'analysis': {
                'node_types': node_types,
                'isolated_nodes': isolated_nodes,
                'source_nodes': source_nodes,
                'sink_nodes': sink_nodes,
                'max_in_degree': max(in_degree.values()) if in_degree else 0,
                'max_out_degree': max(out_degree.values()) if out_degree else 0,
                'is_connected': len(isolated_nodes) == 0 and num_nodes > 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing pipeline: {str(e)}")

@app.get('/health')
def health_check():
    return {'status': 'healthy', 'service': 'pipeline-api'}
