<?php
/*
 * OpenSTAManager: il software gestionale open source per l'assistenza tecnica e la fatturazione
 * Copyright (C) DevCode s.r.l.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

include_once __DIR__.'/../../../core.php';

use Modules\Interventi\Stato;
use Modules\Interventi\Intervento;

$rs = Intervento::where('idstatointervento', '=', Stato::where('codice', '=', 'TODO')->first()->id)->get();

if (!empty($rs)) {
    echo '
<table class="table table-hover">
    <tr>
        <th width="100">'.tr('Codice').'</th>
        <th width="180">'.tr('Cliente').'</th>
        <th width="80"><small>'.tr('Data richiesta').'</small></th>
        <th width="17%" class="text-center">'.tr('Tecnici assegnati').'</th>
        <th width="210">'.tr('Tipo intervento').'</th>
        <th>'.tr('Descrizione').'</th>
    </tr>';

    foreach ($rs as $r) {
        $rs_tecnici = $dbo->fetchArray("SELECT GROUP_CONCAT(ragione_sociale SEPARATOR ',') AS tecnici FROM an_anagrafiche INNER JOIN in_interventi_tecnici_assegnati ON in_interventi_tecnici_assegnati.id_tecnico=an_anagrafiche.idanagrafica WHERE id_intervento=".prepare($r->id).' GROUP BY id_intervento');

        echo '
            <tr id="int_'.$r->id.'">
				<td><a target="_blank" >'.Modules::link('Interventi', $r->id, $r->codice).'</a></td>
                <td><a target="_blank" >'.Modules::link('Anagrafiche', $r->idanagrafica, $dbo->fetchOne('SELECT ragione_sociale FROM an_anagrafiche WHERE idanagrafica='.prepare($r->idanagrafica))['ragione_sociale']).'<br><small>Presso: ';
        // Sede promemoria
        if ($r->idsede == '-1') {
            echo '- Nessuna -';
        } elseif (empty($r->idsede)) {
            echo tr('Sede legale');
        } else {
            $rsp2 = $dbo->fetchArray("SELECT id, CONCAT( CONCAT_WS( ' (', CONCAT_WS(', ', nomesede, citta), indirizzo ), ')') AS descrizione FROM an_sedi WHERE id=".prepare($r->idsede));

            echo $rsp2[0]['descrizione'];
        }
        echo '
                </small>
                </td>
                <td>'.Translator::dateToLocale($r->data_richiesta).' '.((empty($r->data_scadenza)) ? '' : '<br><small>Entro il '.Translator::dateToLocale($r->data_scadenza).'</small>').'</td>
                <td>
                    '.$rs_tecnici[0]['tecnici'].'
                </td>

                <td>'.$dbo->fetchOne("SELECT CONCAT_WS(' - ', `codice`, `name`) AS descrizione FROM `in_tipiintervento` LEFT JOIN `in_tipiintervento_lang` ON (`in_tipiintervento`.`id` = `in_tipiintervento_lang`.`id_record` AND `in_tipiintervento_lang`.`id_lang` = ".prepare(setting('Lingua')).") WHERE `in_tipiintervento`.`id`=".prepare($r->idtipointervento))['descrizione'].'</td>

                <td>'.nl2br($r->richiesta).'</td>
				';

        echo '
            </tr>';
    }
    echo '
</table>';
} else {
    echo '
<p>'.tr('Non ci sono attività da programmare').'.</p>';
}
