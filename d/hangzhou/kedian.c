// kedian.c
// Date: Nov.1997 by Venus

inherit ROOM;

void create()
{
        set("short", "天外天客店");
        set("long", @LONG
这是杭州最有名的客店，里面雕梁画壁，装饰有如宫殿，你可以在这里
打听到各地的风土人情。店小二里里外外忙得团团转，接待着南腔北调的客
人。墙上挂着一个牌子(paizi)。
LONG);
        set("no_fight", 1);
        set("valid_startroom", 1);
        set("no_sleep_room",1);
        set("item_desc", ([
                "paizi" : "楼上雅房，每夜五两白银。\n",
        ]));

        set("objects", ([
                __DIR__"npc/xiaoer" : 1,
        ]));

        set("exits", ([
                "west" : __DIR__"road13",
                "east" : __DIR__"majiu",
                "up"   : __DIR__"kedian2",
        ]));
        set("no_clean_up", 0);
        setup();
        "/clone/board/kedian7_b"->foo();
}

int valid_leave(object me, string dir)
{
        if ( !me->query_temp("rent_paid") && dir == "up" )
     return notify_fail("店小二一下挡在楼梯前，白眼一翻：怎麽着，想白住啊！\n");

        if ( me->query_temp("rent_paid") && dir == "west" )
        return notify_fail("店小二跑到门边拦住：客官已经付了银子，怎麽不住店就住
旁人还以为小店伺候不周呢！\n");

        return ::valid_leave(me, dir);
}

