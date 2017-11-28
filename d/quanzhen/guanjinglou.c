#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "观景楼");
        set("long", @LONG
这里是一座两层的小楼，是建筑在庄园边缘用来登高凭拦
看风景的。你轻轻靠在栏杆上，竟朽的吱吱做响。看来已经很
久没有人有这个雅兴来这里看风景了。窗户(window)上的窗纸
已经破了不少，风一吹哗哗的响。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "north" : __DIR__"houhuayuan",
        ]));
        set("no_clean_up", 0);
        set("item_desc", ([
                "window" : HIY "\n窗外是黄沙满天，往远处看，什么"
                           "都看不清楚。\n" NOR,
        ]));

        setup();
        replace_program(ROOM);
}
