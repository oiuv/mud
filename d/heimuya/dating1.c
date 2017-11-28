inherit ROOM;

void create()
{
        set("short", "堂厅");
        set("long", @LONG
这是日月神教下第一大堂风雷堂的大厅，大厅内非常的宽
敞明亮。四目望去，满朴素的，堂梁上有一副联子。
LONG);
        
        set("exits", ([
            	"south" : __DIR__"grass2",
            	"north" : __DIR__"fenggate",
        ]));
        set("objects",([
            	__DIR__"npc/dizi3" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
