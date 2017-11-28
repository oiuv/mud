inherit ROOM;
 
void create()
{
        set("short", "白虎堂后厅");
        set("long",@LONG
这里是黑木崖的第二大堂白虎堂的后厅所在。堂内青砖铺
地，四周燃有熏香，非常的宽畅明亮，厅中设有一座，一中年
男子横眉座在当中。
LONG);
        set("exits", ([
            	"north" : __DIR__"baistep2",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/shangguan" : 1,
                __DIR__"npc/dizi4" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
