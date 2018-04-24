<?php
error_reporting(E_ERROR);
$data     = json_decode($_POST['data'], true);
$reporte  = json_decode($_POST['columnas'], true);
$columnas = $reporte['columnas'];

require dirname(__FILE__) . '/../autoload.php';
/*require dirname(__FILE__) . '/../reportes/header_declaracion_jurada_h.php';*/
$tituloRPDF    = 'LOTERIA DE LA PROVINCIA DE CORDOBA S.E.';
$subTituloRPDF = $reporte['configurar']['titulo'];
$orientacion   = (isset($reporte['configurar']['orientacion']) ? $reporte['configurar']['orientacion'] : 'L');
$pdf           = new RPDF($orientacion);

$pdf->directorioBase = dirname(__FILE__) . '/../';
$pdf->SetLineWidth(0.3);
$pdf->AliasNbPages();
$pdf->AddPage();

function RPDF_ReportarError($pdf, $texto)
{
    $pdf->Ln(5);
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->SetFillColor(255, 0, 0);
    $pdf->Cell(0, 5, $texto, 1, 1, 'C', 1);
    $pdf->SetFont('Arial', '', 10);
    $pdf->SetFillColor(250);
}

if (count($data) == 0) {
    RPDF_ReportarError($pdf, 'No hay datos para mostrar');
    $pdf->Output();
}

function cabecera()
{
    global $pdf, $columnas;
    $i        = 0;
    $numItems = count($columnas);
    $pdf->SetFont('Arial', 'B', 9);
    $pdf->Cell(10, 10, '#', 1, 0, 'C', 1);
    foreach ($columnas as $key => $value) {
        if (++$i === $numItems) {
            $pdf->Cell($value['ancho'], 10, strtoupper($value['nombre']), 1, 1, 'C', 1);
            break;
        }
        $pdf->Cell($value['ancho'], 10, strtoupper($value['nombre']), 1, 0, 'C', 1);
    }
}

$numItems = count($columnas);
$i        = 0;
$j        = 0;
$total    = array();
$esTotal  = false;
$colNum   = 1;
foreach ($data as $key => $value) {

    if ($j == 0 || $pdf->GetY() > 180) {
        cabecera();
        $pdf->SetFont('Arial', '', 9);
        $j = 1;
    }
    $pdf->Cell(10, 10, $colNum, 1, 0, 'C');
    $colNum = $colNum + 1;
    foreach ($columnas as $cKey => $cValue) {

        if ($cValue['tipo'] != 'objeto') {
            $valor   = $value[$cKey];
            $valor_f = utf8_decode($value[$cKey]);
            if (isset($cValue['tipo_dato']) && $cValue['tipo_dato'] == 'moneda') {
                $valor_f = number_format($valor, 2, ',', '.');
            }
            if (++$i === $numItems) {
                $pdf->Cell($cValue['ancho'], 10, $valor_f, 1, 1, $cValue['alineado']);
                $i = 0;
                break;
            }
            $pdf->Cell($cValue['ancho'], 10, substr($valor_f, 0, $cValue['ancho'] / 2), 1, 0, $cValue['alineado']);
        } elseif ($cValue['tipo'] == 'objeto') {
            $valor   = $value[$cKey][$cValue['columna']];
            $valor_f = utf8_decode($value[$cKey][$cValue['columna']]);
            if (isset($cValue['tipo_dato']) && $cValue['tipo_dato'] == 'moneda') {
                $valor = number_format($valor, 2, ',', '.');
            }
            if (++$i === $numItems) {
                $pdf->Cell($cValue['ancho'], 10, $valor_f, 1, 1, $cValue['alineado']);
                $i = 0;
                break;
            }
            $pdf->Cell($cValue['ancho'], 10, substr($valor_f, 0, $cValue['ancho'] / 2), 1, 0, $cValue['alineado']);
        }
        if (isset($cValue['totalizar']) && $cValue['totalizar'] == true) {
            $esTotal      = true;
            $total[$cKey] = $total[$cKey] + $valor;
        }
    }

}

if ($esTotal) {
    $pdf->Cell(10, 10, 'Total Gral:', 0, 1, $cValue['alineado']);
}
foreach ($columnas as $cKey => $cValue) {

    if (!isset($cValue['totalizar'])) {
        $pdf->Cell($cValue['ancho'] + 2.5, 10, '', 0, 0, $cValue['alineado']);
    } else {
        if (isset($cValue['tipo_dato']) && $cValue['tipo_dato'] == 'moneda') {
            $total[$cKey] = number_format($total[$cKey], 2, ',', '.');
        }
        $pdf->Cell($cValue['ancho'], 10, $total[$cKey], 1, 0, $cValue['alineado']);
    }
}
/*var_dump($total[$cKey]);*/
$pdf->Output();
