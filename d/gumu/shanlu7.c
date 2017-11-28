
inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这是一条非常崎岖难行的山路，一路上蜿蜒盘山而上，沿
途均是葱郁的古柏山林，蔚然森秀。在此处可眺望终南山的景
色，只见山险岭峻，山川毓秀，不少鸟ㄦ在枝头高声啼唱不绝。
往北下是草堂寺。往西上是一条山路。往东是一块广大的空地。
往西北通往后山下。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "westup"     : __DIR__"shanlu6",
                "northdown"  : __DIR__"caotangsi",
                "northwest"  : __DIR__"shandao1",
                "eastdown"   : __DIR__"daxiaochang",
        ]));

        setup();
        replace_program(ROOM);
}
