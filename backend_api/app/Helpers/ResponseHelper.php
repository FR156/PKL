<?php

// Helper functions untuk membuat response JSON standard di logika bisnis

if (!function_exists('success')) {
    function success($message, $data = null, $status = 200)
    {
        $response = [
            'success' => [
                'status' => $status,
                'message' => $message ?: 'Request was successful',
            ],
        ];

        // hanya tambahkan data kalau tidak kosong
        if (!empty($data)) {
            $response['success']['data'] = $data;
        }

        return response()->json($response, $status);
    }
}


if (!function_exists('error')) {
    function error($message, $data = null, $status = 400)
    {
        $response = [
            'error' => [
                'status' => $status,
                'message' => $message ?: 'An error occurred',
            ],
        ];

        // hanya tambahkan data kalau tidak kosong
        if (!empty($data)) {
            $response['error']['data'] = $data;
        }

        return response()->json($response, $status);
    }
}


if (!function_exists('errorException')) {
    function errorException(
        $type,
        $status,
        $message,
        $timestamp = null,
        $extra = []
) {
        $baseError = [
            'type' => $type ?: 'Internal Server Error',
            'status' => $status ?: 500,
            'message' => $message ?: 'An unexpected error occurred',
            'timestamp' => $timestamp ?? now()->toISOString(),
        ];

        // merge field tambahan secara dinamis
        $error = array_merge($baseError, $extra);

        return response()->json(['error' => $error], $status);
    }
}
