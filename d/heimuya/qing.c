inherit ROOM;

void create()
{
        set("short", "青龙堂大厅");
        set("long", @LONG
这里便是日月神教下第三大堂青龙堂的大厅。堂内青砖铺
地，四周燃有熏香，非常的宽畅明亮，厅中设有一座，一位长
者居中，神情恍惚。
LONG );
        set("exits", ([
            	"north" : __DIR__"chlang2",
        ]));
        set("objects",([
                CLASS_D("riyue") + "/jia" : 1,
            	__DIR__"npc/dizi5" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
