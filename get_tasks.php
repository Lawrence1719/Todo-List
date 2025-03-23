<?php
// Set headers to allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Define the file path
$file = 'tasks.json';

// Check if the file exists
if (file_exists($file)) {
    try {
        // Read the file content
        $jsonData = file_get_contents($file);
        $tasks = json_decode($jsonData, true);
        
        if ($tasks !== null) {
            // Return tasks as JSON
            echo json_encode([
                "success" => true,
                "tasks" => $tasks,
                "count" => count($tasks)
            ]);
        } else {
            // Return empty array if JSON is invalid
            echo json_encode([
                "success" => true,
                "tasks" => [],
                "message" => "No tasks found or invalid JSON data"
            ]);
        }
    } catch (Exception $e) {
        // Return error if exception occurred
        echo json_encode([
            "success" => false,
            "message" => "Error: " . $e->getMessage()
        ]);
    }
} else {
    // Return empty array if file doesn't exist
    echo json_encode([
        "success" => true,
        "tasks" => [],
        "message" => "No tasks found"
    ]);
}
?>