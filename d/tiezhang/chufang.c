inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
这里是铁掌帮内的厨房。你的正面是一个大炉灶，几乎占去了一大半的
房间。灶上留有很多火眼，可同时做很多种菜。几位帮中的厨子正在来回忙
碌着。整间屋内弥漫着各种饭菜的香味，闻了让人垂涎欲滴。
LONG    );
        set("exits", ([
                "south" : __DIR__"zoulang-3",
        ]));

        set("objects", ([ 
                __DIR__"obj/hsnr" : 2,
                __DIR__"obj/ruzhu" : 1,
                __DIR__"obj/fan" : 2,
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
