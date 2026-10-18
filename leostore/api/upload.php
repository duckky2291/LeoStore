<?php
/**
 * Leo Fashion Store - Image Upload API
 * Milan • Paris • New York • London
 * 
 * Supports single or multi-file uploads from drag & drop or file picker.
 */

require_once __DIR__ . '/db.php';

$uploadDir = __DIR__ . '/../uploads/products/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Only POST method is allowed.'], 405);
}

$uploadedUrls = [];
$errors = [];

$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/avif' => 'avif'
];

// Normalize $_FILES into a uniform list of files
$filesToProcess = [];

if (!empty($_FILES)) {
    foreach ($_FILES as $field => $fileData) {
        if (is_array($fileData['name'])) {
            for ($i = 0; $i < count($fileData['name']); $i++) {
                if ($fileData['error'][$i] === UPLOAD_ERR_OK) {
                    $filesToProcess[] = [
                        'name'     => $fileData['name'][$i],
                        'type'     => $fileData['type'][$i],
                        'tmp_name' => $fileData['tmp_name'][$i],
                        'size'     => $fileData['size'][$i],
                    ];
                }
            }
        } else {
            if ($fileData['error'] === UPLOAD_ERR_OK) {
                $filesToProcess[] = $fileData;
            }
        }
    }
}

if (empty($filesToProcess)) {
    jsonResponse(['success' => false, 'message' => 'No files were uploaded or an error occurred during upload.'], 400);
}

foreach ($filesToProcess as $file) {
    if ($file['size'] > 15 * 1024 * 1024) {
        $errors[] = "File {$file['name']} exceeds the maximum allowed size (15MB).";
        continue;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!isset($allowedMimes[$mimeType])) {
        $errors[] = "File {$file['name']} is not a supported image format ({$mimeType}).";
        continue;
    }

    $ext = $allowedMimes[$mimeType];
    $safeName = 'prod_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $targetPath = $uploadDir . $safeName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $uploadedUrls[] = 'uploads/products/' . $safeName;
    } else {
        $errors[] = "Failed to save {$file['name']} to disk.";
    }
}

if (!empty($uploadedUrls)) {
    jsonResponse([
        'success' => true,
        'message' => 'Uploaded ' . count($uploadedUrls) . ' file(s) successfully.',
        'urls'    => $uploadedUrls,
        'url'     => $uploadedUrls[0],
        'errors'  => $errors
    ], 200);
} else {
    jsonResponse([
        'success' => false,
        'message' => 'Failed to upload images.',
        'errors'  => $errors
    ], 400);
}
