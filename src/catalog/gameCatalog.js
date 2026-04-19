// Katalog-/Resolver-Grundlagen aus dem Legacy-core herausgezogen.
const CUP_UNLOCK_HINTS = {
    'snes:grand_prix:spezial_cup': 'Freischaltung: Gewinne in 100cc Pilz-, Blumen- und Stern-Cup.',
    'gba:grand_prix:spezial_cup': 'Freischaltung: Gewinne in derselben Klasse Pilz-, Blumen-, Blitz- und Stern-Cup.',
    'gba:grand_prix:extra_pilz_cup': 'Freischaltung: Gewinne nach dem Spezial-Cup den Pilz-Cup in dieser Klasse mit 100 Münzen.',
    'gba:grand_prix:extra_blumen_cup': 'Freischaltung: Gewinne nach dem Spezial-Cup den Blumen-Cup in dieser Klasse mit 100 Münzen.',
    'gba:grand_prix:extra_blitz_cup': 'Freischaltung: Gewinne nach dem Spezial-Cup den Blitz-Cup in dieser Klasse mit 100 Münzen.',
    'gba:grand_prix:extra_stern_cup': 'Freischaltung: Gewinne nach dem Spezial-Cup den Stern-Cup in dieser Klasse mit 100 Münzen.',
    'gba:grand_prix:extra_spezial_cup': 'Freischaltung: Gewinne nach dem Spezial-Cup den Extra Spezial-Cup in dieser Klasse mit 100 Münzen.',
    'gc:grand_prix:spezial_cup': 'Freischaltung: Gewinne den Stern-Cup auf 100cc.',
    'switch2:grand_prix:spezial_cup': 'Freischaltung: Schließe alle sieben Basis-Cups im Grand Prix ab.'
};
function getCupUnlockHint(consoleId, modeLike, cupLike) {
    const cupId = String((cupLike === null || cupLike === void 0 ? void 0 : cupLike.id) || '');
    const mode = resolveCatalogMode(consoleId, modeLike);
    const source = String((cupLike === null || cupLike === void 0 ? void 0 : cupLike.source) || '');
    if (source !== 'unlock')
        return '';
    const key = `${String((typeof consoleId === 'object' && consoleId ? consoleId.id : consoleId) || '')}:${String((mode === null || mode === void 0 ? void 0 : mode.id) || '')}:${cupId}`;
    return CUP_UNLOCK_HINTS[key] || 'Freischaltung im Spiel erforderlich.';
}
const GAME_CATALOG = [
    {
        "id": "snes",
        "name": "SNES",
        "game": "Super Mario Kart (1992)",
        "emoji": "🟥",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Marios Piste 1",
                            "Donut-Ebene 1",
                            "Geistertal 1",
                            "Bowsers Festung 1",
                            "Marios Piste 2"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Schoko-Insel 1",
                            "Geistertal 2",
                            "Donut-Ebene 2",
                            "Bowsers Festung 2",
                            "Marios Piste 3"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Koopa-Strand 1",
                            "Schoko-Insel 2",
                            "Vanille-See 1",
                            "Bowsers Festung 3",
                            "Marios Piste 4"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Donut-Ebene 3",
                            "Koopa-Strand 2",
                            "Geistertal 3",
                            "Vanille-See 2",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "unlock"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle freigeschalteten Rennstrecken aus Grand Prix."
            },
            {
                "id": "versus",
                "name": "2-Spieler-Rennen",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle freigeschalteten Rennstrecken aus Grand Prix."
            },
            {
                "id": "battle",
                "name": "Battle Mode",
                "cups": [
                    {
                        "id": "battle_arenen",
                        "name": "Battle-Arenen",
                        "tracks": [
                            "Battle-Arena 1",
                            "Battle-Arena 2",
                            "Battle-Arena 3",
                            "Battle-Arena 4"
                        ],
                        "source": "base"
                    }
                ],
                "note": "Eigene Arenen, kein Cup-System."
            }
        ]
    },
    {
        "id": "n64",
        "name": "N64",
        "game": "Mario Kart 64 (1997)",
        "emoji": "🕹️",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Luigis Rennpiste",
                            "Kuhmuh-Farm",
                            "Koopa-Strand",
                            "Kalimari-Wüste"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Toads Autobahn",
                            "Polar-Parcours",
                            "Schoko-Sumpf",
                            "Marios Rennpiste"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Wario-Stadion",
                            "Sorbet-Land",
                            "Königliche Rennpiste",
                            "Bowsers Festung"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "DKs Dschungelpark",
                            "Yoshi-Tal",
                            "Spukpfad",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle 16 Rennstrecken."
            },
            {
                "id": "versus",
                "name": "Versus",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle 16 Rennstrecken."
            },
            {
                "id": "battle",
                "name": "Battle Mode",
                "cups": [
                    {
                        "id": "battle_arenen",
                        "name": "Battle-Arenen",
                        "tracks": [
                            "Block-Fort",
                            "Doppel-Deck",
                            "Big Donut",
                            "Skyscraper"
                        ],
                        "source": "base"
                    }
                ]
            }
        ]
    },
    {
        "id": "gba",
        "name": "GBA",
        "game": "Mario Kart: Super Circuit (2001)",
        "emoji": "🟠",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Peachs Piste",
                            "Shy Guy-Strand",
                            "Flussufer-Park",
                            "Bowsers Festung 1"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Marios Piste",
                            "Buu-Huu-Tal",
                            "Käseland",
                            "Bowsers Festung 2"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blitz_cup",
                        "name": "Blitz-Cup",
                        "tracks": [
                            "Luigis Piste",
                            "Wolkenpiste",
                            "Cheep-Cheep-Insel",
                            "Sonnenuntergangs-Wüste"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Schneeland",
                            "Party-Straße",
                            "Yoshi-Wüste",
                            "Bowsers Festung 3"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Seeufer-Park",
                            "Zerstörter Pfad",
                            "Bowsers Festung 4",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "unlock"
                    },
                    {
                        "id": "extra_pilz_cup",
                        "name": "Extra Pilz-Cup",
                        "tracks": [
                            "SNES Marios Piste 1",
                            "SNES Donut-Ebene 1",
                            "SNES Geistertal 1",
                            "SNES Bowsers Festung 1"
                        ],
                        "source": "unlock"
                    },
                    {
                        "id": "extra_blumen_cup",
                        "name": "Extra Blumen-Cup",
                        "tracks": [
                            "SNES Marios Piste 2",
                            "SNES Schoko-Insel 1",
                            "SNES Geistertal 2",
                            "SNES Donut-Ebene 2"
                        ],
                        "source": "unlock"
                    },
                    {
                        "id": "extra_blitz_cup",
                        "name": "Extra Blitz-Cup",
                        "tracks": [
                            "SNES Bowsers Festung 2",
                            "SNES Marios Piste 3",
                            "SNES Koopa-Strand 1",
                            "SNES Schoko-Insel 2"
                        ],
                        "source": "unlock"
                    },
                    {
                        "id": "extra_stern_cup",
                        "name": "Extra Stern-Cup",
                        "tracks": [
                            "SNES Vanille-See 1",
                            "SNES Bowsers Festung 3",
                            "SNES Marios Piste 4",
                            "SNES Donut-Ebene 3"
                        ],
                        "source": "unlock"
                    },
                    {
                        "id": "extra_spezial_cup",
                        "name": "Extra Spezial-Cup",
                        "tracks": [
                            "SNES Koopa-Strand 2",
                            "SNES Geistertal 3",
                            "SNES Vanille-See 2",
                            "SNES Regenbogen-Boulevard"
                        ],
                        "source": "unlock"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle freigeschalteten Rennstrecken."
            },
            {
                "id": "quick_run",
                "name": "Quick Run",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Einzelne freigeschaltete Rennstrecken."
            },
            {
                "id": "versus",
                "name": "VS",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Einzelne freigeschaltete Rennstrecken."
            },
            {
                "id": "battle",
                "name": "Battle Mode",
                "cups": [
                    {
                        "id": "battle_kurse",
                        "name": "Battle-Kurse",
                        "tracks": [
                            "Battle-Kurs 1",
                            "Battle-Kurs 2",
                            "Battle-Kurs 3",
                            "Battle-Kurs 4"
                        ],
                        "source": "base"
                    }
                ]
            }
        ]
    },
    {
        "id": "gc",
        "name": "GameCube",
        "game": "Mario Kart: Double Dash!! (2003)",
        "emoji": "🟣",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Luigis Piste",
                            "Peach-Strand",
                            "Baby-Park",
                            "Staubtrockene Wüste"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Pilz-Brücke",
                            "Marios Piste",
                            "Daisys Dampfer",
                            "Waluigi-Arena"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Sorbet-Land",
                            "Pilz-City",
                            "Yoshis Piste",
                            "DK Bergland"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Wario-Kolosseum",
                            "Dinodino-Dschungel",
                            "Bowsers Festung",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "unlock"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle 16 Rennstrecken."
            },
            {
                "id": "versus",
                "name": "Versus",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle freigeschalteten Rennstrecken."
            },
            {
                "id": "all_cup_tour",
                "name": "All-Cup-Tour",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Fährt alle 16 Rennstrecken in einer Tour."
            },
            {
                "id": "battle",
                "name": "Battle Mode",
                "cups": [
                    {
                        "id": "battle_kurse",
                        "name": "Battle-Kurse",
                        "tracks": [
                            "Keks-Land",
                            "Block-City",
                            "Nintendo GameCube",
                            "Röhren-Platz",
                            "Luigis Villa",
                            "Auf der Kippe"
                        ],
                        "source": "base"
                    }
                ],
                "note": "Modi: Ballonbalgerei und Bomben-Raserei."
            }
        ]
    },
    {
        "id": "ds",
        "name": "DS",
        "game": "Mario Kart DS (2005)",
        "emoji": "💿",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Achterpiste",
                            "Yoshi-Kaskaden",
                            "Cheep-Cheep-Strand",
                            "Luigis Villa"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Glühheiße Wüste",
                            "Piazzale Delfino",
                            "Waluigi-Flipper",
                            "Pilz-Pass"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "DK Alpin",
                            "Ticktack-Trauma",
                            "Marios Piste",
                            "Fliegende Festung"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Wario-Arena",
                            "Peachs Schlossgarten",
                            "Bowsers Festung",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "panzer_cup",
                        "name": "Panzer-Cup",
                        "tracks": [
                            "SNES Marios Piste 1",
                            "N64 Kuhmuh-Farm",
                            "GBA Peachs Piste",
                            "GCN Luigis Piste"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "bananen_cup",
                        "name": "Bananen-Cup",
                        "tracks": [
                            "SNES Donut-Ebene 1",
                            "N64 Polar-Parcours",
                            "GBA Bowsers Festung 2",
                            "GCN Baby-Park"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blatt_cup",
                        "name": "Blatt-Cup",
                        "tracks": [
                            "SNES Koopa-Strand 2",
                            "N64 Schoko-Sumpf",
                            "GBA Luigis Piste",
                            "GCN Pilz-Brücke"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blitz_cup",
                        "name": "Blitz-Cup",
                        "tracks": [
                            "SNES Schoko-Insel 2",
                            "N64 Spukpfad",
                            "GBA Wolkenpiste",
                            "GCN Yoshis Piste"
                        ],
                        "source": "base"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle 32 Rennstrecken."
            },
            {
                "id": "versus",
                "name": "Versus",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle freigeschalteten Rennstrecken."
            },
            {
                "id": "rennmissionen",
                "name": "Rennmissionen",
                "note": "Ausgewählte Strecken aus Nitro- und Retro-Cups."
            },
            {
                "id": "battle",
                "name": "Battle Mode / Wettkampf",
                "cups": [
                    {
                        "id": "battle_kurse",
                        "name": "Battle-Kurse",
                        "tracks": [
                            "Nintendo DS",
                            "Dämmerhaus",
                            "Palmenstrand",
                            "Tortenplatz",
                            "Block-Fort",
                            "Röhren-Platz"
                        ],
                        "source": "base"
                    }
                ],
                "note": "Modi: Ballonbalgerei und Insignienraser."
            }
        ]
    },
    {
        "id": "wii",
        "name": "Wii",
        "game": "Mario Kart Wii (2008)",
        "emoji": "⚪",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Luigis Piste",
                            "Kuhmuh-Weide",
                            "Pilz-Schlucht",
                            "Toads Fabrik"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Marios Piste",
                            "Kokos-Promenade",
                            "DK Skikane",
                            "Warios Goldmine"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Daisys Piste",
                            "Koopa-Kap",
                            "Blätterwald",
                            "Vulkangrollen"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Staubtrockene Ruinen",
                            "Mondblickstraße",
                            "Bowsers Festung",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "panzer_cup",
                        "name": "Panzer-Cup",
                        "tracks": [
                            "GCN Peach-Strand",
                            "DS Yoshi-Kaskaden",
                            "SNES Geistertal 2",
                            "N64 Marios Rennpiste"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "bananen_cup",
                        "name": "Bananen-Cup",
                        "tracks": [
                            "N64 Sorbet-Land",
                            "GBA Shy Guy-Strand",
                            "DS Piazzale Delfino",
                            "GCN Waluigi-Arena"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blatt_cup",
                        "name": "Blatt-Cup",
                        "tracks": [
                            "DS Glühheiße Wüste",
                            "GBA Bowsers Festung 3",
                            "N64 DKs Dschungelpark",
                            "GCN Marios Piste"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blitz_cup",
                        "name": "Blitz-Cup",
                        "tracks": [
                            "SNES Marios Piste 3",
                            "DS Peachs Schlossgarten",
                            "GCN DK Bergland",
                            "N64 Bowsers Festung"
                        ],
                        "source": "base"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle 32 Rennstrecken."
            },
            {
                "id": "versus",
                "name": "Versus-Rennen",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle 32 Rennstrecken."
            },
            {
                "id": "battle",
                "name": "Battle Mode / Wettkampf",
                "cups": [
                    {
                        "id": "battle_kurse",
                        "name": "Battle-Kurse",
                        "tracks": [
                            "Block-Plaza",
                            "Delfino-Pier",
                            "Funky-Stadion",
                            "Kettenhund-Roulette",
                            "Wüstenpalast",
                            "SNES Battle-Kurs 4",
                            "GBA Battle-Kurs 3",
                            "N64 Wolkenkratzer",
                            "GCN Keks-Land",
                            "DS Dämmerhaus"
                        ],
                        "source": "base"
                    }
                ],
                "note": "Modi: Ballonbalgerei und Münzjagd."
            }
        ]
    },
    {
        "id": "3ds",
        "name": "3DS",
        "game": "Mario Kart 7 (2011)",
        "emoji": "🔷",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Toads Piste",
                            "Daisy-Hügel",
                            "Cheep-Cheep-Bucht",
                            "Shy Guys Basar"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Wuhu-Rundfahrt",
                            "Marios Piste",
                            "Musikpark",
                            "Gebirgspfad"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Röhrenraserei",
                            "Warios Galeonenwrack",
                            "Koopa-Großstadtfieber",
                            "Wuhu-Bergland"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "DK Dschungel",
                            "Rosalinas Eiswelt",
                            "Bowsers Festung",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "panzer_cup",
                        "name": "Panzer-Cup",
                        "tracks": [
                            "N64 Luigis Rennpiste",
                            "GBA Bowsers Festung 1",
                            "Wii Pilz-Schlucht",
                            "DS Luigis Villa"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "bananen_cup",
                        "name": "Bananen-Cup",
                        "tracks": [
                            "N64 Koopa-Strand",
                            "SNES Marios Piste 2",
                            "Wii Kokos-Promenade",
                            "DS Waluigi-Flipper"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blatt_cup",
                        "name": "Blatt-Cup",
                        "tracks": [
                            "N64 Kalimari-Wüste",
                            "DS DK Alpin",
                            "GCN Daisys Dampfer",
                            "Wii Blätterwald"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blitz_cup",
                        "name": "Blitz-Cup",
                        "tracks": [
                            "Wii Koopa-Kap",
                            "GCN Dinodino-Dschungel",
                            "DS Fliegende Festung",
                            "SNES Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle 32 Rennstrecken."
            },
            {
                "id": "versus",
                "name": "Mehrspieler / Online-Rennen",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle freigeschalteten Rennstrecken."
            },
            {
                "id": "battle",
                "name": "Battle Mode / Wettkampf",
                "cups": [
                    {
                        "id": "battle_kurse",
                        "name": "Battle-Kurse",
                        "tracks": [
                            "Bienenstock",
                            "Eisbahn",
                            "Wuhu-Stadt",
                            "GBA Battle-Kurs 1",
                            "N64 Big Donut",
                            "DS Palmenstrand"
                        ],
                        "source": "base"
                    }
                ],
                "note": "Modi: Ballonbalgerei und Münzjagd."
            }
        ]
    },
    {
        "id": "wiiu",
        "name": "Wii U",
        "game": "Mario Kart 8 (2014)",
        "emoji": "🔵",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Mario Kart-Stadion",
                            "Wasserpark",
                            "Zuckersüßer Canyon",
                            "Steinblock-Ruinen"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Marios Piste",
                            "Toads Hafenstadt",
                            "Verdrehtes Herrenhaus",
                            "Shy Guys Wasserfälle"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Sonnenflughafen",
                            "Delfinlagune",
                            "Discodrom",
                            "Wario-Abfahrt"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Wolkenstraße",
                            "Knochentrockene Dünen",
                            "Bowsers Festung",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "panzer_cup",
                        "name": "Panzer-Cup",
                        "tracks": [
                            "Wii Kuhmuh-Weide",
                            "GBA Marios Piste",
                            "DS Cheep-Cheep-Strand",
                            "N64 Toads Autobahn"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "bananen_cup",
                        "name": "Bananen-Cup",
                        "tracks": [
                            "GCN Staubtrockene Wüste",
                            "SNES Donut-Ebene 3",
                            "N64 Königliche Rennpiste",
                            "3DS DK Dschungel"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blatt_cup",
                        "name": "Blatt-Cup",
                        "tracks": [
                            "DS Wario-Arena",
                            "GCN Sorbet-Land",
                            "3DS Musikpark",
                            "N64 Yoshi-Tal"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blitz_cup",
                        "name": "Blitz-Cup",
                        "tracks": [
                            "DS Ticktack-Trauma",
                            "3DS Röhrenraserei",
                            "Wii Vulkangrollen",
                            "N64 Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "ei_cup",
                        "name": "Ei-Cup",
                        "tracks": [
                            "GCN Yoshis Piste",
                            "Excitebike-Stadion",
                            "Große Drachenmauer",
                            "Mute City"
                        ],
                        "source": "dlc"
                    },
                    {
                        "id": "triforce_cup",
                        "name": "Triforce-Cup",
                        "tracks": [
                            "Wii Warios Goldmine",
                            "SNES Regenbogen-Boulevard",
                            "Eis-Eis-Außenposten",
                            "Hyrule-Piste"
                        ],
                        "source": "dlc"
                    },
                    {
                        "id": "crossing_cup",
                        "name": "Crossing-Cup",
                        "tracks": [
                            "GCN Baby-Park",
                            "GBA Käseland",
                            "Wilder Wipfelweg",
                            "Animal Crossing"
                        ],
                        "source": "dlc"
                    },
                    {
                        "id": "glocken_cup",
                        "name": "Glocken-Cup",
                        "tracks": [
                            "3DS Koopa-Großstadtfieber",
                            "GBA Party-Straße",
                            "Marios Metro",
                            "Big Blue"
                        ],
                        "source": "dlc"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle Rennstrecken aus Basis- und DLC-Cups."
            },
            {
                "id": "versus",
                "name": "Versus-Rennen",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle Rennstrecken aus Basis- und DLC-Cups."
            },
            {
                "id": "battle",
                "name": "Wettkampf",
                "cups": [
                    {
                        "id": "battle_strecken",
                        "name": "Battle-Strecken",
                        "tracks": [
                            "Kuhmuh-Weide",
                            "Staubtrockene Wüste",
                            "Donut-Ebene 3",
                            "Toads Autobahn",
                            "Marios Piste",
                            "Toads Hafenstadt",
                            "Sorbet-Land",
                            "Yoshi-Tal"
                        ],
                        "source": "base"
                    }
                ],
                "note": "In Mario Kart 8 Wii U findet der Battle-Modus auf umgebauten Rennstrecken statt."
            }
        ]
    },
    {
        "id": "switch",
        "name": "Switch",
        "game": "Mario Kart 8 Deluxe (2017)",
        "emoji": "🔴",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Mario Kart-Stadion",
                            "Wasserpark",
                            "Zuckersüßer Canyon",
                            "Steinblock-Ruinen"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Marios Piste",
                            "Toads Hafenstadt",
                            "Verdrehtes Herrenhaus",
                            "Shy Guys Wasserfälle"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "Sonnenflughafen",
                            "Delfinlagune",
                            "Discodrom",
                            "Wario-Abfahrt"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Wolkenstraße",
                            "Knochentrockene Dünen",
                            "Bowsers Festung",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "panzer_cup",
                        "name": "Panzer-Cup",
                        "tracks": [
                            "Wii Kuhmuh-Weide",
                            "GBA Marios Piste",
                            "DS Cheep-Cheep-Strand",
                            "N64 Toads Autobahn"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "bananen_cup",
                        "name": "Bananen-Cup",
                        "tracks": [
                            "GCN Staubtrockene Wüste",
                            "SNES Donut-Ebene 3",
                            "N64 Königliche Rennpiste",
                            "3DS DK Dschungel"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blatt_cup",
                        "name": "Blatt-Cup",
                        "tracks": [
                            "DS Wario-Arena",
                            "GCN Sorbet-Land",
                            "3DS Musikpark",
                            "N64 Yoshi-Tal"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blitz_cup",
                        "name": "Blitz-Cup",
                        "tracks": [
                            "DS Ticktack-Trauma",
                            "3DS Röhrenraserei",
                            "Wii Vulkangrollen",
                            "N64 Regenbogen-Boulevard"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "ei_cup",
                        "name": "Ei-Cup",
                        "tracks": [
                            "GCN Yoshis Piste",
                            "Excitebike-Stadion",
                            "Große Drachenmauer",
                            "Mute City"
                        ],
                        "source": "dlc"
                    },
                    {
                        "id": "triforce_cup",
                        "name": "Triforce-Cup",
                        "tracks": [
                            "Wii Warios Goldmine",
                            "SNES Regenbogen-Boulevard",
                            "Eis-Eis-Außenposten",
                            "Hyrule-Piste"
                        ],
                        "source": "dlc"
                    },
                    {
                        "id": "crossing_cup",
                        "name": "Crossing-Cup",
                        "tracks": [
                            "GCN Baby-Park",
                            "GBA Käseland",
                            "Wilder Wipfelweg",
                            "Animal Crossing"
                        ],
                        "source": "dlc"
                    },
                    {
                        "id": "glocken_cup",
                        "name": "Glocken-Cup",
                        "tracks": [
                            "3DS Koopa-Großstadtfieber",
                            "GBA Party-Straße",
                            "Marios Metro",
                            "Big Blue"
                        ],
                        "source": "dlc"
                    },
                    {
                        "id": "goldener_turbo_cup",
                        "name": "Goldener-Turbo-Cup",
                        "tracks": [
                            "Paris-Parcours",
                            "Toads Piste",
                            "Schoko-Sumpf",
                            "Kokos-Promenade"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "glueckskatzen_cup",
                        "name": "Glückskatzen-Cup",
                        "tracks": [
                            "Tokio-Tempotour",
                            "Pilz-Pass",
                            "Wolkenpiste",
                            "Ninja-Dojo"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "rueben_cup",
                        "name": "Rüben-Cup",
                        "tracks": [
                            "New-York-Speedway",
                            "Marios Piste 3",
                            "Kalimari-Wüste",
                            "Waluigi-Flipper"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "propeller_cup",
                        "name": "Propeller-Cup",
                        "tracks": [
                            "Sydney-Spritztour",
                            "Schneeland",
                            "Pilz-Schlucht",
                            "Eiscreme-Eskapade"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "fels_cup",
                        "name": "Fels-Cup",
                        "tracks": [
                            "London-Tour",
                            "Buu-Huu-Tal",
                            "Gebirgspfad",
                            "Blätterwald"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "mond_cup",
                        "name": "Mond-Cup",
                        "tracks": [
                            "Pflaster von Berlin",
                            "Peachs Schlossgarten",
                            "Bergbescherung",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "frucht_cup",
                        "name": "Frucht-Cup",
                        "tracks": [
                            "Ausfahrt Amsterdam",
                            "Flussufer-Park",
                            "DK Skikane",
                            "Yoshis Eiland"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "bumerang_cup",
                        "name": "Bumerang-Cup",
                        "tracks": [
                            "Bangkok-Abendrot",
                            "Marios Piste",
                            "Waluigi-Arena",
                            "Überholspur Singapur"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "feder_cup",
                        "name": "Feder-Cup",
                        "tracks": [
                            "Athen auf Abwegen",
                            "Daisys Dampfer",
                            "Mondblickstraße",
                            "Bad-Parcours"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "doppelkirschen_cup",
                        "name": "Doppelkirschen-Cup",
                        "tracks": [
                            "Los-Angeles-Strandpartie",
                            "Sonnenuntergangs-Wüste",
                            "Koopa-Kap",
                            "Vancouver-Wildpfad"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "eichel_cup",
                        "name": "Eichel-Cup",
                        "tracks": [
                            "Rom-Rambazamba",
                            "DK-Bergland",
                            "Daisys Piste",
                            "Piranha-Pflanzen-Bucht"
                        ],
                        "source": "pass"
                    },
                    {
                        "id": "stachi_cup",
                        "name": "Stachi-Cup",
                        "tracks": [
                            "Stadtrundfahrt Madrid",
                            "Rosalinas Eisplanet",
                            "Bowsers Festung 3",
                            "Regenbogen-Boulevard"
                        ],
                        "source": "pass"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle Rennstrecken aus Basis-, DLC- und Booster-Cups."
            },
            {
                "id": "versus",
                "name": "Versus-Rennen",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle Rennstrecken aus Basis-, DLC- und Booster-Cups."
            },
            {
                "id": "battle",
                "name": "Battle Mode / Schlacht",
                "cups": [
                    {
                        "id": "battle_kurse",
                        "name": "Battle-Kurse",
                        "tracks": [
                            "Kampf-Arena",
                            "Zuckersüßes Schloss",
                            "Drachen-Palast",
                            "Mondkolonie",
                            "Wuhu-Stadt",
                            "Luigis Villa",
                            "SNES Kampfkurs 1",
                            "Dekabahnstation"
                        ],
                        "source": "base"
                    }
                ],
                "note": "Schlacht-Modi: Ballonschlacht, Räuber und Gendarm, Bob-omb-Wurf, Münzjäger, Insignien-Diebstahl."
            }
        ]
    },
    {
        "id": "tour",
        "name": "Tour",
        "game": "Mario Kart Tour (2019)",
        "emoji": "📱",
        "modes": [
            {
                "id": "touren",
                "name": "Touren & Cups",
                "note": "Kein dauerhaft festes Cup-Strecken-Schema. Touren rotieren; jede Tour besteht aus mehreren Cups mit je 3 Strecken plus Bonus-Herausforderung. Originalstrecken u. a.: New-York-Speedway, Tokio-Tempotour, Paris-Parcours, London-Tour, Vancouver-Wildpfad, Los-Angeles-Strandpartie, Pflaster von Berlin, Sydney-Spritztour, Überholspur Singapur, Ausfahrt Amsterdam, Bangkok-Abendrot, Athen auf Abwegen, Rom-Rambazamba, Stadtrundfahrt Madrid."
            },
            {
                "id": "rennen",
                "name": "Rennen",
                "note": "Aktuelle Strecken der laufenden Tour."
            },
            {
                "id": "zeitrennen",
                "name": "Zeitrennen",
                "note": "Aktuelle Strecken der laufenden Tour."
            },
            {
                "id": "mehrspieler",
                "name": "Mehrspieler",
                "note": "Aktuelle Strecken der laufenden Tour."
            },
            {
                "id": "battle",
                "name": "Battle Mode",
                "note": "Ballonbalgerei auf ausgewählten Battle-Kursen innerhalb aktiver Touren."
            }
        ]
    },
    {
        "id": "switch2",
        "name": "Switch 2",
        "game": "Mario Kart World (2025)",
        "emoji": "🟡",
        "modes": [
            {
                "id": "grand_prix",
                "name": "Grand Prix",
                "cups": [
                    {
                        "id": "pilz_cup",
                        "name": "Pilz-Cup",
                        "tracks": [
                            "Mario Bros.-Piste",
                            "Kronen-Metropole",
                            "Whistlestop Summit",
                            "DK Spaceport"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blumen_cup",
                        "name": "Blumen-Cup",
                        "tracks": [
                            "Staubtrockene Hügel",
                            "Shy Guys Basar",
                            "Wario-Stadion",
                            "Fliegende Festung"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "stern_cup",
                        "name": "Stern-Cup",
                        "tracks": [
                            "DK Alpin",
                            "Starview Peak",
                            "Sky-High Sundae",
                            "Warios Galeonenwrack"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "panzer_cup",
                        "name": "Panzer-Cup",
                        "tracks": [
                            "Koopa-Strand",
                            "Faraway Oasis",
                            "Kronen-Metropole",
                            "Peach-Stadion"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "bananen_cup",
                        "name": "Bananen-Cup",
                        "tracks": [
                            "Peach-Strand",
                            "Salty Salty Speedway",
                            "Dinodino-Dschungel",
                            "Great ?-Block Ruins"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blatt_cup",
                        "name": "Blatt-Cup",
                        "tracks": [
                            "Cheep Cheep Falls",
                            "Löwenzahn-Tiefe",
                            "Boo Cinema",
                            "Dry Bones Burnout"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "blitz_cup",
                        "name": "Blitz-Cup",
                        "tracks": [
                            "Kuhmuh-Weide",
                            "Schoko-Sumpf",
                            "Toads Fabrik",
                            "Bowsers Festung"
                        ],
                        "source": "base"
                    },
                    {
                        "id": "spezial_cup",
                        "name": "Spezial-Cup",
                        "tracks": [
                            "Eichhörnchenhöhe",
                            "Marios Piste",
                            "Peach-Stadion",
                            "Regenbogenstraße"
                        ],
                        "source": "unlock"
                    }
                ]
            },
            {
                "id": "zeitfahren",
                "name": "Zeitfahren",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle Rennstrecken."
            },
            {
                "id": "versus",
                "name": "Versus",
                "refModeIds": [
                    "grand_prix"
                ],
                "note": "Nutzt alle Rennstrecken."
            },
            {
                "id": "ko_tour",
                "name": "K.O.-Tour",
                "routes": [
                    {
                        "id": "gold_rallye",
                        "name": "Gold-Rallye",
                        "tracks": [
                            "Staubtrockene Hügel",
                            "Mario Bros.-Piste",
                            "Choco Mountain",
                            "Kuhmuh-Weide",
                            "Mario Circuit",
                            "Acorn Heights"
                        ]
                    },
                    {
                        "id": "eis_rallye",
                        "name": "Eis-Rallye",
                        "tracks": [
                            "Sky-High Sundae",
                            "Starview Peak",
                            "Löwenzahn-Tiefe",
                            "Cheep Cheep Falls",
                            "Peach-Stadion",
                            "Crown City"
                        ]
                    },
                    {
                        "id": "mond_rallye",
                        "name": "Mond-Rallye",
                        "tracks": [
                            "Bowsers Festung",
                            "Toads Fabrik",
                            "Kuhmuh-Weide",
                            "Löwenzahn-Tiefe",
                            "Cheep Cheep Falls",
                            "Faraway Oasis"
                        ]
                    },
                    {
                        "id": "stachel_rallye",
                        "name": "Stachel-Rallye",
                        "tracks": [
                            "Boo Cinema",
                            "Starview Peak",
                            "DK Pass",
                            "Salty Salty Speedway",
                            "Peach-Strand",
                            "Wario Shipyard"
                        ]
                    },
                    {
                        "id": "kirsch_rallye",
                        "name": "Kirsch-Rallye",
                        "tracks": [
                            "Peach-Strand",
                            "Dinodino-Dschungel",
                            "Koopa-Strand",
                            "DK Spaceport",
                            "Whistlestop Summit",
                            "Staubtrockene Hügel"
                        ]
                    },
                    {
                        "id": "eichel_rallye",
                        "name": "Eichel-Rallye",
                        "tracks": [
                            "Toads Fabrik",
                            "Wario-Stadion",
                            "Choco Mountain",
                            "Peach-Stadion",
                            "Cheep Cheep Falls",
                            "DK Pass"
                        ]
                    },
                    {
                        "id": "wolken_rallye",
                        "name": "Wolken-Rallye",
                        "tracks": [
                            "Fliegende Festung",
                            "Shy Guys Basar",
                            "Mario Bros.-Piste",
                            "Crown City",
                            "Faraway Oasis",
                            "Great ?-Block Ruins"
                        ]
                    },
                    {
                        "id": "herz_rallye",
                        "name": "Herz-Rallye",
                        "tracks": [
                            "Shy Guys Basar",
                            "Fliegende Festung",
                            "Dry Bones Burnout",
                            "Mario Circuit",
                            "Kuhmuh-Weide",
                            "Peach-Stadion"
                        ]
                    }
                ],
                "note": "Eigener Rallye-Modus mit acht festen K.O.-Tour-Verläufen und klarer, separater Zuordnung."
            },

            {
                "id": "battle",
                "name": "Battle Mode",
                "cups": [
                    {
                        "id": "battle_kurse",
                        "name": "Battle-Kurse",
                        "tracks": [
                            "Mario Bros.-Piste",
                            "Kuhmuh-Weide",
                            "Peach-Stadion",
                            "Salty Salty Speedway",
                            "Chain Chomp Desert",
                            "Dinodino-Dschungel",
                            "Big Donut",
                            "DK Alpin"
                        ],
                        "source": "base"
                    }
                ]
            },
            {
                "id": "freies_fahren",
                "name": "Freies Fahren",
                "note": "Offene Spielwelt, kein festes Strecken-Cup-Schema."
            }
        ]
    }
];
const DEFAULT_MODE_DESCRIPTORS = {
    "snes": [
        {
            "id": "snes_gp",
            "name": "Grand Prix",
            "desc": "Cup-Auswahl im Modus Grand Prix.",
            "af": [
                "1v1"
            ],
            "sf": "1v1",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "route"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "snes_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen freigeschalteten Rennstrecken.",
            "af": [
                "1v1"
            ],
            "sf": "1v1",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "snes_race",
            "name": "2-Spieler-Rennen",
            "desc": "Direkte Rennen auf allen freigeschalteten Rennstrecken.",
            "af": [
                "1v1"
            ],
            "sf": "1v1",
            "rounds": 2,
            "enabled": true,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "snes_battle",
            "name": "Battle Mode",
            "desc": "Ballonschlacht in den vier Battle-Arenen.",
            "af": [
                "1v1"
            ],
            "sf": "1v1",
            "rounds": 1,
            "enabled": true,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "n64": [
        {
            "id": "n64_gp",
            "name": "Grand Prix",
            "desc": "Cup-Auswahl mit allen vier Cups.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "n64_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen 16 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "n64_race",
            "name": "Versus",
            "desc": "Freie Streckenwahl auf allen 16 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 2,
            "enabled": true,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "n64_battle",
            "name": "Battle Mode",
            "desc": "Ballonbalgerei auf vier Battle-Arenen.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": true,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "gba": [
        {
            "id": "gba_gp",
            "name": "Grand Prix",
            "desc": "Reguläre und freigeschaltete Extra-Cups.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gba_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen freigeschalteten Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gba_quick",
            "name": "Quick Run",
            "desc": "Einzelne freigeschaltete Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "quick_run",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gba_vs",
            "name": "VS",
            "desc": "Einzelne freigeschaltete Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gba_battle",
            "name": "Battle Mode",
            "desc": "Battle-Kurse 1 bis 4.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "gc": [
        {
            "id": "gc_gp",
            "name": "Grand Prix",
            "desc": "Cup-Auswahl mit Pilz bis Spezial-Cup.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "2v2",
                "3v3",
                "4x2"
            ],
            "sf": "2v2",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gc_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen 16 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "2v2",
                "3v3",
                "4x2"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gc_race",
            "name": "Versus",
            "desc": "Freie Streckenwahl auf allen freigeschalteten Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "2v2",
                "3v3",
                "4x2"
            ],
            "sf": "2v2",
            "rounds": 2,
            "enabled": true,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gc_allcup",
            "name": "All-Cup-Tour",
            "desc": "Tour über alle 16 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "2v2",
                "3v3",
                "4x2"
            ],
            "sf": "2v2",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "all_cup_tour",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "gc_battle",
            "name": "Ballonbalgerei",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "2v2",
                "3v3",
                "4x2"
            ],
            "sf": "2v2",
            "rounds": 1,
            "enabled": true,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual",
            "scoringModes": [
                "individual",
                "team"
            ]
        },
        {
            "id": "gc_bomb",
            "name": "Bomben-Raserei",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "2v2",
                "3v3",
                "4x2"
            ],
            "sf": "2v2",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual",
            "scoringModes": [
                "individual",
                "team"
            ]
        }
    ],
    "ds": [
        {
            "id": "ds_gp",
            "name": "Grand Prix",
            "desc": "Nitro- und Retro-Cups.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "ds_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen 32 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "ds_race",
            "name": "Versus",
            "desc": "Freie Streckenwahl auf allen freigeschalteten Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 2,
            "enabled": true,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "ds_mission",
            "name": "Rennmissionen",
            "desc": "Ausgewählte Missions-Strecken; primär Einzelmodus.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "2ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "rennmissionen",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "ds_battle",
            "name": "Ballonbalgerei",
            "desc": "Battle-Kurse im Wettkampfmodus.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": true,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "ds_shine",
            "name": "Insignienraser",
            "desc": "Battle-Kurse im Wettkampfmodus.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "wii": [
        {
            "id": "wii_gp",
            "name": "Grand Prix",
            "desc": "Wii- und Retro-Cups.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wii_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen 32 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wii_race",
            "name": "Versus-Rennen",
            "desc": "Freie Streckenwahl auf allen 32 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "4x2"
            ],
            "sf": "4ffa",
            "rounds": 2,
            "enabled": true,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wii_battle",
            "name": "Ballonbalgerei",
            "desc": "Battle-Kurse im Wettkampfmodus.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "4x2"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wii_coin",
            "name": "Münzjagd",
            "desc": "Battle-Kurse im Wettkampfmodus.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "4x2"
            ],
            "sf": "2v2",
            "rounds": 1,
            "enabled": true,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "3ds": [
        {
            "id": "3ds_gp",
            "name": "Grand Prix",
            "desc": "Nitro- und Retro-Cups.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "3ds_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen 32 Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "3ds_race",
            "name": "Mehrspieler / Online-Rennen",
            "desc": "Freie Streckenwahl auf allen freigeschalteten Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "3ds_battle",
            "name": "Ballonbalgerei",
            "desc": "Battle-Kurse im Wettkampfmodus.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "3ds_coin",
            "name": "Münzjagd",
            "desc": "Battle-Kurse im Wettkampfmodus.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "wiiu": [
        {
            "id": "wiiu_gp",
            "name": "Grand Prix",
            "desc": "Basis- und DLC-Cups.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wiiu_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "2ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wiiu_race",
            "name": "Versus-Rennen",
            "desc": "Freie Streckenwahl auf allen Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 2,
            "enabled": true,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wiiu_200",
            "name": "200cc Versus-Rennen",
            "desc": "Versus-Rennen in 200cc.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "wiiu_battle",
            "name": "Wettkampf",
            "desc": "Battle auf den acht umgebauten Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "switch": [
        {
            "id": "sw_gp",
            "name": "Grand Prix",
            "desc": "Basis-, DLC- und Booster-Cups.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung auf allen Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw_race",
            "name": "Versus-Rennen",
            "desc": "Freie Streckenwahl auf allen Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "6ffa",
            "rounds": 2,
            "enabled": true,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw_battle",
            "name": "Ballonschlacht",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw_renegade",
            "name": "Räuber und Gendarm",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4v4",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "team",
            "scoringModes": [
                "team"
            ]
        },
        {
            "id": "sw_bomb",
            "name": "Bob-omb-Wurf",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw_coin",
            "name": "Münzjäger",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw_shine",
            "name": "Insignien-Diebstahl",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "tour": [
        {
            "id": "tour_race",
            "name": "Rennen",
            "desc": "Aktuelle Strecken der laufenden Tour.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "rennen",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "tour_time",
            "name": "Zeitrennen",
            "desc": "Aktuelle Strecken der laufenden Tour.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "zeitrennen",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "tour_multi",
            "name": "Mehrspieler",
            "desc": "Live-Rennen auf aktuellen Strecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "mehrspieler",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "tour_battle",
            "name": "Battle Mode",
            "desc": "Battle-Kurse innerhalb aktiver Touren.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ],
    "switch2": [
        {
            "id": "sw2_gp",
            "name": "Grand Prix",
            "desc": "Cup-Auswahl mit acht Cups und bis zu 24 Fahrern.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "24ffa",
            "rounds": 4,
            "enabled": true,
            "catalogModeId": "grand_prix",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "cup"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw2_time",
            "name": "Zeitfahren",
            "desc": "Bestzeitwertung; pro Fahrer zählt nur die beste Zeit.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": true,
            "catalogModeId": "zeitfahren",
            "timeTrial": true,
            "attempts": 3,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw2_vs",
            "name": "Versus",
            "desc": "Freie Streckenwahl auf allen Rennstrecken.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "8ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "versus",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw2_ko",
            "name": "K.O.-Tour",
            "desc": "Feste Rallye-Verläufe mit sechs Etappen.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "24ffa",
            "rounds": 4,
            "enabled": true,
            "catalogModeId": "ko_tour",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "route"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw2_battle",
            "name": "Ballonbalgerei",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "24ffa",
            "rounds": 4,
            "enabled": true,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw2_bomb",
            "name": "Bob-omb-Blast",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "24ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw2_coin",
            "name": "Münzjagd",
            "desc": "Battle-Kurse im Battle Mode.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "24ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "battle",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        },
        {
            "id": "sw2_roam",
            "name": "Freies Fahren",
            "desc": "Offene Spielwelt ohne feste Wertung.",
            "af": [
                "2ffa",
                "3ffa",
                "4ffa",
                "5ffa",
                "6ffa",
                "8ffa",
                "10ffa",
                "12ffa",
                "16ffa",
                "24ffa",
                "2v2",
                "3v3",
                "4v4",
                "5v5",
                "6v6",
                "8v8",
                "12v12",
                "3x2",
                "4x2",
                "6x2",
                "8x2",
                "12x2",
                "3x3",
                "4x3",
                "8x3",
                "3x4",
                "4x4",
                "4x6"
            ],
            "sf": "4ffa",
            "rounds": 1,
            "enabled": false,
            "catalogModeId": "freies_fahren",
            "timeTrial": false,
            "attempts": 1,
            "drawModes": [
                "track"
            ],
            "scoringMode": "individual"
        }
    ]
};
function cloneCatalogCup(cup) {
    return { ...cup, tracks: [...((cup === null || cup === void 0 ? void 0 : cup.tracks) || [])] };
}
function cloneCatalogRoute(route) {
    return { ...route, tracks: [...((route === null || route === void 0 ? void 0 : route.tracks) || [])] };
}
function getRouteSequenceText(route) {
    const sequence = ((route === null || route === void 0 ? void 0 : route.tracks) || []).map(track => String(track || '').trim()).filter(Boolean);
    if (sequence.length)
        return sequence.join(' → ');
    return String((route === null || route === void 0 ? void 0 : route.text) || '').trim();
}
function cloneCatalogMode(mode) {
    return {
        ...mode,
        refModeIds: [...((mode === null || mode === void 0 ? void 0 : mode.refModeIds) || [])],
        cups: ((mode === null || mode === void 0 ? void 0 : mode.cups) || []).map(cloneCatalogCup),
        routes: ((mode === null || mode === void 0 ? void 0 : mode.routes) || []).map(cloneCatalogRoute)
    };
}
function buildTrackCatalog() {
    return GAME_CATALOG.map(con => ({
        id: con.id,
        name: con.name,
        game: con.game,
        emoji: con.emoji,
        modes: (con.modes || []).map(cloneCatalogMode)
    }));
}
const STRECKEN_DB = buildTrackCatalog();
function buildLegacyTracksIndex(db = STRECKEN_DB) {
    const out = {};
    (db || []).forEach(con => {
        const seen = new Set();
        const tracks = [];
        (con.modes || []).forEach(mode => {
            (mode.cups || []).forEach(cup => {
                (cup.tracks || []).forEach(track => {
                    const name = String(track || '').trim();
                    if (!name || seen.has(name))
                        return;
                    seen.add(name);
                    tracks.push(name);
                });
            });
            (mode.routes || []).forEach(route => {
                (route.tracks || []).forEach(track => {
                    const name = String(track || '').trim();
                    if (!name || seen.has(name))
                        return;
                    seen.add(name);
                    tracks.push(name);
                });
            });
        });
        out[String(con.id)] = { id: String(con.id), name: String(con.name || con.id || ''), tracks };
    });
    return out;
}
const TRACKS = buildLegacyTracksIndex();
function findCatalogConsole(consoleId) {
    return STRECKEN_DB.find(con => String(con.id) === String(consoleId)) || null;
}
function resolveCatalogMode(consoleId, modeLike) {
    const con = typeof consoleId === 'object' && consoleId ? consoleId : findCatalogConsole(consoleId);
    if (!con)
        return null;
    const requestedId = typeof modeLike === 'string'
        ? String(modeLike)
        : String((modeLike === null || modeLike === void 0 ? void 0 : modeLike.catalogModeId) || (modeLike === null || modeLike === void 0 ? void 0 : modeLike.modeCatalogId) || (modeLike === null || modeLike === void 0 ? void 0 : modeLike.modeId) || (modeLike === null || modeLike === void 0 ? void 0 : modeLike.id) || '');
    if (requestedId) {
        const exact = con.modes.find(mode => String(mode.id) === requestedId);
        if (exact)
            return exact;
    }
    const text = `${requestedId} ${typeof modeLike === 'string' ? modeLike : ((modeLike === null || modeLike === void 0 ? void 0 : modeLike.name) || (modeLike === null || modeLike === void 0 ? void 0 : modeLike.modeName) || '')}`.toLowerCase();
    if (/grand prix|\bgp\b/.test(text))
        return con.modes.find(mode => mode.id === 'grand_prix') || null;
    if (/zeit|time trial/.test(text))
        return con.modes.find(mode => mode.id === 'zeitfahren' || mode.id === 'zeitrennen') || null;
    if (/ko|k\.o\.|knockout|rally/.test(text))
        return con.modes.find(mode => mode.id === 'ko_tour') || null;
    if (/battle|ballon|m[üu]nz|bomb|bob|shine|insignien|renegade|schlacht/.test(text))
        return con.modes.find(mode => mode.id === 'battle') || null;
    if (/versus|vs/.test(text))
        return con.modes.find(mode => mode.id === 'versus') || null;
    return con.modes[0] || null;
}
function getCatalogModeAllCups(consoleId, modeLike, visited = new Set()) {
    const con = typeof consoleId === 'object' && consoleId ? consoleId : findCatalogConsole(consoleId);
    const mode = resolveCatalogMode(con, modeLike);
    if (!con || !mode)
        return [];
    const key = `${con.id}:${mode.id}`;
    if (visited.has(key))
        return [];
    visited.add(key);
    const ownCups = ((mode && mode.cups) || []).map(cup => ({ ...cloneCatalogCup(cup), __modeId: mode.id }));
    const refCups = ((mode && mode.refModeIds) || []).flatMap(refId => getCatalogModeAllCups(con, refId, visited));
    const merged = [...ownCups, ...refCups];
    const seen = new Set();
    return merged.filter(cup => {
        const id = `${cup.id}|${cup.name}`;
        if (seen.has(id))
            return false;
        seen.add(id);
        return true;
    });
}
function getCatalogModeRoutes(consoleId, modeLike) {
    const con = typeof consoleId === 'object' && consoleId ? consoleId : findCatalogConsole(consoleId);
    const mode = resolveCatalogMode(con, modeLike);
    if (!mode)
        return [];
    return ((mode.routes || []).map(cloneCatalogRoute));
}
function collectCatalogTrackKeys(db = STRECKEN_DB) {
    const keys = [];
    (db || []).forEach(con => {
        (con.modes || []).forEach(mode => {
            ((mode.cups || [])).forEach(cup => {
                (cup.tracks || []).forEach(track => {
                    keys.push(`${con.id}.${mode.id}.${cup.id}.${track}`);
                });
            });
        });
    });
    return keys;
}
function buildDefaultTrackEnabledMap() {
    const enabled = {};
    collectCatalogTrackKeys().forEach(key => {
        enabled[key] = true;
    });
    return enabled;
}
function normalizeTrackEnabledMap(map) {
    const defaults = buildDefaultTrackEnabledMap();
    const next = { ...defaults };
    Object.keys(map || {}).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(next, key))
            next[key] = map[key] !== false;
    });
    return next;
}
const CONSOLE_YEARS = { 'snes': 1992, 'n64': 1997, 'gba': 2001, 'gc': 2003, 'ds': 2005, 'wii': 2008, '3ds': 2011, 'wiiu': 2014, 'switch': 2017, 'tour': 2019, 'switch2': 2025 };
function normalizeCatalogKey(text = '') { return String(text || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function consoleYearForName(name = '', consoles = []) {
    const target = normalizeCatalogKey(name);
    const direct = (consoles || []).find(con => normalizeCatalogKey(con === null || con === void 0 ? void 0 : con.name) === target);
    if (direct && CONSOLE_YEARS[direct.id] != null)
        return CONSOLE_YEARS[direct.id];
    const fallback = (GAME_CATALOG || []).find(con => normalizeCatalogKey(con === null || con === void 0 ? void 0 : con.name) === target);
    if (fallback && CONSOLE_YEARS[fallback.id] != null)
        return CONSOLE_YEARS[fallback.id];
    const byId = Object.keys(CONSOLE_YEARS).find(id => target === normalizeCatalogKey(id) || target.includes(normalizeCatalogKey(id)));
    return byId ? CONSOLE_YEARS[byId] : 9999;
}


export {
  CUP_UNLOCK_HINTS,
  getCupUnlockHint,
  GAME_CATALOG,
  DEFAULT_MODE_DESCRIPTORS,
  cloneCatalogCup,
  cloneCatalogRoute,
  getRouteSequenceText,
  cloneCatalogMode,
  buildTrackCatalog,
  STRECKEN_DB,
  buildLegacyTracksIndex,
  TRACKS,
  findCatalogConsole,
  resolveCatalogMode,
  getCatalogModeAllCups,
  getCatalogModeRoutes,
  collectCatalogTrackKeys,
  buildDefaultTrackEnabledMap,
  normalizeTrackEnabledMap,
  CONSOLE_YEARS,
  normalizeCatalogKey,
  consoleYearForName,
};
