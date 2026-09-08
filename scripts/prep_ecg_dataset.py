import os
import shutil
import random
import glob

def prep_dataset():
    base_dir = "d:/med dash"
    output_dir = os.path.join(base_dir, "ecg_dataset_split")
    
    # The source directories
    src_dirs = {
        "mi": "ECG Images of Myocardial Infarction Patients (240x12=2880)",
        "history_mi": "ECG Images of Patient that have History of MI (172x12=2064)",
        "abnormal": "ECG Images of Patient that have abnormal heartbeat (233x12=2796)",
        "normal": "Normal Person ECG Images (284x12=3408)"
    }
    
    splits = ['train', 'val', 'test']
    
    # Create output directories
    for split in splits:
        for cls in src_dirs.keys():
            os.makedirs(os.path.join(output_dir, split, cls), exist_ok=True)
            
    random.seed(42)
    
    for cls_name, cls_dir in src_dirs.items():
        full_dir = os.path.join(base_dir, cls_dir)
        if not os.path.exists(full_dir):
            print(f"Directory not found: {full_dir}")
            continue
            
        # Get all images
        images = []
        for ext in ('*.jpg', '*.jpeg', '*.png'):
            images.extend(glob.glob(os.path.join(full_dir, ext)))
            
        # If images are in subfolders? Let's check recursively just in case
        if not images:
            for ext in ('*.jpg', '*.jpeg', '*.png'):
                images.extend(glob.glob(os.path.join(full_dir, '**', ext), recursive=True))
                
        # Shuffle
        random.shuffle(images)
        
        n = len(images)
        train_end = int(n * 0.7)
        val_end = train_end + int(n * 0.15)
        
        train_imgs = images[:train_end]
        val_imgs = images[train_end:val_end]
        test_imgs = images[val_end:]
        
        print(f"Processing class '{cls_name}': {n} total -> {len(train_imgs)} train, {len(val_imgs)} val, {len(test_imgs)} test")
        
        def copy_imgs(img_list, split):
            for img_path in img_list:
                img_filename = os.path.basename(img_path)
                dst = os.path.join(output_dir, split, cls_name, img_filename)
                
                # To prevent filename collisions if recursive found same names
                # we can prepend the parent directory or just a random hash, 
                # but standard dataset should have unique names or unique paths.
                # Let's just use a counter if needed, or hash the original path.
                # For simplicity, we just copy. If it exists, we modify the name.
                counter = 1
                while os.path.exists(dst):
                    name, ext = os.path.splitext(img_filename)
                    dst = os.path.join(output_dir, split, cls_name, f"{name}_{counter}{ext}")
                    counter += 1
                    
                shutil.copy2(img_path, dst)
                
        copy_imgs(train_imgs, 'train')
        copy_imgs(val_imgs, 'val')
        copy_imgs(test_imgs, 'test')
        
    print("Dataset successfully prepared in 'ecg_dataset_split' directory.")

if __name__ == "__main__":
    prep_dataset()
