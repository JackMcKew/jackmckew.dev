Title: 3D Point Cloud Classification and Segmentation
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: point-cloud, 3d, classification, segmentation, lidar, machine-learning

Point clouds are just lists of 3D coordinates. A LiDAR scanner spits out millions of them per second. The challenge: given a chaotic blob of 3D points, figure out what each point is - a car, a person, a building, the ground.

I've been working with point cloud data for a few months, and it's genuinely different from traditional computer vision. The tools are specialized, the math is non-intuitive, and getting good results requires understanding the constraints of the data itself.

Let me walk through the pipeline: loading data, visualizing it, and applying a classification model.

## What is a Point Cloud?

A point cloud is a collection of 3D coordinates, usually from a LiDAR sensor or 3D camera. Each point has X, Y, Z coordinates. Often, there's also intensity (how reflective the surface is), color (RGB), or a timestamp.

```
X        Y        Z        Intensity
-10.5    25.3     1.2      128
-10.6    25.4     1.3      130
-10.4    25.2     1.1      125
... (millions of points)
```

A typical LiDAR scan has 64-128 laser channels and spins 10-20 times per second, generating 1-3 million points per second. A 10-second scan is 10-30 million points.

## Loading and Visualizing

The standard library for point cloud work in Python is `open3d`. It's fast, well-documented, and handles large clouds.

```python
import open3d as o3d
import numpy as np

# Load a point cloud from a file
cloud = o3d.io.read_point_cloud('scan.ply')

# Check what we have
print(f"Points: {len(cloud.points)}")
print(f"Has colors: {cloud.has_colors()}")
print(f"Has normals: {cloud.has_normals()}")

# Visualize
o3d.visualization.draw_geometries([cloud])
```

This opens an interactive viewer where you can rotate, zoom, and inspect the cloud.

If the cloud is huge (50M+ points), visualization will be slow. Downsample first:

```python
# Keep every Nth point
cloud = cloud.uniform_down_sample(every_k_points=10)

# Or downsample to a target number of points
cloud = cloud.voxel_down_sample(voxel_size=0.05)  # 5cm voxels

# Then visualize
o3d.visualization.draw_geometries([cloud])
```

`voxel_down_sample` is smarter - it groups nearby points into 3D grid cells and keeps one representative point per cell. It preserves the overall structure while drastically reducing the point count.

## Normals and Features

Most classification models work with local geometry, not just XYZ coordinates. You need surface normals (the perpendicular direction to a surface) and local curvature.

```python
# Estimate normals
cloud.estimate_normals(
    search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30)
)

# Normalize normals (ensure unit length)
cloud.normalize_normals()

# Access normals
normals = np.asarray(cloud.normals)
print(f"First normal: {normals[0]}")

# Visualize normals
o3d.visualization.draw_geometries([cloud])
```

Normals are crucial for distinguishing surfaces. A car roof has a normal pointing upward, a wall has a horizontal normal, the ground has a normal pointing down.

## Simple Statistical Segmentation

Before jumping to neural networks, try statistical methods. They're fast and often good enough.

```python
# Remove outliers (points far from their neighbors)
cloud, inliers = cloud.remove_statistical_outlier(
    nb_neighbors=20,
    std_ratio=2.0
)

# Segment the ground plane (RANSAC)
plane_model, inliers = cloud.segment_plane(
    distance_threshold=0.05,
    ransac_n=3,
    num_iterations=1000
)

# Extract ground and non-ground
ground = cloud.select_by_index(inliers)
objects = cloud.select_by_index(inliers, invert=True)

print(f"Ground points: {len(ground.points)}")
print(f"Object points: {len(objects.points)}")

# Visualize
ground.paint_uniform_color([0.5, 0.5, 0.5])  # Gray for ground
objects.paint_uniform_color([0, 1, 0])  # Green for objects
o3d.visualization.draw_geometries([ground, objects])
```

This finds the dominant flat plane (the ground) and separates it from everything else. It's the first step in any outdoor LiDAR pipeline.

## Clustering

Next, group nearby points that likely belong to the same object:

```python
# Euclidean clustering
labels = np.array(cloud.cluster_dbscan(
    eps=0.2,  # Points within 20cm are neighbors
    min_points=10  # Need at least 10 points for a cluster
))

# Assign a color to each cluster
colors = plt.cm.Spectral(labels / labels.max())
cloud.colors = o3d.utility.Vector3dVector(colors[:, :3])

o3d.visualization.draw_geometries([cloud])

# Print cluster info
unique_labels = np.unique(labels[labels >= 0])
for label in unique_labels:
    count = np.sum(labels == label)
    print(f"Cluster {label}: {count} points")
```

`DBSCAN` groups points that are close together. It's parameter-sensitive (tuning `eps` and `min_points` is annoying), but it works for dense clusters.

