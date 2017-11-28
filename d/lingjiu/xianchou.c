inherit ROOM;

void create()
{
        set("short", "仙愁门");
        set("long", @LONG
这里就快到缥缈峰绝顶了，越往上走，山势越高，缭绕在
你身边的白雾愈来愈浓，往南则是下山的路。沿着山道没走几
步，在你眼前出现一个石坊，上书「仙愁门」三个大字，盖因
上山之艰辛吧。
LONG);
        set("outdoors", "lingjiu");
        set("exits",([
                "eastup" : __DIR__"dadao1",
                "southdown" : __DIR__"jian",
        ]));
        setup();
        replace_program(ROOM);
}
