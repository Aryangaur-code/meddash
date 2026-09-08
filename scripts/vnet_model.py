import torch
import torch.nn as nn
from monai.networks.nets import VNet

def get_vnet_model(device):
    """
    Instantiates the 3D V-Net Architecture using MONAI.
    V-Net is natively designed for volumetric medical image segmentation (Milletari et al.)
    """
    model = VNet(
        spatial_dims=3,
        in_channels=1,
        out_channels=2, # Background vs Tumor
    ).to(device)
    
    # In a real scenario, we would load weights here:
    # model.load_state_dict(torch.load("vnet_tumor_weights.pth"))
    
    model.eval()
    return model
