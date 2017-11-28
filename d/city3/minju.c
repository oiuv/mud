inherit ROOM;

void create()
{
        set("short", "废弃的民居");
        set("long", @LONG
这里是一幢破烂的民居，看样子已经被废弃很常一段日子
了，大院内四处残戈断壁，杂草丛生。院子的一个阴暗角落里
还立着一个已快腐烂的书架。
LONG );
        set("exits", ([
            	"out"      : __DIR__"eastroad3",
        ]));

        set("objects", ([
            	__DIR__"obj/shelf" : 1,
        ]));

        set("no_clean_up", 0);
        setup();

        replace_program(ROOM);
}
