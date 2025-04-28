-- Step 1: Rename the column
ALTER TABLE `user` RENAME COLUMN create_at TO created_at;

-- Step 2: Modify the datatype and default
ALTER TABLE `user` MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
