<?php

if (!function_exists('success')) {
    function success($message = '', $data = [])
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }
}

if (!function_exists('error')) {
    function error($message = '', $data = [])
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data
        ], 400);
    }
}
