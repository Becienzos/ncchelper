-- Aggiunta popup Stampa riepilogo interventi
UPDATE `zz_widgets` SET `more_link` = './modules/interventi/widgets/stampa_riepilogo.php', `more_link_type` = 'popup' WHERE `zz_widgets`.`name` = 'Stampa riepilogo';