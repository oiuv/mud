
inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这是一条非常崎岖难行的山路，一路上蜿蜒盘山而上，沿
途均是葱郁的古柏山林，蔚然森秀。在此处可眺望终南山的景
色，只见山险岭峻，山川毓秀，不少鸟ㄦ在枝头高声啼唱不绝。
往东下是莲花寺。往西上是一条山路。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "westup"    : __DIR__"riyueyan",
                "eastdown"  : __DIR__"jinliange",
        ]));

        setup();
        replace_program(ROOM);
}
