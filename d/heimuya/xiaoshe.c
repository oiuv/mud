//ROOM: xiaoshe.c

inherit ROOM;

void create()
{
	set("short", "小舍");
        set("long", @LONG
这是一间用翠竹搭成的小舍。一进门，便闻到一阵浓烈的花
香，房中挂着一幅仕女图，椅上铺了绣花锦垫，东边有一扇门，
挂着绣了一丛牡丹的锦缎门帏。难道这是谁家姑娘的闺房？
LONG    );
        set("exits", ([
            "east" : __DIR__"neishi",
            "out" :__DIR__"xiaohuayuan",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
