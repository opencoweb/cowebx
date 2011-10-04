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
	iexcl:"point d'exclamation invers?",
	cent:"signe cent",
	pound:"signe livre sterling",
	curren:"signe devise",
	yen:"signe yen\nsigne yuan",
	brvbar:"barre interrompue\nbarre verticale interrompue",
	sect:"signe section",
	uml:"tr?ma\ntr?ma d'espacement",
	copy:"signe de droit d'auteur",
	ordf:"indicateur ordinal f?minin",
	laquo:"guillemets fermants",
	not:"signe non",
	shy:"trait d'union conditionnel\ntiret conditionnel",
	reg:"signe enregistr?\nmarque commerciale enregistr?e",
	macr:"macron\nmacron d'espacement\nligne sup?rieure\nbarre sup?rieure APL",
	deg:"signe degr?",
	plusmn:"signe plus-moins\nsigne plus-ou-moins",
	sup2:"exposant deux\npuissance deux\ncarr?",
	sup3:"exposant trois\npuissance trois\ncube",
	acute:"accent aigu\naccent aigu d'espacement",
	micro:"signe micro",
	para:"symbole de paragraphe",
	middot:"point m?dian\nvirgule g?orgiennea\npoint m?dian grec",
	cedil:"c?dille\nc?dille d'espacement",
	sup1:"exposant un\npuissance un",
	ordm:"indicateur ordinal masculin",
	raquo:"guillemets ouvrants",
	frac14:"fraction commune un quart\nfraction un quart",
	frac12:"fraction commune un demi\nfraction un demi",
	frac34:"fraction commune trois quarts\nfraction trois quarts",
	iquest:"point d'interrogation invers?\npoint d'interrogation retourn?",
	Agrave:"Latin - A majuscule avec accent grave\nLatin - A majuscule accent grave",
	Aacute:"Latin - A majuscule avec accent aigu",
	Acirc:"Latin - A majuscule avec accent circonflexe",
	Atilde:"Latin - A majuscule avec tilde",
	Auml:"Latin - A majuscule avec tr?ma",
	Aring:"Latin - A majuscule rond en chef\nLatin - A majuscule rond",
	AElig:"Latin - AE majuscule\nLatin - AE majuscule (ligature)",
	Ccedil:"Latin - C majuscule avec c?dille",
	Egrave:"Latin - E majuscule avec accent grave",
	Eacute:"Latin - E majuscule avec accent aigu",
	Ecirc:"Latin - E majuscule avec accent circonflexe",
	Euml:"Latin - E majuscule avec tr?ma",
	Igrave:"Latin - I majuscule avec accent grave",
	Iacute:"Latin - I majuscule avec accent aigu",
	Icirc:"Latin - I majuscule avec accent circonflexe",
	Iuml:"Latin - I majuscule avec tr?ma",
	ETH:"Latin - ETH majuscule",
	Ntilde:"Latin - N majuscule avec tilde",
	Ograve:"Latin - O majuscule avec accent grave",
	Oacute:"Latin - O majuscule avec accent aigu",
	Ocirc:"Latin - O majuscule avec accent circonflexe",
	Otilde:"Latin - O majuscule avec tilde",
	Ouml:"Latin - O majuscule avec tr?ma",
	times:"signe multiplication",
	Oslash:"Latin - O majuscule barr?\nLatin - Ensemble vide",
	Ugrave:"Latin - U majuscule avec accent grave",
	Uacute:"Latin - U majuscule avec accent aigu",
	Ucirc:"Latin - U majuscule avec accent circonflexe",
	Uuml:"Latin - U majuscule avec tr?ma",
	Yacute:"Latin - Y majuscule avec accent aigu",
	THORN:"Latin THORN majuscule",
	szlig:"Latin - s dur minuscule\nss",
	agrave:"Latin - a minuscule avec accent grave\nLatin - a minuscule accent grave",
	aacute:"Latin - a minuscule avec accent aigu",
	acirc:"Latin - a minuscule avec accent circonflexe",
	atilde:"Latin - a minuscule avec tilde",
	auml:"Latin - a minuscule avec tr?ma",
	aring:"Latin - a minuscule rond en chef\nLatin - a minuscule rond",
	aelig:"Latin - AE minuscule\nLatin - AE minuscule (ligature)",
	ccedil:"Latin - c minuscule avec c?dille",
	egrave:"Latin - e minuscule avec accent grave",
	eacute:"Latin - e minuscule avec accent aigu",
	ecirc:"Latin - e minuscule avec accent circonflexe",
	euml:"Latin - e minuscule avec tr?ma",
	igrave:"Latin - i minuscule avec accent grave",
	iacute:"Latin - i minuscule avec accent aigu",
	icirc:"Latin - i minuscule avec accent circonflexe",
	iuml:"Latin - i minuscule avec tr?ma",
	eth:"Latin - eth minuscule",
	ntilde:"Latin - n minuscule avec tilde",
	ograve:"Latin - o minuscule avec accent grave",
	oacute:"Latin - o minuscule avec accent aigu",
	ocirc:"Latin - o minuscule avec accent circonflexe",
	otilde:"Latin - o minuscule avec tilde",
	ouml:"Latin - o minuscule avec tr?ma",
	divide:"signe division",
	oslash:"Latin - o minuscule barr?\nLatin - Ensemble vide minuscule",
	ugrave:"Latin - u minuscule avec accent grave",
	uacute:"Latin - u minuscule avec accent aigu",
	ucirc:"Latin - u minuscule avec accent circonflexe",
	uuml:"Latin - u minuscule avec tr?ma",
	yacute:"Latin - y minuscule avec accent aigu",
	thorn:"Latin - thorn minuscule",
	yuml:"Latin - y minuscule avec tr?ma",

