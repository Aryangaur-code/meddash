import os
import shutil
import random
import csv
import cv2

def prep_dataset():
    base_dir = "d:/med dash"
    csv_file = os.path.join(base_dir, "overview.csv")
    tiff_dir = os.path.join(base_dir, "tiff_images")
    output_dir = os.path.join(base_dir, "ct_dataset_split")
    
    # Create output directories
    splits = ['train', 'val', 'test']
    classes = ['contrast', 'no_contrast']
    
    for split in splits:
        for cls in classes:
            os.makedirs(os.path.join(output_dir, split, cls), exist_ok=True)
            
    # Read CSV
    images = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            tiff_name = row['tiff_name']
            has_contrast = row['Contrast'].lower() == 'true'
            images.append({'name': tiff_name, 'contrast': has_contrast})
            
    # Split into classes
    contrast_imgs = [img['name'] for img in images if img['contrast']]
    no_contrast_imgs = [img['name'] for img in images if not img['contrast']]
    
    # Shuffle
    random.seed(42)
    random.shuffle(contrast_imgs)
    random.shuffle(no_contrast_imgs)
    
    def get_split(lst, ratios=(0.7, 0.15, 0.15)):
        n = len(lst)
        train_end = int(n * ratios[0])
        val_end = train_end + int(n * ratios[1])
        return lst[:train_end], lst[train_end:val_end], lst[val_end:]
        
    c_train, c_val, c_test = get_split(contrast_imgs)
    nc_train, nc_val, nc_test = get_split(no_contrast_imgs)
    
    def process_and_copy(img_list, split, cls):
        for img_name in img_list:
            src = os.path.join(tiff_dir, img_name)
            if not os.path.exists(src):
                print(f"Warning: {src} not found!")
                continue
                
            dst = os.path.join(output_dir, split, cls, img_name.replace('.tif', '.jpg'))
            try:
                img = cv2.imread(src, cv2.IMREAD_UNCHANGED)
                if img is None:
                    print(f"Failed to read {img_name}")
                    continue
                # Normalize if 16-bit
                if img.dtype == 'uint16':
                    img = (img / 256).astype('uint8')
                cv2.imwrite(dst, img)
            except Exception as e:
                print(f"Failed to process {img_name}: {e}")
                
    # Process
    print(f"Processing Contrast images ({len(contrast_imgs)} total)...")
    process_and_copy(c_train, 'train', 'contrast')
    process_and_copy(c_val, 'val', 'contrast')
    process_and_copy(c_test, 'test', 'contrast')
    
    print(f"Processing No Contrast images ({len(no_contrast_imgs)} total)...")
    process_and_copy(nc_train, 'train', 'no_contrast')
    process_and_copy(nc_val, 'val', 'no_contrast')
    process_and_copy(nc_test, 'test', 'no_contrast')
    
    print(f"Class 'contrast': {len(contrast_imgs)} total -> {len(c_train)} train, {len(c_val)} val, {len(c_test)} test")
    print(f"Class 'no_contrast': {len(no_contrast_imgs)} total -> {len(nc_train)} train, {len(nc_val)} val, {len(nc_test)} test")
    print("Dataset successfully prepared in 'ct_dataset_split' directory.")

if __name__ == "__main__":
    prep_dataset()
