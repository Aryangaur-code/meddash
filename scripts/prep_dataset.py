import os
import shutil
import random
from pathlib import Path

# Fix the random seed for reproducibility
random.seed(42)

def prep_dataset():
    base_dir = Path("d:/med dash/Bone_Fracture_Binary_Classification/Bone_Fracture_Binary_Classification")
    out_dir = Path("d:/med dash/dataset_split")
    
    if out_dir.exists():
        print(f"Directory {out_dir} already exists. Cleaning it up...")
        shutil.rmtree(out_dir)
        
    out_dir.mkdir(parents=True, exist_ok=True)
    
    classes = ['fractured', 'not fractured']
    
    # Pool all images by class
    all_images = {cls: [] for cls in classes}
    
    for split in ['train', 'val', 'test']:
        for cls in classes:
            src_dir = base_dir / split / cls
            if src_dir.exists():
                for img_path in src_dir.glob("*.*"): # grabs jpg, png, etc
                    all_images[cls].append(img_path)
                    
    # Create the new directory structure
    for split in ['train', 'val', 'test']:
        for cls in classes:
            (out_dir / split / cls).mkdir(parents=True, exist_ok=True)
            
    # Perform the 70-15-15 split
    for cls in classes:
        imgs = all_images[cls]
        random.shuffle(imgs)
        
        total = len(imgs)
        train_end = int(total * 0.70)
        val_end = train_end + int(total * 0.15)
        
        train_imgs = imgs[:train_end]
        val_imgs = imgs[train_end:val_end]
        test_imgs = imgs[val_end:]
        
        print(f"Class '{cls}': {total} total images -> {len(train_imgs)} train, {len(val_imgs)} val, {len(test_imgs)} test")
        
        def copy_files(img_list, split_name):
            dest_dir = out_dir / split_name / cls
            for img in img_list:
                shutil.copy(img, dest_dir / img.name)
                
        copy_files(train_imgs, 'train')
        copy_files(val_imgs, 'val')
        copy_files(test_imgs, 'test')
        
    print("Dataset successfully re-split to 70-15-15 in 'dataset_split' directory.")

if __name__ == "__main__":
    prep_dataset()