// Greek Characters and Symbols
	fnof:"Latin - f minuscule avec crochet\nfonction\nflorin",
	Alpha:"Grec - alpha majuscule",
	Beta:"Grec - beta majuscule",
	Gamma:"Grec - gamma majuscule",
	Delta:"Grec - delta majuscule",
	Epsilon:"Grec - epsilon majuscule",
	Zeta:"Grec - zeta majuscule",
	Eta:"Grec - eta majuscule",
	Theta:"Grec - theta majuscule",
	Iota:"Grec - iota majuscule",
	Kappa:"Grec - kappa majuscule",
	Lambda:"Grec - lambda majuscule",
	Mu:"Grec - mu majuscule",
	Nu:"Grec - nu majuscule",
	Xi:"Grec - xi majuscule",
	Omicron:"Grec - omicron majuscule",
	Pi:"Grec - pi majuscule",
	Rho:"Grec - rho majuscule",
	Sigma:"Grec - sigma majuscule",
	Tau:"Grec - tau majuscule",
	Upsilon:"Grec - upsilon majuscule",
	Phi:"Grec - phi majuscule",
	Chi:"Grec - chi majuscule",
	Psi:"Grec - psi majuscule",
	Omega:"Grec - omega majuscule",
	alpha:"Grec - alpha minuscule",
	beta:"Grec - beta minuscule",
	gamma:"Grec - gamma minuscule",
	delta:"Grec - delta minuscule",
	epsilon:"Grec - epsilon minuscule",
	zeta:"Grec - zeta minuscule",
	eta:"Grec - eta minuscule",
	theta:"Grec - theta minuscule",
	iota:"Grec - iota minuscule",
	kappa:"Grec - kappa minuscule",
	lambda:"Grec - lambda minuscule",
	mu:"Grec - mu minuscule",
	nu:"Grec - nu minuscule",
	xi:"Grec - xi minuscule",
	omicron:"Grec - omicron minuscule",
	pi:"Grec - pi minuscule",
	rho:"Grec - rho minuscule",
	sigmaf:"Grec - sigma final minuscule",
	sigma:"Grec - sigma minuscule",
	tau:"Grec - tau minuscule",
	upsilon:"Grec - upsilon minuscule",
	phi:"Grec - phi minuscule",
	chi:"Grec - chi minuscule",
	psi:"Grec - psi minuscule",
	omega:"Grec - omega minuscule",
	thetasym:"Grec - theta minuscule",
	upsih:"Greek - upsilon avec symbole de crochet",
	piv:"Greek - symbole pi",
	bull:"puce\npetit cercle noir",
	hellip:"points de suspension\ntrois points de conduite",
	prime:"apostrophe\nminutes\npieds",
	Prime:"double apostrophe\nsecondes\npouces",
	oline:"surlign?\nbarre sup?rieure d'espacement",
	frasl:"barre de fraction",
	weierp:"P majuscule scripte\nensemble de puissances\nfonction elliptique de Weierstrass",
	image:"I majuscule noir\npartie imaginaire",
	real:"R majuscule noir\npartie r?elle",
	trade:"signe de marque commerciale",
	alefsym:"symbole alef\npremier cardinal transfini",
	larr:"fl?che vers la gauche",
	uarr:"fl?che vers le haut",
	rarr:"fl?che vers la droite",
	darr:"fl?che vers le bas",
	harr:"fl?che vers la gauche et la droite",
	crarr:"fl?che vers le bas avec coin vers la gauche\nretour chariot",
	lArr:"fl?che double vers la gauche",
	uArr:"fl?che double vers le haut",
	rArr:"fl?che double vers la droite",
	dArr:"fl?che double vers le bas",
	hArr:"fl?che double vers la gauche",
	forall:"pour tous",
	part:"diff?rentiel partiel",
	exist:"il existe",
	empty:"ensemble vide\nensemble null\ndiam?tre",
	nabla:"nabla\ndiff?rence arri?re",
	isin:"?l?ment de",
	notin:"non ?l?ment de",
	ni:"contient comme membre",
	prod:"produit n-aire\nsigne produit",
	sum:"somme n-aire",
	minus:"signe moins",
	lowast:"ast?risque",
	radic:"racine carr?e\nsigne radical",
	prop:"proportionnel ?",
	infin:"infinit?",
	ang:"angle",
	and:"et logique\nwedge",
	or:"ou logique\nvee",
	cap:"intersection\ncap",
	cup:"union\ncup","int":"int?grale",
	there4:"donc",
	sim:"tilde\nvarie en fonction de\nsimilaire ?",
	cong:"approximativement ?gal ?",
	asymp:"presque ?gal ?\nasymptotique ?",
	ne:"diff?rente de",
	equiv:"identique ?",
	le:"inf?rieur ou ?gal ?",
	ge:"sup?rieur ou ?gal ?",
	sub:"sous-ensemble de",
	sup:"sur-ensemble de",
	nsub:"non sous-ensemble de",
	sube:"sous-ensemble de ou ?gal ?",
	supe:"sur-ensemble de ou ?gal ?",
	oplus:"plus entour?\nsomme directe",
	otimes:"signe multipli? entour?\nproduit vectoriel",
	perp:"orthogonal ?\nperpendiculaire",
	sdot:"point",
	lceil:"plafond ? gauche\nmontant APL",
	rceil:"plafond ? droite",
	lfloor:"plancher ? gauche\ndescendant APL",
	rfloor:"plancher ? droite",
	lang:"chevron vers la gauche",
	rang:"chevron vers la droite",
	loz:"losange",
	spades:"pic noir",
	clubs:"tr?fle noir",
	hearts:"coeur noir\nvalentine",
	diams:"carreau noir",
	OElig:"Latin - Ligature OE majuscule",
	oelig:"Latin - Ligature oe minuscule",
	Scaron:"Latin - S majuscule avec caron",
	scaron:"Latin - s minuscule avec caron",
	Yuml:"Latin - Y majuscule avec tr?ma",
	circ:"accent circonflexe de lettre modificateur",
	tilde:"petit tilde",
	ensp:"espace demi-cadratin",
	emsp:"espace cadratin",
	thinsp:"espace fin",
	zwnj:"antiliant sans chasse",
	zwj:"liant sans chasse",
	lrm:"marque de gauche ? droite",
	rlm:"marque de droite ? gauche",
	ndash:"tiret demi-cadratin",
	mdash:"tiret cadratin",
	lsquo:"guillemet simple ouvrant",
	rsquo:"guillemet simple fermant",
	sbquo:"guillemet simple fermant bas",
	ldquo:"guillemet double gauche",
	rdquo:"guillemet double droit",
	bdquo:"guillemet double fermant bas",
	dagger:"ob?le",
	Dagger:"double ob?le",
	permil:"signe pour-mille",
	lsaquo:"guillemet simple orient? vers la gauche",
	rsaquo:"guillemet simple orient? vers la droite",
	euro:"signe euro"
})

//end v1.x content
);
