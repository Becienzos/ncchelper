ALTER TABLE `co_contratti` ADD `idsede` INT NOT NULL AFTER `idanagrafica`;

-- Imposto conto cassa per contanti e rimesse
UPDATE `co_pagamenti` SET `idconto_vendite` = (SELECT id FROM co_pianodeiconti3 WHERE descrizione = 'Cassa'), `idconto_acquisti` = (SELECT id FROM co_pianodeiconti3 WHERE descrizione = 'Cassa')  WHERE `co_pagamenti`.`descrizione` = 'Contanti' OR `co_pagamenti`.`descrizione` LIKE 'Rimessa %';

-- Imposto conto banca per tutti i bonifici e ri.ba.
UPDATE `co_pagamenti` SET `idconto_vendite` = (SELECT id FROM co_pianodeiconti3 WHERE descrizione = 'Banca C/C'), `idconto_acquisti` = (SELECT id FROM co_pianodeiconti3 WHERE descrizione = 'Banca C/C')  WHERE `co_pagamenti`.`descrizione` LIKE 'Bonifico %' OR `co_pagamenti`.`descrizione` LIKE 'Ri.Ba. %';

-- Indirizzo PEC
ALTER TABLE `an_anagrafiche` ADD `pec` VARCHAR(255) NOT NULL AFTER `email`;

-- ISO 3166-1 alpha-2 code per nazioni
ALTER TABLE `an_nazioni` ADD `iso2` VARCHAR(2) NOT NULL AFTER `nome`;

-- ISO 2 per ITALIA (https://it.wikipedia.org/wiki/ISO_3166-1_alpha-2)
UPDATE `an_nazioni` SET `iso2` = 'IT' WHERE `an_nazioni`.`nome` = 'ITALIA';

-- Aggiunto name per i filtri
ALTER TABLE `zz_group_module` ADD `name` VARCHAR(255) NOT NULL AFTER `idmodule`;

UPDATE `zz_group_module` SET `name` = 'Mostra interventi ai tecnici coinvolti' WHERE `zz_group_module`.`id` = 1;
UPDATE `zz_group_module` SET `name` = 'Mostra interventi ai clienti coinvolti' WHERE `zz_group_module`.`id` = 5;

-- Abilito plugin Pianificazione fatturazione in contratti
UPDATE `zz_plugins` SET `enabled` = '1' WHERE `zz_plugins`.`name` = 'Pianificazione fatturazione';

-- Abilito widget Rate contrattuali in dashboard
UPDATE `zz_widgets` SET `enabled` = '1' WHERE `zz_widgets`.`name` = 'Rate contrattuali';

-- Help text per i plugins
ALTER TABLE `zz_plugins` ADD `help` VARCHAR(255) NOT NULL AFTER `directory`;

-- Help text per plugin Ddt del cliente
UPDATE `zz_plugins` SET `help` = 'Righe ddt del cliente. I ddt senza righe non saranno visualizzati.' WHERE `zz_plugins`.`name` = 'Ddt del cliente';

-- Creazione tablla per modelli primanota
CREATE TABLE IF NOT EXISTS `co_movimenti_modelli` (
  `id` int(11) NOT NULL,
  `idmastrino` int(11) NOT NULL,
  `descrizione` text NOT NULL,
  `idconto` int(11) NOT NULL
);

ALTER TABLE `co_movimenti_modelli` ADD PRIMARY KEY (`id`);

ALTER TABLE `co_movimenti_modelli` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
  
-- Modulo modelli primanota
INSERT INTO `zz_modules` (`id`, `name`, `title`, `directory`, `options`, `options2`, `icon`, `version`, `compatibility`, `order`, `parent`, `default`, `enabled`) VALUES (NULL, 'Modelli prima nota', 'Modelli prima nota', 'modelli_primanota', 'SELECT |select| FROM `co_movimenti_modelli` WHERE 1=1 GROUP BY `idmastrino` HAVING 2=2', '', 'fa fa-angle-right', '2.4.1', '2.4.1', '1', '40', '1', '1');

INSERT INTO `zz_views` (`id`, `id_module`, `name`, `query`, `order`, `search`, `slow`, `format`, `search_inside`, `order_by`, `enabled`, `summable`, `default`) VALUES (NULL, (SELECT id FROM zz_modules WHERE name='Modelli prima nota'), 'id', 'co_movimenti_modelli.id', '0', '1', '0', '0', NULL, NULL, '0', '0', '1');
INSERT INTO `zz_views` (`id`, `id_module`, `name`, `query`, `order`, `search`, `slow`, `format`, `search_inside`, `order_by`, `enabled`, `summable`, `default`) VALUES (NULL, (SELECT id FROM zz_modules WHERE name='Modelli prima nota'), 'Causale predefinita', 'co_movimenti_modelli.descrizione', '1', '1', '0', '0', NULL, NULL, '1', '0', '1');

INSERT INTO `zz_group_view` (`id_gruppo`, `id_vista`) VALUES
(1, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='id' )),
(1, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='Causale predefinita' )),
(2, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='id' )),
(2, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='Causale predefinita' )),
(3, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='id' )),
(3, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='Causale predefinita' )),
(4, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='id' )),
(4, (SELECT id FROM `zz_views` WHERE id_module=(SELECT id FROM zz_modules WHERE name='Modelli prima nota') AND name='Causale predefinita' ));