## Neural Network Classification: PointNet

For real classification (car vs person vs tree vs building), you need a neural network trained on labeled data.

PointNet is the standard architecture for point cloud classification. It takes unordered sets of 3D points and learns a global feature vector.

```python
# Install torch and pytorch3d if you haven't
# pip install torch pytorch3d

import torch
import torch.nn as nn
from torch_geometric.nn import PointConv, global_mean_pool

class SimplePointNet(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.conv1 = PointConv(3, 64, aggr='mean')
        self.conv2 = PointConv(64, 128, aggr='mean')
        self.conv3 = PointConv(128, 256, aggr='mean')

        self.fc1 = nn.Linear(256, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x, pos, batch):
        # x: point features (initially just XYZ)
        # pos: point coordinates
        # batch: which batch each point belongs to (for mini-batches)

        x = self.conv1(x, pos, pos, batch, batch)
        x = x.relu()

        x = self.conv2(x, pos, pos, batch, batch)
        x = x.relu()

        x = self.conv3(x, pos, pos, batch, batch)
        x = global_mean_pool(x, batch)

        x = self.fc1(x).relu()
        x = self.fc2(x)

        return x
```

This is a simplified version. Real PointNet uses more sophisticated operations (multi-scale features, transformation networks), but the concept is the same: aggregate local features, then use global features to classify.

Training requires labeled data, which is expensive to collect. You have three options:

1. **Use a pretrained model** on a dataset like KITTI or nuScenes
2. **Train on synthetic data** from a simulator (Carla, AirSim)
3. **Label real data yourself** (painful but sometimes necessary)

## Using a Pretrained Model

There are pretrained models available through PyTorch. Here's an example using a segmentation model:

```python
# This assumes you have labeled training data
# For now, let's fake a classification pipeline

def classify_point_cloud(cloud):
    """
    Simple per-point classification using local features.
    Returns class labels for each point.
    """
    points = np.asarray(cloud.points)
    normals = np.asarray(cloud.normals)

    # Extract hand-crafted features
    # Feature 1: Z-coordinate (ground is low, sky is high)
    z_feature = points[:, 2]

    # Feature 2: Normal deviation from horizontal
    # If normal is (0, 0, 1), it's ground. If (1, 0, 0) or (0, 1, 0), it's vertical (wall/building)
    normal_z = normals[:, 2]

    # Simple decision rules (this is bad, but demonstrates the idea)
    labels = np.zeros(len(points), dtype=int)

    # Ground: low Z and upward-pointing normal
    ground_mask = (z_feature < 1.0) & (normal_z > 0.5)
    labels[ground_mask] = 0  # Class 0: ground

    # Walls/buildings: high Z and horizontal normal
    building_mask = (z_feature > 5.0) & (np.abs(normal_z) < 0.2)
    labels[building_mask] = 1  # Class 1: building

    # People/cars: mid-height, varied normals
    labels[(labels == 0) & (z_feature > 0.5) & (z_feature < 5)] = 2  # Class 2: other

    return labels

labels = classify_point_cloud(cloud)

# Visualize classes
colors = np.array([
    [0.5, 0.5, 0.5],  # Ground: gray
    [0.8, 0.8, 0.8],  # Building: lighter gray
    [0, 1, 0]         # Other: green
])

cloud_colored = cloud
cloud_colored.colors = o3d.utility.Vector3dVector(colors[labels])

o3d.visualization.draw_geometries([cloud_colored])
```

This is a terrible classifier (hand-crafted rules fail on any complex scene), but it shows the pipeline: extract features, apply rules/model, visualize results.

## The Reality of Point Clouds

Here's what you actually face in production:

- **Data is noisy**: Reflective surfaces, rain, fog, low light - it all corrupts the data.
- **Class imbalance**: There's way more ground than cars. Your model will be biased.
- **Computational cost**: Processing a 30-million-point cloud takes time. Real-time inference needs GPU optimization.
- **Labeling is expensive**: A human can manually label 10 scans per day. Deep learning needs thousands.
- **Seasonal variation**: A scene in summer looks different in winter (leaves, snow, shadows).

## The Honest Take

Point cloud classification is a real domain. If you're working with LiDAR (autonomous vehicles, robotics, surveying), it's worth understanding. If you're just curious, the learning curve is steep.

Here's the practical progression:

1. Load a point cloud with `open3d`
2. Visualize and downsample
3. Remove the ground plane (RANSAC)
4. Cluster objects (DBSCAN)
5. If you need per-point labels, train a PointNet (requires labeled data)

For most real-world applications, you'll use a pretrained model or outsource the labeling. Ground-truth point cloud labels are expensive.

Start with `open3d`, play with downsampling and segmentation. Once you need classification, decide: spend the effort training, or find a pretrained model that's close enough. The second option is usually right.
