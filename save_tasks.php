<?php
// Set headers to allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get JSON data from the request
$data = json_decode(file_get_contents("php://input"), true);

// Validate the received data
if (isset($data['tasks']) && is_array($data['tasks'])) {
    try {
        // Save tasks to a JSON file
        $file = 'tasks.json';
        $result = file_put_contents($file, json_encode($data['tasks'], JSON_PRETTY_PRINT));
        
        if ($result !== false) {
            // Return success response
            echo json_encode([
                "success" => true,
                "message" => "Tasks saved successfully",
                "count" => count($data['tasks'])
            ]);
        } else {
            // Return error if file writing failed
            echo json_encode([
                "success" => false,
                "message" => "Failed to save tasks"
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
    // Return error if data format is invalid
    echo json_encode([
        "success" => false,
        "message" => "Invalid data format"
    ]);
}
?>