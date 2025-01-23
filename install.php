<?php
/**
 * Metal Aloud Installation Wizard
 * Copyright (c) 2024 Metal Aloud. All rights reserved.
 */

// Prevent direct access if already installed
if (file_exists('.env') && !isset($_GET['force'])) {
    die('Metal Aloud is already installed. Remove this file for security.');
}

// Security headers
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('X-Content-Type-Options: nosniff');

// Process installation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'error' => null];
    
    try {
        // Create .env file
        $envContent = "VITE_SUPABASE_URL={$_POST['supabase_url']}\n" .
                     "VITE_SUPABASE_ANON_KEY={$_POST['supabase_key']}\n\n" .
                     "VITE_SPOTIFY_CLIENT_ID={$_POST['spotify_id']}\n" .
                     "VITE_SPOTIFY_CLIENT_SECRET={$_POST['spotify_secret']}\n\n" .
                     "DOMAIN={$_SERVER['HTTP_HOST']}\n" .
                     "ADMIN_EMAIL=admin@{$_SERVER['HTTP_HOST']}\n";

        file_put_contents('.env', $envContent);
        
        $response['success'] = true;
    } catch (Exception $e) {
        $response['error'] = $e->getMessage();
    }

    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metal Aloud Installation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Metal+Mania&display=swap" rel="stylesheet">
    <style>
        .font-metal { font-family: 'Metal Mania', cursive; }
    </style>
</head>
<body class="bg-gradient-to-br from-red-900 via-zinc-900 to-black min-h-screen">
    <div id="root"></div>
    <script type="module">
        import { createRoot } from 'https://esm.sh/react-dom@18.3.0-canary-a870b2d54-20240314/client';
        import { InstallWizard } from './src/components/install/InstallWizard';
        
        const root = createRoot(document.getElementById('root'));
        root.render(<InstallWizard />);
    </script>
</body>
</html>