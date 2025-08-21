<?php

require __DIR__ . '/vendor/autoload.php';
use Mpdf\Mpdf;

ini_set('memory_limit', '512M');
ini_set('max_execution_time', 120);

$questions = $_POST['question_text'] ?? [];
$marks = $_POST['marks'] ?? [];
$answerLines = $_POST['answer_lines'] ?? [];
$images = $_FILES['image'] ?? null;

if (empty($questions)) {
    die('No questions provided.');
}

$html = '<h4 style="text-align:center; margin-bottom: 0.1px;">Examination Paper</h4>';
$html .= '<hr><br>';

foreach ($questions as $i => $qText) {
    $num = $i + 1;

    $html .= "<div style='margin-bottom:35px; page-break-inside: avoid;'>";
    $html .= "<strong>Question {$num}</strong><br>" . nl2br(htmlspecialchars($qText)) . "<br>";

    // Handle image
    if (!empty($images['name'][$i])) {
        $tmpName = $images['tmp_name'][$i];
        $ext = pathinfo($images['name'][$i], PATHINFO_EXTENSION);
        $safeName = uniqid('qimg_') . '.' . $ext;
        $uploadPath = __DIR__ . '/tmp/' . $safeName;
        if (!is_dir(__DIR__ . '/tmp')) {
            mkdir(__DIR__ . '/tmp', 0777, true);
        }
        move_uploaded_file($tmpName, $uploadPath);

        $html .= "<div style='text-align:center; margin:10px 0;'>
                    <img src='" . $uploadPath . "' style='max-width:100%; max-height:200px;'>
                  </div>";
    }

    // Answer lines
    $lines = isset($answerLines[$i]) ? intval($answerLines[$i]) : 0;
    if ($lines > 0) {
        $html .= "<div style='margin-top:8px;'>";
        for ($l = 0; $l < $lines; $l++) {
            $html .= "<div style='border-bottom:1px solid #000; height:20px;'></div>";
        }
        $html .= "</div>";
    }

    // Marks place
    if (!empty($marks[$i])) {
        $html .= "<div style='text-align:right; margin-top:5px; font-style:italic;'>(Marks: " . intval($marks[$i]) . ")</div>";
    }

    $html .= "</div><br>";
}

$mpdf = new Mpdf();
$mpdf->setFooter('Page {PAGENO} of {nbpg}');
$mpdf->WriteHTML($html);
$mpdf->Output('exam_paper.pdf', 'I');
