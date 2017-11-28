inherit ROOM;
 
void create()
{
        set("short", "花园小径");
        set("long",@LONG
这里风雷堂中的小花园，你走这里，只觉得草地西边似乎
香气四逸，东边好象是另一个花园。
LONG);
        set("exits", ([
            	"west"  : __DIR__"chufang1",
            	"east"  : __DIR__"hua1",
             	"north" :__DIR__"dating1",
             	"south" :__DIR__"grass1",
        ]));
        set("objects", ([
                __DIR__"npc/shinu" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
