#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "卧室");
        set("long", @LONG
这里是侯员外的卧室，卧室中央横拉着一道大帘子。在帘
后有张雕着八仙过海的大床，床头有个抽屉(drawer)。床上铺
丝陈缎，厚厚的锦被看起来很舒服。
LONG);
        set("sleep_room",1);
        set("exits", ([
                "north" : __DIR__"fu-houyuan",
        ]));
        set("objects", ([
                __DIR__"npc/yuanwai" : 1,
        ]));
        set("item_desc", ([
                "drawer": RED "一个抽屉，好象可以拉(pull)开，里"
                          "面可能有不少金银珠宝哦。\n" NOR
        ]));

        setup();
}

void init()
{
        add_action("do_pull","pull");
}

int do_pull(string arg)
{
//      object me = this_player();

        if (! arg || arg != "drawer")
                return notify_fail("你要拉开什么？\n");

        message_vision(HIY "\n$N" HIY "把抽屉拉开，还没来得及看里面有什么东"
                       "西，只听得床板吱\n吱连声，自动向两边分开，现出一个黑"
                       "黝黝的洞口。\n" NOR, this_player());

        set("exits/down", __DIR__"fu-midao");
        remove_call_out("close");
        call_out("close", 5, this_object());

        return 1;
}

void close(object room)
{
        message("vision", WHT "床板又合了起来，把洞口封住了。\n" NOR, room);
        room->delete("exits/down");
}