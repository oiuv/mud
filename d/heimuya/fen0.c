inherit ROOM;

void create()
{
        set("short", "风雷堂");
        set("long", @LONG
这里是日月神教教下第一大堂。这里距黑目崖不远，教下
第一大堂堂主童百熊把掌此堂。堂内站满了风雷堂的弟子，警
惕的注视着周围的一切。
LONG);
        set("exits", ([
            	"north" :  __DIR__"grass1",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/tong" : 1,
            	__DIR__ "npc/dizi3" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
