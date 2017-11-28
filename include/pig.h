// pig.h π∞÷Ì÷ß≥÷
// Written by Xiang Tu <tu@uwalpha.uwinnipeg.ca>

#ifndef _PIG_H
#define _PIG_H

#define PIG_RULES	"/doc/help/pig_rules"
#define PIG_COMMANDS	"/doc/help/pig_cmds"

#define SPADE	0
#define HEART	1
#define DIAMOND	2
#define CLUB	3

#define SPIG 	10
#define HACE	25
#define DSHEEP	35
#define CTRANS	47

#define BID_SPIG	1
#define BID_HACE	2
#define BID_DSHEEP	4
#define BID_CTRANS	8

#define PIG_INITTING	0
#define PIG_DEALING	1
#define PIG_BIDDING	2
#define PIG_PLAYING	3
#define PIG_SCORING	4

#define SUIT(x)		x / 13
#define RANK(x)		x % 13

#endif
