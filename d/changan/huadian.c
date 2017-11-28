//Room: huadian.c

inherit ROOM;

void create ()
{
        set ("short", "花店");
        set ("long", @LONG
还没进门，你就已经闻到一股清新的花香。店中各种名花，玲琅满
目，不乏珍奇异种。来客不分高低贵贱，这里的主人总是笑脸相迎。许
多城中的小伙子都喜欢在这儿逗留，想挑选一些美丽的鲜花送给心上的
姑娘。
LONG);
        set("exits", 
        ([ //sizeof() == 1
                "south" : __DIR__"huarui3",
        ]));
        set("objects", 
        ([ //sizeof() == 1
                __DIR__"npc/girl" : 1,
        ]));

        setup();
	replace_program(ROOM);
}
