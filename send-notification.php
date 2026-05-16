<?php
require __DIR__ . '/vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$auth = [
    'VAPID' => [
        'subject' => 'mailto:your-email@example.com', // Change this!
        'publicKey' => 'BOYnncohitFj669QBh_ojuNdHsdb5yXwc6k6Ns_oSPSOK2w43JZs1637a5r8SDyJpbevY7w2dlsIZreSkMwNgHE',
        'privateKey' => 'Verp7xKIMW9097rtQiT1lkPdx3eqpPFzms3ibKgj6Kk',
    ],
];

$webPush = new WebPush($auth);
$webPush->setReuseVAPIDHeaders(true); // performance

$subscriptions = json_decode(file_get_contents(__DIR__ . '/subscriptions.json'), true) ?: [];

foreach ($subscriptions as $sub) {
    $subscription = Subscription::create($sub);
    $webPush->queueNotification(
        $subscription,
        json_encode([
            'title' => 'Fuel & Recovery Reminder',
            'body'  => 'Take Collagen + Fat Flush' // customize per reminder
        ])
    );
}

foreach ($webPush->flush() as $report) {
    if ($report->isSuccess()) {
        echo "Sent to {$report->getEndpoint()}\n";
    } else {
        echo "Failed: {$report->getReason()}\n";
        // optionally remove bad subscription
    }
}