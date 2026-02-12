<?php
/**
 * SQLite to MySQL Data Exporter
 * Run this locally to export your data for cPanel migration.
 */

$sqliteFile = __DIR__ . '/database.sqlite';
if (!file_exists($sqliteFile)) {
    die("Error: database.sqlite not found in " . __DIR__);
}

try {
    $pdo = new PDO('sqlite:' . $sqliteFile);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $tables = ['users', 'visitors', 'notifications'];
    $outputFile = __DIR__ . '/local_data_dump.sql';
    $handle = fopen($outputFile, 'w');

    fwrite($handle, "-- Local SQL Data Dump (Generated " . date('Y-m-d H:i:s') . ")\n");
    fwrite($handle, "SET FOREIGN_KEY_CHECKS = 0;\n\n");

    $totalExported = 0;
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM $table");
        $rows = $stmt->fetchAll();

        if (count($rows) > 0) {
            fwrite($handle, "-- Data for table `$table` (" . count($rows) . " rows)\n");
            $totalExported += count($rows);
            
            // Generate column names
            $cols = array_keys($rows[0]);
            $isUsersTable = ($table === 'users');
            
            // If it's the users table, we skip the 'id' column to let MySQL auto-increment handle it
            // and avoid conflicts with the default admin (which takes ID 1).
            if ($isUsersTable) {
                $cols = array_filter($cols, fn($c) => $c !== 'id');
            }

            $colNames = implode('`, `', $cols);

            foreach ($rows as $row) {
                $values = [];
                foreach ($cols as $col) {
                    $val = $row[$col];
                    if ($val === null) {
                        $values[] = "NULL";
                    } elseif (is_numeric($val) && !is_string($val)) {
                        $values[] = $val;
                    } else {
                        // Basic escaping for MySQL
                        $escaped = str_replace(["\\", "'"], ["\\\\", "''"], $val);
                        $values[] = "'" . $escaped . "'";
                    }
                }
                $valStr = implode(', ', $values);
                fwrite($handle, "INSERT IGNORE INTO `$table` (`$colNames`) VALUES ($valStr);\n");
            }
            fwrite($handle, "\n");
        }
    }

    fwrite($handle, "SET FOREIGN_KEY_CHECKS = 1;\n");
    fclose($handle);

    echo "✅ Success! exported total $totalExported records to local_data_dump.sql\n";
    echo "You can now import local_data_dump.sql into your cPanel phpMyAdmin.\n";

} catch (Exception $e) {
    die("Error during export: " . $e->getMessage());
}
?>
