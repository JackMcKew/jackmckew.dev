Title: How Diffusion Models Actually Work
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, diffusion-models, deep-learning, generative-ai, pytorch, ddpm

I spent two weeks trying to understand diffusion models by reading papers and getting nowhere. Then I built a minimal DDPM (Denoising Diffusion Probabilistic Model) from scratch in 300 lines of PyTorch and it clicked. Here's what I found out: it's not magic, it's just iterative denoising guided by a learned noise predictor.

The core insight is beautiful and simple. You take an image, you add a ton of noise to it, then you train a neural network to predict what noise was added. Once it's good at that, you can run the process backwards - start with pure noise and iteratively denoise to generate a new image.

Let me break down the two halves:

**The forward process** is deterministic and easy:

```python
import torch
import torch.nn as nn

def forward_diffusion(x0, t, sqrt_alphas_cumprod, sqrt_one_minus_alphas_cumprod):
    """Add noise at timestep t to original image x0"""
    noise = torch.randn_like(x0)
    noisy = sqrt_alphas_cumprod[t] * x0 + sqrt_one_minus_alphas_cumprod[t] * noise
    return noisy, noise
```

You're literally just doing: `noisy = a*x + b*noise` where `a` and `b` are pre-computed schedules that change over T timesteps (usually 1000). At t=0, it's almost all original image. At t=T, it's almost all noise. You train on every possible t, so your model learns to denoise at every noise level.

The schedule is the boring part but critical. You want the noise to increase smoothly. The paper uses:

```python
betas = torch.linspace(0.0001, 0.02, timesteps)
alphas = 1 - betas
alphas_cumprod = torch.cumprod(alphas, dim=0)
sqrt_alphas_cumprod = torch.sqrt(alphas_cumprod)
sqrt_one_minus_alphas_cumprod = torch.sqrt(1 - alphas_cumprod)
```

**The reverse process** is what the model learns. You build a U-Net (just like for segmentation) that predicts the noise given a noisy image and a timestep:

```python
class UNet(nn.Module):
    def __init__(self, channels=1):
        super().__init__()
        self.down1 = nn.Sequential(
            nn.Conv2d(channels + 1, 64, 3, padding=1),  # +1 for timestep embedding
            nn.ReLU()
        )
        self.down2 = nn.Sequential(nn.MaxPool2d(2), nn.Conv2d(64, 128, 3, padding=1), nn.ReLU())
        self.bottleneck = nn.Sequential(nn.Conv2d(128, 256, 3, padding=1), nn.ReLU())
        self.up2 = nn.Sequential(nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1), nn.ReLU())
        self.up1 = nn.ConvTranspose2d(192, channels, 3, padding=1)  # 128 (up2 output) + 64 (d1 skip connection)

    def forward(self, x, t):
        t_embed = t.unsqueeze(-1).unsqueeze(-1).expand(-1, -1, x.shape[2], x.shape[3])
        x = torch.cat([x, t_embed.float()], dim=1)
        d1 = self.down1(x)
        d2 = self.down2(d1)
        b = self.bottleneck(d2)
        u2 = self.up2(b)
        u1 = self.up1(torch.cat([u2, d1], dim=1))
        return u1
```

Training is straightforward. For each batch, pick a random timestep t, add noise to your images, and train the model to predict that noise:

```python
def train_step(model, x0, optimizer, device):
    batch_size = x0.shape[0]
    t = torch.randint(0, timesteps, (batch_size,), device=device)

    x_noisy, true_noise = forward_diffusion(x0, t, sqrt_alphas_cumprod, sqrt_one_minus_alphas_cumprod)
    predicted_noise = model(x_noisy, t)

    loss = nn.MSELoss()(predicted_noise, true_noise)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    return loss.item()
```

That's the whole thing. No fancy losses, no adversarial training, no contrastive learning. Just predict the noise and minimize L2.

**Generation** is the reverse - start with random noise and iteratively denoise:

```python
@torch.no_grad()
def sample(model, shape, device):
    x = torch.randn(shape, device=device)

    for t in range(timesteps - 1, 0, -1):
        t_batch = torch.full((shape[0],), t, device=device, dtype=torch.long)
        predicted_noise = model(x, t_batch)

        # Langevin dynamics step
        alpha_t = alphas_cumprod[t]
        alpha_prev = alphas_cumprod[t - 1] if t > 1 else torch.tensor(1.0)
        posterior_variance = (1 - alpha_prev) / (1 - alpha_t) * (1 - alphas[t])

        x = (x - (1 - alpha_t) / sqrt_one_minus_alphas_cumprod[t] * predicted_noise) / sqrt_alphas_cumprod[t]

        if t > 1:
            x += torch.sqrt(posterior_variance) * torch.randn_like(x)

    return x
```

I tested this on MNIST and it took about 30 epochs to get reasonable digit generation. Not perfect - the generated images are blurry - but you can see it's learning structure, not memorizing.

The gotcha I hit: timestep embedding matters way more than I expected. Early versions where I didn't embed the timestep properly just produced noise. The model needs to know *which* noise level it's dealing with. Also, running 1000 reverse steps takes forever (a few seconds per image). You can speed it up with DDIM sampling (fewer steps, different schedule) but that's a separate thing.

What surprised me most was how the model learns linguistic structure naturally. Feed it a 1D signal instead of images and it learns autocorrelated patterns without being told to. The architecture doesn't care - it just learns to denoise.

The papers are dense but now that I've built it I get why diffusion is beating GANs for generation. It's stable to train, you don't get mode collapse, and the iterative denoising process is genuinely differentiable all the way through. No tricks.

If you want to understand transformers, you have to implement attention. If you want to understand diffusion, you have to implement DDPM. Both take an afternoon and suddenly the magic becomes just maths.
