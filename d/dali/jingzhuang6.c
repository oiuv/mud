//Room: /d/dali/jingzhuang6.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","第六层");
	set("long",@LONG
有神龛五座，内中雕有佛像浮雕二百余座。布局严密，层次分明；
表情各异，比例协条；刀痕尤劲，备极精巧；线条流畅，栩栩如生；
不愧是滇南石雕艺术的珍品。世代金文家皆赞“滇中艺术，此及品也
”。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "up"    : __DIR__"jingzhuang7",
	    "down"  : __DIR__"jingzhuang5",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

