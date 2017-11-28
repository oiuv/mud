
inherit ROOM;

void create()
{
        set("short", "山道");
        set("long", @LONG
此段山路是通往后山脚。往南上是一大片树林。往北下可
以望见一个较大的湖。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "southup"   : __DIR__"shulin12",
                "northdown" : __DIR__"taiyi1",
        ]));

        setup();
        replace_program(ROOM);
}
