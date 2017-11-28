inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
你走在一条崎岖的小路上，这里荒无人烟，寒风凛冽。
LONG);
        set("exits", ([
            	"southeast" : __DIR__"xxroad6",
            	"west" : __DIR__"xxroad8"
        ]));
        set("no_clean_up", 0);
        set("outdoors", "xingxiu");
        setup();
        replace_program(ROOM);
}
