<?php
require __DIR__ . '/vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

// Load subscriptions from file
$file = __DIR__ . '/subscriptions.json';
$subscriptions = json_decode(file_get_contents($file), true) ?: [];

// VAPID keys
$auth = [
    'VAPID' => [
        'subject' => 'mailto:you@example.com',
        'publicKey' => 'BOYnncohitFj669QBh_ojuNdHsdb5yXwc6k6Ns_oSPSOK2w43JZs1637a5r8SDyJpbevY7w2dlsIZreSkMwNgHE',
        'privateKey' => 'Verp7xKIMW9097rtQiT1lkPdx3eqpPFzms3ibKgj6Kk',
    ],
];

$webPush = new WebPush($auth);

// Loop through subscriptions
foreach ($subscriptions as $sub) {
    $subscription = Subscription::create($sub);
    $webPush->sendNotification(
        $subscription,
        json_encode(['title' => 'Recovery Reminder', 'body' => 'Time to hydrate!'])
    );
}

// Flush results
foreach ($webPush->flush() as $report) {
    echo $report->isSuccess()
        ? 'Notification sent to ' . $report->getEndpoint()
        : 'Error sending to ' . $report->getEndpoint() . ': ' . $report->getReason();
}
