#!/usr/bin/env python3
"""
Local embedding service using sentence-transformers
Alternative to external embedding APIs for development
"""

import os
import asyncio
from typing import List, Dict, Any
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

# Initialize FastAPI app
app = FastAPI(title="Mnemosyne Embedding Service", version="1.0.0")

# Global model variable
model = None

class EmbeddingRequest(BaseModel):
    texts: List[str]
    model: str = "sentence-transformers/all-MiniLM-L6-v2"

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    model: str
    dimensions: int

@app.on_event("startup")
async def load_model():
    """Load the sentence transformer model on startup"""
    global model
    model_name = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    print(f"Loading model: {model_name}")
    model = SentenceTransformer(model_name)
    print(f"Model loaded successfully. Dimensions: {model.get_sentence_embedding_dimension()}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_dimensions": model.get_sentence_embedding_dimension() if model else None
    }

@app.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(request: EmbeddingRequest):
    """Create embeddings for the provided texts"""
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not request.texts:
        raise HTTPException(status_code=400, detail="No texts provided")
    
    try:
        # Generate embeddings
        embeddings = model.encode(request.texts, convert_to_numpy=True)
        
        # Convert to list of lists for JSON serialization
        embeddings_list = embeddings.tolist()
        
        return EmbeddingResponse(
            embeddings=embeddings_list,
            model=request.model,
            dimensions=len(embeddings_list[0]) if embeddings_list else 0
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embeddings: {str(e)}")

@app.get("/models")
async def list_models():
    """List available models"""
    return {
        "models": [
            {
                "id": "sentence-transformers/all-MiniLM-L6-v2",
                "name": "All MiniLM L6 v2",
                "dimensions": 384,
                "description": "Fast and efficient sentence embedding model"
            },
            {
                "id": "sentence-transformers/all-mpnet-base-v2", 
                "name": "All MPNet Base v2",
                "dimensions": 768,
                "description": "High quality sentence embedding model"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "embedding_service:app",
        host="0.0.0.0",
        port=8002,
        reload=False,
        log_level="info"
    )
