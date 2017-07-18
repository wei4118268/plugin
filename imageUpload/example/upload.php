<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS");
header('Access-Control-Allow-Headers: Content-Type, X_FILENAME');
$fn = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);
if ($fn) {
    file_put_contents(
        '../uploadImg/images/' . $fn,
        file_get_contents('php://input')
    );
    echo "1111";
    exit();
}
?>
