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
	iexcl:"Umgekehrtes Ausrufezeichen",
	cent:"Cent-Zeichen",
	pound:"Nummernzeichen",
	curren:"W?hrungssymbol",
	yen:"Yen-Zeichen\Nyuan-Zeichen",
	brvbar:"Unterbrochener Balken\nUnterbrochener vertikaler Balken",
	sect:"Abschnittszeichen",
	uml:"Trema\nLeerzeichen mit Trema",
	copy:"Copyrightzeichen",
	ordf:"Weibliches Ordinalzeichen",
	laquo:"Doppelte, winklige Anf?hrungszeichen, die nach links weisen\linke franz?sische Anf?hrungszeichen",
	not:"Nicht-Zeichen",
	shy:"Ver?nderlicher Silbentrennstrich\nbedingter Trennstrich",
	reg:"Registrierte Handelsmarke\nregistriertes Markenzeichen",
	macr:"Makron\nLeerzeichen mit Makron\n?berstrich\nQuerstrich ?ber dem Buchstaben",
	deg:"Gradzeichen",
	plusmn:"Plus-Minus-Zeichen\nPlus-oder-Minus-Zeichen",
	sup2:"Hochgestellte Zwei\nHoch 2\nzum Quadrat",
	sup3:"Hochgestellte Drei\nHoch 3\nKubik",
	acute:"Akut\nsLeerzeichen mit Akut",
	micro:"Micro-Zeichen",
	para:"Pilcrow-Zeichen (engl.)\nAbsatzzeichen",
	middot:"Multiplikationszeichen\nGeorgisches Komma\nGriechisches Multiplikationszeichen",
	cedil:"Cedilla\nLeerzeichen mit Cedilla",
	sup1:"Hochgestellte Eins\nHoch 1",
	ordm:"M?nnliches Ordinalzeichen",
	raquo:"Doppelte, winklige Anf?hrungszeichen, die nach rechts weisen\nRechtes franz?sisches Anf?hrungszeichen",
	frac14:"Bruch 1 durch 4\nEin Viertel",
	frac12:"Bruch 1 durch 2\nEinhalb",
	frac34:"Bruch 3 durch 4\nDreiviertel",
	iquest:"Umgekehrtes Fragezeichen\nFragezeichen auf dem Kopf",
	Agrave:"Gro?es A mit Gravis\nGro?buchstabe A mit Gravis",
	Aacute:"Gro?buchstabe A mit Akut",
	Acirc:"Gro?buchstabe A mit Zirkumflex",
	Atilde:"Gro?buchstabe A mit Tilde",
	Auml:"Gro?buchstabe A mit Trema",
	Aring:"Gro?es A mit Ring dar?ber\nLateinischer Gro?buchstabe A mit Ring dar?ber",
	AElig:"Gro?es AE\nLigatur aus Gro?buchstaben A und E",
	Ccedil:"Gro?buchstabe C mit Cedilla",
	Egrave:"Gro?buchstabe E mit Gravis",
	Eacute:"Gro?buchstabe E mit Akut",
	Ecirc:"Gro?buchstabe E mit Zirkumflex",
	Euml:"Gro?buchstabe E mit Trema",
	Igrave:"Gro?buchstabe I mit Gravis",
	Iacute:"Gro?buchstabe I mit Akut",
	Icirc:"Gro?buchstabe I mit Zirkumflex",
	Iuml:"Gro?buchstabe I mit Trema",
	ETH:"Gro?es ETH",
	Ntilde:"Gro?buchstabe N mit Tilde",
	Ograve:"Gro?buchstabe O mit Gravis",
	Oacute:"Gro?buchstabe O mit Akut",
	Ocirc:"Gro?buchstabe O mit Zirkumflex",
	Otilde:"Lateinischer Gro?buchstabe O mit Tilde",
	Ouml:"Lateinischer Gro?buchstabe O mit Trema",
	times:"Multiplikationszeichen",
	Oslash:"Gro?es O mit Schr?gstrich\nGro?er d?nisch-norwegischer Umlaut ?",
	Ugrave:"Gro?buchstabe U mit Gravis",
	Uacute:"Gro?buchstabe U mit Akut",
	Ucirc:"Gro?buchstabe U mit Zirkumflex",
	Uuml:"Gro?buchstabe U mit Trema",
	Yacute:"Gro?buchstabe Y mit Akut",
	THORN:"Gro?es THORN",
	szlig:"Scharfes s\nEsszett",
	agrave:"Kleines a mit Gravis\nKleinbuchstabe a mit Gravis",
	aacute:"Kleinbuchstabe a mit Aktut",
	acirc:"Kleinbuchstabe a mit Zirkumflex",
	atilde:"Kleinbuchstabe a mit Tilde",
	auml:"Kleinbuchstabe a mit Trema",
	aring:"Kleines a mit Ring dar?ber\nKleinbuchstabe a mit Ring",
	aelig:"Kleines ae\nLigatur aus Kleinbuchstaben a und e",
	ccedil:"Kleinbuchstabe c mit Cedilla",
	egrave:"Kleinbuchstabe e mit Gravis",
	eacute:"Kleinbuchstabe e mit Aktut",
	ecirc:"Kleinbuchstabe e mit Zirkumflex",
	euml:"Kleinbuchstabe e mit Trema",
	igrave:"Kleinbuchstabe i mit Gravis",
	iacute:"Kleinbuchstabe i mit Aktut",
	icirc:"Kleinbuchstabe i mit Zirkumflex",
	iuml:"Kleinbuchstabe i mit Trema",
	eth:"Kleines eth",
	ntilde:"Kleinbuchstabe n mit Tilde",
	ograve:"Kleinbuchstabe o mit Gravis",
	oacute:"Kleinbuchstabe o mit Aktut",
	ocirc:"Kleinbuchstabe o mit Zirkumflex",
	otilde:"Kleinbuchstabe o mit Tilde",
	ouml:"Kleinbuchstabe o mit Gravis",
	divide:"Divisionszeichen",
	oslash:"Kleines o mit Schr?gstrich\nKleiner d?nisch-norwegischer Umlaut ?",
	ugrave:"Kleinbuchstabe u mit Gravis",
	uacute:"Kleinbuchstabe u mit Aktut",
	ucirc:"Kleinbuchstabe u mit Zirkumflex",
	uuml:"Kleinbuchstabe u mit Trema",
	yacute:"Kleinbuchstabe y mit Aktut",
	thorn:"Kleines thorn",
	yuml:"Kleinbuchstabe y mit Trema",

