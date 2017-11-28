// Room: /qingcheng/chaoyangdong.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "朝阳洞");
	set("long", @LONG
你来到朝阳洞。洞深广数丈，相传是宁封子栖息处。这里也是
观日好去处，“古洞常临光照耀”，正是指旭日东升，霞光透过绿
荫，射到洞口，一片璀灿绚丽的景色。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"westdown"  : __DIR__"zushidian",
		"northup"   : __DIR__"sanwanjiudao",
	]));
	set("objects", ([
		__DIR__"npc/hong" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

