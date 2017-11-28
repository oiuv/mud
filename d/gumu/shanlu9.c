
inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这是一条非常崎岖难行的山路，一路上蜿蜒盘山而上，沿
途均是葱郁的古柏山林，蔚然森秀。在此处可眺望终南山的景
色，只见山险岭峻，山川毓秀，不少鸟ㄦ在枝头高声啼唱不绝。
往南下是两块耸天而立的巨石。往北是一片蓊郁的山林。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "northup"    : __DIR__"shulin9",
                "southdown"  : __DIR__"riyueyan",
        ]));

        setup();
        replace_program(ROOM);
}
