inherit ROOM;

void create()
{
	set("short", "男浴池");
	set("long", @LONG
这里热气腾腾，烟雾袅绕，一切都在朦胧之中，当中好象有个很大的
浴池，一些人正在里面尽情的享受着，微波粼粼，肉光闪动，你睁大眼睛
仔细一看，原来都是些大老爷们，没劲没劲。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
		"west" : __DIR__"rest1",
	]));
        set("objects", ([
                "/d/kaifeng/npc/obj/zaopeng" : 2,
        ]));
	setup();
	replace_program(ROOM);
}
