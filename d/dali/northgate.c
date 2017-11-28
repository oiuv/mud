inherit ROOM;

void create()
{
	set("short", "北门");
	set("long", @LONG
阳苜咩城，或简称苜咩城，是大理国的都城。自南诏于初创，历
经陈氏“长大和国”、赵氏“大天兴国”、杨氏“大义宁国”诸代而
至当今的段氏的“大理国”，均以此城为都。此处乃是北城门，以梅
"溪为护河，城墙建在溪南，由石块和土垒成，高二丈五，厚达二丈，
门上有重楼，驻有了哨。青石官道从城里直向北延伸，另有一条黄土
大路向西通去。
LONG);
	set("objects", ([
                __DIR__"npc/bing": 4,
                __DIR__"npc/jiang": 1,
                "/clone/npc/walker" : 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    "south"     : __DIR__"paifang",
	    "north"     : __DIR__"dalinorth",
	    "east"      : __DIR__"chahuashan1",
	    "west"      : __DIR__"shanlu3",
	]));
	setup();
	replace_program(ROOM);
}

