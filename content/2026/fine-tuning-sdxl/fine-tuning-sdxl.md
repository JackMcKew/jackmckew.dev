Title: Teaching SDXL a New Trick - Finetuning Stable Diffusion XL with LoRA
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: stable-diffusion, sdxl, fine-tuning, dreambooth, lora, machine-learning

I spent a weekend fine-tuning SDXL to generate images of a specific style I wanted, and it was weirdly satisfying and deeply frustrating in equal measure. If you've looked at fine-tuning and thought "seems complicated", you're right. But it's also surprisingly doable if you know what to skip and what to obsess over.

## Why fine-tune at all?

You could just prompt-engineer SDXL to death. "A painting in the style of X with Y composition and Z lighting" works for generic stuff. But if you want consistent, repeatable outputs - a specific character across multiple images, a particular artistic style, or your friend's face in different scenarios - prompt engineering hits a wall. Fine-tuning teaches the model your concept.

LoRA (Low-Rank Adaptation) is the sensible way to do this now. Instead of retraining the entire model (which requires 24GB+ VRAM and days), you train tiny adapter weights that bolt onto the existing model. The full model stays frozen, and you only learn the differences. Your fine-tuned LoRA is usually 50-100MB instead of 6GB.

## The dataset problem

This is where most guides hand-wave. Everyone says "5-10 images is enough" and leaves you to figure out the rest.

I wanted SDXL to generate images of a specific visual style - moody, high-contrast, film noir aesthetic. So I collected 20 images of that style from various artists, put them in a folder, resized them to 1024x1024, and moved on. Dead simple.

But if you're training on a person's face (the classic fine-tuning use case), you need consistency. Same lighting, similar framing, no other people in the shot. 5 images of your friend's face taken in different locations with different cameras is worse than 2 images in identical studio conditions. Consistency beats quantity.

The flip side: if your dataset is too specific, your model overfits and can only generate that exact scenario. Too generic, and it doesn't learn anything. It's a weird sweet spot.

## Setting up the environment

I used diffusers + peft (Hugging Face's fine-tuning library) on an RTX 3070 (8GB VRAM). Here's the config that actually worked:

```python
from diffusers import StableDiffusionXLPipeline, DDPMScheduler
from peft import get_peft_model, LoraConfig, TaskType
import torch

# Model setup
model_id = "stabilityai/stable-diffusion-xl-base-1.0"
pipeline = StableDiffusionXLPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    use_safetensors=True
)

# LoRA config - this is the secret sauce
lora_config = LoraConfig(
    r=32,  # rank - higher = more expressive, more VRAM
    lora_alpha=32,
    target_modules=["to_k", "to_v", "to_q"],  # only train attention
    lora_dropout=0.1,
    bias="none",
    task_type=TaskType.TEXT_TO_IMAGE
)

# Apply LoRA
unet = pipeline.unet
unet = get_peft_model(unet, lora_config)
```

The key hyperparameters that matter:

**rank (r)**: How much capacity your LoRA has. r=16 is conservative, r=32 is reasonable, r=64 eats VRAM. Start at 32.

**learning_rate**: Use 1e-4 or 5e-5. Too high (1e-3) and the model collapses. Too low (1e-6) and nothing happens.

**batch_size**: This destroys memory. I used batch_size=1 with gradient_accumulation_steps=4 to simulate batch_size=4 without OOMing.

**num_epochs**: 100-200 epochs on a small dataset. You'll overfit eventually, and that's fine - you're trying to memorize your concept.

## The training loop

Here's the actual training with all the boring details:

```python
from torch.optim import AdamW

optimizer = AdamW(unet.parameters(), lr=5e-5)
pipeline.to("cuda")
noise_scheduler = DDPMScheduler.from_config(
    pipeline.scheduler.config
)

for epoch in range(num_epochs):
    for batch in dataloader:
        # Get latent representations
        with torch.no_grad():
            latents = vae.encode(batch["images"].to("cuda")).latent_dist.sample()
            latents = latents * 0.18215

        # Random timestep noise
        noise = torch.randn_like(latents)
        timesteps = torch.randint(0, noise_scheduler.num_train_timesteps, (batch_size,))

        # Add noise to latents
        noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)

        # Encode prompts
        with torch.no_grad():
            prompt_embeds = pipeline.text_encoder(batch["prompts"])

        # Predict noise residual
        model_pred = unet(noisy_latents, timesteps, prompt_embeds).sample

        # MSE loss
        loss = F.mse_loss(model_pred, noise)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
```

This is diffusion model training 101 - you're teaching the model to predict noise in slightly-noisy images. Repeat that millions of times and it learns your style.

## The gotchas that wasted my time

**VRAM management**: I hit CUDA OOM three times because I wasn't being explicit about when to move tensors. Use `.to("cuda")` and `.to("cpu")` religiously.

**Learning rate decay**: Don't use it. Straight fixed learning rate works better for LoRA. The scheduler suggestions in tutorials are cargo cult.

**Prompt engineering during training**: Your training prompts matter. I used generic ones like "a painting" at first and got mediocre results. When I switched to specific prompts like "a high-contrast noir painting with dramatic lighting", the outputs got way better. The model learns what you tell it to learn.

**Validating during training**: I didn't check outputs until epoch 150. By then I'd already overfit. Sample every 20 epochs and you'll catch problems early.

**LoRA rank too high**: r=64 looked promising until I realized it was just memorizing my training images. r=32 generalized better.

## The results

After 150 epochs, the LoRA learned the style decently well. I could run:

```python
lora_model = StableDiffusionXLPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
lora_model.unet.load_attn_procs(my_lora_weights)

image = lora_model(
    "a noir landscape at sunset",
    num_inference_steps=30,
    guidance_scale=7.5
).images[0]
```

And get consistent, moody images in that style. They weren't pixel-perfect copies of my training data, but they were clearly the same aesthetic. That's the goal.

## When is this worth doing?

If you want a specific character across multiple scenes: absolutely fine-tune. 10 images of your D&D character and you're generating consistent art forever.

If you want a style: maybe. General style fine-tuning is finicky - you need a good dataset and it still won't generalize perfectly. You might be better off just getting really good at prompting.

If you want to generate your face: yes, but be aware of the privacy implications and the ethics of what you're doing with it.

If you're curious and have a GPU: do it. It takes a weekend and costs nothing. You'll learn how diffusion models actually work instead of just knowing the abstract theory.

The frustrating part is that this whole thing - dataset curation, VRAM management, hyperparameter tuning - still feels very 2014 machine learning. You need to understand the fundamentals or you'll waste a lot of electricity spinning on hyperparameters. But if you do the work, fine-tuning is genuinely powerful. Your model, your style, your rules.
