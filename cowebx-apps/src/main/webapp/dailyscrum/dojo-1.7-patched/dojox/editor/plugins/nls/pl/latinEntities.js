/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(
//begin v1.x content
({
	/* These are already handled in the default RTE
		amp:"ampersand",lt:"less-than sign",
		gt:"greater-than sign",
		nbsp:"no-break space\nnon-breaking space",
		quot:"quote",
	*/
	iexcl:"odwr?cony wykrzyknik",
	cent:"znak centa",
	pound:"znak funta",
	curren:"znak waluty",
	yen:"znak jena\nznak yuana",
	brvbar:"przerwana kreska\nprzerwana pionowa kreska",
	sect:"znak sekcji",
	uml:"diereza\ndiereza rozdzielaj?ca",
	copy:"znak praw autorskich",
	ordf:"znak liczby rodzaju ?e?skiego",
	laquo:"lewy cudzys??w tr?jk?tny\nlewy guillemet",
	not:"znak negacji",
	shy:"??cznik mi?kki\n??cznik opcjonalny",
	reg:"symbol zastrze?enia\nsymbol zastrze?onego znaku towarowego",
	macr:"makron\nmakron rozdzielaj?cy\nnadkre?lenie\nkreska g?rna APL",
	deg:"znak stopni",
	plusmn:"znak plus-minus\nznak zakresu warto?ci przybli?onej",
	sup2:"indeks g?rny dwa\ncyfra dwa w indeksie g?rnym\nkwadrat",
	sup3:"indeks g?rny trzy\ncyfra trzy w indeksie g?rnym\nsze?cian",
	acute:"akcent ostry\nodst?p ostry",
	micro:"znak mikro",
	para:"znak pilcrow\nznak akapitu",
	middot:"kropka ?rodkowa\ngruzi?ski przecinek\ngrecka kropka ?rodkowa",
	cedil:"cedilla\nodst?p cedilla",
	sup1:"indeks g?rny jeden\ncyfra jeden w indeksie g?rnym",
	ordm:"znak liczby rodzaju m?skiego",
	raquo:"prawy cudzys??w tr?jk?tny\nprawy guillemet",
	frac14:"znak u?amka jedna czwarta\nu?amek jedna czwarta",
	frac12:"znak u?amka jedna druga\nu?amek jedna druga",
	frac34:"znak u?amka trzy czwarte\nu?amek trzy czwarte",
	iquest:"odwr?cony znak zapytania\nodwrotny znak zapytania",
	Agrave:"?aci?ska wielka litera A z symbolem gravis\n?aci?ska wielka litera A z akcentem ci??kim",
	Aacute:"?aci?ska wielka litera A z akcentem ostrym",
	Acirc:"?aci?ska wielka litera A z daszkiem",
	Atilde:"?aci?ska wielka litera A z tyld?",
	Auml:"?aci?ska wielka litera A z diarez?",
	Aring:"?aci?ska wielka litera A z pier?cieniem powy?ej\n?aci?ska wielka litera A z pier?cieniem",
	AElig:"?aci?ska wielka litera AE\n?aci?ska ligatura wielkich liter AE",
	Ccedil:"?aci?ska wielka litera C z cedill?",
	Egrave:"?aci?ska wielka litera E z akcentem ci??kim",
	Eacute:"?aci?ska wielka litera E z akcentem ostrym",
	Ecirc:"?aci?ska wielka litera E z daszkiem",
	Euml:"?aci?ska wielka litera E z diarez?",
	Igrave:"?aci?ska wielka litera I z akcentem ci??kim",
	Iacute:"?aci?ska wielka litera I z akcentem ostrym",
	Icirc:"?aci?ska wielka litera I z daszkiem",
	Iuml:"?aci?ska wielka litera I z diarez?",
	ETH:"?aci?ska wielka litera ETH",
	Ntilde:"?aci?ska wielka litera N z tyld?",
	Ograve:"?aci?ska wielka litera O z akcentem ci??kim",
	Oacute:"?aci?ska wielka litera O z akcentem ostrym",
	Ocirc:"?aci?ska wielka litera O z daszkiem",
	Otilde:"?aci?ska wielka litera O z tyld?",
	Ouml:"?aci?ska wielka litera O z diarez?",
	times:"znak mno?enia",
	Oslash:"?aci?ska wielka litera O z przekre?leniem\n?aci?ska wielka litera O z uko?nikiem",
	Ugrave:"?aci?ska wielka litera U z akcentem ci??kim",
	Uacute:"?aci?ska wielka litera U z akcentem ostrym",
	Ucirc:"?aci?ska wielka litera U z daszkiem",
	Uuml:"?aci?ska wielka litera U z diarez?",
	Yacute:"?aci?ska wielka litera Y z akcentem ostrym",
	THORN:"?aci?ska wielka litera THORN",
	szlig:"?aci?ska ma?a litera ostre s\ness-zed",
	agrave:"?aci?ska ma?a litera a z symbolem gravis\n?aci?ska ma?a litera a z akcentem ci??kim",
	aacute:"?aci?ska ma?a litera a z akcentem ostrym",
	acirc:"?aci?ska ma?a litera a z daszkiem",
	atilde:"?aci?ska ma?a litera a z tyld?",
	auml:"?aci?ska ma?a litera a z diarez?",
	aring:"?aci?ska ma?a litera a z pier?cieniem powy?ej\n?aci?ska ma?a litera a z pier?cieniem",
	aelig:"?aci?ska ma?a litera ae\n?aci?ska ligatura ma?ych liter ae",
	ccedil:"?aci?ska ma?a litera c z cedill?",
	egrave:"?aci?ska ma?a litera e z akcentem ci??kim",
	eacute:"?aci?ska ma?a litera e z akcentem ostrym",
	ecirc:"?aci?ska ma?a litera e z daszkiem",
	euml:"?aci?ska ma?a litera e z diarez?",
	igrave:"?aci?ska ma?a litera i z akcentem ci??kim",
	iacute:"?aci?ska ma?a litera i z akcentem ostrym",
	icirc:"?aci?ska ma?a litera i z daszkiem",
	iuml:"?aci?ska ma?a litera i z diarez?",
	eth:"?aci?ska ma?a litera eth",
	ntilde:"?aci?ska ma?a litera n z tyld?",
	ograve:"?aci?ska ma?a litera o z akcentem ci??kim",
	oacute:"?aci?ska ma?a litera o z akcentem ostrym",
	ocirc:"?aci?ska ma?a litera o z daszkiem",
	otilde:"?aci?ska ma?a litera o z tyld?",
	ouml:"?aci?ska ma?a litera o z diarez?",
	divide:"znak dzielenia",
	oslash:"?aci?ska ma?a litera o z przekre?leniem\n?aci?ska ma?a litera o z uko?nikiem",
	ugrave:"?aci?ska ma?a litera u z akcentem ci??kim",
	uacute:"?aci?ska ma?a litera u z akcentem ostrym",
	ucirc:"?aci?ska ma?a litera u z daszkiem",
	uuml:"?aci?ska ma?a litera u z diarez?",
	yacute:"?aci?ska ma?a litera y z akcentem ostrym",
	thorn:"?aci?ska ma?a litera thorn",
	yuml:"?aci?ska ma?a litera y z diarez?",

// Greek Characters and Symbols
	fnof:"?aci?ska ma?a litera f z haczykiem\nfunkcja\nfloren",
	Alpha:"grecka wielka litera alfa",
	Beta:"grecka wielka litera beta",
	Gamma:"grecka wielka litera gamma",
	Delta:"grecka wielka litera delta",
	Epsilon:"grecka wielka litera epsilon",
	Zeta:"grecka wielka litera dzeta",
	Eta:"grecka wielka litera eta",
	Theta:"grecka wielka litera theta",
	Iota:"grecka wielka litera jota",
	Kappa:"grecka wielka litera kappa",
	Lambda:"grecka wielka litera lambda",
	Mu:"grecka wielka litera my",
	Nu:"grecka wielka litera ni",
	Xi:"grecka wielka litera ksi",
	Omicron:"grecka wielka litera omikron",
	Pi:"grecka wielka litera pi",
	Rho:"grecka wielka litera rho",
	Sigma:"grecka wielka litera sigma",
	Tau:"grecka wielka litera tau",
	Upsilon:"grecka wielka litera ipsylon",
	Phi:"grecka wielka litera phi",
	Chi:"grecka wielka litera chi",
	Psi:"grecka wielka litera psi",
	Omega:"grecka wielka litera omega",
	alpha:"grecka wielka litera alfa",
	beta:"grecka ma?a litera beta",
	gamma:"grecka ma?a litera gamma",
	delta:"grecka ma?a litera delta",
	epsilon:"grecka ma?a litera epsilon",
	zeta:"grecka ma?a litera dzeta",
	eta:"grecka ma?a litera eta",
	theta:"grecka ma?a litera theta",
	iota:"grecka ma?a litera jota",
	kappa:"grecka ma?a litera kappa",
	lambda:"grecka ma?a litera lambda",
	mu:"grecka ma?a litera my",
	nu:"grecka ma?a litera ni",
	xi:"grecka ma?a litera ksi",
	omicron:"grecka ma?a litera omikron",
	pi:"grecka ma?a litera phi",
	rho:"grecka ma?a litera rho",
	sigmaf:"grecka ma?a litera ko?cowa sigma",
	sigma:"grecka ma?a litera sigma",
	tau:"grecka ma?a litera tau",
	upsilon:"grecka ma?a litera ipsylon",
	phi:"grecka ma?a litera phi",
	chi:"grecka ma?a litera chi",
	psi:"grecka ma?a litera psi",
	omega:"grecka ma?a litera omega",
	thetasym:"grecka ma?a litera theta (symbol)",
	upsih:"grecka litera ipsylon z symbolem haczyka",
	piv:"grecki symbol pi",
	bull:"znacznik podpunktu\nma?e czarne k??ko",
	hellip:"wielokropek\ntrzy kropki",
	prime:"prim\nminuty\nstopy",
	Prime:"bis\nsekundy\ncale",
	oline:"nadkre?lenie\nnadkre?lenie tworz?ce odst?p",
	frasl:"kreska u?amkowa",
	weierp:"odr?cznie pisana wielka litera P\nzbi?r pot?gowy\nP Weierstrassa",
	image:"gotycka wielka litera I\ncz??? urojona liczby zespolonej",
	real:"gotycka wielka litera R\nsymbol cz??ci rzeczywistej liczby zespolonej",
	trade:"symbol znaku zastrze?onego",
	alefsym:"znak alef\npocz?tkowa liczba porz?dkowa",
	larr:"strza?ka w lewo",
	uarr:"strza?ka w g?r?",
	rarr:"strza?ka w prawo",
	darr:"strza?ka w d??",
	harr:"strza?ka w lewo i w prawo",
	crarr:"strza?ka w d?? z rogiem w lewo\npowr?t karetki",
	lArr:"podw?jna strza?ka w lewo",
	uArr:"podw?jna strza?ka w g?r?",
	rArr:"podw?jna strza?ka w prawo",
	dArr:"podw?jna strza?ka w d??",
	hArr:"podw?jna strza?ka w lewo i w prawo",
	forall:"dla ka?dego",
	part:"pochodna cz?stkowa",
	exist:"istnieje",
	empty:"zbi?r pusty\nzbi?r miary zero\n?rednica",
	nabla:"nabla\nkoneksja",
	isin:"nale?y do",
	notin:"nie nale?y do",
	ni:"zawiera",
	prod:"iloczyn n element?w\nznak iloczynu",
	sum:"suma n element?w",
	minus:"znak minus",
	lowast:"operator gwiazdka",
	radic:"pierwiastek kwadratowy\nznak pierwiastka",
	prop:"proporcjonalnie do",
	infin:"niesko?czono??",
	ang:"k?t",
	and:"iloczyn logiczny\nklin",
	or:"suma logiczna\nlitera v",
	cap:"cz??? wsp?lna zbior?w\nczepek",
	cup:"suma zbior?w\nfili?anka","int":"ca?ka",
	there4:"dlatego",
	sim:"operator tylda\nzmienia si? w granicach\noko?o",
	cong:"r?wna si? w przybli?eniu",
	asymp:"prawie r?wna si?\nasymptotyczne do",
	ne:"nie r?wna si?",
	equiv:"takie same jak",
	le:"mniejsze ni? lub r?wne",
	ge:"wi?ksze ni? lub r?wne",
	sub:"jest podzbiorem",
	sup:"jest nadzbiorem",
	nsub:"nie jest podzbiorem",
	sube:"jest podzbiorem lub r?wna si?",
	supe:"jest nadzbiorem lub r?wna si?",
	oplus:"znak plus w okr?gu\nsuma bezpo?rednia",
	otimes:"znak mno?enia w okr?gu\niloczyn wektor?w",
	perp:"odwr?cona litera T\nprostopad?e do\nprostopad?e",
	sdot:"operator kropka",
	lceil:"lewy sufit\nhaczyk g?rny APL",
	rceil:"prawy sufit",
	lfloor:"lewa pod?oga\nhaczyk dolny APL",
	rfloor:"prawa pod?oga",
	lang:"lewy nawias tr?jk?tny",
	rang:"prawy nawias tr?jk?tny",
	loz:"romb",
	spades:"symbol pik",
	clubs:"symbol trefl\nkoniczyna",
	hearts:"symbol kier\nserce",
	diams:"symbol karo",
	OElig:"?aci?ska ligatura wielkich liter OE",
	oelig:"?aci?ska ligatura ma?ych liter oe",
	Scaron:"?aci?ska wielka litera S z daszkiem odwr?conym",
	scaron:"?aci?ska ma?a litera s z daszkiem odwr?conym",
	Yuml:"?aci?ska wielka litera Y z diarez?",
	circ:"modyfikator litery - akcent w formie daszka",
	tilde:"ma?a tylda",
	ensp:"spacja ?rednia",
	emsp:"spacja d?uga",
	thinsp:"spacja kr?tka",
	zwnj:"symbol rozdzielaj?cy o zerowej szeroko?ci",
	zwj:"??cznik o zerowej szeroko?ci",
	lrm:"znacznik zapisu od lewej do prawej",
	rlm:"znacznik zapisu od prawej do lewej",
	ndash:"p??pauza",
	mdash:"pauza",
	lsquo:"lewy pojedynczy cudzys??w",
	rsquo:"prawy pojedynczy cudzys??w",
	sbquo:"pojedynczy cudzys??w dolny",
	ldquo:"lewy podw?jny cudzys??w",
	rdquo:"prawy podw?jny cudzys??w",
	bdquo:"podw?jny cudzys??w dolny",
	dagger:"krzy?yk",
	Dagger:"podw?jny krzy?yk",
	permil:"promile",
	lsaquo:"pojedynczy lewy cudzys??w tr?jk?tny",
	rsaquo:"pojedynczy prawy cudzys??w tr?jk?tny",
	euro:"znak euro"
})

//end v1.x content
);
