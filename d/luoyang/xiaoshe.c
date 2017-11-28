inherit ROOM;

void create()
{
	set("short", "竹林小舍");
	set("long", @LONG
这里是洛阳东城郊绿竹林中的一间小舍，你走进小舍，只见桌椅几榻，
无一而非竹制，墙上悬着一幅墨竹，笔势纵横，墨迹淋漓，颇有森森之意。
桌上放着一具瑶琴，一管洞箫。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"zhulin3",
	]));
        set("objects", ([
                __DIR__"npc/lvzhu" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