// Greek Characters and Symbols
	fnof:"Kleines mit Haken\nFunction\nFlorin",
	Alpha:"Griechischer Gro?buchstabe Alpha",
	Beta:"Griechischer Gro?buchstabe Beta",
	Gamma:"Griechischer Gro?buchstabe Gamma",
	Delta:"Griechischer Gro?buchstabe Delta",
	Epsilon:"Griechischer Gro?buchstabe Epsilon",
	Zeta:"Griechischer Gro?buchstabe Zeta",
	Eta:"Griechischer Gro?buchstabe Eta",
	Theta:"Griechischer Gro?buchstabe Theta",
	Iota:"Griechischer Gro?buchstabe Iota",
	Kappa:"Griechischer Gro?buchstabe Kappa",
	Lambda:"Griechischer Gro?buchstabe Lambda",
	Mu:"Griechischer Gro?buchstabe My",
	Nu:"Griechischer Gro?buchstabe Ny",
	Xi:"Griechischer Gro?buchstabe Xi",
	Omicron:"Griechischer Gro?buchstabe Omicron",
	Pi:"Griechischer Gro?buchstabe Pi",
	Rho:"Griechischer Gro?buchstabe Rho",
	Sigma:"Griechischer Gro?buchstabe Sigma",
	Tau:"Griechischer Gro?buchstabe Tau",
	Upsilon:"Griechischer Gro?buchstabe Upsilon",
	Phi:"Griechischer Gro?buchstabe Phi",
	Chi:"Griechischer Gro?buchstabe Chi",
	Psi:"Griechischer Gro?buchstabe Psi",
	Omega:"Griechischer Gro?buchstabe Omega",
	alpha:"Griechischer Kleinbuchstabe Alpha",
	beta:"Griechischer Kleinbuchstabe Beta",
	gamma:"Griechischer Kleinbuchstabe Gamma",
	delta:"Griechischer Kleinbuchstabe Delta",
	epsilon:"Griechischer Kleinbuchstabe Epsilon",
	zeta:"Griechischer Kleinbuchstabe Zeta",
	eta:"Griechischer Kleinbuchstabe Eta",
	theta:"Griechischer Kleinbuchstabe Theta",
	iota:"Griechischer Kleinbuchstabe Iota",
	kappa:"Griechischer Kleinbuchstabe Kappa",
	lambda:"Griechischer Kleinbuchstabe Lambda",
	mu:"Griechischer Kleinbuchstabe My",
	nu:"Griechischer Kleinbuchstabe Ny",
	xi:"Griechischer Kleinbuchstabe Xi",
	omicron:"Griechischer Kleinbuchstabe Omicron",
	pi:"Griechischer Kleinbuchstabe Pi",
	rho:"Griechischer Kleinbuchstabe Rho",
	sigmaf:"Griechischer Kleinbuchstabe Sigma am Wortende",
	sigma:"Griechischer Kleinbuchstabe Sigma",
	tau:"Griechischer Kleinbuchstabe Tau",
	upsilon:"Griechischer Kleinbuchstabe Upsilon",
	phi:"Griechischer Kleinbuchstabe Phi",
	chi:"Griechischer Kleinbuchstabe Chi",
	psi:"Griechischer Kleinbuchstabe Psi",
	omega:"Griechischer Kleinbuchstabe Omega",
	thetasym:"Griechischer Kleinbuchstabe Theta (Symbol)",
	upsih:"Griechisches Upsilon mit Haken",
	piv:"Griechisches Pi-Symbol",
	bull:"Rundes Aufz?hlungszeichen\nSchwarzer kleiner Kreis",
	hellip:"Auslassung\nDrei kleine Punkte",
	prime:"Prime\nMinuten\nFu?",
	Prime:"Doppelter Prime\nSekunden\nZoll",
	oline:"Hochgestellter Querstrich\nLeerzeichen mit Oberstrich",
	frasl:"Schr?gstrich f?r Bruch",
	weierp:"Kleines p in Schreibschrift\nPotenz\nWeierstrass'sche Ellipsen-Funktion",
	image:"Gro?es I in Frakturschrift\nImagin?rteil",
	real:"Gro?es R in Frakturschrift\nRealteilsymbol",
	trade:"Markenzeichen",
	alefsym:"Alef-Symbol\nerste Transfinite Kardinalzahl",
	larr:"Linkspfeil",
	uarr:"Aufw?rtspfeil",
	rarr:"Rechtspfeil",
	darr:"Abw?rtspfeil",
	harr:"Links-Rechts-Pfeil",
	crarr:"Abw?rtspfeil, der nach links abknickt\nZeilenumbruch",
	lArr:"Doppelter Linkspfeil",
	uArr:"Doppelter Aufw?rtspfeil",
	rArr:"Doppelter Rechtspfeil",
	dArr:"Doppelter Abw?rtspfeil",
	hArr:"Doppelter Rechts-Links-Pfeil",
	forall:"F?r alle",
	part:"Partielle Differenzialgleichung",
	exist:"Es existiert",
	empty:"Leermenge\nNullmenge\nDurchmesser",
	nabla:"Nabla\nAbsteigende Differenz",
	isin:"Element von",
	notin:"Kein Element von",
	ni:"Enth?lt als Member",
	prod:"un?res Produkt\nProduktzeichen",
	sum:"un?re Summation",
	minus:"Minuszeichen",
	lowast:"Sternoperator",
	radic:"Quadratwurzel\nWurzelzeichen",
	prop:"proportional zu",
	infin:"Unendlich",
	ang:"Winkel",
	and:"Logisches Und\nKeil",
	or:"Logisches Oder\nv-f?rmig",
	cap:"Schnittpunkt\nH?tchen",
	cup:"Vereinigungsmenge\nCup","int":"Integral",
	there4:"Deshalb",
	sim:"Tilde (Operator)\nvariiert mit\n?hnlich wie",
	cong:"Etwa gleich mit",
	asymp:"Ungef?hr gleich mit\nasymptotisch",
	ne:"Nicht gleich mit",
	equiv:"Identisch mit",
	le:"Kleiner-gleich",
	ge:"Gr??er-gleich",
	sub:"Teil von",
	sup:"Obermenge von",
	nsub:"Kein Teil von",
	sube:"Teilmenge oder gleich mit",
	supe:"Obermenge oder gleich mit",
	oplus:"Pluszeichen mit Kreis\ndirekte Summe",
	otimes:"Multiplikationszeichen mit Kreis\nVektorprodukt",
	perp:"Senkrecht\nSenkrecht zu\nLotrecht",
	sdot:"Punktoperator",
	lceil:"Linke Ecke oben\nAPL upstile",
	rceil:"Rechte Ecke oben",
	lfloor:"Linke Ecke unten\nAPL downstile",
	rfloor:"Rechte Ecke unten",
	lang:"Linke spitze Klammer",
	rang:"Rechte spitze Klammer",
	loz:"Raute",
	spades:"Schwarzes Pik (Kartenspiel)",
	clubs:"Schwarzes Kreuz (Kartenspiel)\nKleeblatt",
	hearts:"Schwarzes Herz (Kartenspiel)\nValentine",
	diams:"Schwarzes Karo (Kartenspiel)",
	OElig:"Ligatur aus Gro?buchstaben O und E",
	oelig:"Ligatur aus Kleinbuchstaben o und e",
	Scaron:"Gro?buchstabe S mit Caron",
	scaron:"Kleinbuchstabe s mit Caron",
	Yuml:"Gro?buchstabe Y mit Trema",
	circ:"Zirkumflex, Akzent",
	tilde:"kleine Tilde",
	ensp:"Leerschritt von der Breite des Buchstaben n",
	emsp:"Leerschritt von der Breite des Buchstaben m",
	thinsp:"Schmaler Leerschritt",
	zwnj:"Nichtverbinder mit Nullbreite",
	zwj:"Verbinder mit Nullbreite",
	lrm:"Links-Rechts-Markierung",
	rlm:"Rechts-Links-Markierung",
	ndash:"Gedankenstrich von der L?nge des Buchstabens n",
	mdash:"Gedankenstrich von der L?nge des Buchstabens m",
	lsquo:"Linkes einfaches Anf?hrungszeichen",
	rsquo:"Rechtes einfaches Anf?hrungszeichen",
	sbquo:"Einfaches, gekr?mmtes Anf?hrungszeichen unten",
	ldquo:"Linkes doppeltes Anf?hrungszeichen",
	rdquo:"Rechtes doppeltes Anf?hrungszeichen",
	bdquo:"Doppeltes, gekr?mmtes Anf?hrungszeichen unten",
	dagger:"Kreuzzeichen",
	Dagger:"Doppelkreuzzeichen",
	permil:"Promillezeichen",
	lsaquo:"Einfaches linkes Anf?hrungszeichen",
	rsaquo:"Einfaches rechtes Anf?hrungszeichen",
	euro:"Euro-Zeichen"
})

//end v1.x content
);
