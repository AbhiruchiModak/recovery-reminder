<?php
// Path to file where subscriptions are stored
$file = __DIR__ . '/subscriptions.json';

// Get raw POST body
$subscription = file_get_contents('php://input');

// Decode to validate
$data = json_decode($subscription, true);
if (!$data) {
    http_response_code(400);
    echo "Invalid subscription data";
    exit;
}

// Load existing subscriptions
$subscriptions = [];
if (file_exists($file)) {
    $subscriptions = json_decode(file_get_contents($file), true) ?: [];
}

// Add new subscription
$subscriptions[] = $data;

// Save back to file
file_put_contents($file, json_encode($subscriptions, JSON_PRETTY_PRINT));

echo "Subscription saved";
