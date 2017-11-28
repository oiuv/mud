// void.c

inherit ROOM;

void create()
{
	set("short","虚空");
	set("long",@LONG
这里就是传说中的无尽虚空，你看到四周白茫茫的一片，什么也没有。
只是脚下有一点亮光，似乎传来熟悉的声音。
LONG
	);

	set("exits", ([
		"down" : "/d/city/zuixianlou",
	]));

        set("no_fight", 1);
        set("no_sleep_room", 1);

	setup();
	replace_program(ROOM);
}
