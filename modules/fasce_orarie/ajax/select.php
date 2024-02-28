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

switch ($resource) {
    case 'fasce_orarie':
        $query = 'SELECT `in_fasceorarie`.`id`, `name` AS `descrizione` FROM `in_fasceorarie` LEFT JOIN `in_fasceorarie_lang` ON (`in_fasceorarie_lang`.`id_record` = `in_fasceorarie`.`id` AND `in_fasceorarie_lang`.`id_lang` = '.prepare(setting('Lingua')).') |where| ORDER BY `name` ASC';

        foreach ($elements as $element) {
            $filter[] = '`in_fasceorarie`.`id`='.prepare($element);
        }
        if (empty($filter)) {
            $where[] = '`in_fasceorarie`.`deleted_at` IS NULL';
        }

        if (!empty($search)) {
            $search_fields[] = '`name` LIKE '.prepare('%'.$search.'%');
        }

        break;
}
