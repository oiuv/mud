inherit ROOM;
 
void create()
{
        set("short", "草地");
        set("long",@LONG
这里风雷堂中的小花园，你走这里，只觉得草地西边似乎
香气四逸，南边不远便是风雷堂的大厅了。
LONG );
        set("exits", ([
            	"south"    : __DIR__"fen0", 
            	"north"    :__DIR__"grass2",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "heimuya");
        setup();
        replace_program(ROOM);
}
