<?php
header("Pragma: public");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Cache-Control: public");
header("Content-type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=xls" . date('dmY_Hms') . ".xls");
error_reporting(E_ERROR);
$data     = json_decode($_POST['data'], true);
$reporte  = json_decode($_POST['columnas'], true);
$columnas = $reporte['columnas'];

require dirname(__FILE__) . '/../autoload.php';
/*require dirname(__FILE__) . '/../reportes/header_declaracion_jurada_h.php';*/
$titulo    = 'LOTERIA DE LA PROVINCIA DE CORDOBA S.E.';
$subTitulo = $reporte['configurar']['titulo'];

echo $titulo . '<br>';
echo $subTitulo . '<br>';
echo 'Emitido el día ' . date('d/m/Y H:m:s') . ' por el sistema ' . $reporte['configurar']['sistema'];
function cabecera()
{
    global $pdf, $columnas;
    $i        = 0;
    $numItems = count($columnas);
    ?>
    <tr>
   	<?php

    foreach ($columnas as $key => $value) {
        if (++$i === $numItems) {
            ?>
        	<th><?php echo $value['nombre'];
            break; ?></th>
        <?php
}
        ?>
		<th><?php echo $value['nombre']; ?></th>
        <?php

    }
    ?>
    </tr>
    <?php
}

$numItems = count($columnas);
$i        = 0;
$j        = 0;
$total    = array();
$esTotal  = false;
$colNum   = 1;
?>
<table border="1" cellspacing="0" cellpadding="8" >
	<thead>
<?php

foreach ($data as $key => $value) {

    if ($j == 0) {
        cabecera();
        $j = 1;
    }
    if ($j == 1) {
        ?>
    </tr>
    	<?php
}
    ?>
</thead>
    <?php
$colNum = $colNum + 1;
    foreach ($columnas as $cKey => $cValue) {

        if ($cValue['tipo'] != 'objeto') {
            $valor   = $value[$cKey];
            $valor_f = utf8_decode($value[$cKey]);
            if (isset($cValue['tipo_dato']) && $cValue['tipo_dato'] == 'moneda') {
                $valor_f = number_format($valor, 2, ',', '.');
            }
            if (++$i === $numItems) {
                ?>
            <td style="text-align: <?php echo (($cValue['alineado'] == 'C') ? 'center' : (($cValue['alineado'] == 'R') ? 'right' : 'left')); ?>;"><?php echo $valor_f ?></td>
            <?php
$i = 0;
                break;
            }
            ?>
<td style="text-align: <?php echo (($cValue['alineado'] == 'C') ? 'center' : (($cValue['alineado'] == 'R') ? 'right' : 'left')); ?>;"><?php echo $valor_f ?></td>
           <?php
} elseif ($cValue['tipo'] == 'objeto') {
            $valor   = $value[$cKey][$cValue['columna']];
            $valor_f = utf8_decode($value[$cKey][$cValue['columna']]);
            if (isset($cValue['tipo_dato']) && $cValue['tipo_dato'] == 'moneda') {
                $valor = number_format($valor, 2, ',', '.');
            }
            if (++$i === $numItems) {
                ?>
<td style="text-align: <?php echo (($cValue['alineado'] == 'C') ? 'center' : (($cValue['alineado'] == 'R') ? 'right' : 'left')); ?>"><?php echo $valor_f ?></td>
           <?php
$i = 0;
                break;
            }
            ?>
<td><?php echo $valor_f ?></td>
           <?php
}
        if (isset($cValue['totalizar']) && $cValue['totalizar'] == true) {
            $esTotal      = true;
            $total[$cKey] = $total[$cKey] + $valor;
        }
    }

}
?>
</tr>
<tr>
<?php
if ($esTotal) {
    ?>
            <td>Total General</td>
            <?php
}
?>
</tr>
<tr>
<?php
foreach ($columnas as $cKey => $cValue) {

    if (!isset($cValue['totalizar'])) {
        ?>
            <td></td>
            <?php
} else {
        if (isset($cValue['tipo_dato']) && $cValue['tipo_dato'] == 'moneda') {
            $total[$cKey] = number_format($total[$cKey], 2, ',', '.');
        }

        ?>
<td><?php echo $total[$cKey] ?></td>
           <?php
}
}
?>
</tr>
</table>
