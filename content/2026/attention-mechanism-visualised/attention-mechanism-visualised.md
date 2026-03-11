Title: Visualising Attention in Transformers
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, transformers, attention, deep-learning, nlp, visualisation

I implemented multi-head self-attention from scratch three times before I actually understood what was happening. Then I built a visualisation showing which tokens attend to which, and suddenly it all made sense. The thing that clicked: different attention heads learn completely different linguistic patterns - some are clearly hunting for syntax, others for meaning - and they do this without being told.

Let me start with the basic mechanism. Attention is a three-step dance: you compute a relevance score between every pair of tokens, soften those scores, then use them to weight-average the values:

```python
import torch
import torch.nn.functional as F
import math

def attention(query, key, value, mask=None):
    """Compute scaled dot-product attention"""
    d_k = query.shape[-1]
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attention_weights = F.softmax(scores, dim=-1)
    output = torch.matmul(attention_weights, value)
    return output, attention_weights
```

The magic is in the softmax - it turns the raw scores (which can be any value) into a probability distribution. High scores become high weights, low scores vanish.

Multi-head attention does this multiple times with different learned projections:

```python
class MultiHeadAttention(torch.nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = torch.nn.Linear(d_model, d_model)
        self.W_k = torch.nn.Linear(d_model, d_model)
        self.W_v = torch.nn.Linear(d_model, d_model)
        self.W_o = torch.nn.Linear(d_model, d_model)

    def forward(self, query, key, value, mask=None):
        batch_size = query.shape[0]

        # Project and reshape for multiple heads
        Q = self.W_q(query).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)

        # Compute attention for each head
        attn_output, self.attention_weights = attention(Q, K, V, mask)

        # Concatenate heads
        attn_output = attn_output.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        output = self.W_o(attn_output)
        return output, self.attention_weights
```

Here's where it gets interesting. That `self.attention_weights` is a tensor of shape `[batch, num_heads, seq_len, seq_len]`. It tells you exactly which tokens the model is looking at. Let's visualise it:

```python
import matplotlib.pyplot as plt
import numpy as np

def plot_attention(attention_weights, tokens, head_idx=None):
    """Visualise attention weights as a heatmap"""
    if head_idx is not None:
        weights = attention_weights[0, head_idx].detach().cpu().numpy()
    else:
        # Average across heads if not specified
        weights = attention_weights[0].mean(dim=0).detach().cpu().numpy()

    fig, ax = plt.subplots(figsize=(10, 8))
    im = ax.imshow(weights, cmap='viridis')

    ax.set_xticks(range(len(tokens)))
    ax.set_yticks(range(len(tokens)))
    ax.set_xticklabels(tokens, rotation=45, ha='right')
    ax.set_yticklabels(tokens)
    ax.set_xlabel('Token being attended to')
    ax.set_ylabel('Token doing attending')

    plt.colorbar(im, ax=ax, label='Attention weight')
    plt.tight_layout()
    return fig
```

Now feed it a sentence and watch what happens:

```python
sentence = "The cat sat on the mat"
tokens = sentence.split()

model = MultiHeadAttention(d_model=64, num_heads=8)
# Dummy embeddings for demo
embeddings = torch.randn(1, len(tokens), 64)

output, attn_weights = model(embeddings, embeddings, embeddings)

# Plot each head
fig, axes = plt.subplots(2, 4, figsize=(15, 8))
for head_idx in range(8):
    ax = axes[head_idx // 4, head_idx % 4]
    weights = attn_weights[0, head_idx].detach().numpy()
    ax.imshow(weights, cmap='viridis')
    ax.set_title(f'Head {head_idx}')
    ax.set_xticks(range(len(tokens)))
    ax.set_yticks(range(len(tokens)))
    ax.set_xticklabels(tokens, rotation=45, ha='right', fontsize=8)
    ax.set_yticklabels(tokens, fontsize=8)
plt.tight_layout()
plt.show()
```

Here's the magic moment - when I trained a small transformer on a language task and looked at the attention patterns, I started seeing linguistic structure appear:

- **Head 1** consistently attends in a diagonal pattern - it's basically looking at the current token and the next one. Pure positional/sequential logic.
- **Head 2** learns subject-verb agreement - when processing a verb, this head focuses on the noun earlier in the sentence.
- **Head 3** looks for articles and nouns - the word "the" gets high attention to following words.
- **Head 4** spreads attention uniformly - seems to be aggregating information broadly.

Nobody told the model "learn syntax in head 2 and semantics in head 3". It just figured it out. The multi-head design gives it enough capacity to develop multiple strategies, and different strategies turn out to be useful.

There's a neat trick using BertViz if you want publication-quality attention plots:

```python
from bertviz import head_view, model_view

# After getting attention weights from your model
# BertViz expects specific tensor shapes and handles the plotting
head_view(attn_weights, tokens)
```

But honestly, matplotlib heatmaps tell the story just as well.

The gotcha I hit: attention is local to a single layer. The model has many layers, each with their own attention heads. A token's final representation gets refined through multiple rounds of attending. And causal masking (for autoregressive models) prevents tokens from looking at future tokens - that's why decoder transformers have a triangular attention pattern.

Also, raw attention weights can be noisy. Sometimes a head will distribute attention evenly across everything (entropy maximized), sometimes it'll focus on one token. You need to read the patterns in context - a single attention head doesn't tell the whole story, it's the ensemble that matters.

What knocked me sideways: probing studies show that lower layers learn syntactic structure and higher layers learn semantic structure. Attention visualisation lets you see this happening in real-time.

Play with this. Take a trained transformer (BERT, GPT, whatever), extract attention for a test sentence, and look at the patterns. You'll see your model thinking.
